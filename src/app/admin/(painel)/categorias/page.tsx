import { q } from "@/server/db";
import { saveCategory } from "@/server/admin-actions";

export const metadata = { title: "Categorias" };

export default async function Categories() {
  const [cats, ctas] = await Promise.all([q<Record<string, string | number | boolean | unknown>>(`select * from categories order by sort`), q<{ key: string }>(`select key from ctas order by key`)]);
  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Categorias</h1>
      <p className="text-fg-muted mb-5">Criar categoria nova é decisão de arquitetura (URL permanente): faça por migração, depois de validar a intenção de busca.</p>
      <div className="flex flex-col gap-3">
        {cats.map((c) => {
          const faq = (typeof c.faq === "string" ? JSON.parse(c.faq) : c.faq) as { q: string; a: string }[];
          return (
            <details key={String(c.id)} className="card">
              <summary className="p-4 cursor-pointer font-display font-bold text-lg">{String(c.name)} <span className="text-fg-subtle text-sm font-normal">/{String(c.slug)}/</span></summary>
              <form action={saveCategory} className="p-4 pt-0 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={String(c.id)} />
                <div><label className="field-label">Nome<input name="name" defaultValue={String(c.name)} className="field mt-1" required /></label></div>
                <div><label className="field-label">Chamada curta<input name="tagline" defaultValue={String(c.tagline)} className="field mt-1" /></label></div>
                <div className="md:col-span-2"><label className="field-label">Descrição<textarea name="description" defaultValue={String(c.description)} className="field mt-1" rows={2} /></label></div>
                <div className="md:col-span-2"><label className="field-label">Introdução (Markdown)<textarea name="intro_md" defaultValue={String(c.intro_md)} className="field mt-1" rows={4} /></label></div>
                <div><label className="field-label">Título SEO<input name="seo_title" defaultValue={String(c.seo_title ?? "")} className="field mt-1" /></label></div>
                <div><label className="field-label">CTA do aplicativo<select name="cta_key" defaultValue={String(c.cta_key ?? "")} className="field mt-1"><option value="">Padrão</option>{ctas.map((x) => <option key={x.key}>{x.key}</option>)}</select></label></div>
                <div className="md:col-span-2"><label className="field-label">Descrição SEO<textarea name="seo_description" defaultValue={String(c.seo_description ?? "")} className="field mt-1" rows={2} /></label></div>
                <div className="md:col-span-2"><label className="field-label">Perguntas frequentes (pergunta =&gt; resposta, uma por linha)<textarea name="faq" defaultValue={faq.map((f) => `${f.q} => ${f.a}`).join("\n")} className="field mt-1" rows={3} /></label></div>
                <div><label className="field-label">Ordem<input name="sort" type="number" defaultValue={Number(c.sort)} className="field mt-1" /></label></div>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="published" defaultChecked={Boolean(c.published)} className="size-5" />Visível no site</label>
                <div className="md:col-span-2"><button className="btn btn-primary btn-sm">Salvar</button></div>
              </form>
            </details>
          );
        })}
      </div>
    </div>
  );
}
