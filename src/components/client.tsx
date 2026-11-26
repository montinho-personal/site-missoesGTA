"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { track, type TrackEvent } from "@/lib/analytics";
import { favs, spoilers } from "@/lib/store";

const sub = (name: string) => (cb: () => void) => {
  window.addEventListener(name, cb); window.addEventListener("storage", cb);
  return () => { window.removeEventListener(name, cb); window.removeEventListener("storage", cb); };
};

export function useFavIds(): string[] {
  const raw = useSyncExternalStore(sub("gs:favs"), () => { try { return localStorage.getItem("gs:favs") ?? "[]"; } catch { return "[]"; } }, () => "[]");
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export function FavButton({ id, title, withLabel }: { id: string; title: string; withLabel?: boolean }) {
  const on = useFavIds().includes(id);
  return (
    <button
      type="button"
      className={`fav-btn relative z-20 inline-flex items-center justify-center gap-2 rounded-full border border-ink-500 text-fg-muted hover:border-gold hover:text-gold ${withLabel ? "min-h-11 px-4 text-sm font-semibold" : "size-11 -m-1.5"}`}
      aria-pressed={on}
      aria-label={withLabel ? undefined : on ? `Remover "${title}" dos favoritos` : `Salvar "${title}" nos favoritos`}
      onClick={() => { const now = favs.toggle(id); track(now ? "favorite_add" : "favorite_remove", { entry_id: id }); }}
    >
      <Icon name="star" size={18} />
      {withLabel && (on ? "Salvo" : "Salvar")}
    </button>
  );
}

export function RevealButton() {
  return (
    <button type="button" className="btn btn-ghost btn-sm relative z-20"
      onClick={(ev) => { const host = ev.currentTarget.closest("[data-spoiler]"); host?.setAttribute("data-revealed", ""); track("spoiler_reveal"); }}>
      <Icon name="eye" size={16} />Mostrar mesmo assim
    </button>
  );
}

export function useSpoilersOn() {
  return useSyncExternalStore(sub("gs:spoilers"), () => spoilers.isOn(), () => true);
}

export function SpoilerToggle({ compact }: { compact?: boolean }) {
  const on = useSpoilersOn();
  return (
    <button type="button" role="switch" aria-checked={on}
      className={`inline-flex items-center gap-2.5 min-h-11 rounded-full border px-3.5 text-sm font-semibold ${on ? "border-ok/60 text-ok" : "border-ink-500 text-fg-muted"}`}
      onClick={() => { spoilers.set(!on); track("spoiler_toggle", { protection: !on }); }}>
      <Icon name={on ? "shield" : "eye"} size={18} />
      <span>{compact ? "Spoilers" : "Proteção contra spoilers"}: <span className="font-bold">{on ? "ligada" : "desligada"}</span></span>
    </button>
  );
}

export function TrackLink({ href, event, params, className, children, external }: { href: string; event: TrackEvent; params?: Record<string, string | number | boolean>; className?: string; children: React.ReactNode; external?: boolean }) {
  if (external) return <a href={href} className={className} rel="noopener" onClick={() => track(event, params)}>{children}</a>;
  return <Link href={href} className={className} onClick={() => track(event, params)}>{children}</Link>;
}

export function TrackView({ event, params }: { event: TrackEvent; params?: Record<string, string | number | boolean> }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { track(event, params); }, []);
  return null;
}

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-ink-500 text-fg-muted text-sm font-semibold hover:border-cyan hover:text-cyan"
      onClick={async () => {
        try {
          if (navigator.share) { await navigator.share({ title, url }); track("share", { method: "native", url }); }
          else { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 2500); track("share", { method: "copy", url }); }
        } catch {}
      }}>
      <Icon name={done ? "check" : "share"} size={18} />
      <span aria-live="polite">{done ? "Link copiado" : "Compartilhar"}</span>
    </button>
  );
}

/** Pix copia e cola: botão que copia o código e confirma na tela. */
export function CopyPix({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="field-label" htmlFor="pix-code">Pix copia e cola</label>
      <textarea id="pix-code" readOnly value={code} rows={3} className="field font-mono text-xs break-all" onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="btn btn-app" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {} }}>
        {copied ? "Código copiado. Agora cole no app do banco" : "Copiar código Pix"}
      </button>
      <p role="status" aria-live="polite" className="sr-only">{copied ? "Código copiado" : ""}</p>
    </div>
  );
}

/** Enquanto o Pix não confirma, a página se confere sozinha a cada poucos segundos. */
export function AutoRefresh({ seconds = 5, until }: { seconds?: number; until?: string }) {
  const router = useRouter();
  useEffect(() => {
    const stop = until ? new Date(until).getTime() + 60_000 : Infinity;
    const t = setInterval(() => { if (Date.now() < stop && document.visibilityState === "visible") router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds, until]);
  return null;
}

/** Botão que copia um texto pronto (mensagem, código) e confirma na tela. */
export function CopyText({ text, label = "Copiar mensagem", done = "Copiado" }: { text: string; label?: string; done?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="btn btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {} }}>
      {copied ? done : label}
      <span role="status" aria-live="polite" className="sr-only">{copied ? done : ""}</span>
    </button>
  );
}
