import type { MetadataRoute } from "next";
import { entryUrl, getCategories, getGames, getPublishedEntries, getRegions } from "@/server/content";
import { abs } from "@/lib/site";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  const latest = (dates: string[]) => (dates.length ? new Date(dates.sort().at(-1)!) : undefined);
  let allDates: string[] = [];
  for (const g of await getGames()) {
    const [entries, cats, regions] = await Promise.all([getPublishedEntries(g.slug), getCategories(g.slug), getRegions(g.slug)]);
    const dates = entries.map((e) => e.updated_at);
    allDates = allDates.concat(dates);
    out.push({ url: abs(`/${g.slug}/`), lastModified: latest([...dates]) });
    out.push({ url: abs(`/${g.slug}/segredos/`), lastModified: latest([...dates]) });
    out.push({ url: abs(`/${g.slug}/mapa/`) });
    for (const c of cats) out.push({ url: abs(`/${g.slug}/${c.slug}/`), lastModified: latest(entries.filter((e) => e.category_id === c.id).map((e) => e.updated_at)) });
    // região vazia fica fora do sitemap (e com noindex) até ter conteúdo
    for (const r of regions) if ((r.entry_count ?? 0) > 0) out.push({ url: abs(`/${g.slug}/mapa/${r.slug}/`), lastModified: latest(entries.filter((e) => e.region_id === r.id).map((e) => e.updated_at)) });
    for (const e of entries) {
      const images = e.media.filter((m) => m.tipo === "imagem").map((m) => m.url);
      out.push({ url: abs(entryUrl(e)), lastModified: new Date(e.updated_at), ...(images.length ? { images } : {}) });
    }
  }
  out.unshift({ url: abs("/"), lastModified: latest([...allDates]) });
  for (const p of ["/app/", "/sobre/", "/metodologia/", "/radar/", "/ajuda/", "/enviar-descoberta/", "/contato/", "/privacidade/", "/termos/"]) out.push({ url: abs(p) });
  return out;
}
