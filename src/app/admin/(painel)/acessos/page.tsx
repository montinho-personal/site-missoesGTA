import { q } from "@/server/db";
import { createCourtesyAction, revokeLicense } from "@/server/admin-actions";
import { saleConfig } from "@/server/mercadopago";
import { formatDate } from "@/lib/labels";

export const metadata = { title: "Acessos e vendas" };

export default async function Acessos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const novo = (await searchParams).novo;
  const sale = saleConfig();
  const [lic, totals] = await Promise.all([
    q<{ code: string; email: string | null; origin: string; status: string; note: string | null; created_at: string; last_used_at: string | null }>(`select code, email, origin, status, note, created_at::text, last_used_at::text from licenses order by created_at desc limit 300`),
    q<{ pagos: number; pendentes: number; receita: number; cortesias: number }>(`select (select count(*) from orders where status = 'pago')::int as pagos, (select count(*) from orders where status = 'pendente')::int as pendentes, (select coalesce(sum(amount_cents), 0) from orders where status = 'pago')::int as receita, (select count(*) from licenses where origin = 'cortesia' and status = 'ativa')::int as cortesias`),
  ]);
  const t = totals[0];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black">Acessos e vendas</h1>
      <p className={`card p-4 ${sale.enabled ? "border-ok/60" : "border-orange/60"}`}>{sale.enabled ? `Venda ligada: ${sale.priceLabel}, pagamento único pelo Mercado Pago.` : "Venda desligada. Para ligar, defina MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, APP_PRICE_BRL e DATABASE_URL nas variáveis de ambiente e refaça o deploy."}</p>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[["Vendas pagas", t.pagos], ["Receita", new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(t.receita / 100)], ["Pedidos pendentes", t.pendentes], ["Cortesias ativas", t.cortesias]].map(([l, v]) => (
          <div key={String(l)} className="card p-4"><p className="label text-fg-subtle">{l}</p><p className="font-display text-3xl font-black mt-1">{v}</p></div>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="text-xl font-bold">Liberar acesso de graça (cortesia)</h2>
        <p className="text-fg-muted mt-1 mb-4">Gera um código que você envia para a pessoa. Ela digita o código no aplicativo, sem pagar.</p>
        <form action={createCourtesyAction} className="flex flex-wrap items-end gap-3">
          <div className="grow min-w-52"><label className="field-label" htmlFor="c-email">E-mail de quem recebe (opcional)</label><input id="c-email" name="email" type="email" className="field" /></div>
          <div className="grow min-w-52"><label className="field-label" htmlFor="c-note">Anotação (para quem, por quê)</label><input id="c-note" name="note" maxLength={200} className="field" /></div>
          <button className="btn btn-primary">Gerar código</button>
        </form>
        {novo && <p role="status" className="mt-4 card border-ok/60 p-4">Código gerado: <strong className="font-display text-xl tracking-wider select-all">{novo}</strong></p>}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Códigos de acesso</h2>
        <div className="card overflow-x-auto"><table className="w-full text-left text-[0.95rem]">
          <thead><tr className="border-b border-ink-600 text-fg-subtle"><th className="p-3">Código</th><th className="p-3">Origem</th><th className="p-3">E-mail e anotação</th><th className="p-3">Criado</th><th className="p-3">Último uso</th><th className="p-3">Situação</th></tr></thead>
          <tbody>
            {lic.length === 0 && <tr><td colSpan={6} className="p-5 text-fg-muted">Nenhum código ainda.</td></tr>}
            {lic.map((l) => (
              <tr key={l.code} className="border-b border-ink-700 last:border-0">
                <td className="p-3 font-mono whitespace-nowrap">{l.code}</td>
                <td className="p-3">{l.origin === "compra" ? "Compra" : "Cortesia"}</td>
                <td className="p-3">{l.email ?? "sem e-mail"}{l.note && <span className="block text-sm text-fg-subtle">{l.note}</span>}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(l.created_at, true)}</td>
                <td className="p-3 whitespace-nowrap">{l.last_used_at ? formatDate(l.last_used_at, true) : "nunca"}</td>
                <td className="p-3">{l.status === "ativa" ? <form action={revokeLicense}><input type="hidden" name="code" value={l.code} /><button className="link text-sm">Revogar</button></form> : <span className="badge tone-red">Revogado</span>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
