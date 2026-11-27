import Link from "next/link";
import Markdown from "react-markdown";
import { Explorer } from "@/components/Explorer";
import { AppCta, Breadcrumbs, FaqList, JsonLd } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getCategories, getCtas, getGames, getPublishedEntries, toCard } from "@/server/content";
import { notFoundOrRedirect, requireGame } from "@/server/route-helpers";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";
import { categoryFaq } from "@/lib/seo-entry";

export const revalidate = 600;
export async function generateStaticParams() {
  const out: { game: string; categoria: string }[] = [];
  for (const g of await getGames()) for (const c of await getCategories(g.slug)) out.push({ game: g.slug, categoria: c.slug });
  return out;
}

export async function generateMetadata({ params }: PageProps<"/[game]/[categoria]">) {
  const { game, categoria } = await params;
  const c = (await getCategories(game)).find((x) => x.slug === categoria);
  if (!c) return {};
  return pageMeta({ title: c.seo_title || `${c.name} de GTA 6`, description: c.seo_description || c.description, path: `/${game}/${c.slug}/` });
}

export default async function CategoryPage({ params }: PageProps<"/[game]/[categoria]">) {
  const { game, categoria } = await params;
  const path = `/${game}/${categoria}/`;
  const g = await requireGame(game, path);
  const categories = await getCategories(g.slug);
  const c = categories.find((x) => x.slug === categoria);
  if (!c) await notFoundOrRedirect(path);
  const cat = c!;
  const [all, ctas] = await Promise.all([getPublishedEntries(g.slug), getCtas()]);
  const inCat = all.filter((e) => e.category_id === cat.id);
  const cards = inCat.map(toCard);
  const faq = [...cat.faq, ...categoryFaq(cat.name, inCat)];
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name, href: `/${g.slug}/` }, { name: cat.name }];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        breadcrumbLd(crumbs, path),
        { "@type": "CollectionPage", name: cat.seo_title || cat.name, description: cat.description, url: abs(path), inLanguage: "pt-BR",
          mainEntity: { "@type": "ItemList", numberOfItems: cards.length, itemListElement: cards.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.title, url: abs(x.url) })) } },
        ...(faq.length ? [faqLd(faq)] : []),
      ] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <p className="label text-cyan mb-3 inline-flex items-center gap-2"><Icon name={cat.icon} size={16} />{cat.tagline}</p>
        <h1 className="text-4xl sm:text-5xl font-black">{cat.name} de {g.short_name}</h1>
        <div className="prose mt-4 text-lg text-fg-muted"><Markdown>{cat.intro_md || cat.description}</Markdown></div>
      </header>

      <Explorer entries={cards} show={["region", "rewardType", "status", "character"]} />

      <div className="mt-12"><AppCta cta={ctas[cat.cta_key ?? "padrao"] ?? ctas.padrao} placement="category" context={cat.slug} /></div>

      {faq.length > 0 && (
        <section className="mt-14" aria-labelledby="h-faq">
          <h2 id="h-faq" className="text-2xl sm:text-3xl font-extrabold mb-5">Perguntas frequentes sobre {cat.name.toLowerCase()} de {g.short_name}</h2>
          <FaqList items={faq} />
        </section>
      )}

      <section className="mt-10 card p-5 sm:p-6 max-w-3xl" aria-labelledby="h-fontes">
        <h2 id="h-fontes" className="label text-fg-subtle">Fontes e como checamos</h2>
        <p className="mt-2 text-fg-muted">Cada ficha lista as próprias fontes. As informações oficiais do jogo estão no <a className="link" href="https://www.rockstargames.com/VI" target="_blank" rel="noopener">site oficial de GTA VI, da Rockstar Games</a>. Para entender os selos, veja <Link className="link" href="/metodologia/">como decidimos o status de cada descoberta</Link>. Este é um guia não oficial, sem ligação com a Rockstar Games.</p>
      </section>

      <nav className="mt-14" aria-labelledby="h-outras">
        <h2 id="h-outras" className="label text-fg-subtle mb-3">Outras categorias</h2>
        <div className="flex flex-wrap gap-2.5">
          {categories.filter((x) => x.id !== cat.id).map((x) => <Link key={x.id} href={`/${g.slug}/${x.slug}/`} className="chip"><Icon name={x.icon} size={15} />{x.name}</Link>)}
        </div>
      </nav>
    </div>
  );
}
