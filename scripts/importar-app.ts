// Importa as fichas do aplicativo (fonte única dos fatos) para o conteúdo-semente do site.
// Uso: npm run importar:app -- /caminho/para/app/conteudo
// O site NÃO edita estes fatos: correção de conteúdo se faz no aplicativo e se importa de novo.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const dir = process.argv[2] ?? "../app-missoes-secretas-gta/conteudo";
const ler = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
type Passo = string | { t: string };
interface Ficha {
  id: string; nome: string; cat: string; tem: string[]; regiao: string; local: string; x: number | null; y: number | null;
  prec: string | null; selo: "C" | "P" | "N" | "X"; cap: number; ate?: number; quem?: string; quando?: string; leva?: string[];
  premio: string; valor?: number; risco?: string; ver?: string; prova?: string; busca?: string; passos: Passo[];
  codigos?: { c: string; onde: string }[]; obs?: string[]; tags?: string[]; depende?: string; fontes: string[];
  midia?: { t: string; n: string; u: string; i?: string; o?: string }[]; criado: string; mudou: string; rev: string;
}
const fichas: Ficha[] = ler("segredos.json");
const meta = ler("meta.json") as { jogo: string; regioes: string[]; fontes: Record<string, { n: string; u: string }>; colecoes: { id: string; itens: string[] }[] };

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const CAT: Record<string, string> = { dinheiro: "gta6-dinheiro", arma: "gta6-armas-e-itens", veiculo: "gta6-veiculos", bunker: "gta6-lugares-secretos", encontro: "gta6-missoes-secretas", segredo: "gta6-easter-eggs" };
const SELO = { C: "confirmado", P: "provavel", N: "nao_verificado", X: "desmentido" } as const;
const PREMIO: Record<string, string> = { dinheiro: "dinheiro", arma: "arma", veiculo: "veiculo", colecionavel: "item", bonus: "item", trofeu: "conquista", historia: "cena" };
const corta = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");
const ponto = (s: string) => (/[.!?…]$/.test(s.trim()) ? s.trim() : s.trim() + ".");
const nomeDe = new Map(fichas.map((f) => [f.id, f.nome]));
const destaque = new Set(meta.colecoes.find((c) => c.id === "comece")?.itens ?? []);
const versao = /vers[aã]o\s+([\d.]+)/i.exec(meta.jogo)?.[1] ?? null;
const plataforma = /PS5|Xbox[^,]*/i.exec(meta.jogo)?.[0] ?? null;

const regioes = meta.regioes.filter((r) => r !== "Sem local fixo").map((r, i) => ({
  id: `gta6-${slug(r)}`, game_id: "gta6", slug: slug(r), name: r,
  description: `Segredos de GTA 6 registrados em ${r}, com o lugar, o passo a passo e o selo de confiança de cada um.`, source_url: null, sort: i + 1,
}));

const usados = new Set<string>();
const entradas = fichas.map((f) => {
  const partes: string[] = [];
  if (f.codigos?.length) partes.push("## Códigos\n\n" + f.codigos.map((c) => `- **${c.c}**: ${c.onde}`).join("\n") + "\n\nOs códigos valem o que vale o selo desta ficha: confira o selo antes de atravessar o mapa.");
  if (f.obs?.length) partes.push("## Bom saber\n\n" + f.obs.map((o) => `- ${o}`).join("\n"));
  if (f.risco) partes.push(`## Risco\n\n${ponto(f.risco)}`);
  const requisitos = [f.leva?.length ? `Leve: ${f.leva.join(", ")}` : null, f.depende ? `Faça antes: ${nomeDe.get(f.depende) ?? f.depende}` : null].filter(Boolean).join(". ");
  let seo = corta(`${f.nome} em GTA 6`, 62);
  if (usados.has(seo)) seo = corta(`${f.nome} (${f.regiao}) em GTA 6`, 62);
  usados.add(seo);
  const fontes = [
    ...f.fontes.map((k) => meta.fontes[k]).filter(Boolean).map((s) => ({ nome: s.n, url: s.u, tipo: "imprensa", data: null, nota: null })),
    ...(f.midia ?? []).map((m) => ({ nome: m.n, url: m.u, tipo: m.t === "video" ? "video" : "fotos", data: null, nota: [m.i === "pt" ? "Em português" : m.i === "en" ? "Em inglês" : null, m.o].filter(Boolean).join(". ") || null })),
  ];
  return {
    id: `gta6-${f.id}`, app_ref: f.id, game_id: "gta6", category_id: CAT[f.cat], region_id: f.regiao === "Sem local fixo" ? null : `gta6-${slug(f.regiao)}`,
    author_id: "redacao", kind: "descoberta", slug: f.id, title: f.nome,
    direct_answer: corta(`${ponto(f.local)} Recompensa: ${ponto(f.premio)}`, 580), summary: "", body_md: partes.join("\n\n"),
    location_text: f.regiao === "Sem local fixo" ? `${ponto(f.local)} Sem local fixo: não há ponto único no mapa.` : f.local,
    landmark: f.ver ?? null, coords: f.x != null && f.y != null ? { x: f.x, y: f.y } : null, pin_precision: f.prec, pin_evidence: f.prova ?? null,
    character_req: f.quem ?? null, requirements: requisitos || null, chapter: f.cap,
    progress_required: f.cap > 0 ? `A partir do Capítulo ${f.cap}` : null, conditions: f.quando ?? null,
    steps: f.passos.map((p) => (typeof p === "string" ? p : p.t)), reward: f.premio, reward_value: f.valor ?? null, reward_type: PREMIO[f.tem[0]] ?? null,
    repeatable: f.tags?.includes("repetivel") ? "Sim" : f.tags?.includes("unico") ? "Não, é único" : null,
    missable: f.ate ? `Sim: só existe até o fim do Capítulo ${f.ate}` : f.tags?.includes("perdivel") ? "Sim" : null,
    common_mistakes: [], troubleshooting: [], platform_tested: plataforma, game_version: versao, last_verified_on: f.rev,
    verification_status: SELO[f.selo], evidence_type: "relatos",
    // Capítulo 1 (ou não informado) não revela história; do 2 em diante é spoiler leve; do 4 em diante, da história.
    spoiler_level: f.cap >= 4 ? "historia" : f.cap >= 2 || f.tem.includes("historia") ? "leve" : "nenhum",
    sources: fontes, media: [], faq: [], related: [], tags: [...new Set([...(f.busca ? f.busca.toLowerCase().split(/\s+/) : []), ...(f.tags ?? []), ...f.tem])],
    seo_title: seo, seo_description: corta(`${ponto(f.local)} ${ponto(f.premio)}`, 158),
    workflow_status: "publicado", featured: destaque.has(f.id), reviewed_by: null,
    published_at: `${f.criado}T12:00:00Z`, created_at: `${f.criado}T12:00:00Z`, updated_at: `${f.mudou}T12:00:00Z`,
    _change_note: "Ficha importada do guia do aplicativo, com as fontes listadas.",
  };
});

// Guias próprios do site (não existem no aplicativo) são preservados.
const atuais = JSON.parse(fs.readFileSync("content/seed/entries.json", "utf8")) as Record<string, unknown>[];
const guias = atuais.filter((e) => e.kind === "guia").map((e) => ({
  ...e, pin_precision: null, pin_evidence: null, chapter: 0, reward_value: null, related: [], region_id: null,
  verification_status: ({ relato: "provavel", investigacao: "nao_verificado" } as Record<string, string>)[String(e.verification_status)] ?? e.verification_status,
}));

fs.writeFileSync("content/seed/entries.json", "[\n" + [...entradas, ...guias].map((e) => " " + JSON.stringify(e)).join(",\n") + "\n]\n");
fs.writeFileSync("content/seed/regions.json", JSON.stringify(regioes, null, 1) + "\n");
let commit = "desconhecido";
try { commit = execSync(`git -C "${dir}" rev-parse --short HEAD`).toString().trim(); } catch {}
fs.writeFileSync("content/seed/_origem.json", JSON.stringify({ fonte: "conteudo/ do repositório do aplicativo", commit, jogo: meta.jogo, fichas: entradas.length, guias_do_site: guias.length, importado_em: new Date().toISOString().slice(0, 10) }, null, 1) + "\n");
const por = (k: "category_id" | "verification_status") => Object.entries(entradas.reduce<Record<string, number>>((a, e) => ((a[e[k]] = (a[e[k]] ?? 0) + 1), a), {}));
console.log(`${entradas.length} fichas + ${guias.length} guias`, por("category_id"), por("verification_status"), "sem fonte:", entradas.filter((e) => e.sources.length === 0).map((e) => e.id));
