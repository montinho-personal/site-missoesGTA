import "server-only";
import { q } from "./db";
import { classify } from "@/lib/keyword-rules";

export interface KeywordRow {
  keyword: string; source?: string; seed?: string; country?: string; language?: string; date?: string;
  volume?: number | null; difficulty?: number | null; trend?: string | null; relevance?: number | null;
}

const HEADERS: Record<keyof KeywordRow, RegExp> = {
  keyword: /^(keyword|palavra.?chave|termo|query|consulta|search ?term|suggestion|sugest[aã]o|top queries|pesquisa)$/i,
  volume: /volume|avg\.? monthly|buscas mensais|search vol/i, difficulty: /^(kd|difficulty|dificuldade|keyword difficulty)$/i,
  trend: /trend|tend[eê]ncia/i, source: /^(fonte|source)$/i, seed: /^(seed|semente|modifier|modificador)$/i,
  country: /^(country|pa[ií]s)$/i, language: /^(language|idioma)$/i, date: /^(data|date|data.?coleta)$/i, relevance: /^(relev[aâ]ncia|relevance)$/i,
};

/** CSV de AnswerThePublic, Keyword Planner, Search Console etc. Detecta separador e colunas. */
export function parseCsv(text: string): KeywordRow[] {
  const clean = text.replace(/^﻿/, "");
  const first = clean.split(/\r?\n/).find((l) => l.trim()) ?? "";
  const sep = [";", "\t", ","].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows: string[][] = [];
  let cur: string[] = [], cell = "", inQ = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQ) { if (ch === '"' && clean[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') inQ = false; else cell += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === sep) { cur.push(cell); cell = ""; }
    else if (ch === "\n") { cur.push(cell); rows.push(cur); cur = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || cur.length) { cur.push(cell); rows.push(cur); }
  const hi = rows.findIndex((r) => r.some((c) => HEADERS.keyword.test(c.trim())));
  if (hi < 0) return [];
  const map = Object.fromEntries((Object.keys(HEADERS) as (keyof KeywordRow)[]).map((k) => [k, rows[hi].findIndex((c) => HEADERS[k].test(c.trim()))])) as Record<keyof KeywordRow, number>;
  const num = (v?: string) => { const n = Number((v ?? "").replace(/[^\d]/g, "")); return v && /\d/.test(v) ? n : null; };
  return rows.slice(hi + 1).map((r) => ({
    keyword: (r[map.keyword] ?? "").trim(),
    volume: map.volume >= 0 ? num(r[map.volume]) : null, difficulty: map.difficulty >= 0 ? num(r[map.difficulty]) : null,
    trend: map.trend >= 0 ? r[map.trend]?.trim() || null : null, source: map.source >= 0 ? r[map.source]?.trim() : undefined,
    seed: map.seed >= 0 ? r[map.seed]?.trim() : undefined, country: map.country >= 0 ? r[map.country]?.trim() : undefined,
    language: map.language >= 0 ? r[map.language]?.trim() : undefined, date: map.date >= 0 ? r[map.date]?.trim() : undefined,
    relevance: map.relevance >= 0 ? num(r[map.relevance]) : null,
  }));
}

/**
 * Importação contínua e idempotente.
 * - Duplicata exata ou variação só de acento/caixa/“gta vi”: vira UMA linha, e o termo original é preservado em original_terms.
 * - Volumes NUNCA são somados entre variantes (podem ser a mesma demanda): fica o maior valor informado.
 * - Nada é descartado sem motivo; só linhas vazias são ignoradas.
 */
export async function importKeywordRows(rows: KeywordRow[], defaults: { source: string; date: string; country?: string; language?: string }) {
  let inserted = 0, merged = 0, skipped = 0;
  for (const r of rows) {
    if (!r.keyword || r.keyword.length < 2) { skipped++; continue; }
    const c = classify(r.keyword);
    if (!c.keyword_norm) { skipped++; continue; }
    const source = r.source || defaults.source, date = (r.date || defaults.date).slice(0, 10);
    const src = JSON.stringify([{ fonte: source, semente: r.seed ?? null, data: date }]);
    const existing = await q<{ id: number }>(`select id from keywords where keyword_norm = $1`, [c.keyword_norm]);
    if (existing.length) {
      await q(
        `update keywords set
           original_terms = case when original_terms @> $2::text::jsonb then original_terms else original_terms || $2::text::jsonb end,
           sources = case when sources @> $3::text::jsonb then sources else sources || $3::text::jsonb end,
           last_collected = greatest(last_collected, $4::date), first_collected = least(first_collected, $4::date),
           volume = case when $5::int is null then volume when volume is null then $5::int else greatest(volume, $5::int) end,
           difficulty = coalesce($6::int, difficulty), trend = coalesce($7, trend),
           relevance = case when $8::int is null then relevance when relevance is null then $8::int else greatest(relevance, $8::int) end
         where id = $1`,
        [existing[0].id, JSON.stringify([r.keyword]), src, date, r.volume ?? null, r.difficulty ?? null, r.trend ?? null, r.relevance ?? null]);
      merged++;
    } else {
      await q(
        `insert into keywords (keyword, keyword_norm, original_terms, sources, first_collected, last_collected, country, language, volume, trend, difficulty, relevance,
           intent_primary, cluster, subcluster, game, planned_url, priority, commercial_potential, app_conversion_potential, entity)
         values ($1,$2,$3::text::jsonb,$4::text::jsonb,$5::date,$5::date,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [r.keyword.toLowerCase().trim(), c.keyword_norm, JSON.stringify([r.keyword]), src, date, r.country || defaults.country || "BR", r.language || defaults.language || "pt-BR",
          r.volume ?? null, r.trend ?? null, r.difficulty ?? null, r.relevance ?? null, c.intent_primary, c.cluster, c.subcluster, c.game, c.planned_url, c.priority, c.commercial_potential, c.app_conversion_potential, "Grand Theft Auto VI"]);
      inserted++;
    }
  }
  return { inserted, merged, skipped };
}
