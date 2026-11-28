"use client";
// O trailer do app no site. Só carrega o YouTube (versão sem cookies) quando a pessoa toca:
// a página continua leve e nada do Google roda sem pedido.
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { track } from "@/lib/analytics";
import { trailer } from "@/lib/trailer";

const src = `${trailer.embedUrl}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

function Play({ big }: { big?: boolean }) {
  return (
    <span aria-hidden="true" className={`grid place-items-center rounded-full bg-gradient-to-br from-pink to-gold text-ink-950 shadow-[0_8px_30px_-6px_rgb(255_92_157/0.9)] ${big ? "size-20" : "size-11"}`}>
      <svg viewBox="0 0 24 24" width={big ? 34 : 20} height={big ? 34 : 20} fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
    </span>
  );
}

const Frame = () => (
  <iframe src={src} title={trailer.title} className="absolute inset-0 size-full" loading="lazy"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
);

/** Destaque: o vídeo em pé, grande, tocando no próprio lugar. Para a página do app e o bloco do app na home. */
export function TrailerFeature({ placement, caption = "Veja o app em ação em 1 minuto." }: { placement: string; caption?: string }) {
  const [on, setOn] = useState(false);
  return (
    <figure className="mx-auto w-full max-w-[19rem]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.6rem] border border-violet/50 bg-ink-950 shadow-[0_20px_60px_-20px_rgb(109_67_224/0.9)]">
        {on ? <Frame /> : (
          <button type="button" onClick={() => { setOn(true); track("video_play", { placement }); }} className="group absolute inset-0 size-full cursor-pointer" aria-label={`Assistir: ${trailer.title} (${trailer.durationLabel})`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={trailer.poster} alt="" width={540} height={960} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
            <span className="absolute inset-0 grid place-items-center"><Play big /></span>
            <span className="absolute inset-x-0 bottom-0 p-4 text-left">
              <span className="label text-gold">Trailer · {trailer.durationLabel}</span>
              <span className="mt-1 block font-display text-lg font-extrabold leading-tight text-fg">Dá o play, mano.</span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-center text-sm text-fg-muted">{caption} <a href={trailer.watchUrl} className="link" target="_blank" rel="noopener">Ver no YouTube</a></figcaption>
    </figure>
  );
}

/** Compacto: miniatura ao lado do texto; o vídeo abre numa janela por cima. Para as chamadas do app nas outras páginas. */
export function TrailerCompact({ placement }: { placement: string }) {
  const box = useRef<HTMLDialogElement>(null);
  const [on, setOn] = useState(false);
  const open = () => { setOn(true); box.current?.showModal(); track("video_play", { placement }); };
  const close = () => { box.current?.close(); };
  return (
    <figure className="flex items-center gap-4">
      <button type="button" onClick={open} className="group relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-xl border border-violet/50 bg-ink-950 cursor-pointer" aria-label={`Assistir: ${trailer.title} (${trailer.durationLabel})`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trailer.poster} alt="" width={540} height={960} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-ink-950/30"><Play /></span>
      </button>
      <figcaption className="text-[0.97rem]">
        <button type="button" onClick={open} className="font-display font-bold text-fg underline decoration-violet/60 underline-offset-4 cursor-pointer text-left">Assista ao trailer do app ({trailer.durationLabel})</button>
        <span className="mt-1 block text-fg-muted">Telas reais do app, sem enrolação.</span>
      </figcaption>
      <dialog ref={box} aria-label={trailer.title} onClose={() => setOn(false)} onClick={(e) => { if (e.target === box.current) close(); }}
        className="m-auto w-[min(22rem,92vw)] max-w-none bg-transparent p-0 backdrop:bg-ink-950/85">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.4rem] border border-violet/50 bg-ink-950">{on && <Frame />}</div>
        <button type="button" onClick={close} className="btn btn-ghost mt-3 w-full">Fechar vídeo<Icon name="close" size={18} /></button>
      </dialog>
    </figure>
  );
}

/**
 * No rodapé de toda página que ainda não mostra o trailer no conteúdo (mapa, sobre, radar, ajuda, favoritos...).
 * Some onde o vídeo já está no corpo da página, para não repetir, e nas telas de compra e de conta.
 */
const JA_TEM = [/^\/$/, /^\/app\//, /^\/conta\//, /^\/gta-6\/$/, /^\/gta-6\/segredos\//, /^\/gta-6\/(?!mapa\/)[^/]+\//];
export function FooterTrailer() {
  const path = usePathname() ?? "/";
  const p = path.endsWith("/") ? path : `${path}/`;
  if (JA_TEM.some((r) => r.test(p))) return null;
  return (
    <section aria-label="Trailer do aplicativo" className="mt-6">
      <TrailerCompact placement="footer_video" />
    </section>
  );
}
