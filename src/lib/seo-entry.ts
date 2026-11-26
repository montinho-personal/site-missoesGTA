// SEO das fichas e categorias, gerado a partir dos dados de cada ficha.
// Regra de ouro: nada aqui inventa fato de jogo. Título, descrição e perguntas só reorganizam
// o que a ficha já diz (local, recompensa, requisitos, status), no jeito que as pessoas pesquisam.
import { statusInfo } from "./labels";
import type { VerificationStatus } from "./types";

export const BRAND_SUFFIX = " | Missões Secretas GTA 6";
export const TITLE_MAX = 60;
const DESC_MAX = 158;

/** Corta no limite sem quebrar palavra, e fecha com ponto. */
export function clamp(text: string, max = DESC_MAX): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…";
}

const end = (s: string) => (/[.!?…]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
const lower1 = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Intenção de busca de cada categoria: o que a pessoa quer saber ao pesquisar. */
const intent: Record<string, string[]> = {
  "missoes-secretas": ["onde fica e como fazer", "como ativar", "onde fica"],
  "lugares-secretos": ["onde fica e como entrar", "onde fica"],
  "easter-eggs": ["onde fica e o que significa", "onde fica"],
  dinheiro: ["onde fica e quanto dá", "onde fica"],
  veiculos: ["onde encontrar e como pegar", "onde encontrar"],
  "armas-e-itens": ["onde fica e como pegar", "onde pegar"],
};

export interface SeoEntry {
  title: string; kind: string; category_slug: string; seo_title?: string | null; seo_description?: string | null;
  direct_answer?: string | null; summary?: string | null; location_text?: string | null; region_name?: string | null;
  reward?: string | null; requirements?: string | null; character_req?: string | null; missable?: string | null;
  repeatable?: string | null; verification_status: VerificationStatus; last_verified_on?: string | null;
  faq?: { q: string; a: string }[];
}

const baseName = (e: SeoEntry) => e.title.replace(/\s+(em|no|de)\s+GTA\s*6.*$/i, "").trim();

/** Título no formato de busca: "Hyde Island em GTA 6: onde fica e como fazer", sem passar de 60 caracteres. */
export function entrySeoTitle(e: SeoEntry): string {
  const name = baseName(e);
  if (e.kind === "guia") return e.title.length <= TITLE_MAX ? e.title : `${name} em GTA 6`;
  for (const i of intent[e.category_slug] ?? []) {
    const t = `${name} em GTA 6: ${i}`;
    if (t.length <= TITLE_MAX) return t;
  }
  return `${name} em GTA 6`;
}

/** Descrição que responde e convida: local, recompensa e selo, até ~158 caracteres. */
export function entrySeoDescription(e: SeoEntry): string {
  if (e.kind === "guia") return clamp(e.seo_description || e.direct_answer || e.summary || "");
  const parts: string[] = [];
  if (e.location_text) parts.push(end(`Onde fica: ${lower1(e.location_text)}`));
  if (e.reward) parts.push(end(`Recompensa: ${e.reward}`));
  if (!parts.length) parts.push(end(e.direct_answer || e.summary || e.title));
  parts.push(`${statusInfo[e.verification_status].label}, com passo a passo.`);
  const full = parts.join(" ");
  return full.length <= DESC_MAX ? full : clamp(parts.slice(0, -1).join(" "));
}

/** Perguntas que as pessoas fazem sobre a descoberta, respondidas só com os dados da ficha. */
export function entryFaq(e: SeoEntry): { q: string; a: string }[] {
  const own = e.faq ?? [];
  if (e.kind === "guia") return own;
  const name = baseName(e);
  const out: { q: string; a: string }[] = [];
  if (e.location_text) out.push({ q: `Onde fica ${name} em GTA 6?`, a: end(e.location_text) + (e.region_name ? ` Região: ${e.region_name}.` : "") });
  if (e.reward) out.push({ q: `Qual é a recompensa de ${name}?`, a: end(e.reward) });
  const known = (v?: string | null) => (v && !/^n\/?a$/i.test(v.trim()) ? v.trim() : null);
  const char = known(e.character_req);
  const req = [known(e.requirements), char && `Personagem: ${char}`].filter(Boolean).join(". ");
  if (req) out.push({ q: `O que precisa para fazer ${name}?`, a: end(req) });
  if (known(e.missable)) out.push({ q: `Dá para perder ${name}?`, a: end(known(e.missable)!) });
  if (known(e.repeatable)) out.push({ q: `Dá para repetir ${name}?`, a: end(known(e.repeatable)!) });
  const st = statusInfo[e.verification_status];
  out.push({ q: `${name} é confirmado ou é boato?`, a: `${st.label}. ${st.meaning}${e.last_verified_on ? ` Última conferência: ${e.last_verified_on.split("-").reverse().join("/")}.` : ""}` });
  const seen = new Set(own.map((f) => f.q.toLowerCase()));
  return [...own, ...out.filter((f) => !seen.has(f.q.toLowerCase()))];
}

/** Título de página com a marca só quando cabe em 60 caracteres. */
export const withBrand = (title: string) => (title.length + BRAND_SUFFIX.length <= TITLE_MAX ? `${title}${BRAND_SUFFIX}` : title);

/** Perguntas de cada categoria, com números contados no próprio arquivo (nada estimado). */
export function categoryFaq(catName: string, entries: { verification_status: VerificationStatus; region_name?: string | null; updated_at: string }[]): { q: string; a: string }[] {
  if (!entries.length) return [];
  const n = entries.length;
  const by = (s: VerificationStatus) => entries.filter((e) => e.verification_status === s).length;
  const solid = by("testado") + by("confirmado");
  const regions = [...new Set(entries.map((e) => e.region_name).filter(Boolean))] as string[];
  const last = entries.map((e) => e.updated_at).sort().at(-1)!.slice(0, 10).split("-").reverse().join("/");
  const nome = catName.toLowerCase();
  const out = [
    { q: `Quantos registros de ${nome} de GTA 6 já existem?`, a: `${n} no arquivo até agora, ${solid} deles testados ou confirmados por três ou mais fontes. A lista mais recente foi revisada em ${last}.` },
    { q: `Como saber se uma descoberta de ${nome} é verdade ou boato?`, a: "Cada ficha tem um selo: Testado, Confirmado (três ou mais fontes independentes), Muito provável (duas fontes), Não verificado (uma fonte só) ou Desmentido. As fontes ficam listadas no fim de cada ficha." },
  ];
  if (regions.length) out.push({ q: `Em que regiões do mapa de GTA 6 ficam?`, a: `Em ${regions.length} ${regions.length === 1 ? "região" : "regiões"} de Leonida: ${regions.join(", ")}. Use o filtro de região para ver só as de perto de você.` });
  out.push({ q: "Esta lista tem spoiler da história?", a: "A proteção contra spoiler vem ligada: o que entrega a história fica coberto até você pedir para ver. Local e recompensa ficam visíveis." });
  return out;
}
