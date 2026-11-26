import "server-only";
import { createHash, randomInt } from "node:crypto";
import { q } from "./db";
import { compactCode, DEVICES_PER_PURCHASE } from "./licenses";
import { sendEmail } from "./email";
import { site } from "@/lib/site";

export const DEFAULT_APP_URL = "https://app.missoessecretasgta.com.br";

/** Endereço do app: o que o dono salvou no painel, ou o endereço padrão. */
export async function appUrl(): Promise<string> {
  try { return (await q<{ value: string }>(`select value from settings where key = 'app_url'`))[0]?.value || DEFAULT_APP_URL; } catch { return DEFAULT_APP_URL; }
}

/** Link que abre o app já liberado: o comprador nunca digita nada. */
export const accessLink = (base: string, code: string) => `${base.replace(/\/$/, "")}/entrar?chave=${compactCode(code)}`;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const brl = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

/** E-mail com o botão que abre o app liberado e o passo a passo para instalar. */
export function accessEmail(o: { link: string; kind: "compra" | "link"; cents?: number; paidAt?: Date; orderId?: string; loginCode?: string }) {
  const quando = o.paidAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(o.paidAt) : "";
  const subject = o.kind === "compra" ? "Compra confirmada: seu acesso ao Missões Secretas GTA 6" : "Seu link para entrar no Missões Secretas GTA 6";
  const abertura = o.kind === "compra"
    ? `Pagamento de ${brl(o.cents ?? 0)} confirmado${quando ? ` em ${quando}` : ""}. Seu acesso já está liberado.`
    : "Você pediu para entrar no app. Toque no botão abaixo, neste celular.";
  const passos = [
    "Toque em <b>Abrir o app</b>, no celular onde você vai usar. Ele abre já liberado.",
    "Para ficar com o ícone na tela: no <b>Android (Chrome)</b>, toque nos três pontinhos ⋮ e em <b>Instalar app</b>. No <b>iPhone (Safari)</b>, toque em <b>Compartilhar</b> e em <b>Adicionar à Tela de Início</b>.",
    `Quer usar em outro celular? Abra este mesmo e-mail nele e toque no botão. Vale para até ${DEVICES_PER_PURCHASE} aparelhos.`,
  ];
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#0c0b19;font-family:Arial,Helvetica,sans-serif;color:#f5f3ff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#131127;border:1px solid #2a2650;border-radius:14px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 24px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff4d9d;font-weight:bold">Missões Secretas GTA 6</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;color:#ffffff">${o.kind === "compra" ? "Compra confirmada" : "Entrar no app"}</h1>
<p style="margin:0 0 22px;font-size:16px;line-height:1.5;color:#bdb8d9">${esc(abertura)}</p>
<p style="margin:0 0 26px"><a href="${esc(o.link)}" style="display:inline-block;background:#6d43e0;color:#ffffff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 26px;border-radius:10px">Abrir o app</a></p>
${o.loginCode ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#bdb8d9">Está no app instalado no iPhone? Digite este código lá (vale por 15 minutos):<br><span style="display:inline-block;margin-top:8px;font-size:30px;letter-spacing:6px;font-weight:bold;color:#ffffff">${o.loginCode.slice(0, 3)} ${o.loginCode.slice(3)}</span></p>` : ""}
<ol style="margin:0 0 20px;padding-left:20px;font-size:15px;line-height:1.55;color:#bdb8d9">${passos.map((p) => `<li style="margin-bottom:8px">${p}</li>`).join("")}</ol>
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#9690b8">O botão não abriu? Copie este endereço no navegador do celular:<br><a href="${esc(o.link)}" style="color:#5ce1f2;word-break:break-all">${esc(o.link)}</a></p>
${o.kind === "compra" ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:#9690b8">Pode desistir em até 7 dias e receber tudo de volta: responda este e-mail.${o.orderId ? ` Pedido nº ${esc(o.orderId.slice(0, 8).toUpperCase())}.` : ""}</p>` : `<p style="margin:14px 0 0;font-size:13px;color:#9690b8">Não foi você? É só ignorar este e-mail.</p>`}
<p style="margin:18px 0 0;font-size:12px;color:#9690b8">Guia não oficial, sem ligação com a Rockstar Games. <a href="${site.url}" style="color:#9690b8">${site.url.replace(/^https?:\/\//, "")}</a></p>
</td></tr></table></td></tr></table></body></html>`;
  const text = [o.kind === "compra" ? "Compra confirmada" : "Entrar no app", "", abertura, "", `Abrir o app: ${o.link}`, "", ...(o.loginCode ? [`No app instalado no iPhone, digite o código: ${o.loginCode} (vale por 15 minutos)`, ""] : []), ...passos.map((p, i) => `${i + 1}. ${p.replace(/<[^>]+>/g, "")}`), "", o.kind === "compra" ? "Pode desistir em até 7 dias: responda este e-mail." : "Não foi você? Ignore este e-mail.", "", "Guia não oficial, sem ligação com a Rockstar Games."].join("\n");
  return { subject, html, text };
}

/**
 * Entrega o acesso de uma compra paga: manda o e-mail de confirmação uma vez só.
 * Se o envio falhar, o pedido fica como "acesso não entregue" no painel, com o motivo, para reenviar.
 */
export async function deliverAccess(orderId: string, { force = false } = {}): Promise<{ ok: boolean; error?: string }> {
  const [o] = await q<{ id: string; email: string; amount_cents: number; paid_at: string; code: string | null; access_email_at: string | null }>(
    `select o.id, o.email, o.amount_cents, o.paid_at::text, l.code, o.access_email_at::text from orders o left join licenses l on l.order_id = o.id where o.id = $1 and o.status = 'pago'`, [orderId]);
  if (!o?.code) return { ok: false, error: "Compra sem acesso gerado" };
  if (o.access_email_at && !force) return { ok: true };
  const mail = accessEmail({ link: accessLink(await appUrl(), o.code), kind: "compra", cents: o.amount_cents, paidAt: new Date(o.paid_at), orderId: o.id });
  const sent = await sendEmail({ to: o.email, ...mail });
  if (sent.ok) await q(`update orders set access_email_at = now(), access_email_error = null where id = $1`, [o.id]);
  else await q(`update orders set access_email_error = $2 where id = $1`, [o.id, sent.error]);
  return sent.ok ? { ok: true } : { ok: false, error: sent.error };
}

const hashCode = (email: string, code: string) => createHash("sha256").update(`${email}:${code}:${process.env.SESSION_SECRET ?? ""}`).digest("hex");

/** Cria um código de entrada de 6 dígitos para o e-mail (15 min). Só o resumo do código fica guardado. */
export async function newLoginCode(email: string): Promise<string> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await q(`insert into login_codes (email, code_hash, expires_at) values ($1, $2, now() + interval '15 minutes')`, [email, hashCode(email, code)]);
  return code;
}

/** Confere o código de entrada: até 5 tentativas por código, uso único. Devolve se valeu. */
export async function redeemLoginCode(email: string, code: string): Promise<boolean> {
  const [row] = await q<{ id: number; code_hash: string; attempts: number }>(`select id, code_hash, attempts from login_codes where email = $1 and used_at is null and expires_at > now() order by id desc limit 1`, [email]);
  if (!row || row.attempts >= 5) return false;
  if (row.code_hash !== hashCode(email, code)) { await q(`update login_codes set attempts = attempts + 1 where id = $1`, [row.id]); return false; }
  await q(`update login_codes set used_at = now() where id = $1`, [row.id]);
  return true;
}
