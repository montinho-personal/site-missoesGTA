"use client";
// Vídeos de dica de outros criadores: o player só carrega no toque (página leve, nada roda sem pedido),
// e o crédito com link para o criador fica sempre visível. Instagram vira cartão com link.
import { useState } from "react";
import { track } from "@/lib/analytics";
import { embedUrl, platformName, thumbUrl, type Platform } from "@/lib/video-url";

export interface PublicTipVideo { id: number; platform: Platform; video_id: string; url: string; title: string; creator_name: string; creator_url: string | null }

function Play() {
  return (
    <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-pink to-gold text-ink-950 shadow-[0_8px_30px_-6px_rgb(255_92_157/0.9)]">
      <svg viewBox="0 0 24 24" width={26} height={26} fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
    </span>
  );
}

function OneVideo({ v, context }: { v: PublicTipVideo; context: string }) {
  const [on, setOn] = useState(false);
  const ref = { platform: v.platform, id: v.video_id };
  const src = embedUrl(ref);
  const th = thumbUrl(ref);
  const who = v.creator_name;
  return (
    <figure className="flex flex-col">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-violet/40 bg-gradient-to-b from-violet-strong/40 via-ink-900 to-ink-950">
        {on && src ? (
          <iframe src={src} title={v.title || `Vídeo de ${who}`} className="absolute inset-0 size-full" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : src ? (
          <button type="button" className="group absolute inset-0 size-full cursor-pointer" aria-label={`Assistir: ${v.title || "vídeo"}, de ${who}, no ${platformName[v.platform]}`}
            onClick={() => { setOn(true); track("video_play", { video_id: `${v.platform}:${v.video_id}`, placement: "dica", context }); }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {th && <img src={th} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]" />}
            <span className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/10 to-ink-950/30" />
            <span className="absolute inset-0 grid place-items-center"><Play /></span>
            <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-semibold text-fg">{platformName[v.platform]}</span>
            <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm font-semibold leading-snug text-fg line-clamp-3">{v.title}</span>
          </button>
        ) : (
          <a href={v.url} target="_blank" rel="noopener noreferrer nofollow" className="absolute inset-0 grid place-items-center p-4 text-center" onClick={() => track("cta_click", { cta_key: "video_externo", placement: "dica", context })}>
            <span className="flex flex-col items-center gap-3"><Play /><span className="text-sm font-semibold">{v.title || "Assistir no Instagram"}</span><span className="text-xs text-fg-subtle">Abre no Instagram</span></span>
          </a>
        )}
      </div>
      <figcaption className="mt-2 text-sm text-fg-muted">
        Vídeo de {v.creator_url ? <a className="link" href={v.creator_url} target="_blank" rel="noopener noreferrer nofollow">{who}</a> : <strong className="font-semibold text-fg">{who}</strong>} · <a className="link" href={v.url} target="_blank" rel="noopener noreferrer nofollow">ver no {platformName[v.platform]}</a>
      </figcaption>
    </figure>
  );
}

export function TipVideos({ videos, context, heading = "Aprende vendo" }: { videos: PublicTipVideo[]; context: string; heading?: string }) {
  if (videos.length === 0) return null;
  return (
    <section aria-labelledby="h-videos" className="max-w-3xl">
      <p className="label text-pink">Treino de Leonida</p>
      <h2 id="h-videos" className="text-2xl font-extrabold mt-1">{heading}</h2>
      <p className="mt-1.5 text-fg-muted text-[0.97rem]">{videos.length === 1 ? "Um vídeo curto" : `${videos.length} vídeos curtos`} de quem manja, com o crédito de cada criador. Os vídeos são deles; a gente só junta o que presta.</p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">{videos.map((v) => <OneVideo key={v.id} v={v} context={context} />)}</div>
    </section>
  );
}
