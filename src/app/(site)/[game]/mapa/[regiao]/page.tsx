import { Explorer } from "@/components/Explorer";
import { Breadcrumbs, JsonLd } from "@/components/ui";
import { getGames, getPublishedEntries, getRegions, toCard } from "@/server/content";
import { notFoundOrRedirect, requireGame } from "@/server/route-helpers";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

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
  return pageMeta({ title: `${r.name} em GTA 6: segredos e descobertas da região`, description: `O que já foi encontrado em ${r.name}, em GTA 6: missões secretas, easter eggs, dinheiro e veículos, com status de verificação.`, path: `/${game}/mapa/${r.slug}/`, noindex: (r.entry_count ?? 0) === 0 });
}

export default async function RegionPage({ params }: Props) {
  const { game, regiao } = await params;
  const path = `/${game}/mapa/${regiao}/`;
  const g = await requireGame(game, path);
  const r = (await getRegions(g.slug)).find((x) => x.slug === regiao);
  if (!r) await notFoundOrRedirect(path);
  const region = r!;
  const cards = (await getPublishedEntries(g.slug)).filter((e) => e.region_id === region.id).map(toCard);
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name, href: `/${g.slug}/` }, { name: "Mapa e regiões", href: `/${g.slug}/mapa/` }, { name: region.name }];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbLd(crumbs, path)] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-black">{region.name}: segredos e descobertas</h1>
        <p className="mt-4 text-lg text-fg-muted">{region.description}</p>
      </header>
      <Explorer entries={cards} show={["cat", "rewardType", "status"]} />
    </div>
  );
}
