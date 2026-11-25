import { describe, expect, it } from "vitest";
import { classify, normKeyword } from "../src/lib/keyword-rules";
import { buildIndex, expandQuery, runSearch, type SearchDoc } from "../src/lib/search";
import { factValue } from "../src/lib/labels";
import entries from "../content/seed/entries.json";
import categories from "../content/seed/categories.json";
import regions from "../content/seed/regions.json";

describe("banco de palavras-chave", () => {
  it("agrupa variações de acento, caixa e 'GTA VI'", () => {
    expect(normKeyword("GTA VI Missões Secretas")).toBe(normKeyword("gta 6 missoes secretas"));
    expect(normKeyword("gta6  segredos")).toBe("gta 6 segredos");
  });
  it("classifica cluster, intenção e URL planejada", () => {
    expect(classify("gta 6 missões secretas")).toMatchObject({ cluster: "exploracao-e-segredos", subcluster: "missoes-secretas", planned_url: "/gta-6/missoes-secretas/", game: "gta-6" });
    expect(classify("gta 6 como ganhar dinheiro")).toMatchObject({ cluster: "dinheiro-e-recompensas", intent_primary: "como-fazer" });
    expect(classify("gta 6 mapa interativo").cluster).toBe("comercial-app");
  });
  it("separa pesquisas de outros jogos para uso futuro, sem URL planejada", () => {
    expect(classify("armas escondidas gta 5")).toMatchObject({ game: "gta-5", priority: "futura", planned_url: null });
  });
});

describe("busca", () => {
  const docs: SearchDoc[] = (entries as { id: string; title: string; direct_answer: string; tags: string[]; category_id: string }[]).map((e) => ({
    id: e.id, url: `/x/${e.id}/`, title: e.title, answer: e.direct_answer, kind: "descoberta", cat: e.category_id, catName: categories.find((c) => c.id === e.category_id)!.name,
    icon: "x", region: null, regionName: null, status: "relato", spoiler: "nenhum", rewardType: null, character: null, updated: "", tags: e.tags, text: "",
  }));
  const ms = buildIndex(docs);
  const top = (qy: string) => runSearch(ms, qy)[0]?.title ?? "";
  it("tolera erro de digitação", () => expect(top("bigfot")).toMatch(/Pé Grande|Skunk/i));
  it("ignora acentos", () => expect(top("papagaio dinheiro")).toMatch(/papagaio/i));
  it("reconhece sinônimos", () => {
    expect(expandQuery("grana")).toContain("dinheiro");
    expect(runSearch(ms, "grana").length).toBeGreaterThan(0);
    expect(top("pé grande")).toMatch(/Pé Grande/i);
  });
  it("não inventa resultado", () => expect(runSearch(ms, "xyzqwk")).toHaveLength(0));
});

describe("integridade editorial do conteúdo-semente", () => {
  const es = entries as Record<string, unknown>[];
  it("nenhum registro é 'confirmado' sem teste direto ou fonte oficial", () => {
    for (const e of es) if (e.verification_status === "confirmado") expect(["oficial", "teste_direto"]).toContain(e.evidence_type);
  });
  it("todo registro publicado tem resposta rápida e fonte com URL", () => {
    for (const e of es.filter((x) => x.workflow_status === "publicado")) {
      expect(String(e.direct_answer).length, String(e.id)).toBeGreaterThan(20);
      const src = e.sources as { url: string }[];
      expect(src.length, String(e.id)).toBeGreaterThan(0);
      for (const s of src) expect(s.url).toMatch(/^https?:\/\//);
    }
  });
  it("referências internas existem e slugs não colidem", () => {
    const ids = new Set(es.map((e) => e.id)), seen = new Set<string>();
    for (const e of es) {
      expect(categories.some((c) => c.id === e.category_id)).toBe(true);
      if (e.region_id) expect(regions.some((r: { id: string }) => r.id === e.region_id)).toBe(true);
      for (const r of e.related as string[]) expect(ids.has(r)).toBe(true);
      const k = `${e.category_id}/${e.slug}`; expect(seen.has(k)).toBe(false); seen.add(k);
    }
  });
  it("títulos e descrições SEO dentro do limite e únicos", () => {
    const titles = es.map((e) => e.seo_title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const e of es) { expect(String(e.seo_title).length, String(e.id)).toBeLessThanOrEqual(65); expect(String(e.seo_description).length, String(e.id)).toBeLessThanOrEqual(165); }
  });
});

describe("campos vazios nunca viram invenção", () => {
  it("distingue desconhecido de não aplicável", () => {
    expect(factValue(null)).toEqual({ text: "Ainda não confirmado", known: false });
    expect(factValue("n/a")).toEqual({ text: "Não se aplica", known: true });
  });
});
