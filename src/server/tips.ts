import "server-only";
import { cache } from "react";
import { q } from "./db";
import type { Platform } from "@/lib/video-url";

export interface TipVideo { id: number; entry_id: string | null; platform: Platform; video_id: string; url: string; title: string; creator_name: string; creator_url: string | null; theme: string | null; status: "rascunho" | "aprovado" | "rejeitado"; note: string | null; sort: number }

/** Vídeos aprovados, agrupados pela dica. Sem a tabela (banco antigo), devolve vazio. */
export const getApprovedTipVideos = cache(async (): Promise<Map<string, TipVideo[]>> => {
  const rows = await q<TipVideo>(`select * from tip_videos where status = 'aprovado' and entry_id is not null order by sort, approved_at nulls last, id`).catch(() => [] as TipVideo[]);
  const out = new Map<string, TipVideo[]>();
  for (const r of rows) out.set(r.entry_id!, [...(out.get(r.entry_id!) ?? []), r]);
  return out;
});

export async function videosFor(entryId: string): Promise<TipVideo[]> {
  return (await getApprovedTipVideos()).get(entryId) ?? [];
}

/** Dados públicos do criador e do vídeo (oEmbed). Sem chave; o Instagram não tem oEmbed aberto: fica o que o dono digitar. */
export async function fetchVideoMeta(platform: Platform, url: string): Promise<{ title: string; creator_name: string; creator_url: string | null } | null> {
  const endpoint = platform === "youtube" ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
    : platform === "tiktok" ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}` : null;
  if (!endpoint) return null;
  try {
    const r = await fetch(endpoint, { signal: AbortSignal.timeout(6000), cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { title?: string; author_name?: string; author_url?: string };
    return { title: String(j.title ?? "").slice(0, 200), creator_name: String(j.author_name ?? "").slice(0, 120), creator_url: typeof j.author_url === "string" && /^https:\/\//.test(j.author_url) ? j.author_url.slice(0, 300) : null };
  } catch { return null; }
}
