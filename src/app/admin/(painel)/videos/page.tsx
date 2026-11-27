import Link from "next/link";
import { q } from "@/server/db";
import { updateTipVideo } from "@/server/admin-actions";
import { AddTipVideoForm } from "@/components/AdminTipForm";
import { TIP_THEMES, platformName, thumbUrl, type Platform } from "@/lib/video-url";
import type { TipVideo } from "@/server/tips";

export const metadata = { title: "Vídeos de dica" };
const LABEL = { rascunho: "Para revisar", aprovado: "No ar", rejeitado: "Recusados" } as const;

export default async function TipVideos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const st = (sp.status && sp.status in LABEL ? sp.status : "rascunho") as keyof typeof LABEL;
  const [rows, dicas, counts] = await Promise.all([
    q<TipVideo>(`select * from tip_videos where status = $1 order by theme nulls last, sort, id desc`, [st]),
    q<{ id: string; title: string; workflow_status: string }>(`select id, title, workflow_status from entries where category_id = 'gta6-dicas' order by title`),
    q<{ status: string; n: number }>(`select status, count(*)::int as n from tip_videos group by status`),
  ]);
  const n = Object.fromEntries(counts.map((c) => [c.status, c.n]));
  const dicaName = new Map(dicas.map((d) => [d.id, d]));
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black">Vídeos de dica (Treino de Leonida)</h1>
        <p className="mt-2 text-fg-muted max-w-3xl">Vídeos de terceiros, sempre com crédito: o site só incorpora o player, nunca copia o vídeo. Nada aparece no site antes de você aprovar. Para aprovar, ligue o vídeo a uma dica (a página do site onde ele aparece). A dica em si se escreve em <Link className="link" href="/admin/entradas/">Descobertas e guias</Link>, na categoria Dicas, com a etiqueta <code>tema:mira</code> (ou comandos, assaltos, dinheiro, direcao, combate).</p>
      </div>
      <AddTipVideoForm dicas={dicas.map((d) => ({ id: d.id, title: `${d.title}${d.workflow_status === "publicado" ? "" : " (rascunho)"}` }))} />
      {sp.erro === "sem-dica" && <p role="alert" className="card border-red/60 p-4 text-red">Para aprovar, escolha a dica onde o vídeo vai aparecer.</p>}
      <nav className="flex flex-wrap gap-2">{Object.entries(LABEL).map(([k, v]) => <a key={k} href={`/admin/videos/?status=${k}`} className="chip" aria-current={st === k ? "page" : undefined}>{v} ({n[k] ?? 0})</a>)}</nav>
      <ul className="grid gap-4 lg:grid-cols-2">
        {rows.length === 0 && <li className="card p-5 text-fg-muted">Nada aqui.</li>}
        {rows.map((v) => {
          const th = thumbUrl({ platform: v.platform as Platform, id: v.video_id });
          return (
            <li key={v.id} id={`v${v.id}`} className="card p-4 flex gap-4">
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-28 aspect-[9/16] rounded-lg overflow-hidden border border-ink-600 bg-ink-900 grid place-items-center text-sm text-fg-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {th ? <img src={th} alt="" className="size-full object-cover" loading="lazy" /> : platformName[v.platform as Platform]}
              </a>
              <form action={updateTipVideo} className="grow grid gap-2 text-sm">
                <input type="hidden" name="id" value={v.id} />
                <p className="label text-cyan">{platformName[v.platform as Platform]} · <a className="link" href={v.url} target="_blank" rel="noopener noreferrer">abrir o vídeo</a>{v.entry_id && dicaName.get(v.entry_id) ? ` · ${dicaName.get(v.entry_id)!.title}` : ""}</p>
                <input name="title" defaultValue={v.title} className="field" aria-label="Título" />
                <input name="creator_name" defaultValue={v.creator_name} className="field" aria-label="Criador" />
                {v.note && <p className="text-fg-muted">{v.note}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <select name="theme" defaultValue={v.theme ?? ""} className="field" aria-label="Tema"><option value="">Sem tema</option>{TIP_THEMES.map((t) => <option key={t.key} value={t.key}>{t.short}</option>)}</select>
                  <input name="sort" type="number" min={0} max={999} defaultValue={v.sort} className="field" aria-label="Ordem" />
                </div>
                <select name="entry_id" defaultValue={v.entry_id ?? ""} className="field" aria-label="Dica"><option value="">Sem dica</option>{dicas.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select>
                <div className="flex flex-wrap gap-2 mt-1">
                  {v.status !== "aprovado" && <button name="acao" value="aprovado" className="btn btn-primary btn-sm">Aprovar e publicar</button>}
                  <button name="acao" value="salvar" className="btn btn-ghost btn-sm">Salvar</button>
                  {v.status === "aprovado" && <button name="acao" value="rascunho" className="btn btn-ghost btn-sm">Tirar do ar</button>}
                  {v.status !== "rejeitado" && <button name="acao" value="rejeitado" className="btn btn-ghost btn-sm">Recusar</button>}
                  <button name="acao" value="apagar" className="btn btn-ghost btn-sm text-red">Apagar</button>
                </div>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
