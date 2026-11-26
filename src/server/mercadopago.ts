import "server-only";
import { createHmac } from "node:crypto";
import { safeEqual } from "./security";
import { q } from "./db";
import { site } from "@/lib/site";

/**
 * Integração com o Mercado Pago (Checkout Pro): o comprador paga na página do Mercado Pago
 * e nenhum dado de cartão passa pelo site.
 *
 * Variáveis (todas no painel da hospedagem, nunca no repositório):
 *   MP_ACCESS_TOKEN    credencial de produção da aplicação no Mercado Pago
 *   MP_WEBHOOK_SECRET  assinatura secreta do webhook (Suas integrações > Webhooks)
 *   APP_PRICE_BRL      preço em reais, ex.: 19.90 (opcional: o preço normalmente é definido no painel)
 */
const API = () => (process.env.MP_API_BASE || "https://api.mercadopago.com").replace(/\/$/, "");

/** Lê "19,90" ou "19.90" e devolve centavos; 0 quando não é um preço válido. */
export function parsePrice(raw: string | null | undefined): number {
  const price = Number(String(raw ?? "").trim().replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(price) && price > 0 && price < 10000 ? Math.round(price * 100) : 0;
}

/** O preço vale primeiro o que o dono gravou no painel; sem isso, a variável APP_PRICE_BRL. */
export async function saleConfig() {
  let saved: string | null = null;
  try { saved = (await q<{ value: string }>(`select value from settings where key = 'app_price_brl'`))[0]?.value ?? null; } catch {}
  const cents = parsePrice(saved) || parsePrice(process.env.APP_PRICE_BRL);
  const credentials = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET);
  // Sem banco permanente não há onde guardar pedido nem acesso: a venda fica desligada.
  const database = Boolean(process.env.DATABASE_URL);
  const enabled = credentials && database && cents > 0;
  return { enabled, cents, credentials, database, priceLabel: cents ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100) : null };
}

export async function createPreference(order: { id: string; email: string; cents: number }): Promise<string> {
  const res = await fetch(`${API()}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json", "X-Idempotency-Key": order.id },
    body: JSON.stringify({
      items: [{ id: "acesso-app", title: "Missões Secretas GTA 6: acesso ao aplicativo", quantity: 1, currency_id: "BRL", unit_price: order.cents / 100 }],
      payer: { email: order.email },
      external_reference: order.id,
      back_urls: { success: `${site.url}/app/acesso/?pedido=${order.id}`, pending: `${site.url}/app/acesso/?pedido=${order.id}`, failure: `${site.url}/app/acesso/?pedido=${order.id}` },
      auto_return: "approved",
      notification_url: `${site.url}/api/mercadopago/webhook/`,
      statement_descriptor: "MISSOESSECRETAS",
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago recusou a preferência (${res.status})`);
  const data = (await res.json()) as { init_point?: string };
  if (!data.init_point) throw new Error("Mercado Pago não devolveu o endereço de pagamento");
  return data.init_point;
}

/**
 * Confere a assinatura do aviso, como manda a documentação do Mercado Pago:
 * cabeçalho x-signature "ts=...,v1=..." e HMAC-SHA256 de "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 */
export function isSignatureValid(xSignature: string | null, xRequestId: string | null, dataId: string | null): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !xSignature || !dataId) return false;
  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  // Identificador alfanumérico vai em minúsculas no manifesto, segundo a documentação.
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId ?? ""};ts:${parts.ts};`;
  return safeEqual(createHmac("sha256", secret).update(manifest).digest("hex"), parts.v1);
}

export interface MpPayment { id: number | string; status: string; external_reference: string | null; transaction_amount: number; currency_id: string }

/** O aviso só diz "olhe o pagamento X". O estado de verdade é sempre buscado na API, nunca lido do aviso. */
export async function getPayment(id: string): Promise<MpPayment | null> {
  if (!/^\d+$/.test(id)) return null;
  const res = await fetch(`${API()}/v1/payments/${id}`, { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }, cache: "no-store" });
  return res.ok ? ((await res.json()) as MpPayment) : null;
}
