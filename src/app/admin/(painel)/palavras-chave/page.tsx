import { q } from "@/server/db";
import { updateKeyword } from "@/server/admin-actions";
import { KeywordImport } from "../../ui";

export const metadata = { title: "Palavras-chave" };

export default async function Keywords({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const game = sp.jogo ?? "gta-6";
  const [clusters, rows, total] = await Promise.all([
    q<{ cluster: string; n: number }>(`select coalesce(cluster,'nao-classificado') as cluster, count(*)::int as n from keywords where game = $1 group by 1 order by 2 desc`, [game]),
    q<Record<string, string | number | boolean | null>>(
      `select id, keyword, cluster, subcluster, intent_primary, priority, planned_url, production_status, volume, difficulty, relevance, notes, is_page_primary, jsonb_array_length(original_terms) as variants, jsonb_array_length(sources) as nsrc
       from keywords where game = $1 and ($2::text is null or cluster = $2) and ($3::text is null or keyword_norm like '%' || $3 || '%')
       order by case priority when 'alta' then 0 when 'media' then 1 else 2 end, relevance desc nulls last, keyword limit 150`, [game, sp.cluster || null, sp.q?.toLowerCase().slice(0, 60) || null]),
    q<{ n: number }>(`select count(*)::int as n from keywords`),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Banco mestre de palavras-chave</h1>
      <p className="text-fg-muted mb-5">{total[0].n} termos únicos. Variações de acento, caixa e “GTA VI” são agrupadas; volumes de variantes nunca são somados. Volume e dificuldade ficam vazios até virem de uma ferramenta.</p>
      <KeywordImport />
      <form className="flex flex-wrap gap-2 my-5">
        <select name="jogo" defaultValue={game} className="field max-w-44" aria-label="Jogo"><option value="gta-6">GTA 6</option><option value="gta-5">GTA 5 (futuro)</option><option value="gta-san-andreas">San Andreas (futuro)</option><option value="gta-4">GTA 4 (futuro)</option><option value="outro">Outros</option></select>
        <select name="cluster" defaultValue={sp.cluster ?? ""} className="field max-w-64" aria-label="Cluster"><option value="">Todos os clusters</option>{clusters.map((c) => <option key={c.cluster} value={c.cluster}>{c.cluster} ({c.n})</option>)}</select>
        <input name="q" defaultValue={sp.q} placeholder="Contém…" className="field max-w-52" aria-label="Contém" /><button className="btn btn-ghost btn-sm">Filtrar</button>
      </form>
      {total[0].n === 0 && <p className="card p-5 text-fg-muted">Banco vazio. Rode <code>npm run db:keywords</code> para carregar a coleta inicial, ou importe um CSV acima.</p>}
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={Number(r.id)}>
            <details className="card">
              <summary className="p-3 cursor-pointer flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-semibold grow">{r.keyword}</span>
                <span className="text-sm text-fg-subtle">{r.cluster}{r.subcluster ? ` / ${r.subcluster}` : ""}</span>
                <span className="text-sm text-fg-subtle">{r.intent_primary}</span>
                <span className={`badge ${r.priority === "alta" ? "tone-gold" : "tone-gray"}`}>{r.priority}</span>
                <span className="text-sm text-fg-subtle">vol. {r.volume ?? "s/d"}</span>
              </summary>
              <form action={updateKeyword} className="p-3 pt-0 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="id" value={Number(r.id)} />
                <label className="field-label">Cluster<input name="cluster" defaultValue={String(r.cluster ?? "")} className="field mt-1" /></label>
                <label className="field-label">Intenção<input name="intent_primary" defaultValue={String(r.intent_primary ?? "")} className="field mt-1" /></label>
                <label className="field-label">Prioridade<select name="priority" defaultValue={String(r.priority ?? "")} className="field mt-1"><option>alta</option><option>media</option><option>baixa</option><option>futura</option></select></label>
                <label className="field-label">Produção<select name="production_status" defaultValue={String(r.production_status)} className="field mt-1"><option value="nao_iniciado">Não iniciado</option><option value="planejado">Planejado</option><option value="em_producao">Em produção</option><option value="publicado">Publicado</option><option value="descartado">Descartado (com justificativa)</option></select></label>
                <label className="field-label md:col-span-2">URL planejada<input name="planned_url" defaultValue={String(r.planned_url ?? "")} className="field mt-1" /></label>
                <label className="field-label md:col-span-2">Notas<input name="notes" defaultValue={String(r.notes ?? "")} className="field mt-1" /></label>
                <label className="flex items-center gap-3 cursor-pointer md:col-span-2"><input type="checkbox" name="is_page_primary" defaultChecked={Boolean(r.is_page_primary)} className="size-5" />Palavra-chave principal da página</label>
                <p className="text-sm text-fg-subtle md:col-span-2">{r.variants} variante(s) · {r.nsrc} coleta(s) · relevância autocomplete {r.relevance ?? "s/d"}</p>
                <div><button className="btn btn-primary btn-sm">Salvar</button></div>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
