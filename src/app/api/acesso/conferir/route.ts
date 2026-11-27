import { checkCode } from "@/server/licenses";
import { safeEqual } from "@/server/security";

export const dynamic = "force-dynamic";

/**
 * Conferência de acesso, de servidor para servidor: só o servidor do app chama, com a chave APP_SITE_KEY.
 * Responde só se vale e o motivo. Nunca devolve e-mail nem dado do comprador.
 */
export async function POST(req: Request) {
  const key = process.env.APP_SITE_KEY;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!key || !got || !safeEqual(got, key)) return Response.json({ erro: "não autorizado" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let chave = "", aparelho = "";
  try { const b = (await req.json()) as { chave?: unknown; aparelho?: unknown }; chave = String(b.chave ?? "").slice(0, 40); aparelho = String(b.aparelho ?? "").slice(0, 80); } catch {}
  return Response.json(await checkCode(chave, aparelho), { headers: { "Cache-Control": "no-store" } });
}
