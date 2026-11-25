import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { AppCta, Breadcrumbs, EntryGrid, FaqList, JsonLd, SectionHead } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getCategories, getCtas, getGames, getPublishedEntries, getRegions, toCard } from "@/server/content";
import { requireGame } from "@/server/route-helpers";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { factsCheckedOn, gta6Facts, homeFaq } from "@/lib/game-facts";
import { formatDate } from "@/lib/labels";

export const revalidate = 600;
export async function generateStaticParams() { return (await getGames()).map((g) => ({ game: g.slug })); }

export async function generateMetadata({ params }: PageProps<"/[game]">) {
  const { game } = await params;
  const g = (await getGames()).find((x) => x.slug === game);
  if (!g) return {};
  return pageMeta({
    title: `${g.short_name}: guia de segredos, missões secretas e dicas`,
    description: `Tudo o que já foi apurado sobre os segredos de ${g.short_name}: missões secretas, lugares escondidos, dinheiro, carros raros, mistérios e dicas, organizado por categoria e região.`,
    path: `/${g.slug}/`,
  });
}

export default async function GamePage({ params }: PageProps<"/[game]">) {
  const { game } = await params;
  const g = await requireGame(game, `/${game}/`);
  const [categories, entries, regions, ctas] = await Promise.all([getCategories(g.slug), getPublishedEntries(g.slug), getRegions(g.slug), getCtas()]);
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name }];
  const guides = entries.filter((e) => e.kind === "guia").slice(0, 3);
  const isGta6 = g.slug === "gta-6";
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbLd(crumbs, `/${g.slug}/`), ...(isGta6 ? [faqLd(homeFaq)] : [])] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 max-w-3xl">
        <p className="label text-pink mb-3">Guia de exploração</p>
        <h1 className="text-4xl sm:text-5xl font-black">{g.short_name}: segredos, missões secretas e dicas</h1>
        <p className="mt-4 text-lg text-fg-muted">O ponto de partida para explorar {g.name}. Escolha uma categoria, filtre por região ou vá direto às respostas rápidas. Cada registro mostra de onde veio a informação e o quanto ela já foi verificada.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${g.slug}/segredos/`} className="btn btn-primary">Ver todos os segredos<Icon name="arrow" size={18} /></Link>
          <Link href={`/${g.slug}/mapa/`} className="btn btn-ghost"><Icon name="pin" size={18} />Explorar por região</Link>
        </div>
      </header>

      {isGta6 && (
        <section className="mt-12" aria-labelledby="h-fatos">
          <h2 id="h-fatos" className="label text-fg-subtle mb-3">O jogo em resumo</h2>
          <dl className="card grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-ink-600">
            {gta6Facts.map((f) => (
              <div key={f.k} className="p-4 sm:p-5 sm:border-b sm:border-ink-600">
                <dt className="label text-cyan">{f.k}</dt>
                <dd className="mt-1.5">{f.v} <a href={f.src} rel="noopener nofollow" className="text-sm text-fg-subtle underline underline-offset-2 hover:text-fg whitespace-nowrap">({f.srcName})</a></dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm text-fg-subtle">Dados apurados em {formatDate(factsCheckedOn)}.</p>
        </section>
      )}

      <section className="mt-14" aria-labelledby="h-cats">
        <SectionHead id="h-cats" title="Categorias" />
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{categories.map((c) => <li key={c.id}><CategoryCard c={c} gameSlug={g.slug} /></li>)}</ul>
      </section>

      {guides.length > 0 && (
        <section className="mt-16" aria-labelledby="h-guias">
          <SectionHead id="h-guias" eyebrow="Começando agora?" title="Guias para os primeiros dias" href={`/${g.slug}/dicas/`} linkLabel="Todas as dicas" />
          <EntryGrid entries={guides.map(toCard)} />
        </section>
      )}

      {regions.length > 0 && (
        <section className="mt-16" aria-labelledby="h-reg">
          <SectionHead id="h-reg" title="Regiões de Leonida" href={`/${g.slug}/mapa/`} linkLabel="Ver todas" />
          <div className="flex flex-wrap gap-2.5">
            {regions.map((r) => <Link key={r.id} href={`/${g.slug}/mapa/${r.slug}/`} className="chip"><Icon name="pin" size={15} />{r.name}{(r.entry_count ?? 0) > 0 && <span className="opacity-60 text-xs">{r.entry_count}</span>}</Link>)}
          </div>
        </section>
      )}

      {isGta6 && (
        <section className="mt-16" aria-labelledby="h-faq">
          <SectionHead id="h-faq" title="Perguntas frequentes sobre GTA 6" />
          <FaqList items={homeFaq} />
        </section>
      )}
      <div className="mt-14"><AppCta cta={ctas.padrao} placement="game_hub" /></div>
    </div>
  );
}
