import { Shell } from "@/components/Shell";
import { SearchPanel } from "@/components/Search";
import { pageMeta } from "@/lib/seo";

// Resultado de busca interna nunca é indexado.
export const metadata = pageMeta({ title: "Busca", description: "Busque descobertas, missões secretas, lugares e dicas de GTA 6.", path: "/busca/", noindex: true });

export default async function Busca({ searchParams }: PageProps<"/busca">) {
  const sp = await searchParams;
  const initial = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  return <Shell title="Busca" path="/busca/"><SearchPanel key={initial} initial={initial} /></Shell>;
}
