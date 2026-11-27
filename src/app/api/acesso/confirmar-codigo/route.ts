import { z } from "zod";
import { q } from "@/server/db";
import { redeemLoginCode } from "@/server/access";
import { checkCode, compactCode } from "@/server/licenses";
import { safeEqual } from "@/server/security";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.email().max(160), codigo: z.string().regex(/^\d{6}$/), aparelho: z.string().max(80) });

/**
 * Código de 6 dígitos do "Já comprei" (app instalado no iPhone), de servidor para servidor com APP_SITE_KEY.
 * Valeu: devolve a chave de acesso, que o app guarda como se tivesse chegado pelo link.
 */
export async function POST(req: Request) {
  const h = { "Cache-Control": "no-store" };
  const key = process.env.APP_SITE_KEY;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!key || !got || !safeEqual(got, key)) return Response.json({ erro: "não autorizado" }, { status: 401, headers: h });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ valido: false, motivo: "codigo" }, { headers: h });
  const email = parsed.data.email.toLowerCase();
  if (!(await redeemLoginCode(email, parsed.data.codigo))) return Response.json({ valido: false, motivo: "codigo" }, { headers: h });
  const [lic] = await q<{ code: string }>(`select code from licenses where lower(email) = $1 and status = 'ativa' order by (origin = 'compra') desc, created_at desc limit 1`, [email]);
  if (!lic) return Response.json({ valido: false, motivo: "cancelado" }, { headers: h });
  const v = await checkCode(lic.code, parsed.data.aparelho);
  return Response.json(v.valido ? { valido: true, chave: compactCode(lic.code) } : v, { headers: h });
}
