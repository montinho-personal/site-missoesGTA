import { q } from "@/server/db";
import { deleteRedirect, saveRedirect } from "@/server/admin-actions";

export const metadata = { title: "Redirecionamentos" };

export default async function Redirects() {
  const rows = await q<{ id: number; from_path: string; to_path: string; code: number }>(`select * from redirects order by created_at desc`);
  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Redirecionamentos</h1>
      <p className="text-fg-muted mb-5">Só caminhos internos. Mudanças de slug em registros publicados entram aqui automaticamente.</p>
      <form action={saveRedirect} className="card p-4 flex flex-wrap items-end gap-3 mb-5">
        <div className="grow"><label className="field-label">De<input name="from_path" placeholder="/gta-6/antigo/" required className="field mt-1" /></label></div>
        <div className="grow"><label className="field-label">Para<input name="to_path" placeholder="/gta-6/novo/" required className="field mt-1" /></label></div>
        <div><label className="field-label">Código<select name="code" className="field mt-1"><option>301</option><option>302</option></select></label></div>
        <button className="btn btn-primary btn-sm">Adicionar</button>
      </form>
      <ul className="card divide-y divide-ink-600">
        {rows.length === 0 && <li className="p-4 text-fg-muted">Nenhum redirecionamento.</li>}
        {rows.map((r) => <li key={r.id} className="p-3 flex flex-wrap items-center gap-3"><code className="grow break-all">{r.from_path} → {r.to_path}</code><span className="badge tone-gray">{r.code}</span><form action={deleteRedirect}><input type="hidden" name="id" value={r.id} /><button className="link text-sm">Remover</button></form></li>)}
      </ul>
    </div>
  );
}
