import { q } from "@/server/db";
import { reviewSubmission } from "@/server/admin-actions";
import { formatDate } from "@/lib/labels";

export const metadata = { title: "Envios da comunidade" };
const LABEL: Record<string, string> = { pendente: "Pendentes", aprovado: "Aprovados", rejeitado: "Rejeitados", spam: "Spam" };

export default async function Submissions({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const st = (await searchParams).status ?? "pendente";
  const rows = await q<{ id: number; kind: string; status: string; name: string | null; email: string | null; payload: Record<string, string> | string; entry_id: string | null; created_at: string; review_note: string | null }>(
    `select id, kind, status, name, email, payload, entry_id, created_at::text, review_note from submissions where status = $1 order by created_at desc limit 200`, [st in LABEL ? st : "pendente"]);
  return (
    <div>
      <h1 className="text-3xl font-black mb-4">Envios da comunidade</h1>
      <nav className="flex flex-wrap gap-2 mb-5">{Object.entries(LABEL).map(([k, v]) => <a key={k} href={`/admin/envios/?status=${k}`} className="chip" aria-current={st === k ? "page" : undefined}>{v}</a>)}</nav>
      <ul className="flex flex-col gap-4">
        {rows.length === 0 && <li className="card p-5 text-fg-muted">Nada aqui.</li>}
        {rows.map((r) => {
          const p = typeof r.payload === "string" ? (JSON.parse(r.payload) as Record<string, string>) : r.payload;
          return (
            <li key={r.id} className="card p-5">
              <p className="label text-cyan">{r.kind}{r.entry_id ? ` · ${r.entry_id}` : ""} · {formatDate(r.created_at)}</p>
              {p.title && <p className="font-display text-xl font-bold mt-1">{p.title}</p>}
              {/* Texto de terceiros: sempre renderizado como texto puro, nunca como HTML. */}
              <p className="mt-2 whitespace-pre-wrap">{p.message}</p>
              <dl className="mt-3 text-sm text-fg-muted grid gap-1 sm:grid-cols-2">
                {p.where && <div><dt className="inline font-semibold">Onde: </dt><dd className="inline">{p.where}</dd></div>}
                {p.platform && <div><dt className="inline font-semibold">Plataforma: </dt><dd className="inline">{p.platform}</dd></div>}
                {p.evidence && <div className="sm:col-span-2 break-all"><dt className="inline font-semibold">Evidência: </dt><dd className="inline"><a className="link" href={p.evidence} rel="noopener noreferrer nofollow" target="_blank">{p.evidence}</a></dd></div>}
                <div><dt className="inline font-semibold">De: </dt><dd className="inline">{r.name || "anônimo"}{r.email ? ` · ${r.email}` : ""}</dd></div>
              </dl>
              <form action={reviewSubmission} className="mt-4 flex flex-wrap items-end gap-2.5">
                <input type="hidden" name="id" value={r.id} />
                <div className="grow min-w-56"><label className="field-label" htmlFor={`n${r.id}`}>Nota interna</label><input id={`n${r.id}`} name="review_note" defaultValue={r.review_note ?? ""} className="field" /></div>
                <button name="status" value="aprovado" className="btn btn-primary btn-sm">Aprovar</button>
                <button name="status" value="rejeitado" className="btn btn-ghost btn-sm">Rejeitar</button>
                <button name="status" value="spam" className="btn btn-ghost btn-sm">Spam</button>
              </form>
              <p className="mt-2 text-sm text-fg-subtle">Aprovar não publica nada sozinho: crie ou atualize o registro correspondente, com o status de verificação adequado.</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
