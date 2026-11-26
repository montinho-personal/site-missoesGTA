import { applyPayment } from "@/server/payments";
import { getPayment, isSignatureValid } from "@/server/mercadopago";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id");
  if (!isSignatureValid(req.headers.get("x-signature"), req.headers.get("x-request-id"), dataId)) return new Response("assinatura inválida", { status: 401 });
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic");
  if (type !== "payment" || !dataId) return new Response("ignorado", { status: 200 });

  // O aviso só diz "olhe o pagamento X": o estado de verdade vem sempre da API.
  const pay = await getPayment(dataId);
  if (!pay) return new Response("pagamento não encontrado", { status: 200 });
  return new Response(await applyPayment(pay), { status: 200 });
}
