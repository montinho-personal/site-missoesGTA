import { z } from "zod";
import { q } from "@/server/db";
import { createCardPayment } from "@/server/mercadopago";
import { applyPayment } from "@/server/payments";
import { clientKey, rateLimit } from "@/server/security";

export const dynamic = "force-dynamic";

const schema = z.object({
  pedido: z.string().regex(/^[a-f0-9]{32}$/),
  token: z.string().min(8).max(200),
  payment_method_id: z.string().min(2).max(40),
  issuer_id: z.union([z.string().max(20), z.number()]).nullish(),
  installments: z.coerce.number().int().min(1).max(12),
  payer: z.object({
    email: z.email().max(160),
    identification: z.object({ type: z.string().max(10), number: z.string().max(20) }).optional(),
  }),
});

const motivo: Record<string, string> = {
  cc_rejected_insufficient_amount: "Saldo ou limite insuficiente.",
  cc_rejected_bad_filled_security_code: "O código de segurança (CVV) não confere.",
  cc_rejected_bad_filled_date: "A data de validade não confere.",
  cc_rejected_bad_filled_other: "Algum dado do cartão não confere. Revise e tente de novo.",
  cc_rejected_call_for_authorize: "O banco pediu para você autorizar a compra. Ligue para o banco ou use o Pix.",
  cc_rejected_card_disabled: "O cartão está bloqueado. Fale com o banco ou use o Pix.",
  cc_rejected_duplicated_payment: "Já existe um pagamento igual a este. Confira o seu e-mail ou a fatura.",
  cc_rejected_high_risk: "O pagamento foi recusado pela análise de segurança. Tente o Pix.",
};

/** Recebe o cartão já transformado em token pelo formulário do Mercado Pago e faz a cobrança. */
export async function POST(req: Request) {
  if (!(await rateLimit("cartao", await clientKey(), 10, 3600))) return Response.json({ ok: false, message: "Muitas tentativas. Tente de novo mais tarde ou use o Pix." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, message: "Dados do pagamento incompletos. Revise e tente de novo." }, { status: 400 });
  const { pedido, ...card } = parsed.data;
  const [order] = await q<{ id: string; amount_cents: number; status: string }>(`select id, amount_cents, status from orders where id = $1`, [pedido]);
  if (!order) return Response.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 });
  if (order.status === "pago") return Response.json({ ok: true, status: "approved" });
  if (order.status === "estornado") return Response.json({ ok: false, message: "Este pedido foi cancelado. Faça uma compra nova." }, { status: 409 });

  let pay;
  try { pay = await createCardPayment({ id: order.id, cents: order.amount_cents }, card); }
  catch { return Response.json({ ok: false, message: "Não foi possível falar com o Mercado Pago agora. Nada foi cobrado. Tente de novo em instantes." }, { status: 502 }); }
  // Tentativa recusada não marca o pedido: a pessoa pode tentar outro cartão ou o Pix no mesmo pedido.
  if (pay.status !== "rejected") await q(`update orders set payment_id = $2 where id = $1 and status <> 'pago'`, [order.id, String(pay.id)]);
  if (pay.status === "approved") { await applyPayment(pay); return Response.json({ ok: true, status: "approved" }); }
  if (pay.status === "in_process" || pay.status === "pending") return Response.json({ ok: true, status: "pending" });
  return Response.json({ ok: false, message: motivo[pay.status_detail ?? ""] ?? "O cartão foi recusado e nada foi cobrado. Tente outro cartão ou pague com Pix." });
}
