import "server-only";

/**
 * Envio de e-mail pelo Resend (https://resend.com). Variáveis na hospedagem, nunca no repositório:
 *   RESEND_API_KEY  chave da conta
 *   EMAIL_FROM      remetente, ex.: "Missões Secretas GTA 6 <acesso@missoessecretasgta.com.br>"
 *   EMAIL_REPLY_TO  opcional: para onde vão as respostas do cliente
 * Sem chave, nada é enviado e a função devolve o motivo: o painel mostra a compra como "acesso não entregue".
 */
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export async function sendEmail(m: { to: string; subject: string; html: string; text: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Envio de e-mail não configurado" };
  try {
    const res = await fetch(`${(process.env.RESEND_API_BASE || "https://api.resend.com").replace(/\/$/, "")}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Missões Secretas GTA 6 <acesso@missoessecretasgta.com.br>",
        to: [m.to], subject: m.subject, html: m.html, text: m.text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
      }),
    });
    if (!res.ok) return { ok: false, error: `O serviço de e-mail recusou (${res.status})` };
    return { ok: true };
  } catch {
    return { ok: false, error: "O serviço de e-mail não respondeu" };
  }
}
