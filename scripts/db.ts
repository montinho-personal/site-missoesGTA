// npm run db:migrate | db:seed | db:keywords   (use com DATABASE_URL para o Postgres real)
import fs from "node:fs";
import { getDb, migrate } from "../src/server/db";
import { seed } from "../src/server/db/seed";
import { importKeywordRows } from "../src/server/keywords";

async function main() {
  const cmd = process.argv[2];
  const db = await migrate();
  console.log(`banco: ${db.driver}${db.persistent ? "" : " (efêmero)"} · migrações em dia`);
  if (cmd === "seed") { await seed(db); console.log("conteúdo-semente aplicado (não sobrescreve o que já existe)"); }
  if (cmd === "keywords") {
    for (const f of fs.readdirSync("data/keywords/raw").filter((f) => /^serpapi-.*\.json$/.test(f))) {
      const raw = JSON.parse(fs.readFileSync(`data/keywords/raw/${f}`, "utf8")) as { termo: string; fonte: string; semente?: string; pais?: string; idioma?: string; data_coleta?: string; relevancia?: number | null }[];
      const r = await importKeywordRows(raw.map((x) => ({ keyword: x.termo, source: x.fonte, seed: x.semente, country: x.pais, language: x.idioma, date: x.data_coleta, relevance: x.relevancia })), { source: f, date: new Date().toISOString().slice(0, 10) });
      console.log(f, r);
    }
  }
  void getDb; process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
