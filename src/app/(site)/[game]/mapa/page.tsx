import Link from "next/link";
import { Breadcrumbs, Callout, JsonLd } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getGames, getPublishedEntries, getRegions } from "@/server/content";
import { requireGame } from "@/server/route-helpers";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const revalidate = 600;
export async function generateStaticParams() { return (await getGames()).map((g) => ({ game: g.slug })); }
export async function generateMetadata({ params }: PageProps<"/[game]/mapa">) {
  const { game } = await params;
  return pageMeta({ title: "Mapa de GTA 6: regiões de Leonida e segredos de cada uma", description: "As regiões do mapa de GTA 6 e as descobertas registradas em cada uma: Vice City, Leonida Keys, Port Gellhorn, Mount Kalaga e outras.", path: `/${game}/mapa/` });
}

export default async function MapPage({ params }: PageProps<"/[game]/mapa">) {
  const { game } = await params;
  const g = await requireGame(game, `/${game}/mapa/`);
  const [regions, entries] = await Promise.all([getRegions(g.slug), getPublishedEntries(g.slug)]);
  const noRegion = entries.filter((e) => !e.region_id && e.kind === "descoberta").length;
  const crumbs = [{ name: "Início", href: "/" }, { name: g.short_name, href: `/${g.slug}/` }, { name: "Mapa e regiões" }];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbLd(crumbs, `/${g.slug}/mapa/`)] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-black">Mapa de {g.short_name}: regiões e segredos</h1>
        <p className="mt-4 text-lg text-fg-muted">Escolha a região onde você está no jogo para ver o que já foi registrado por lá.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((r) => (
          <li key={r.id}>
            <Link href={`/${g.slug}/mapa/${r.slug}/`} className="card grid-paper p-5 flex flex-col gap-2 h-full">
              <span className="label text-cyan inline-flex items-center gap-1.5"><Icon name="pin" size={15} />{(r.entry_count ?? 0) > 0 ? `${r.entry_count} ${r.entry_count === 1 ? "registro" : "registros"}` : "Em apuração"}</span>
              <h2 className="font-display text-2xl font-bold">{r.name}</h2>
              <p className="text-fg-muted text-[0.97rem]">{r.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      {noRegion > 0 && <p className="mt-5 text-fg-muted">{noRegion} {noRegion === 1 ? "descoberta ainda não tem" : "descobertas ainda não têm"} região definida, porque as fontes divergem sobre o local. Elas estão em <Link className="link" href={`/${g.slug}/segredos/`}>todos os segredos</Link>.</p>}
      <div className="mt-10 max-w-3xl">
        <Callout icon="info" title="Por que não há um mapa interativo aqui?">
          <p>Um mapa com marcadores só é útil se cada ponto estiver certo. Enquanto não tivermos coordenadas conferidas dentro do jogo, preferimos organizar por região e descrever o ponto de referência de cada descoberta. O mapa interativo está no roteiro do projeto.</p>
        </Callout>
      </div>
    </div>
  );
}
