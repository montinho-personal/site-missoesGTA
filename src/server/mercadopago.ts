import "server-only";
import { createHmac } from "node:crypto";
import { safeEqual } from "./security";
import { q } from "./db";
import { site } from "@/lib/site";
import { LAUNCH_PRICE_CENTS } from "@/lib/app-config";

/**
 * Integração com o Mercado Pago. Dois caminhos: Pix direto (QR Code no próprio site, sem login no
 * Mercado Pago) e Checkout Pro (cartão e outras formas, na página do Mercado Pago). Nenhum dado de
 * cartão passa pelo site.
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

/** O preço vale primeiro o que o dono gravou no painel; depois a variável APP_PRICE_BRL; por fim, o preço de lançamento. */
export async function saleConfig() {
  let saved: string | null = null, open = false;
  try {
    const rows = await q<{ key: string; value: string }>(`select key, value from settings where key in ('app_price_brl', 'venda_aberta')`);
    saved = rows.find((r) => r.key === "app_price_brl")?.value ?? null;
    // A venda só abre quando o dono abre no painel: comprar tem de dar acesso ao app na hora.
    open = rows.find((r) => r.key === "venda_aberta")?.value === "1";
  } catch {}
  const cents = parsePrice(saved) || parsePrice(process.env.APP_PRICE_BRL) || LAUNCH_PRICE_CENTS;
  const isLaunchPrice = cents === LAUNCH_PRICE_CENTS;
  const credentials = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET);
  // Sem banco permanente não há onde guardar pedido nem acesso: a venda fica desligada.
  const database = Boolean(process.env.DATABASE_URL);
  const ready = credentials && database && cents > 0;
  const enabled = ready && open;
  return { enabled, ready, open, cents, isLaunchPrice, credentials, database, priceLabel: cents ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100) : null };
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

export interface PixCharge { paymentId: string; qr: string; qrB64: string; expiresAt: string }

/** Horário no fuso de Brasília, no formato que o Mercado Pago pede (yyyy-MM-ddTHH:mm:ss.SSS-03:00). */
const brt = (d: Date) => new Date(d.getTime() - 3 * 3600_000).toISOString().replace("Z", "-03:00");

/**
 * Cobra por Pix direto pela API: o comprador vê o QR Code no próprio site e paga pelo app do banco,
 * sem entrar na conta do Mercado Pago. O aviso de pagamento chega pelo mesmo webhook.
 */
export async function createPixPayment(order: { id: string; email: string; cents: number }): Promise<PixCharge> {
  const expires = new Date(Date.now() + 30 * 60_000);
  const res = await fetch(`${API()}/v1/payments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json", "X-Idempotency-Key": `pix-${order.id}` },
    body: JSON.stringify({
      transaction_amount: order.cents / 100,
      description: "Missões Secretas GTA 6: acesso ao aplicativo",
      payment_method_id: "pix",
      payer: { email: order.email },
      external_reference: order.id,
      notification_url: `${site.url}/api/mercadopago/webhook/`,
      date_of_expiration: brt(expires),
      statement_descriptor: "MISSOESSECRETAS",
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago recusou o Pix (${res.status})`);
  const data = (await res.json()) as { id?: number | string; point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } } };
  const t = data.point_of_interaction?.transaction_data;
  if (!data.id || !t?.qr_code || !t.qr_code_base64) throw new Error("Mercado Pago não devolveu o QR Code do Pix");
  return { paymentId: String(data.id), qr: t.qr_code, qrB64: t.qr_code_base64, expiresAt: expires.toISOString() };
}

/** Chave pública do formulário de cartão. Não é segredo; sem ela, o cartão volta a usar a página do Mercado Pago. */
export const cardPublicKey = () => process.env.MP_PUBLIC_KEY?.trim() || null;

export interface CardData { token: string; payment_method_id: string; issuer_id?: string | number | null; installments: number; payer: { email: string; identification?: { type: string; number: string } } }

/**
 * Cobra um cartão já tokenizado pelo formulário do Mercado Pago (o número do cartão nunca chega aqui).
 * O valor vem sempre do pedido guardado no banco, nunca do navegador.
 */
export async function createCardPayment(order: { id: string; cents: number }, card: CardData): Promise<MpPayment & { status_detail?: string }> {
  const res = await fetch(`${API()}/v1/payments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json", "X-Idempotency-Key": `card-${order.id}-${card.token.slice(0, 40)}` },
    body: JSON.stringify({
      transaction_amount: order.cents / 100,
      description: "Missões Secretas GTA 6: acesso ao aplicativo",
      token: card.token,
      installments: card.installments,
      payment_method_id: card.payment_method_id,
      ...(card.issuer_id ? { issuer_id: Number(card.issuer_id) } : {}),
      payer: card.payer,
      external_reference: order.id,
      notification_url: `${site.url}/api/mercadopago/webhook/`,
      statement_descriptor: "MISSOESSECRETAS",
    }),
  });
  const data = (await res.json().catch(() => null)) as (MpPayment & { status_detail?: string }) | null;
  if (!res.ok || !data?.id) throw new Error(`Mercado Pago recusou o cartão (${res.status})`);
  return data;
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
