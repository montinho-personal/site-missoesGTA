import { storyCard } from "@/app/story-card";
import { getEntry } from "@/server/content";
import { statusInfo } from "@/lib/labels";
import { STORY_HOOK } from "@/lib/share-copy";

export const revalidate = 600;

export async function GET(_req: Request, { params }: { params: Promise<{ game: string; categoria: string; slug: string }> }) {
  const { game, categoria, slug } = await params;
  const e = await getEntry(game, categoria, slug);
  if (!e) return new Response("não encontrado", { status: 404 });
  const spoiler = e.spoiler_level === "historia";
  return storyCard({
    hook: spoiler ? "Segredo com spoiler" : STORY_HOOK[categoria] ?? "Você conhecia esse?",
    title: spoiler ? "Só abre se você já passou dessa parte da história" : e.title,
    chips: [e.region_name ?? "", statusInfo[e.verification_status].label],
    footer: "Onde fica e o passo a passo:",
    art: categoria,
  });
}
