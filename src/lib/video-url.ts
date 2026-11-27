// Reconhece links de vídeo (YouTube, TikTok, Instagram) e monta o player. Só incorporamos: nunca baixamos o vídeo de ninguém.
export type Platform = "youtube" | "tiktok" | "instagram";
export interface VideoRef { platform: Platform; id: string; url: string }

export function parseVideoUrl(raw: string): VideoRef | null {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const yt = (id: string | null | undefined) => (id && /^[A-Za-z0-9_-]{11}$/.test(id) ? { platform: "youtube" as const, id, url: `https://www.youtube.com/watch?v=${id}` } : null);
  if (host === "youtu.be") return yt(u.pathname.slice(1).split("/")[0]);
  if (host === "youtube.com" || host === "music.youtube.com") {
    if (u.pathname === "/watch") return yt(u.searchParams.get("v"));
    const m = /^\/(shorts|embed|live)\/([^/?#]+)/.exec(u.pathname);
    return m ? yt(m[2]) : null;
  }
  if (host === "youtube-nocookie.com") { const m = /^\/embed\/([^/?#]+)/.exec(u.pathname); return m ? yt(m[1]) : null; }
  if (host === "tiktok.com") {
    const m = /^\/@([\w.]+)\/video\/(\d{8,22})/.exec(u.pathname);
    return m ? { platform: "tiktok", id: m[2], url: `https://www.tiktok.com/@${m[1]}/video/${m[2]}` } : null;
  }
  if (host === "instagram.com") {
    const m = /^\/(?:[\w.]+\/)?(reel|reels|p)\/([A-Za-z0-9_-]{5,40})/.exec(u.pathname);
    return m ? { platform: "instagram", id: m[2], url: `https://www.instagram.com/reel/${m[2]}/` } : null;
  }
  return null;
}

/** Endereço do player (só YouTube e TikTok tocam dentro do site; Instagram vira cartão com link). */
export function embedUrl(v: { platform: Platform; id: string }): string | null {
  if (v.platform === "youtube") return `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
  if (v.platform === "tiktok") return `https://www.tiktok.com/player/v1/${v.id}?autoplay=1&rel=0&description=0&music_info=0`;
  return null;
}

/** Miniatura estável (o YouTube tem; a do TikTok expira, então o site usa um cartão próprio). */
export const thumbUrl = (v: { platform: Platform; id: string }) => (v.platform === "youtube" ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : null);

export const platformName: Record<Platform, string> = { youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram" };

/** Os temas do Treino de Leonida. Ficam como etiqueta "tema:<chave>" nas dicas. */
export const TIP_THEMES = [
  { key: "comandos", name: "Comandos e controles", short: "Comandos" },
  { key: "mira", name: "Mira e configurações", short: "Mira" },
  { key: "assaltos", name: "Assaltos e fugas", short: "Assaltos" },
  { key: "dinheiro", name: "Dinheiro rápido", short: "Dinheiro" },
  { key: "direcao", name: "Direção e perseguição", short: "Direção" },
  { key: "combate", name: "Combate", short: "Combate" },
] as const;
export type TipTheme = (typeof TIP_THEMES)[number]["key"];
export const themeOf = (tags: string[]): TipTheme | null => {
  const t = tags.find((x) => x.startsWith("tema:"))?.slice(5);
  return (TIP_THEMES.find((x) => x.key === t)?.key ?? null) as TipTheme | null;
};
