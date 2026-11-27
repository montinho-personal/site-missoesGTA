import { createHash } from "node:crypto";
import { z } from "zod";
import { accountExists, activeLicenseFor, newResetToken } from "@/server/accounts";
import { resetEmail } from "@/server/access";
import { sendEmail } from "@/server/email";
import { clientKey, rateLimit, safeEqual } from "@/server/security";
import { abs } from "@/lib/site";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.email().max(160) });

/**
 * "Esqueci a senha" (e "criar senha", para quem comprou ou ganhou cortesia sem senha).
 * Manda o link de nova senha para quem tem conta ou acesso. A resposta é sempre a mesma.
 */
export async function POST(req: Request) {
  const h = { "Cache-Control": "no-store" };
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, erro: "Digite um e-mail válido." }, { status: 400, headers: h });
  const email = parsed.data.email.toLowerCase();
  const key = process.env.APP_SITE_KEY, got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const fromApp = Boolean(key && got && safeEqual(got, key));
  if ((!fromApp && !(await rateLimit("esqueci", await clientKey(), 6, 3600))) || !(await rateLimit("esqueci-email", createHash("sha256").update(email).digest("hex"), 3, 3600)))
    return Response.json({ ok: false, erro: "Muitos pedidos. Tente de novo daqui a pouco." }, { status: 429, headers: h });
  if ((await accountExists(email)) || (await activeLicenseFor(email))) {
    const token = await newResetToken(email);
    await sendEmail({ to: email, ...resetEmail(abs(`/conta/nova-senha/?t=${token}`)) });
  }
  return Response.json({ ok: true }, { headers: h });
}
