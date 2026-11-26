import { Explorer } from "@/components/Explorer";
import Link from "next/link";
import { Breadcrumbs, FaqList, JsonLd } from "@/components/ui";
import { getGames, getPublishedEntries, getRegions, toCard } from "@/server/content";
import { notFoundOrRedirect, requireGame } from "@/server/route-helpers";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";

export const revalidate = 600;
export async function generateStaticParams() {
  const out: { game: string; regiao: string }[] = [];
  for (const g of await getGames()) for (const r of await getRegions(g.slug)) out.push({ game: g.slug, regiao: r.slug });
  return out;
}
type Props = PageProps<"/[game]/mapa/[regiao]">;
export async function generateMetadata({ params }: Props) {
  const { game, regiao } = await params;
  const r = (await getRegions(game)).find((x) => x.slug === regiao);
  if (!r) return {};
  // Região sem registros não tem o que oferecer ao buscador ainda.
  const longT = `${r.name} em GTA 6: segredos e descobertas da região`;
  return pageMeta({ title: longT.length <= 60 ? longT : `${r.name} em GTA 6: segredos da região`, description: `O que já foi encontrado em ${r.name}, em GTA 6: missões secretas, easter eggs, dinheiro e veículos, com status de verificação.`, path: `/${game}/mapa/${r.slug}/`, noindex: (r.entry_count ?? 0) === 0 });
}

export default async function RegionPage({ params }: Props) {
  const { game, regiao } = await params;
  const path = `/${game}/mapa/${regiao}/`;
  const g = await requireGame(game, path);
  const r = (await getRegions(g.slug)).find((x) => x.slug === regiao);
  if (!r) await notFoundOrRedirect(path);
  const region = r!;
  const inRegion = (await getPublishedEntries(g.slug)).filter((e) => e.region_id === region.id);
  const cards = inRegion.map(toCard);
  // Perguntas da região, com contagens do próprio arquivo.
  const byCat = Object.entries(inRegion.reduce<Record<string, number>>((m, e) => ((m[e.category_name] = (m[e.category_name] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
  const solid = inRegion.filter((e) => e.verification_status === "testado" || e.verification_status === "confirmado").length;
  const faq = inRegion.length ? [
    { q: `O que tem para descobrir em ${region.name} no GTA 6?`, a: `${inRegion.length} ${inRegion.length === 1 ? "registro" : "registros"} até agora: ${byCat.map(([c, n]) => `${n} em ${c.toLowerCase()}`).join(", ")}. ${solid} deles testados ou confirmados por três ou mais fontes.` },
    { q: `Dá para fazer várias descobertas de ${region.name} na mesma viagem?`, a: "Sim: use o filtro abaixo para ver o que fica na região e montar a rota. No aplicativo, o mapa mostra os pinos lado a lado e o que fica a menos de 2 km de cada um." },
  ] : [];
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name, href: `/${g.slug}/` }, { name: "Mapa e regiões", href: `/${g.slug}/mapa/` }, { name: region.name }];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        breadcrumbLd(crumbs, path),
        { "@type": "CollectionPage", name: `${region.name} em GTA 6`, description: region.description, url: abs(path), inLanguage: "pt-BR",
          mainEntity: { "@type": "ItemList", numberOfItems: cards.length, itemListElement: cards.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.title, url: abs(x.url) })) } },
        ...(faq.length ? [faqLd(faq)] : []),
      ] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-black">{region.name}: segredos e descobertas</h1>
        <p className="mt-4 text-lg text-fg-muted">{region.description}</p>
      </header>
      <Explorer entries={cards} show={["cat", "rewardType", "status"]} />
      {faq.length > 0 && (
        <section className="mt-14 max-w-3xl" aria-labelledby="h-faq">
          <h2 id="h-faq" className="text-2xl sm:text-3xl font-extrabold mb-5">Perguntas sobre {region.name}</h2>
          <FaqList items={faq} />
        </section>
      )}
      <p className="mt-10 text-fg-muted">Veja também <Link className="link" href={`/${g.slug}/mapa/`}>todas as regiões do mapa de GTA 6</Link> e <Link className="link" href={`/${g.slug}/segredos/`}>a lista completa de segredos</Link>.</p>
    </div>
  );
}
