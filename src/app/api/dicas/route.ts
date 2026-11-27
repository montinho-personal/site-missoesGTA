import { getPublishedEntries, entryUrl } from "@/server/content";
import { getApprovedTipVideos } from "@/server/tips";
import { themeOf, TIP_THEMES, platformName } from "@/lib/video-url";
import { abs } from "@/lib/site";

// Lista pública das dicas em vídeo que o app mostra no modo rápido (vídeo + texto curto + "guia completo no site").
// Só entra dica publicada e com pelo menos um vídeo aprovado. O texto e o link vêm daqui; o app não reescreve nada.
export const revalidate = 600;

const curto = (t: string, n = 220) => (t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);

export async function GET() {
  const [entries, videos] = await Promise.all([getPublishedEntries("gta-6"), getApprovedTipVideos()]);
  const dicas = entries
    .filter((e) => e.category_slug === "dicas" && (videos.get(e.id)?.length ?? 0) > 0)
    .map((e) => {
      const tema = themeOf(e.tags);
      return {
        id: e.id,
        titulo: e.title,
        tema,
        tema_nome: TIP_THEMES.find((t) => t.key === tema)?.name ?? null,
        resumo: curto(e.direct_answer || e.summary),
        selo: e.verification_status,
        atualizado: e.updated_at,
        site: abs(`${entryUrl(e)}?utm_source=app&utm_medium=dica&utm_campaign=treino_de_leonida`),
        videos: videos.get(e.id)!.map((v) => ({ plataforma: v.platform, plataforma_nome: platformName[v.platform], id: v.video_id, url: v.url, titulo: v.title, criador: v.creator_name, criador_url: v.creator_url })),
      };
    });
  return Response.json({ v: 1, temas: TIP_THEMES, total: dicas.length, dicas }, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400", "Access-Control-Allow-Origin": "*" },
  });
}
