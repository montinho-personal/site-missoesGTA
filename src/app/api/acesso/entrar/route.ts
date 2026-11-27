import { createHash } from "node:crypto";
import { z } from "zod";
import { activeLicenseFor, verifyLogin } from "@/server/accounts";
import { checkCode, compactCode } from "@/server/licenses";
import { rateLimit, safeEqual } from "@/server/security";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.email().max(160), senha: z.string().min(1).max(100), aparelho: z.string().max(80) });

/**
 * Entrar no app com e-mail e senha, de servidor para servidor (APP_SITE_KEY).
 * Valeu e há acesso ativo: devolve a chave, que o app guarda como se tivesse chegado pelo link.
 */
export async function POST(req: Request) {
  const h = { "Cache-Control": "no-store" };
  const key = process.env.APP_SITE_KEY, got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!key || !got || !safeEqual(got, key)) return Response.json({ erro: "não autorizado" }, { status: 401, headers: h });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ valido: false, motivo: "senha" }, { headers: h });
  const email = parsed.data.email.toLowerCase();
  // Limite por e-mail: 10 tentativas por hora, para ninguém adivinhar senha.
  if (!(await rateLimit("entrar", createHash("sha256").update(email).digest("hex"), 10, 3600))) return Response.json({ valido: false, motivo: "muitas_tentativas" }, { headers: h });
  if (!(await verifyLogin(email, parsed.data.senha))) return Response.json({ valido: false, motivo: "senha" }, { headers: h });
  const lic = await activeLicenseFor(email);
  if (!lic) return Response.json({ valido: false, motivo: "sem_compra" }, { headers: h });
  const v = await checkCode(lic, parsed.data.aparelho);
  return Response.json(v.valido ? { valido: true, chave: compactCode(lic) } : v, { headers: h });
}
