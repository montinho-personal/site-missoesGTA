import { ogCard } from "@/app/opengraph-image";
import { getEntry } from "@/server/content";
import { statusInfo } from "@/lib/labels";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Descoberta de GTA 6";

export default async function Image({ params }: { params: Promise<{ game: string; categoria: string; slug: string }> }) {
  const { game, categoria, slug } = await params;
  const e = await getEntry(game, categoria, slug);
  if (!e) return ogCard("Descoberta de GTA 6", "GTA 6", "");
  // Com spoiler da história, a imagem de compartilhamento não entrega o título.
  const title = e.spoiler_level === "historia" ? "Descoberta com spoiler da história" : e.title;
  return ogCard(title, `GTA 6 · ${e.category_name}`, `Status: ${statusInfo[e.verification_status].label}`);
}
