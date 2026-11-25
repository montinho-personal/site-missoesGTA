import { Explorer } from "@/components/Explorer";
import { AppCta, Breadcrumbs, JsonLd } from "@/components/ui";
import { getCtas, getGames, getPublishedEntries, toCard } from "@/server/content";
import { requireGame } from "@/server/route-helpers";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";
import Link from "next/link";

export const revalidate = 600;
export async function generateStaticParams() { return (await getGames()).map((g) => ({ game: g.slug })); }

export async function generateMetadata({ params }: PageProps<"/[game]/segredos">) {
  const { game } = await params;
  const g = (await getGames()).find((x) => x.slug === game);
  if (!g) return {};
  return pageMeta({
    title: `Segredos de ${g.short_name}: todas as descobertas, com filtros`,
    description: `A lista completa dos segredos de ${g.short_name} já registrados: missões secretas, easter eggs, mistérios, dinheiro escondido e carros raros. Filtre por tipo, região, recompensa e status de verificação.`,
    path: `/${g.slug}/segredos/`,
  });
}

export default async function AllSecrets({ params }: PageProps<"/[game]/segredos">) {
  const { game } = await params;
  const g = await requireGame(game, `/${game}/segredos/`);
  const [entries, ctas] = await Promise.all([getPublishedEntries(g.slug), getCtas()]);
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name, href: `/${g.slug}/` }, { name: "Todos os segredos" }];
  const cards = entries.map(toCard);
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        breadcrumbLd(crumbs, `/${g.slug}/segredos/`),
        { "@type": "ItemList", name: `Segredos de ${g.short_name}`, numberOfItems: cards.length, itemListElement: cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: abs(c.url) })) },
      ] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-black">Segredos de {g.short_name}</h1>
        <p className="mt-4 text-lg text-fg-muted">Todas as descobertas registradas até agora, num lugar só. Use os filtros para achar o que dá para fazer na região onde você está ou o que rende a recompensa que você quer. O selo de cada card indica o nível de verificação, explicado em <Link href="/metodologia/" className="link">como verificamos</Link>.</p>
      </header>
      <Explorer entries={cards} show={["cat", "region", "rewardType", "status", "character"]} />
      <div className="mt-12"><AppCta cta={ctas.padrao} placement="all_secrets" /></div>
    </div>
  );
}
