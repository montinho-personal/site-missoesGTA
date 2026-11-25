import Link from "next/link";
import { notFound } from "next/navigation";
import { q } from "@/server/db";
import { EntryFormShell } from "../../../ui";
import { evidenceLabel, rewardTypeLabel, spoilerLabel, statusInfo, workflowLabel } from "@/lib/labels";
import type { Entry } from "@/lib/types";

export const metadata = { title: "Editar registro" };

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : typeof v === "string" ? JSON.parse(v || "[]") : []);

function F({ label, name, value, hint, type = "text", rows, required }: { label: string; name: string; value?: string | null; hint?: string; type?: string; rows?: number; required?: boolean }) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      {rows ? <textarea id={name} name={name} defaultValue={value ?? ""} rows={rows} className="field font-[inherit]" /> : <input id={name} name={name} type={type} defaultValue={value ?? ""} required={required} className="field" />}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}
function S({ label, name, value, options, empty }: { label: string; name: string; value?: string | null; options: [string, string][]; empty?: string }) {
  return (<div><label className="field-label" htmlFor={name}>{label}</label><select id={name} name={name} defaultValue={value ?? ""} className="field">{empty && <option value="">{empty}</option>}{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>);
}
const Group = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <fieldset className="card p-5"><legend className="font-display text-lg font-bold px-2">{title}</legend>{hint && <p className="text-fg-muted text-sm mb-4">{hint}</p>}<div className="grid gap-4 md:grid-cols-2">{children}</div></fieldset>
);

export default async function EditEntry({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const isNew = id === "nova";
  const [row] = isNew ? [null] : await q<Record<string, unknown>>(`select e.*, e.last_verified_on::text as lv, to_char(e.published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI') as pub, c.slug as cslug, g.slug as gslug from entries e join categories c on c.id = e.category_id join games g on g.id = e.game_id where e.id = $1`, [id]);
  if (!isNew && !row) notFound();
  const e = (row ?? {}) as Partial<Entry> & { lv?: string; pub?: string; cslug?: string; gslug?: string };
  const [cats, regions, authors] = await Promise.all([
    q<{ id: string; name: string }>(`select id, name from categories order by sort`), q<{ id: string; name: string }>(`select id, name from regions order by sort`), q<{ id: string; name: string }>(`select id, name from authors order by name`),
  ]);
  const opt = (rows: { id: string; name: string }[]) => rows.map((r) => [r.id, r.name] as [string, string]);
  const saved = (await searchParams).salvo;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <h1 className="text-3xl font-black">{isNew ? "Novo registro" : e.title}</h1>
        {!isNew && e.workflow_status === "publicado" && <Link className="link" href={`/${e.gslug}/${e.cslug}/${e.slug}/`}>Ver no site</Link>}
        {saved && <span role="status" className="badge tone-ok">Salvo</span>}
      </div>
      <EntryFormShell>
        {!isNew && <input type="hidden" name="id" value={id} />}
        <Group title="Identificação">
          <F label="Título" name="title" value={e.title} required />
          <F label="Slug (parte final do endereço)" name="slug" value={e.slug} hint="Vazio = gerado do título. Mudar o slug de um registro publicado cria um redirecionamento 301 automático." />
          <S label="Categoria" name="category_id" value={e.category_id} options={opt(cats)} />
          <S label="Tipo" name="kind" value={e.kind ?? "descoberta"} options={[["descoberta", "Descoberta"], ["guia", "Guia / tutorial"]]} />
          <S label="Região" name="region_id" value={e.region_id} options={opt(regions)} empty="Sem região definida" />
          <S label="Autor" name="author_id" value={e.author_id ?? authors[0]?.id} options={opt(authors)} empty="Sem autor" />
        </Group>
        <Group title="Resposta e texto" hint="A resposta rápida aparece primeiro na página, nos cards, na busca e no llms.txt.">
          <div className="md:col-span-2"><F label="Resposta rápida (1–2 frases)" name="direct_answer" value={e.direct_answer} rows={3} /></div>
          <div className="md:col-span-2"><F label="Resumo" name="summary" value={e.summary} rows={3} /></div>
          <div className="md:col-span-2"><F label="Detalhes (Markdown)" name="body_md" value={e.body_md} rows={12} /></div>
          <div className="md:col-span-2"><F label="Passo a passo (um por linha)" name="steps" value={arr(e.steps).join("\n")} rows={6} /></div>
        </Group>
        <Group title="Ficha" hint="Vazio = “Ainda não confirmado”. Escreva n/a quando o campo não se aplica. Nunca preencha no chute.">
          <F label="Onde fica" name="location_text" value={e.location_text} rows={2} />
          <F label="Ponto de referência" name="landmark" value={e.landmark} rows={2} />
          <F label="Personagem necessário" name="character_req" value={e.character_req} />
          <F label="Requisitos de desbloqueio" name="requirements" value={e.requirements} />
          <F label="Progresso necessário" name="progress_required" value={e.progress_required} />
          <F label="Horário ou condições" name="conditions" value={e.conditions} />
          <F label="Recompensa" name="reward" value={e.reward} />
          <S label="Tipo de recompensa" name="reward_type" value={e.reward_type} options={Object.entries(rewardTypeLabel)} empty="Desconhecido" />
          <F label="Dá para repetir?" name="repeatable" value={e.repeatable} />
          <F label="Dá para perder?" name="missable" value={e.missable} />
          <F label="Erros comuns (um por linha)" name="common_mistakes" value={arr(e.common_mistakes).join("\n")} rows={3} />
          <F label="Solução de problemas (problema => solução, um por linha)" name="troubleshooting" value={(arr(e.troubleshooting) as { problema: string; solucao: string }[]).map((t) => `${t.problema} => ${t.solucao}`).join("\n")} rows={3} />
        </Group>
        <Group title="Verificação e fontes" hint="“Confirmado” só é aceito com fonte oficial, ou com teste direto + plataforma + data.">
          <S label="Status de confirmação" name="verification_status" value={e.verification_status ?? "investigacao"} options={Object.entries(statusInfo).map(([k, v]) => [k, v.label])} />
          <S label="Tipo de evidência" name="evidence_type" value={e.evidence_type ?? "relatos"} options={Object.entries(evidenceLabel)} />
          <F label="Plataforma testada" name="platform_tested" value={e.platform_tested} />
          <F label="Versão do jogo" name="game_version" value={e.game_version} />
          <F label="Data da última verificação" name="last_verified_on" type="date" value={e.lv} />
          <S label="Nível de spoiler" name="spoiler_level" value={e.spoiler_level ?? "nenhum"} options={Object.entries(spoilerLabel)} />
          <div className="md:col-span-2"><F label="Fontes (nome | url | tipo | data | nota, uma por linha)" name="sources" rows={5} value={(arr(e.sources) as { nome: string; url: string; tipo?: string; data?: string; nota?: string }[]).map((x) => [x.nome, x.url, x.tipo ?? "", x.data ?? "", x.nota ?? ""].join(" | ")).join("\n")} /></div>
          <div className="md:col-span-2"><F label="Imagens e vídeos (url | texto alternativo | crédito | largura | altura)" name="media" rows={3} hint="Só material próprio ou autorizado. Texto alternativo é obrigatório. Imagens com 1200 px ou mais de largura ajudam no Discover." value={(arr(e.media) as { url: string; alt: string; credito?: string; largura?: number; altura?: number }[]).map((m) => [m.url, m.alt, m.credito ?? "", m.largura ?? "", m.altura ?? ""].join(" | ")).join("\n")} /></div>
        </Group>
        <Group title="SEO, relações e aplicativo">
          <F label="Título SEO (até ~60 caracteres)" name="seo_title" value={e.seo_title} />
          <F label="Tags e sinônimos de busca (separados por vírgula)" name="tags" value={arr(e.tags).join(", ")} />
          <div className="md:col-span-2"><F label="Descrição SEO (até ~155 caracteres)" name="seo_description" value={e.seo_description} rows={2} /></div>
          <div className="md:col-span-2"><F label="Perguntas frequentes (pergunta => resposta, uma por linha)" name="faq" rows={4} value={(arr(e.faq) as { q: string; a: string }[]).map((f) => `${f.q} => ${f.a}`).join("\n")} /></div>
          <F label="Relacionados (ids separados por vírgula)" name="related" value={arr(e.related).join(", ")} />
          <F label="Identificador no aplicativo" name="app_ref" value={e.app_ref} hint="Usado para o deep link, quando o aplicativo existir." />
        </Group>
        <Group title="Publicação" hint="Publicar exige resposta rápida, fonte (ou teste direto) e o nome de quem revisou.">
          <S label="Estado no fluxo" name="workflow_status" value={e.workflow_status ?? "rascunho"} options={Object.entries(workflowLabel)} />
          <F label="Revisado por" name="reviewed_by" value={e.reviewed_by} />
          <F label="Data de publicação (UTC)" name="published_at" type="datetime-local" value={e.pub} hint="Data futura = agendamento: só aparece no site quando a hora chegar." />
          <F label="Nota para o histórico público" name="change_note" hint="Ex.: “Recompensa corrigida após teste no PS5”. Aparece na página e no Radar." />
          <label className="flex items-center gap-3 md:col-span-2 cursor-pointer"><input type="checkbox" name="featured" defaultChecked={Boolean(e.featured)} className="size-5 accent-[#ff4d9d]" /><span>Destacar na página inicial</span></label>
        </Group>
      </EntryFormShell>
    </div>
  );
}
