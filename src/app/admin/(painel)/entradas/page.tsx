import Link from "next/link";
import { q } from "@/server/db";
import { formatDate, statusInfo, workflowLabel } from "@/lib/labels";
import type { VerificationStatus, WorkflowStatus } from "@/lib/types";

export const metadata = { title: "Descobertas e guias" };

export default async function Entries({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const wf = sp.wf && sp.wf in workflowLabel ? sp.wf : null;
  const rows = await q<{ id: string; title: string; cat: string; workflow_status: WorkflowStatus; verification_status: VerificationStatus; updated_at: string; kind: string }>(
    `select e.id, e.title, c.name as cat, e.workflow_status, e.verification_status, e.updated_at::text, e.kind from entries e join categories c on c.id = e.category_id
     where ($1::text is null or e.workflow_status = $1) and ($2::text is null or e.title ilike '%' || $2 || '%') order by e.updated_at desc limit 300`, [wf, sp.q?.slice(0, 60) || null]);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><h1 className="text-3xl font-black">Descobertas e guias</h1><Link href="/admin/entradas/nova/" className="btn btn-primary btn-sm">Nova</Link></div>
      <form className="flex flex-wrap gap-2 mb-4"><input name="q" defaultValue={sp.q} placeholder="Buscar por título" className="field max-w-xs" aria-label="Buscar por título" />
        <select name="wf" defaultValue={wf ?? ""} className="field max-w-48" aria-label="Fluxo"><option value="">Todos os estados</option>{Object.entries(workflowLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><button className="btn btn-ghost btn-sm">Filtrar</button></form>
      <div className="card overflow-x-auto"><table className="w-full text-left text-[0.95rem]"><thead><tr className="border-b border-ink-600 text-fg-subtle"><th className="p-3">Título</th><th className="p-3">Categoria</th><th className="p-3">Fluxo</th><th className="p-3">Verificação</th><th className="p-3">Atualizado</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-ink-700 last:border-0"><td className="p-3"><Link className="link" href={`/admin/entradas/${r.id}/`}>{r.title}</Link><span className="block text-xs text-fg-subtle">{r.id} · {r.kind}</span></td><td className="p-3">{r.cat}</td><td className="p-3">{workflowLabel[r.workflow_status]}</td><td className="p-3"><span className={`badge tone-${statusInfo[r.verification_status].tone}`}>{statusInfo[r.verification_status].short}</span></td><td className="p-3 whitespace-nowrap">{formatDate(r.updated_at, true)}</td></tr>)}
          {rows.length === 0 && <tr><td colSpan={5} className="p-5 text-fg-muted">Nada encontrado.</td></tr>}</tbody></table></div>
    </div>
  );
}
