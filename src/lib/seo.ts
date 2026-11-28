import type { Metadata } from "next";
import { abs, site } from "./site";

export const OG_VERSION = "2";
export const ogUrl = (path: string) => abs(`/og/?p=${encodeURIComponent(path)}&v=${OG_VERSION}`);

export function pageMeta(o: { title: string; description: string; path: string; noindex?: boolean; type?: "website" | "article"; published?: string | null; modified?: string | null; absoluteTitle?: boolean }): Metadata {
  return {
    // A marca entra no fim só quando o título inteiro cabe nos ~60 caracteres que o Google mostra.
    title: o.absoluteTitle || o.title.length + ` | ${site.name}`.length > 60 ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: { canonical: o.path },
    ...(o.noindex ? { robots: { index: false, follow: true } } : {}),
    twitter: { card: "summary_large_image", title: o.title, description: o.description, images: [ogUrl(o.path)] },
    openGraph: {
      type: o.type ?? "website", url: o.path, title: o.title, description: o.description, siteName: site.name, locale: "pt_BR",
      // A imagem do WhatsApp/Instagram: arte da própria página (src/app/og/route.tsx). "v" troca quando a arte muda, para os apps buscarem de novo.
      images: [{ url: ogUrl(o.path), width: 1200, height: 630, alt: o.title, type: "image/png" }],
      ...(o.type === "article" ? { publishedTime: o.published ?? undefined, modifiedTime: o.modified ?? undefined } : {}),
    },
  };
}

export const orgLd = () => ({
  "@type": "Organization", "@id": abs("/#org"), name: site.name, url: abs("/"),
  description: site.description, logo: abs("/icon.svg"),
});

export const websiteLd = () => ({
  "@context": "https://schema.org", "@graph": [
    orgLd(),
    { "@type": "WebSite", "@id": abs("/#site"), url: abs("/"), name: site.name, inLanguage: "pt-BR", publisher: { "@id": abs("/#org") },
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: abs("/busca/?q={search_term_string}") }, "query-input": "required name=search_term_string" } },
  ],
});

export const breadcrumbLd = (items: { name: string; href?: string }[], currentPath: string) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.href ?? currentPath) })),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
