import { q } from "@/server/db";
import { licenseForPaidOrder } from "@/server/licenses";
import { getPayment, isSignatureValid } from "@/server/mercadopago";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id");
  if (!isSignatureValid(req.headers.get("x-signature"), req.headers.get("x-request-id"), dataId)) return new Response("assinatura inválida", { status: 401 });
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic");
  if (type !== "payment" || !dataId) return new Response("ignorado", { status: 200 });

  const pay = await getPayment(dataId);
  if (!pay?.external_reference) return new Response("pagamento não encontrado", { status: 200 });
  const [order] = await q<{ id: string; email: string; amount_cents: number; status: string }>(`select id, email, amount_cents, status from orders where id = $1`, [pay.external_reference]);
  if (!order) return new Response("pedido desconhecido", { status: 200 });

  if (pay.status === "approved") {
    // Só libera se o valor pago for o do pedido, na moeda certa.
    if (pay.currency_id !== "BRL" || Math.round(pay.transaction_amount * 100) < order.amount_cents) return new Response("valor divergente", { status: 200 });
    await q(`update orders set status = 'pago', payment_id = $2, paid_at = coalesce(paid_at, now()) where id = $1`, [order.id, String(pay.id)]);
    await licenseForPaidOrder(order.id, order.email);
  } else if (pay.status === "refunded" || pay.status === "charged_back" || pay.status === "cancelled") {
    await q(`update orders set status = 'estornado', payment_id = $2 where id = $1 and status = 'pago'`, [order.id, String(pay.id)]);
    await q(`update licenses set status = 'revogada', revoked_at = now() where order_id = $1 and status = 'ativa'`, [order.id]);
  } else if (pay.status === "rejected") {
    await q(`update orders set status = 'recusado', payment_id = $2 where id = $1 and status = 'pendente'`, [order.id, String(pay.id)]);
  }
  return new Response("ok", { status: 200 });
}
