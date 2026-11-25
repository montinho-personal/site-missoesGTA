import { getPublishedEntries, toCard } from "@/server/content";

export const dynamic = "force-static";
export const revalidate = 600;

export async function GET() {
  const entries = await getPublishedEntries();
  const docs = entries.map((e) => ({
    ...toCard(e),
    // texto de apoio para a busca: local, referência e resumo
    text: [e.summary, e.location_text, e.landmark, e.reward].filter(Boolean).join(" "),
  }));
  return Response.json(docs, { headers: { "X-Robots-Tag": "noindex" } });
}
