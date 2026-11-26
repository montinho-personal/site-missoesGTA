"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { q } from "./db";
import { checkPassword, endSession, requireAdmin, startSession } from "./auth";
import { clientKey, rateLimit } from "./security";
import { importKeywordRows, parseCsv } from "./keywords";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const nul = (v: string) => (v === "" ? null : v);
const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);
const slugify = (v: string) => v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const refresh = () => revalidatePath("/", "layout");

export async function login(_p: { error: string } | null, fd: FormData) {
  const key = await clientKey();
  if (!(await rateLimit("login", key, 6, 900))) return { error: "Muitas tentativas. Aguarde 15 minutos." };
  if (!checkPassword(s(fd, "password"))) return { error: "Senha incorreta." };
  await startSession();
  redirect("/admin/");
}
export async function logout() { await endSession(); redirect("/admin/login/"); }

const STATUS = ["testado", "confirmado", "provavel", "nao_verificado", "desmentido"] as const;
const WORKFLOW = ["rascunho", "revisao", "aprovado", "publicado", "arquivado"] as const;

const entrySchema = z.object({
  title: z.string().min(5, "Título muito curto.").max(160),
  slug: z.string().regex(/^[a-z0-9-]{3,80}$/, "Slug: só minúsculas, números e hífens."),
  category_id: z.string().min(1),
  kind: z.enum(["descoberta", "guia"]),
  verification_status: z.enum(STATUS),
  evidence_type: z.enum(["oficial", "teste_direto", "relatos", "teoria", "vazamento", "mod", "outra_versao"]),
  spoiler_level: z.enum(["nenhum", "leve", "historia"]),
  workflow_status: z.enum(WORKFLOW),
  direct_answer: z.string().max(600),
});

/** "nome | url | tipo | data | nota" por linha */
const parseSources = (v: string) => lines(v).map((l) => { const [nome, url, tipo, data, nota] = l.split("|").map((x) => x.trim()); return { nome, url, tipo: tipo || "imprensa", data: data || null, nota: nota || null }; }).filter((x) => x.nome && /^https?:\/\//.test(x.url ?? ""));
const parsePairs = (v: string, a: string, b: string) => lines(v).map((l) => { const i = l.indexOf("=>"); return i < 0 ? null : { [a]: l.slice(0, i).trim(), [b]: l.slice(i + 2).trim() }; }).filter(Boolean);
/** "url | texto alternativo | crédito | largura | altura" por linha */
const parseMedia = (v: string) => lines(v).map((l) => { const [url, alt, credito, w, h] = l.split("|").map((x) => x.trim()); return { tipo: /youtu|vimeo|\.mp4/.test(url) ? "video" : "imagem", url, alt: alt || "", credito: credito || undefined, largura: Number(w) || undefined, altura: Number(h) || undefined }; }).filter((m) => /^https?:\/\/|^\//.test(m.url) && m.alt);

export async function saveEntry(_p: { error: string } | null, fd: FormData): Promise<{ error: string } | null> {
  await requireAdmin();
  const id = s(fd, "id");
  const raw = Object.fromEntries(fd) as Record<string, string>;
  raw.slug = raw.slug ? raw.slug.trim() : slugify(raw.title ?? "");
  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(" ") };
  const d = parsed.data;
  const sources = parseSources(s(fd, "sources"));

  // Travas editoriais: valem para qualquer um, inclusive para textos gerados por IA.
  if (d.workflow_status === "publicado") {
    if (!d.direct_answer) return { error: "Para publicar, preencha a resposta rápida." };
    if (sources.length === 0 && d.evidence_type !== "teste_direto") return { error: "Para publicar, informe ao menos uma fonte ou registre teste direto." };
    if (!s(fd, "reviewed_by")) return { error: "Para publicar, informe quem revisou." };
  }
  // Mesma régua do aplicativo, sem atalho.
  if (d.verification_status === "testado" && !(d.evidence_type === "teste_direto" && s(fd, "last_verified_on") && s(fd, "platform_tested")))
    return { error: "“Testado por nós” exige evidência de teste direto, com plataforma e data." };
  if (d.verification_status === "confirmado" && sources.length < 3 && d.evidence_type !== "oficial")
    return { error: "“Confirmado” exige três ou mais fontes independentes (ou fonte oficial)." };
  if (d.verification_status === "provavel" && sources.length < 2 && d.evidence_type !== "teste_direto")
    return { error: "“Muito provável” exige duas fontes independentes, ou uma que testou." };

  const [cat] = await q<{ game_id: string; slug: string }>(`select c.game_id, c.slug from categories c where c.id = $1`, [d.category_id]);
  if (!cat) return { error: "Categoria inválida." };
  const clash = await q(`select 1 from entries where category_id = $1 and slug = $2 and id <> $3`, [d.category_id, d.slug, id || "-"]);
  if (clash.length) return { error: "Já existe um registro com esse slug nesta categoria." };

  const cols: Record<string, unknown> = {
    title: d.title, slug: d.slug, category_id: d.category_id, game_id: cat.game_id, kind: d.kind,
    region_id: nul(s(fd, "region_id")), author_id: nul(s(fd, "author_id")), app_ref: nul(s(fd, "app_ref")),
    direct_answer: d.direct_answer, summary: s(fd, "summary"), body_md: s(fd, "body_md"),
    location_text: nul(s(fd, "location_text")), landmark: nul(s(fd, "landmark")), character_req: nul(s(fd, "character_req")),
    requirements: nul(s(fd, "requirements")), progress_required: nul(s(fd, "progress_required")), conditions: nul(s(fd, "conditions")),
    reward: nul(s(fd, "reward")), reward_type: nul(s(fd, "reward_type")), repeatable: nul(s(fd, "repeatable")), missable: nul(s(fd, "missable")),
    platform_tested: nul(s(fd, "platform_tested")), game_version: nul(s(fd, "game_version")), last_verified_on: nul(s(fd, "last_verified_on")),
    verification_status: d.verification_status, evidence_type: d.evidence_type, spoiler_level: d.spoiler_level,
    seo_title: nul(s(fd, "seo_title")), seo_description: nul(s(fd, "seo_description")), workflow_status: d.workflow_status,
    featured: fd.get("featured") === "on", reviewed_by: nul(s(fd, "reviewed_by")),
  };
  const json: Record<string, unknown> = {
    steps: lines(s(fd, "steps")), common_mistakes: lines(s(fd, "common_mistakes")),
    troubleshooting: parsePairs(s(fd, "troubleshooting"), "problema", "solucao"), faq: parsePairs(s(fd, "faq"), "q", "a"),
    sources, media: parseMedia(s(fd, "media")), tags: s(fd, "tags").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
    related: s(fd, "related").split(",").map((t) => t.trim()).filter(Boolean),
  };
  const publishAt = s(fd, "published_at"); // agendamento: data futura só aparece quando chegar a hora
  const names = [...Object.keys(cols), ...Object.keys(json)];
  const vals = [...Object.values(cols), ...Object.values(json).map((v) => JSON.stringify(v))];
  const ph = (i: number) => (i >= Object.keys(cols).length ? `$${i + 1}::text::jsonb` : `$${i + 1}`);

  let entryId = id;
  if (id) {
    const [before] = await q<{ verification_status: string; workflow_status: string; slug: string; category_id: string; cslug: string; gslug: string }>(
      `select e.verification_status, e.workflow_status, e.slug, e.category_id, c.slug as cslug, g.slug as gslug from entries e join categories c on c.id = e.category_id join games g on g.id = e.game_id where e.id = $1`, [id]);
    if (!before) return { error: "Registro não encontrado." };
    await q(`update entries set ${names.map((n, i) => `${n} = ${ph(i)}`).join(", ")}, updated_at = now(),
             published_at = case when $${vals.length + 2} <> '' then $${vals.length + 2}::timestamptz when workflow_status = 'publicado' and published_at is null then now() else published_at end
             where id = $${vals.length + 1}`, [...vals, id, publishAt]);
    // URL mudou? O endereço antigo passa a redirecionar (301) para o novo.
    if (before.workflow_status === "publicado" && (before.slug !== d.slug || before.category_id !== d.category_id)) {
      const from = `/${before.gslug}/${before.cslug}/${before.slug}/`, to = `/${before.gslug}/${cat.slug}/${d.slug}/`;
      await q(`delete from redirects where from_path = $1`, [to]);
      await q(`insert into redirects (from_path, to_path) values ($1, $2) on conflict (from_path) do update set to_path = excluded.to_path`, [from, to]);
      await q(`update redirects set to_path = $2 where to_path = $1`, [from, to]);
    }
    const note = s(fd, "change_note");
    if (before.verification_status !== d.verification_status) await q(`insert into entry_changes (entry_id, kind, note) values ($1, 'status', $2)`, [id, `Status alterado de “${before.verification_status}” para “${d.verification_status}”.${note ? " " + note : ""}`]);
    else if (note) await q(`insert into entry_changes (entry_id, kind, note) values ($1, 'atualizacao', $2)`, [id, note]);
  } else {
    const [{ n }] = await q<{ n: number }>(`select coalesce(max(substring(id from '[0-9]+$')::int), 0) + 1 as n from entries where game_id = $1`, [cat.game_id]);
    entryId = `${cat.game_id}-${String(n).padStart(4, "0")}`;
    await q(`insert into entries (id, ${names.join(", ")}, published_at) values ($${vals.length + 1}, ${names.map((_, i) => ph(i)).join(", ")},
             case when $${vals.length + 2} <> '' then $${vals.length + 2}::timestamptz when $${vals.length + 3} = 'publicado' then now() else null end)`, [...vals, entryId, publishAt, d.workflow_status]);
    await q(`insert into entry_changes (entry_id, kind, note) values ($1, 'criacao', $2)`, [entryId, s(fd, "change_note") || "Registro criado."]);
  }
  refresh();
  redirect(`/admin/entradas/${entryId}/?salvo=1`);
}

export async function saveCategory(fd: FormData) {
  await requireAdmin();
  await q(`update categories set name = $2, tagline = $3, description = $4, intro_md = $5, seo_title = $6, seo_description = $7, cta_key = $8, sort = $9, published = $10, faq = $11::text::jsonb where id = $1`,
    [s(fd, "id"), s(fd, "name"), s(fd, "tagline"), s(fd, "description"), s(fd, "intro_md"), nul(s(fd, "seo_title")), nul(s(fd, "seo_description")), nul(s(fd, "cta_key")), Number(s(fd, "sort")) || 0, fd.get("published") === "on", JSON.stringify(parsePairs(s(fd, "faq"), "q", "a"))]);
  refresh(); revalidatePath("/admin/categorias");
}

export async function saveCta(fd: FormData) {
  await requireAdmin();
  const key = slugify(s(fd, "key")); if (!key || !s(fd, "headline") || !s(fd, "button_label")) return;
  await q(`insert into ctas (key, eyebrow, headline, body, button_label, active) values ($1,$2,$3,$4,$5,$6)
           on conflict (key) do update set eyebrow = excluded.eyebrow, headline = excluded.headline, body = excluded.body, button_label = excluded.button_label, active = excluded.active`,
    [key, s(fd, "eyebrow"), s(fd, "headline"), s(fd, "body"), s(fd, "button_label"), fd.get("active") === "on"]);
  refresh(); revalidatePath("/admin/ctas");
}

const pathRe = /^\/[a-z0-9\-/_.]*$/i;
export async function saveRedirect(fd: FormData) {
  await requireAdmin();
  const from = s(fd, "from_path"), to = s(fd, "to_path");
  if (!pathRe.test(from) || !pathRe.test(to) || from === to) return; // só caminhos internos: nada de redirecionar para fora
  await q(`insert into redirects (from_path, to_path, code) values ($1, $2, $3) on conflict (from_path) do update set to_path = excluded.to_path, code = excluded.code`, [from, to, s(fd, "code") === "302" ? 302 : 301]);
  revalidatePath("/admin/redirecionamentos");
}
export async function deleteRedirect(fd: FormData) {
  await requireAdmin();
  await q(`delete from redirects where id = $1`, [Number(s(fd, "id"))]);
  revalidatePath("/admin/redirecionamentos");
}

export async function reviewSubmission(fd: FormData) {
  await requireAdmin();
  const status = s(fd, "status");
  if (!["aprovado", "rejeitado", "spam", "pendente"].includes(status)) return;
  await q(`update submissions set status = $2, review_note = $3, reviewed_at = now() where id = $1`, [Number(s(fd, "id")), status, nul(s(fd, "review_note"))]);
  revalidatePath("/admin/envios");
}

export async function updateKeyword(fd: FormData) {
  await requireAdmin();
  await q(`update keywords set cluster = $2, intent_primary = $3, priority = $4, planned_url = $5, production_status = $6, notes = $7, is_page_primary = $8 where id = $1`,
    [Number(s(fd, "id")), nul(s(fd, "cluster")), nul(s(fd, "intent_primary")), nul(s(fd, "priority")), nul(s(fd, "planned_url")), s(fd, "production_status") || "nao_iniciado", nul(s(fd, "notes")), fd.get("is_page_primary") === "on"]);
  revalidatePath("/admin/palavras-chave");
}

export async function importKeywords(_p: { message: string } | null, fd: FormData): Promise<{ message: string }> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { message: "Selecione um arquivo CSV." };
  if (file.size > 5_000_000) return { message: "Arquivo grande demais (limite de 5 MB)." };
  const rows = parseCsv(await file.text());
  if (rows.length === 0) return { message: "Não encontrei linhas com uma coluna de palavra-chave." };
  const r = await importKeywordRows(rows, { source: s(fd, "source") || file.name, date: new Date().toISOString().slice(0, 10) });
  revalidatePath("/admin/palavras-chave");
  return { message: `${rows.length} linhas lidas: ${r.inserted} novas, ${r.merged} somadas a termos existentes, ${r.skipped} ignoradas (vazias).` };
}

export async function createCourtesyAction(fd: FormData) {
  await requireAdmin();
  const { createCourtesy, customCode } = await import("./licenses");
  const email = s(fd, "email").toLowerCase();
  const nome = s(fd, "nome").slice(0, 60);
  const tel = s(fd, "tel").replace(/\D/g, "").slice(0, 13);
  const pedido = s(fd, "codigo");
  const custom = pedido ? customCode(pedido) : null;
  const num = (k: string) => Math.trunc(Number(s(fd, k).replace(/\D/g, "")) || 1);
  const vagas = num("vagas"), quantidade = num("quantidade");
  const volta = (extra: Record<string, string>) => `/admin/acessos/?${new URLSearchParams({ ...(nome && { nome }), ...(tel && { tel }), ...extra })}#cortesia`;
  if (pedido && !custom) redirect(volta({ erro: "O nome do código precisa ter de 4 a 24 letras ou números (pode usar hífen). Ex.: NINA-VIP." }));
  if (vagas > 10000 || quantidade > 200) redirect(volta({ erro: "Limite: até 200 códigos por vez e até 10.000 pessoas por código." }));
  const note = nul([nome && `Para: ${nome}`, s(fd, "note")].filter(Boolean).join(" · ").slice(0, 200));
  let batch: string;
  try { batch = (await createCourtesy({ email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null, note, custom, vagas, quantidade })).batch; }
  catch (e) { redirect(volta({ erro: `O código ${String((e as Error).message).split(":")[1] ?? custom} já existe. Escolha outro nome.` })); }
  redirect(volta({ lote: batch! }));
}

export async function revokeLicense(fd: FormData) {
  await requireAdmin();
  await q(`update licenses set status = 'revogada', revoked_at = now() where code = $1`, [s(fd, "code")]);
  revalidatePath("/admin/acessos");
}

export async function savePrice(fd: FormData) {
  await requireAdmin();
  const { parsePrice } = await import("./mercadopago");
  const cents = parsePrice(s(fd, "price"));
  if (cents > 0) await q(`insert into settings (key, value) values ('app_price_brl', $1) on conflict (key) do update set value = excluded.value, updated_at = now()`, [(cents / 100).toFixed(2)]);
  else await q(`delete from settings where key = 'app_price_brl'`); // volta ao preço de lançamento
  revalidatePath("/app");
  revalidatePath("/admin/acessos");
}
