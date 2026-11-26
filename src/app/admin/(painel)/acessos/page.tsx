import { q } from "@/server/db";
import { createCourtesyAction, revokeLicense, saveAppUrl, savePrice, setSaleOpen } from "@/server/admin-actions";
import { saleConfig } from "@/server/mercadopago";
import { formatDate } from "@/lib/labels";
import { courtesyMessage, whatsappLink } from "@/lib/share-copy";
import { site } from "@/lib/site";
import { CopyText } from "@/components/client";
import { DEFAULT_APP_URL } from "@/server/access";

export const metadata = { title: "Acessos e vendas" };

export default async function Acessos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const savedAppUrl = (await q<{ value: string }>(`select value from settings where key = 'app_url'`))[0]?.value ?? null;
  const appUrl = savedAppUrl ?? DEFAULT_APP_URL;
  const nome = sp.nome ?? "", tel = sp.tel ?? "", erro = sp.erro;
  const lote = sp.lote && /^[a-f0-9]{16}$/.test(sp.lote) ? await q<{ code: string; max_uses: number | null }>(`select code, max_uses from licenses where batch = $1 order by code`, [sp.lote]) : [];
  const novo = lote.length === 1 ? lote[0].code : null;
  const msg = novo ? courtesyMessage(novo, nome, site.url, lote[0].max_uses, appUrl) : "";
  const sale = await saleConfig();
  const [lic, totals] = await Promise.all([
    q<{ code: string; email: string | null; origin: string; status: string; note: string | null; created_at: string; last_used_at: string | null; max_uses: number | null; usados: number }>(`select l.code, l.email, l.origin, l.status, l.note, l.created_at::text, l.last_used_at::text, l.max_uses, (select count(*) from license_uses u where u.code = l.code)::int as usados from licenses l order by l.created_at desc limit 300`),
    q<{ pagos: number; pendentes: number; receita: number; cortesias: number }>(`select (select count(*) from orders where status = 'pago')::int as pagos, (select count(*) from orders where status = 'pendente')::int as pendentes, (select coalesce(sum(amount_cents), 0) from orders where status = 'pago')::int as receita, (select count(*) from licenses where origin = 'cortesia' and status = 'ativa')::int as cortesias`),
  ]);
  const t = totals[0];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black">Acessos e vendas</h1>
      <section className={`card p-5 ${sale.enabled ? "border-ok/60" : "border-orange/60"}`}>
        <h2 className="text-xl font-bold">{sale.enabled ? `Venda aberta: ${sale.priceLabel}, pagamento único` : sale.ready ? "Venda pausada" : "Venda desligada"}</h2>
        <ul className="mt-3 flex flex-col gap-1 text-fg-muted">
          <li>{sale.cents > 0 ? "✓" : "✗"} Preço definido{sale.cents > 0 ? `: ${sale.priceLabel}` : ""}</li>
          <li>{sale.credentials ? "✓" : "✗"} Mercado Pago {sale.credentials ? "configurado" : "faltando"}</li>
          <li>{sale.database ? "✓" : "✗"} Banco de dados {sale.database ? "configurado" : "faltando"}</li>
          <li>{sale.open ? "✓" : "✗"} Venda aberta pelo dono</li>
        </ul>
        {sale.open ? (
          <form action={setSaleOpen} className="mt-4"><input type="hidden" name="acao" value="pausar" /><button className="btn btn-ghost">Pausar a venda</button>
            <p className="mt-2 text-sm text-fg-subtle">Pausada, o botão de compra vira “Quero ser avisado” em todo o site. Quem já comprou não perde nada.</p></form>
        ) : (
          <form action={setSaleOpen} className="mt-4 rounded-lg border border-ink-600 p-3">
            <input type="hidden" name="acao" value="abrir" />
            <label className="flex items-start gap-3"><input type="checkbox" name="confirmo" className="mt-1 size-5" />
              <span className="text-sm">Confirmo que o caminho inteiro funciona: quem paga recebe o e-mail de confirmação e abre o app liberado no celular.</span></label>
            {sp.erro_venda && <p role="alert" className="mt-2 text-sm text-red">Marque a confirmação para abrir a venda.</p>}
            <button className="btn btn-primary mt-3" disabled={!sale.ready}>Abrir a venda</button>
          </form>
        )}
        <form action={savePrice} className="mt-4 flex flex-wrap items-end gap-3">
          <div><label className="field-label" htmlFor="p-preco">Preço do aplicativo (R$)</label><input id="p-preco" name="price" inputMode="decimal" placeholder="19,90" defaultValue={sale.cents ? (sale.cents / 100).toFixed(2).replace(".", ",") : ""} className="field max-w-40" /></div>
          <button className="btn btn-ghost">Salvar preço</button>
        </form>
        <p className="mt-2 text-sm text-fg-subtle">Vale para as próximas compras, na hora. Deixe vazio para voltar ao preço de lançamento (R$ 4,20).</p>
      </section>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[["Vendas pagas", t.pagos], ["Receita", new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(t.receita / 100)], ["Pedidos pendentes", t.pendentes], ["Cortesias ativas", t.cortesias]].map(([l, v]) => (
          <div key={String(l)} className="card p-4"><p className="label text-fg-subtle">{l}</p><p className="font-display text-3xl font-black mt-1">{v}</p></div>
        ))}
      </div>

      <section id="cortesia" className="card p-5">
        <h2 className="text-xl font-bold">Liberar acesso de graça (cortesia)</h2>
        <p className="text-fg-muted mt-1 mb-4">Gera um link que abre o app já liberado, sem pagar e sem digitar nada. Dá para escolher o nome do código (aparece no fim do link) ou deixar o sistema sortear.</p>
        <form action={saveAppUrl} className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-ink-600 p-3">
          <div className="grow min-w-60"><label className="field-label" htmlFor="c-appurl">Endereço do aplicativo (vai nas mensagens)</label><input id="c-appurl" name="app_url" type="url" defaultValue={savedAppUrl ?? ""} placeholder={DEFAULT_APP_URL} className="field" />
            <span className="field-hint">Vazio usa {DEFAULT_APP_URL}. As mensagens e os e-mails levam um link que abre o app já liberado.</span></div>
          <button className="btn btn-ghost">Salvar endereço</button>
        </form>
        <form action={createCourtesyAction} className="grid gap-3 sm:grid-cols-2">
          <div><label className="field-label" htmlFor="c-nome">Nome de quem recebe</label><input id="c-nome" name="nome" maxLength={60} defaultValue={nome} placeholder="João" className="field" /></div>
          <div><label className="field-label" htmlFor="c-tel">WhatsApp da pessoa (opcional)</label><input id="c-tel" name="tel" inputMode="tel" defaultValue={tel} placeholder="11 98765-4321" className="field" /><span className="field-hint">Com o número, o WhatsApp já abre a conversa com ela.</span></div>
          <div><label className="field-label" htmlFor="c-codigo">Nome do código (opcional)</label><input id="c-codigo" name="codigo" maxLength={30} placeholder="JOAO-VIP" autoCapitalize="characters" className="field uppercase" /><span className="field-hint">De 4 a 24 letras ou números. Vazio: o sistema cria um código como MS6-ABCD-EFGH-JKMN.</span></div>
          <div><label className="field-label" htmlFor="c-vagas">Quantas pessoas podem usar este código</label><input id="c-vagas" name="vagas" type="number" min={1} max={10000} defaultValue={1} inputMode="numeric" className="field" /><span className="field-hint">1 = código individual. 50 = as primeiras 50 pessoas (bom para influenciador ou grupo).</span></div>
          <div><label className="field-label" htmlFor="c-qtd">Quantos códigos gerar</label><input id="c-qtd" name="quantidade" type="number" min={1} max={200} defaultValue={1} inputMode="numeric" className="field" /><span className="field-hint">Mais de 1 = um código diferente para cada pessoa (sorteio, brinde). Com nome escolhido, saem numerados: NINA-01, NINA-02…</span></div>
          <div><label className="field-label" htmlFor="c-email">E-mail (opcional)</label><input id="c-email" name="email" type="email" className="field" /></div>
          <div className="sm:col-span-2"><label className="field-label" htmlFor="c-note">Anotação (por quê)</label><input id="c-note" name="note" maxLength={140} placeholder="Parceria Instagram, sorteio, amigo" className="field" /></div>
          <div className="sm:col-span-2"><button className="btn btn-primary">Gerar código</button></div>
        </form>
        {erro && <p role="alert" className="mt-4 rounded-lg border border-red/50 bg-red/10 p-3 text-red">{erro}</p>}
        {lote.length > 1 && (
          <div role="status" className="mt-5 card border-ok/60 p-4 sm:p-5">
            <p><strong>{lote.length} códigos gerados</strong>{lote[0].max_uses ? `, cada um para ${lote[0].max_uses} pessoas` : ", um para cada pessoa"}.</p>
            <label className="field-label mt-4" htmlFor="c-lista">Lista para copiar</label>
            <textarea id="c-lista" readOnly value={lote.map((l) => l.code).join("\n")} rows={Math.min(lote.length, 10)} className="field font-mono text-sm" />
            <div className="mt-3"><CopyText text={lote.map((l) => l.code).join("\n")} label="Copiar todos os códigos" /></div>
            <ul className="mt-4 divide-y divide-ink-600">
              {lote.map((l) => (
                <li key={l.code} className="py-2 flex items-center justify-between gap-3">
                  <span className="font-mono">{l.code}</span>
                  <a className="link text-sm whitespace-nowrap" target="_blank" rel="noopener" href={whatsappLink(courtesyMessage(l.code, null, site.url, l.max_uses, appUrl))}>Enviar no WhatsApp</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {novo && (
          <div role="status" className="mt-5 card border-ok/60 p-4 sm:p-5">
            <p>Código gerado{nome ? ` para ${nome}` : ""}: <strong className="font-display text-2xl tracking-wider select-all break-all">{novo}</strong></p>
            {lote[0].max_uses && <p className="mt-1 text-fg-muted">Vale para as primeiras {lote[0].max_uses.toLocaleString("pt-BR")} pessoas. Acompanhe quantas já usaram na lista abaixo.</p>}
            <label className="field-label mt-4" htmlFor="c-msg">Mensagem pronta</label>
            <textarea id="c-msg" readOnly value={msg} rows={9} className="field text-sm" />
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <a href={whatsappLink(msg, tel)} target="_blank" rel="noopener" className="btn btn-primary grow">{tel ? `Enviar no WhatsApp para ${nome || "a pessoa"}` : "Enviar no WhatsApp"}</a>
              <CopyText text={msg} />
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Códigos de acesso</h2>
        <div className="card overflow-x-auto"><table className="w-full text-left text-[0.95rem]">
          <thead><tr className="border-b border-ink-600 text-fg-subtle"><th className="p-3">Código</th><th className="p-3">Origem</th><th className="p-3">E-mail e anotação</th><th className="p-3">Criado</th><th className="p-3">Último uso</th><th className="p-3">Pessoas</th><th className="p-3">Situação</th></tr></thead>
          <tbody>
            {lic.length === 0 && <tr><td colSpan={7} className="p-5 text-fg-muted">Nenhum código ainda.</td></tr>}
            {lic.map((l) => (
              <tr key={l.code} className="border-b border-ink-700 last:border-0">
                <td className="p-3 font-mono whitespace-nowrap">{l.code}</td>
                <td className="p-3">{l.origin === "compra" ? "Compra" : "Cortesia"}</td>
                <td className="p-3">{l.email ?? "sem e-mail"}{l.note && <span className="block text-sm text-fg-subtle">{l.note}</span>}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(l.created_at, true)}</td>
                <td className="p-3 whitespace-nowrap">{l.last_used_at ? formatDate(l.last_used_at, true) : "nunca"}</td>
                <td className="p-3 whitespace-nowrap">{l.max_uses ? `${l.usados} de ${l.max_uses.toLocaleString("pt-BR")}${l.usados >= l.max_uses ? " · esgotado" : ""}` : "1 (individual)"}</td>
                <td className="p-3">{l.status === "ativa" ? (
                  <div className="flex flex-col gap-1.5">
                    {l.origin === "cortesia" && <a className="link text-sm whitespace-nowrap" target="_blank" rel="noopener" href={whatsappLink(courtesyMessage(l.code, /^Para: ([^·]+)/.exec(l.note ?? "")?.[1]?.trim(), site.url, l.max_uses, appUrl))}>Enviar no WhatsApp</a>}
                    <form action={revokeLicense}><input type="hidden" name="code" value={l.code} /><button className="link text-sm">Revogar</button></form>
                  </div>
                ) : <span className="badge tone-red">Revogado</span>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
