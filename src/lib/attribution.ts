// De onde a pessoa veio (só com consentimento, como a medição). Fica neste navegador e segue com o pedido,
// para o painel mostrar a origem de cada compra sem depender do Google Analytics.
// Primeiro toque: a primeira origem conhecida (90 dias). Último toque: a visita que trouxe a pessoa agora.
const FIRST = "gs:origem-primeira";
const LAST = "gs:origem";
const DAYS90 = 90 * 864e5;
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

export type Origin = Partial<Record<(typeof KEYS)[number] | "ref" | "landing" | "at", string>>;

const clip = (s: string) => s.slice(0, 120);

/** Lê a visita atual (UTM, clique de anúncio ou site que mandou para cá). Sem nada disso, é visita direta e não grava. */
export function captureOrigin(now: number) {
  try {
    const url = new URL(window.location.href);
    const o: Origin = {};
    for (const k of KEYS) { const v = url.searchParams.get(k); if (v) o[k] = clip(v); }
    let ref = "";
    try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.hostname !== url.hostname && !r.hostname.endsWith(".missoessecretasgta.com.br")) ref = r.hostname; } catch {}
    if (ref) o.ref = clip(ref);
    if (Object.keys(o).length === 0) return;
    o.landing = clip(url.pathname);
    o.at = new Date(now).toISOString().slice(0, 10);
    localStorage.setItem(LAST, JSON.stringify(o));
    const first = JSON.parse(localStorage.getItem(FIRST) ?? "null") as (Origin & { exp?: number }) | null;
    if (!first || (first.exp ?? 0) < now) localStorage.setItem(FIRST, JSON.stringify({ ...o, exp: now + DAYS90 }));
  } catch {}
}

/** O que vai junto com o pedido: último e primeiro toque. Vazio se não houver nada guardado. */
export function readOrigin(): string {
  try {
    const last = JSON.parse(localStorage.getItem(LAST) ?? "null") as Origin | null;
    const first = JSON.parse(localStorage.getItem(FIRST) ?? "null") as (Origin & { exp?: number }) | null;
    if (!last && !first) return "";
    if (first) delete first.exp;
    return JSON.stringify({ ultimo: last ?? undefined, primeiro: first ?? undefined });
  } catch { return ""; }
}

/** Texto curto para o painel: "instagram / stories / lancamento" ou "google.com" ou "direto". */
export function originLabel(o: Origin | null | undefined): string {
  if (!o) return "direto ou sem consentimento";
  if (o.utm_source) return [o.utm_source, o.utm_medium, o.utm_campaign].filter(Boolean).join(" / ");
  if (o.gclid) return "Google Ads";
  if (o.fbclid) return "Facebook/Instagram (link)";
  return o.ref ?? "direto";
}
