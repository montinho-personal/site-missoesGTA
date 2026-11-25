import MiniSearch from "minisearch";
import type { EntryCardData } from "./types";

export interface SearchDoc extends EntryCardData { text: string }

export const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Como o jogador fala x como o site escreve. Cada grupo é intercambiável.
const SYNONYM_GROUPS = [
  ["dinheiro", "grana", "money", "cash", "bufunfa", "tesouro", "cofre"],
  ["carro", "carros", "veiculo", "veiculos", "automovel", "caranga", "moto", "motos"],
  ["missao", "missoes", "quest", "encontro", "evento"],
  ["segredo", "segredos", "secreto", "secreta", "escondido", "escondida", "oculto"],
  ["lugar", "local", "localizacao", "onde", "area"],
  ["misterio", "misterios", "lenda", "mito", "boato"],
  ["arma", "armas", "armamento", "equipamento"],
  ["colecionavel", "colecionaveis", "coletavel", "coletaveis", "100"],
  ["dica", "dicas", "tutorial", "guia", "como"],
  ["bigfoot", "pe grande", "pegrande", "skunk", "sasquatch"],
  ["ovni", "ufo", "alien", "alienigena", "et", "disco voador"],
  ["easter", "egg", "eggs", "referencia", "referencias"],
  ["codigo", "codigos", "cheat", "cheats", "manha", "manhas", "trapaca"],
  ["salvar", "save", "gravar"],
  ["guardar", "garagem", "estacionar"],
];
const SYN = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) for (const w of group) SYN.set(w, group);

export function expandQuery(query: string): string {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const extra = new Set<string>();
  for (const w of words) for (const s of SYN.get(w) ?? []) if (!words.includes(s)) extra.add(s);
  return [...words, ...extra].join(" ");
}

const STOP = new Set(["de", "do", "da", "dos", "das", "o", "a", "os", "as", "em", "no", "na", "um", "uma", "e", "gta", "6", "vi", "para", "que"]);

export function buildIndex(docs: SearchDoc[]) {
  const ms = new MiniSearch<SearchDoc>({
    fields: ["title", "answer", "catName", "regionName", "tagText", "text"],
    storeFields: ["id", "url", "title", "answer", "catName", "icon", "regionName", "status", "spoiler", "kind"],
    extractField: (doc, field) => (field === "tagText" ? doc.tags.join(" ") : ((doc as unknown as Record<string, string>)[field] ?? "")),
    processTerm: (term) => { const t = normalize(term); return STOP.has(t) ? null : t; },
    searchOptions: {
      boost: { title: 4, tagText: 2.5, catName: 2, answer: 1.5 },
      prefix: true,
      fuzzy: (term) => (term.length > 3 ? 0.25 : false), // tolera erro de digitação
      combineWith: "OR",
    },
  });
  ms.addAll(docs);
  return ms;
}

export type SearchHit = Pick<SearchDoc, "id" | "url" | "title" | "answer" | "catName" | "icon" | "regionName" | "status" | "spoiler" | "kind">;

export function runSearch(ms: MiniSearch<SearchDoc>, query: string, limit = 8): SearchHit[] {
  const original = normalize(query).split(/\s+/).filter((w) => w && !STOP.has(w));
  if (original.length === 0) return [];
  // Termos digitados pesam mais que os sinônimos acrescentados.
  const results = ms.search(expandQuery(query), {
    boostTerm: (term) => (original.some((o) => term.startsWith(o) || o.startsWith(term)) ? 2 : 0.6),
  });
  return results.slice(0, limit) as unknown as SearchHit[];
}

let cached: Promise<MiniSearch<SearchDoc>> | null = null;
export function loadIndex() {
  cached ??= fetch("/search-index.json").then((r) => r.json()).then((docs: SearchDoc[]) => buildIndex(docs)).catch((e) => { cached = null; throw e; });
  return cached;
}
