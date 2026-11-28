import { ogImage, type OgCard } from "@/server/og";
import { getCategories, getEntry, getRegions } from "@/server/content";
import { appSecretCount } from "@/server/app-count";
import { saleConfig } from "@/server/mercadopago";
import { statusInfo } from "@/lib/labels";

// /og/?p=/caminho/da/pagina/ → a imagem de compartilhamento daquela página.
// O texto sai do próprio site (banco e tabela abaixo), nunca da URL: ninguém consegue gerar arte com frase inventada.

const PIN: Record<string, { cor: string; glyph: string }> = {
  dinheiro: { cor: "#f3c44c", glyph: "$" },
  "armas-e-itens": { cor: "#ff7352", glyph: "!" },
  veiculos: { cor: "#5fb9ff", glyph: "?" },
  "lugares-secretos": { cor: "#b9a0ff", glyph: "?" },
  "missoes-secretas": { cor: "#9fdc6e", glyph: "?" },
  "easter-eggs": { cor: "#45dcc6", glyph: "?" },
  guia: { cor: "#ff5c9d", glyph: "i" },
};

const FIXAS: Record<string, Omit<OgCard, "cta"> & { cta?: string }> = {
  "/gta-6/": { eyebrow: "Guia de GTA 6", title: "Tudo que Leonida esconde, num lugar só.", chips: ["Dinheiro", "Carros raros", "Bunkers"] },
  "/gta-6/perdiveis/": { eyebrow: "Corre, que some", title: "O que dá para perder em GTA 6.", chips: ["Por capítulo", "Com o prazo"], glyph: "!" },
  "/gta-6/segredos/": { eyebrow: "Todos os segredos", title: "A lista inteira do que o jogo não te conta." },
  "/gta-6/mapa/": { eyebrow: "Regiões do mapa", title: "Leonida é grande. Não se perde, parça.", glyph: "?" },
  "/sobre/": { eyebrow: "Quem escreve", title: "Fãs que leram o jogo de trás pra frente." },
  "/metodologia/": { eyebrow: "Como verificamos", title: "Cada segredo com fonte e selo de confiança.", chips: ["Confirmado", "Provável", "Não verificado"] },
  "/radar/": { eyebrow: "Radar de descobertas", title: "O que apareceu de novo em Leonida." },
  "/ajuda/": { eyebrow: "Central de ajuda", title: "Travou? A gente destrava, mano." },
  "/app/como-baixar-e-usar/": { eyebrow: "Manual do comparsa", title: "Do Pix ao primeiro pino no mapa em minutos.", glyph: "R$" },
  "/enviar-descoberta/": { eyebrow: "Achou um segredo?", title: "Manda pra gente. Se for real, vira ficha." },
  "/contato/": { eyebrow: "Contato", title: "Fala com a gente." },
};

async function cardFor(path: string): Promise<OgCard> {
  const [n, sale] = await Promise.all([appSecretCount().catch(() => null), saleConfig().catch(() => null)]);
  const gancho = n ? `${n} segredos pra meter o loko` : "Segredos pra meter o loko";
  const preco = sale?.priceLabel ?? "R$ 4,20";
  const ctaApp = sale?.enabled ? `App por ${preco}` : "Conheça o app";
  if (path === "/") return { eyebrow: gancho, title: "O GTA 6 esconde muito mais do que você imagina.", chips: ["Pino no mapa", "Passo a passo", "Vídeo de quem fez"], cta: "Bora explorar" };
  if (path === "/app/") return { eyebrow: `App · ${gancho}`, title: "O segredo a gente revela. A aventura é você quem vive.", chips: [`${preco} uma vez só`, "Sem mensalidade", "Sim, 4,20"], cta: ctaApp, glyph: "R$" };
  const fixa = FIXAS[path];
  if (fixa) return { cta: "Bora ver", ...fixa };
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "gta-6" && parts[1] === "mapa" && parts[2]) {
    const r = (await getRegions("gta-6")).find((x) => x.slug === parts[2]);
    if (r) return { eyebrow: "GTA 6 · Região do mapa", title: `Os segredos de ${r.name}`, chips: r.entry_count ? [`${r.entry_count} no mapa`] : [], cta: "Ver a região" };
  }
  if (parts[0] === "gta-6" && parts[1] && !parts[2]) {
    const c = (await getCategories("gta-6")).find((x) => x.slug === parts[1]);
    if (c) {
      const p = PIN[c.slug];
      return { eyebrow: `GTA 6 · ${c.name}`, title: c.tagline || c.seo_title || c.name, chips: c.entry_count ? [`${c.entry_count} ${c.entry_count === 1 ? "ficha" : "fichas"}`, "Com fonte e selo"] : [], cta: "Bora ver", pin: p?.cor, glyph: p?.glyph };
    }
  }
  if (parts[0] === "gta-6" && parts[1] && parts[2]) {
    const e = await getEntry("gta-6", parts[1], parts[2]);
    if (e) {
      const p = PIN[e.category_slug];
      const spoiler = e.spoiler_level === "historia";
      if (e.kind === "guia") return { eyebrow: "Guia do jogador", title: e.title, chips: ["Resposta direta", "Com fonte"], cta: "Ler o guia", pin: PIN.guia.cor, glyph: "i" };
      return {
        eyebrow: `GTA 6 · ${e.category_name}`,
        // Com spoiler da história, a imagem não entrega o título.
        title: spoiler ? "Segredo com spoiler da história. Abre por tua conta." : e.title,
        chips: [statusInfo[e.verification_status].label, ...(e.region_name ? [e.region_name] : [])],
        cta: "Onde fica? Bora ver", pin: p?.cor, glyph: p?.glyph,
      };
    }
  }
  return { eyebrow: gancho, title: "O GTA 6 esconde muito mais do que você imagina.", cta: "Bora explorar" };
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("p") ?? "/";
  const path = /^\/[a-z0-9/-]{0,160}$/.test(raw) ? (raw.endsWith("/") ? raw : `${raw}/`) : "/";
  return ogImage(await cardFor(path));
}
