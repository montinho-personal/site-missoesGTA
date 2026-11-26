import "server-only";
import { q } from "./db";
import { licenseForPaidOrder } from "./licenses";
import { getPayment, type MpPayment } from "./mercadopago";

/**
 * Aplica ao pedido o estado de um pagamento lido na API do Mercado Pago.
 * Usado pelo webhook e pela página de acesso (que confere o Pix enquanto o comprador espera).
 * Idempotente: o Mercado Pago repete avisos, e a página pode conferir várias vezes.
 */
export async function applyPayment(pay: MpPayment): Promise<string> {
  if (!pay.external_reference) return "pagamento não encontrado";
  const [order] = await q<{ id: string; email: string; amount_cents: number; status: string }>(`select id, email, amount_cents, status from orders where id = $1`, [pay.external_reference]);
  if (!order) return "pedido desconhecido";

  if (pay.status === "approved") {
    // Só libera se o valor pago for o do pedido, na moeda certa.
    if (pay.currency_id !== "BRL" || Math.round(pay.transaction_amount * 100) < order.amount_cents) return "valor divergente";
    await q(`update orders set status = 'pago', payment_id = $2, paid_at = coalesce(paid_at, now()) where id = $1`, [order.id, String(pay.id)]);
    await licenseForPaidOrder(order.id, order.email);
    // E-mail de confirmação com o botão que abre o app liberado (uma vez só; falha fica visível no painel).
    const { deliverAccess } = await import("./access");
    await deliverAccess(order.id);
  } else if (pay.status === "refunded" || pay.status === "charged_back" || pay.status === "cancelled") {
    await q(`update orders set status = 'estornado', payment_id = $2 where id = $1 and status = 'pago'`, [order.id, String(pay.id)]);
    await q(`update licenses set status = 'revogada', revoked_at = now() where order_id = $1 and status = 'ativa'`, [order.id]);
  } else if (pay.status === "rejected") {
    await q(`update orders set status = 'recusado', payment_id = $2 where id = $1 and status = 'pendente'`, [order.id, String(pay.id)]);
  }
  return "ok";
}

/** Confere na API um pagamento ainda pendente. Nunca derruba a página: em erro, fica como estava. */
export async function refreshPayment(paymentId: string): Promise<void> {
  try {
    const pay = await getPayment(paymentId);
    // Um Pix que expirou sem pagar volta como "cancelled": não há o que estornar, o pedido segue pendente.
    if (pay && pay.status !== "cancelled") await applyPayment(pay);
  } catch {}
}
