"use client";
import Link from "next/link";
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
