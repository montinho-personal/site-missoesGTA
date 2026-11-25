// Banco mestre de palavras-chave em arquivo (versão portátil do que o painel guarda no banco).
// Uso: npm run keywords  → lê data/keywords/raw/*.json e *.csv e gera data/keywords/banco-mestre.csv e .json
import fs from "node:fs";
import path from "node:path";
import { classify } from "../src/lib/keyword-rules";

const RAW = "data/keywords/raw";
type Raw = { termo: string; fonte: string; semente?: string; pais?: string; idioma?: string; data_coleta?: string; relevancia?: number | null };
type Row = ReturnType<typeof classify> & { keyword: string; original_terms: string[]; sources: string[]; seeds: string[]; first: string; last: string; country: string; language: string; relevance: number | null; volume: null; trend: null; difficulty: null };

const bank = new Map<string, Row>();
for (const f of fs.readdirSync(RAW).filter((f) => /^serpapi-.*\.json$/.test(f))) {
  for (const r of JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8")) as Raw[]) {
    if (!r.termo) continue;
    const c = classify(r.termo);
    const date = r.data_coleta ?? "";
    const cur = bank.get(c.keyword_norm);
    if (cur) {
      if (!cur.original_terms.includes(r.termo)) cur.original_terms.push(r.termo);
      if (!cur.sources.includes(r.fonte)) cur.sources.push(r.fonte);
      if (r.semente && !cur.seeds.includes(r.semente)) cur.seeds.push(r.semente);
      cur.relevance = Math.max(cur.relevance ?? 0, r.relevancia ?? 0) || null;
      if (date > cur.last) cur.last = date; if (date < cur.first) cur.first = date;
    } else {
      bank.set(c.keyword_norm, { ...c, keyword: r.termo.toLowerCase(), original_terms: [r.termo], sources: [r.fonte], seeds: r.semente ? [r.semente] : [], first: date, last: date, country: r.pais ?? "BR", language: r.idioma ?? "pt-BR", relevance: r.relevancia ?? null, volume: null, trend: null, difficulty: null });
    }
  }
}
const rows = [...bank.values()].sort((a, b) => a.game.localeCompare(b.game) || a.cluster.localeCompare(b.cluster) || (b.relevance ?? 0) - (a.relevance ?? 0));
const cols = ["keyword", "termos_originais", "fontes", "sementes", "primeira_coleta", "ultima_coleta", "pais", "idioma", "volume", "tendencia", "dificuldade", "relevancia_autocomplete", "intencao_primaria", "intencao_secundaria", "cluster", "subcluster", "entidade_principal", "jogo", "palavra_chave_principal_da_pagina", "palavras_chave_secundarias", "url_planejada", "url_existente", "prioridade_editorial", "potencial_comercial", "potencial_conversao_app", "status_producao", "status_indexacao", "precisa_atualizar"];
const esc = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = [cols.join(",")].concat(rows.map((r) => [r.keyword, r.original_terms.join(" | "), r.sources.join(" | "), r.seeds.join(" | "), r.first, r.last, r.country, r.language, "", "", "", r.relevance ?? "", r.intent_primary, "", r.cluster, r.subcluster ?? "", r.game === "gta-6" ? "Grand Theft Auto VI" : "", r.game, "", "", r.planned_url ?? "", "", r.priority, r.commercial_potential, r.app_conversion_potential, "nao_iniciado", "", "nao"].map(esc).join(",")));
fs.writeFileSync("data/keywords/banco-mestre.csv", csv.join("\n") + "\n");
fs.writeFileSync("data/keywords/banco-mestre.json", JSON.stringify(rows, null, 1));
const by = (k: "cluster" | "game") => Object.entries(rows.reduce<Record<string, number>>((a, r) => ((a[r[k]] = (a[r[k]] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
console.log(`${rows.length} termos únicos`); console.log("por jogo:", by("game")); console.log("por cluster:", by("cluster"));
