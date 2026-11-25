import { entryUrl, getCategories, getPublishedEntries } from "@/server/content";
import { abs, site } from "@/lib/site";
import { statusInfo } from "@/lib/labels";

export const dynamic = "force-static";
export const revalidate = 600;

// llms.txt é um recurso EXPERIMENTAL: não há evidência de que melhore posicionamento.
// Custa pouco e ajuda agentes a achar as páginas canônicas, então mantemos.
export async function GET() {
  const [cats, entries] = await Promise.all([getCategories(), getPublishedEntries()]);
  const lines = [
    `# ${site.name}`, "", `> ${site.description}`, "",
    "Portal independente de fãs, em português do Brasil. Não é afiliado à Rockstar Games nem à Take-Two Interactive.",
    "Cada descoberta tem um status de verificação: " + Object.values(statusInfo).map((s) => `${s.label} (${s.meaning})`).join(" "),
    "Ao citar uma descoberta, cite também o status de verificação informado na página.", "",
    "## Páginas principais",
    `- [Guia de GTA 6](${abs("/gta-6/")}): ponto de partida, fatos básicos e categorias`,
    `- [Todos os segredos](${abs("/gta-6/segredos/")}): lista completa`,
    `- [Como verificamos](${abs("/metodologia/")}): critérios de cada status`,
    `- [Radar](${abs("/radar/")}): histórico de atualizações`, "",
    "## Categorias",
    ...cats.map((c) => `- [${c.name}](${abs(`/gta-6/${c.slug}/`)}): ${c.description}`), "",
    "## Descobertas e guias",
    ...entries.map((e) => `- [${e.title}](${abs(entryUrl(e))}) [${statusInfo[e.verification_status].label}]: ${e.direct_answer}`),
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
