import { createHash } from "node:crypto";
import { z } from "zod";
import { q } from "@/server/db";
import { accessEmail, accessLink, appUrl, DEFAULT_APP_URL, newLoginCode } from "@/server/access";
import { sendEmail } from "@/server/email";
import { clientKey, rateLimit } from "@/server/security";

export const dynamic = "force-dynamic";

// "Já comprei": o app pede, o site manda o link de entrada para o e-mail da compra.
// A resposta é sempre a mesma, para ninguém descobrir quem comprou testando e-mails.
const origins = () => [DEFAULT_APP_URL, process.env.APP_ORIGIN].filter(Boolean) as string[];
const cors = (req: Request) => {
  const o = req.headers.get("origin") ?? "";
  return { "Access-Control-Allow-Origin": origins().includes(o) ? o : DEFAULT_APP_URL, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store", Vary: "Origin" };
};
export function OPTIONS(req: Request) { return new Response(null, { status: 204, headers: cors(req) }); }

const schema = z.object({ email: z.email().max(160) });

export async function POST(req: Request) {
  const h = cors(req);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, erro: "Digite um e-mail válido." }, { status: 400, headers: h });
  const email = parsed.data.email.toLowerCase();
  if (!(await rateLimit("enviar-link", await clientKey(), 6, 3600)) || !(await rateLimit("enviar-link-email", createHash("sha256").update(email).digest("hex"), 3, 3600)))
    return Response.json({ ok: false, erro: "Muitos pedidos. Tente de novo daqui a pouco." }, { status: 429, headers: h });
  // O acesso mais recente e ativo desse e-mail (compra ou cortesia).
  const [lic] = await q<{ code: string }>(`select code from licenses where lower(email) = $1 and status = 'ativa' order by (origin = 'compra') desc, created_at desc limit 1`, [email]);
  // O e-mail leva o link (abre o app) e um código de 6 dígitos, para o app instalado no iPhone, que não recebe o link.
  if (lic) await sendEmail({ to: email, ...accessEmail({ link: accessLink(await appUrl(), lic.code), kind: "link", loginCode: await newLoginCode(email) }) });
  return Response.json({ ok: true }, { headers: h });
}
