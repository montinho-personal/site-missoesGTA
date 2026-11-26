import { isCodeValid } from "@/server/licenses";
import { clientKey, rateLimit } from "@/server/security";

export const dynamic = "force-dynamic";

// O aplicativo chama este endereço para saber se um código de acesso vale.
// A resposta é só sim ou não: nunca devolve e-mail nem dados do comprador.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };

export function OPTIONS() { return new Response(null, { status: 204, headers: CORS }); }

export async function POST(req: Request) {
  // Limite por origem, para ninguém testar códigos em massa.
  if (!(await rateLimit("acesso", await clientKey(), 20, 600))) return Response.json({ valido: false, motivo: "muitas_tentativas" }, { status: 429, headers: CORS });
  let codigo = "";
  try { codigo = String(((await req.json()) as { codigo?: unknown }).codigo ?? "").slice(0, 40); } catch {}
  return Response.json({ valido: await isCodeValid(codigo) }, { headers: CORS });
}
