import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Callout } from "@/components/ui";
import { CardBrick } from "@/components/CardBrick";
import { pageMeta } from "@/lib/seo";
import { q } from "@/server/db";
import { cardPublicKey } from "@/server/mercadopago";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Pagar com cartão", description: "Pagamento do acesso ao aplicativo com cartão.", path: "/app/cartao/", noindex: true });

export default async function Cartao({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const pedido = typeof sp.pedido === "string" && /^[a-f0-9]{32}$/.test(sp.pedido) ? sp.pedido : null;
  const [order] = pedido ? await q<{ email: string; amount_cents: number; status: string }>(`select email, amount_cents, status from orders where id = $1`, [pedido]) : [];
  if (order?.status === "pago") redirect(`/app/acesso/?pedido=${pedido}`);
  const key = cardPublicKey();
  const price = order ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.amount_cents / 100) : "";
  return (
    <Shell title="Pagar com cartão" path="/app/cartao/">
      {(!order || !key || order.status === "estornado") ? (
        <Callout icon="info" title="Não foi possível abrir este pagamento"><p>Volte para a <Link className="link" href="/app/#avise-me">página do aplicativo</Link> e comece de novo. Nada foi cobrado.</p></Callout>
      ) : (
        <div className="card p-5 sm:p-7">
          <p className="label text-violet">Acesso ao aplicativo · {price}</p>
          <p className="mt-2 text-fg-muted">Preencha os dados do cartão nos campos abaixo. Eles são do próprio Mercado Pago: o número do cartão não passa por este site. Assim que o pagamento for aprovado, você vai direto para o seu código de acesso.</p>
          <div className="mt-5"><CardBrick publicKey={key} pedido={pedido!} amount={order.amount_cents / 100} email={order.email} /></div>
          <p className="mt-5 text-sm text-fg-subtle">Prefere Pix? <Link className="link" href="/app/#avise-me">Volte e escolha o Pix</Link>: confirma em segundos.</p>
        </div>
      )}
    </Shell>
  );
}
