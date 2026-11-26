import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Callout } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { q } from "@/server/db";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Seu acesso ao aplicativo", description: "Situação do seu pedido e código de acesso ao aplicativo.", path: "/app/acesso/", noindex: true });

export default async function Acesso({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const pedido = typeof sp.pedido === "string" && /^[a-f0-9]{32}$/.test(sp.pedido) ? sp.pedido : null;
  // O número do pedido é longo e aleatório: funciona como a chave desta página.
  const [row] = pedido ? await q<{ status: string; code: string | null; lic: string | null }>(
    `select o.status, l.code, l.status as lic from orders o left join licenses l on l.order_id = o.id where o.id = $1`, [pedido]) : [];
  return (
    <Shell title="Seu acesso ao aplicativo" path="/app/acesso/">
      {!row && <Callout icon="info" title="Pedido não encontrado"><p>Confira o endereço que você recebeu depois do pagamento. Se precisar, <Link className="link" href="/contato/">fale com a gente</Link>.</p></Callout>}
      {row?.status === "pago" && row.code && row.lic === "ativa" && (
        <div className="card border-ok/60 p-6">
          <p className="label text-ok">Pagamento confirmado</p>
          <p className="mt-3 text-fg-muted">Este é o seu código de acesso. Guarde em lugar seguro: é ele que libera o aplicativo.</p>
          <p className="mt-4 font-display text-3xl sm:text-4xl font-black tracking-wider break-all select-all" aria-label="Código de acesso">{row.code}</p>
          <p className="mt-4"><Link href="/app/como-baixar-e-usar/#instalar" className="btn btn-app btn-sm">Como instalar e ativar</Link></p>
          <p className="mt-4 text-sm text-fg-subtle">Salve esta página nos favoritos do navegador. Se perder o código, fale com a gente pelo <Link className="link" href="/contato/">contato</Link>, usando o e-mail da compra.</p>
        </div>
      )}
      {row?.status === "pago" && row.lic === "revogada" && <Callout icon="info" title="Acesso encerrado"><p>Este código foi desativado. Se foi um engano, <Link className="link" href="/contato/">fale com a gente</Link>.</p></Callout>}
      {row?.status === "pendente" && <Callout icon="clock" title="Aguardando a confirmação do pagamento"><p>Pix costuma confirmar em instantes; boleto e alguns cartões podem demorar mais. Atualize esta página em alguns minutos. Nada é liberado antes da confirmação.</p></Callout>}
      {row?.status === "recusado" && <Callout icon="info" title="Pagamento não aprovado"><p>O Mercado Pago não aprovou este pagamento e nada foi cobrado. Você pode <Link className="link" href="/app/#avise-me">tentar de novo</Link> com outra forma de pagamento.</p></Callout>}
      {row?.status === "estornado" && <Callout icon="info" title="Compra cancelada"><p>Este pedido foi cancelado ou devolvido, e o código deixou de valer.</p></Callout>}
    </Shell>
  );
}
