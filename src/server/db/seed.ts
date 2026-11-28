import type { Db } from "./index";
import games from "../../../content/seed/games.json";
import categories from "../../../content/seed/categories.json";
import regions from "../../../content/seed/regions.json";
import authors from "../../../content/seed/authors.json";
import entries from "../../../content/seed/entries.json";
import ctas from "../../../content/seed/ctas.json";
import tipsEntries from "../../../content/seed/tips-entries.json";
import tipVideos from "../../../content/seed/tip-videos.json";
import radarEntries from "../../../content/seed/radar-entries.json";

const JSON_COLS = new Set([
  "faq", "coords", "steps", "common_mistakes", "troubleshooting", "sources", "media", "related", "tags",
]);

async function insertRows(db: Db, table: string, rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const cols = Object.keys(row).filter((c) => !c.startsWith("_"));
    const vals = cols.map((c) => (JSON_COLS.has(c) && row[c] != null ? JSON.stringify(row[c]) : row[c]));
    const ph = cols.map((c, i) => (JSON_COLS.has(c) ? `$${i + 1}::text::jsonb` : `$${i + 1}`));
    await db.query(
      `insert into ${table} (${cols.join(",")}) values (${ph.join(",")}) on conflict do nothing`,
      vals,
    );
  }
}

// Campos do site: a revisão do app não mexe na publicação, no revisor, no destaque nem nas datas de criação.
const SITE_OWNED = new Set(["id", "workflow_status", "reviewed_by", "featured", "published_at", "created_at"]);

/** Fichas que vêm do app: o app é a fonte dos fatos, então o texto revisado lá substitui o daqui. */
async function syncAppEntries(db: Db, rows: Record<string, unknown>[]) {
  for (const row of rows) {
    if (!row.app_ref) continue;
    const cols = Object.keys(row).filter((c) => !c.startsWith("_") && !SITE_OWNED.has(c));
    const vals = cols.map((c) => (JSON_COLS.has(c) && row[c] != null ? JSON.stringify(row[c]) : row[c]));
    const sets = cols.map((c, i) => (JSON_COLS.has(c) ? `${c} = $${i + 2}::text::jsonb` : `${c} = $${i + 2}`));
    await db.query(`update entries set ${sets.join(", ")} where id = $1 and app_ref is not null`, [row.id, ...vals]);
  }
}

export async function seed(db: Db) {
  await insertRows(db, "games", games);
  await insertRows(db, "categories", categories);
  await insertRows(db, "regions", regions);
  await insertRows(db, "authors", authors);
  await insertRows(db, "ctas", ctas);
  await insertRows(db, "entries", entries as Record<string, unknown>[]);
  await syncAppEntries(db, entries as Record<string, unknown>[]);
  // Treino de Leonida: rascunhos para o dono revisar (nada disso é público até ser aprovado no painel).
  await insertRows(db, "entries", tipsEntries as Record<string, unknown>[]);
  await insertRows(db, "tip_videos", tipVideos as Record<string, unknown>[]);
  // Fichas que vieram do radar e ainda não estão no guia do app (o importador não apaga: sem app_ref).
  await insertRows(db, "entries", radarEntries as Record<string, unknown>[]);
  for (const e of [...entries, ...radarEntries] as { id: string; published_at?: string; _change_note?: string }[]) {
    const has = await db.query(`select 1 from entry_changes where entry_id = $1 limit 1`, [e.id]);
    if (has.length === 0) {
      await db.query(
        `insert into entry_changes (entry_id, changed_at, kind, note) values ($1, $2, 'criacao', $3)`,
        [e.id, e.published_at ?? new Date().toISOString(), e._change_note ?? "Registro criado a partir de relatos publicados, com fontes listadas."],
      );
    }
  }
}

export async function seedIfEmpty(db: Db) {
  // "Vazio" = sem fichas: assim uma migração que troca o conteúdo-semente recarrega tudo.
  const [{ n }] = await db.query<{ n: number }>(`select count(*)::int as n from entries`);
  if (n === 0) await seed(db);
}
