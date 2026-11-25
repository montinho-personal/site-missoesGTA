import type { Db } from "./index";
import games from "../../../content/seed/games.json";
import categories from "../../../content/seed/categories.json";
import regions from "../../../content/seed/regions.json";
import authors from "../../../content/seed/authors.json";
import entries from "../../../content/seed/entries.json";
import ctas from "../../../content/seed/ctas.json";

const JSON_COLS = new Set([
  "faq", "coords", "steps", "common_mistakes", "troubleshooting", "sources", "media", "related", "tags",
]);

async function insertRows(db: Db, table: string, rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const cols = Object.keys(row).filter((c) => !c.startsWith("_"));
    const vals = cols.map((c) => (JSON_COLS.has(c) && row[c] != null ? JSON.stringify(row[c]) : row[c]));
    const ph = cols.map((c, i) => (JSON_COLS.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`));
    await db.query(
      `insert into ${table} (${cols.join(",")}) values (${ph.join(",")}) on conflict do nothing`,
      vals,
    );
  }
}

export async function seed(db: Db) {
  await insertRows(db, "games", games);
  await insertRows(db, "categories", categories);
  await insertRows(db, "regions", regions);
  await insertRows(db, "authors", authors);
  await insertRows(db, "ctas", ctas);
  await insertRows(db, "entries", entries as Record<string, unknown>[]);
  for (const e of entries as { id: string; published_at?: string; _change_note?: string }[]) {
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
  const [{ n }] = await db.query<{ n: number }>(`select count(*)::int as n from games`);
  if (n === 0) await seed(db);
}
