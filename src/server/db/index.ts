import "server-only";
import { migrations } from "./schema";

// Convenção para colunas JSONB: o valor vai como texto JSON e o SQL faz o cast
// "$n::text::jsonb". Com "$n::jsonb" direto, o driver postgres serializa a string
// outra vez e grava um JSON duplamente codificado (o PGlite não faz isso).
export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  /** "postgres" = banco persistente; "pglite" = banco local/efêmero */
  driver: "postgres" | "pglite";
  persistent: boolean;
}

type G = typeof globalThis & { __db?: Promise<Db> };
const g = globalThis as G;

async function runMigrations(db: Db) {
  await db.query(`create table if not exists _migrations (id text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await db.query<{ id: string }>(`select id from _migrations`)).map((r) => r.id));
  let applied = 0;
  for (const m of migrations) {
    if (done.has(m.id)) continue;
    for (const stmt of m.sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
      await db.query(stmt);
    }
    await db.query(`insert into _migrations (id) values ($1)`, [m.id]);
    applied++;
  }
  return applied;
}

async function createPostgres(url: string): Promise<Db> {
  const { default: postgres } = await import("postgres");
  const sql = postgres(url, { max: 5, idle_timeout: 20, prepare: false, onnotice: () => {} });
  // O banco se prepara sozinho: na primeira conexão aplica as migrações pendentes
  // e, se estiver vazio, carrega o conteúdo inicial. A trava evita que os
  // processos paralelos do build façam isso ao mesmo tempo.
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(72727401)`;
    const inTx: Db = { driver: "postgres", persistent: true, async query<T>(text: string, params: unknown[] = []) { return (await tx.unsafe(text, params as never[])) as unknown as T[]; } };
    const applied = await runMigrations(inTx);
    const { seed, seedIfEmpty } = await import("./seed");
    // Migração nova pode ter trocado o conteúdo-semente: recarrega (o seed nunca sobrescreve o que existe).
    if (applied > 0) await seed(inTx); else await seedIfEmpty(inTx);
  });
  return {
    driver: "postgres",
    persistent: true,
    async query<T>(text: string, params: unknown[] = []) {
      return (await sql.unsafe(text, params as never[])) as unknown as T[];
    },
  };
}

async function createPglite(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  // Em desenvolvimento o banco fica em disco (.data/) para o painel funcionar
  // de verdade; no build e em produção sem DATABASE_URL ele é só memória.
  const onDisk = process.env.NODE_ENV === "development" || process.env.PGLITE_DIR;
  const dir = process.env.PGLITE_DIR || ".data/pglite";
  if (onDisk) (await import("node:fs")).mkdirSync(dir, { recursive: true });
  const pg = onDisk ? new PGlite(dir) : new PGlite();
  const db: Db = {
    driver: "pglite",
    persistent: Boolean(onDisk),
    async query<T>(text: string, params: unknown[] = []) {
      const res = await pg.query(text, params as never[]);
      return res.rows as T[];
    },
  };
  const applied = await runMigrations(db);
  const { seed, seedIfEmpty } = await import("./seed");
  if (applied > 0) await seed(db); else await seedIfEmpty(db);
  return db;
}

export function getDb(): Promise<Db> {
  if (!g.__db) {
    const url = process.env.DATABASE_URL;
    g.__db = (url ? createPostgres(url) : createPglite()).catch((e) => {
      g.__db = undefined;
      throw e;
    });
  }
  return g.__db;
}

export async function q<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  return (await getDb()).query<T>(text, params);
}

/** Usado por scripts/db.ts contra o Postgres real. */
export async function migrate() {
  const db = await getDb();
  await runMigrations(db);
  return db;
}

/** Escrita só faz sentido quando o banco sobrevive à requisição. */
export async function canWrite(): Promise<boolean> {
  return (await getDb()).persistent;
}
