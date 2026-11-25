import { q } from "@/server/db";
import { saveCta } from "@/server/admin-actions";
import type { Cta } from "@/lib/types";

export const metadata = { title: "CTAs" };

function Form({ c }: { c?: Cta }) {
  return (
    <form action={saveCta} className="card p-4 grid gap-3 md:grid-cols-2">
      <div><label className="field-label">Chave<input name="key" defaultValue={c?.key} readOnly={Boolean(c)} required className="field mt-1" /></label></div>
      <div><label className="field-label">Sobretítulo<input name="eyebrow" defaultValue={c?.eyebrow} className="field mt-1" /></label></div>
      <div className="md:col-span-2"><label className="field-label">Chamada<input name="headline" defaultValue={c?.headline} required className="field mt-1" /></label></div>
      <div className="md:col-span-2"><label className="field-label">Texto<textarea name="body" defaultValue={c?.body} rows={2} className="field mt-1" /></label></div>
      <div><label className="field-label">Texto do botão<input name="button_label" defaultValue={c?.button_label} required className="field mt-1" /></label></div>
      <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="active" defaultChecked={c?.active ?? true} className="size-5" />Ativo</label>
      <div><button className="btn btn-primary btn-sm">{c ? "Salvar" : "Criar"}</button></div>
    </form>
  );
}

export default async function Ctas() {
  const rows = await q<Cta>(`select * from ctas order by key`);
  return (
    <div>
      <h1 className="text-3xl font-black mb-2">CTAs do aplicativo</h1>
      <p className="text-fg-muted mb-5">Cada categoria aponta para uma chave. Não prometa aqui função que o aplicativo ainda não tem.</p>
      <div className="flex flex-col gap-4">{rows.map((c) => <Form key={c.key} c={c} />)}<h2 className="text-xl font-bold mt-4">Novo CTA</h2><Form /></div>
    </div>
  );
}
