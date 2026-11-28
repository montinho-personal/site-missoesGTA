import Link from "next/link";
import { AppCta, Breadcrumbs, FaqList, JsonLd } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { entryUrl, getCtas, getGames, getPublishedEntries } from "@/server/content";
import { requireGame } from "@/server/route-helpers";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";
import { statusInfo } from "@/lib/labels";
import type { Entry } from "@/lib/types";

// Perdíveis: o que some se você avançar na história. A regra vem das próprias fichas (campo "pode perder?" ou etiqueta "perdivel").
export const revalidate = 600;
export async function generateStaticParams() { return (await getGames()).map((g) => ({ game: g.slug })); }

const isMissable = (e: Entry) => /^sim/i.test(e.missable ?? "") || e.tags.includes("perdivel");

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const g = (await getGames()).find((x) => x.slug === game);
  if (!g) return {};
  return pageMeta({
    title: `O que dá para perder em ${g.short_name}: segredos que somem`,
    description: `Os segredos de ${g.short_name} que somem se você avançar na história, separados por capítulo e com o prazo de cada um. Faça antes de passar do ponto.`,
    path: `/${g.slug}/perdiveis/`,
  });
}

export default async function Missables({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const path = `/${game}/perdiveis/`;
  const g = await requireGame(game, path);
  const [all, ctas] = await Promise.all([getPublishedEntries(g.slug), getCtas()]);
  const list = all.filter(isMissable).sort((a, b) => (a.chapter || 99) - (b.chapter || 99) || a.title.localeCompare(b.title, "pt-BR"));
  const chapters = [...new Set(list.map((e) => e.chapter || 0))];
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name, href: `/${g.slug}/` }, { name: "Perdíveis" }];
  const faq = [
    { q: `Dá para voltar e pegar depois em ${g.short_name}?`, a: "Pelo que as fontes de cada ficha registram, não: quando o prazo passa, o segredo some do jogo. Por isso esta lista vem por capítulo, com o limite de cada um." },
    { q: "Como sei em que capítulo estou?", a: "O capítulo atual aparece no menu de pausa, na parte da história. Faça os itens do seu capítulo antes de seguir para a próxima missão principal." },
    ...(list.length ? [{ q: `Quantos perdíveis já estão mapeados aqui?`, a: `${list.length} até agora. A lista cresce conforme novas fichas confirmam o prazo; cada uma traz as fontes e o selo de confiança.` }] : []),
  ];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        breadcrumbLd(crumbs, path),
        { "@type": "ItemList", name: `Perdíveis de ${g.short_name}`, url: abs(path), numberOfItems: list.length, itemListElement: list.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.title, url: abs(entryUrl(e)) })) },
        faqLd(faq),
      ] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <p className="label text-pink mb-3 inline-flex items-center gap-2"><Icon name="clock" size={16} />Corre, que some</p>
        <h1 className="text-4xl sm:text-5xl font-black">O que dá para perder em {g.short_name}</h1>
        <p className="mt-4 text-lg text-fg-muted">Tem segredo que só existe até certo ponto da história. Passou do capítulo, já era, mano. Aqui estão os que a gente já confirmou, na ordem em que somem, com o prazo de cada um.</p>
      </header>

      {list.length === 0 ? <p className="text-fg-muted">Nenhum perdível confirmado ainda.</p> : (
        <div className="flex flex-col gap-8 max-w-3xl">
          {chapters.map((ch) => (
            <section key={ch} aria-labelledby={`cap-${ch}`}>
              <h2 id={`cap-${ch}`} className="text-2xl font-extrabold">{ch ? `Capítulo ${ch}` : "Sem capítulo definido"}</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {list.filter((e) => (e.chapter || 0) === ch).map((e) => (
                  <li key={e.id}><Link href={entryUrl(e)} className="card flex flex-col gap-1.5 p-4 no-underline hover:border-violet/60">
                    <span className="flex flex-wrap items-center gap-2"><span className="font-display text-lg font-bold">{e.title}</span><span className={`badge tone-${statusInfo[e.verification_status].tone}`}>{statusInfo[e.verification_status].short}</span></span>
                    <span className="text-fg-muted">{e.category_name}{e.region_name ? ` · ${e.region_name}` : ""}</span>
                    <span className="text-[0.97rem]"><strong className="text-pink">Prazo:</strong> {(e.missable ?? "").replace(/^sim:?\s*/i, "") || "some ao avançar na história"}</span>
                  </Link></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-12"><AppCta cta={ctas.padrao} placement="perdiveis" /></div>
      <section className="mt-14 max-w-3xl" aria-labelledby="h-faq">
        <h2 id="h-faq" className="text-2xl sm:text-3xl font-extrabold mb-5">Perguntas frequentes sobre perdíveis</h2>
        <FaqList items={faq} />
      </section>
    </div>
  );
}
