import { Breadcrumbs, JsonLd } from "./ui";
import { breadcrumbLd } from "@/lib/seo";

/** Moldura das páginas institucionais: trilha, título e coluna de leitura. */
export function Shell({ title, lead, path, eyebrow, children, wide }: { title: string; lead?: string; path: string; eyebrow?: string; children: React.ReactNode; wide?: boolean }) {
  const crumbs = [{ name: "Início", href: "/" }, { name: title }];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbLd(crumbs, path)] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        {eyebrow && <p className="label text-pink mb-3">{eyebrow}</p>}
        <h1 className="text-4xl sm:text-5xl font-black">{title}</h1>
        {lead && <p className="mt-4 text-lg text-fg-muted">{lead}</p>}
      </header>
      <div className={wide ? "" : "max-w-3xl"}>{children}</div>
    </div>
  );
}
