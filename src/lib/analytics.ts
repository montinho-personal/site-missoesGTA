// Mensuração só depois do consentimento (LGPD). Sem consentimento, track() não faz nada.
export type TrackEvent =
  | "search" | "search_no_results" | "search_result_click"
  | "view_discovery" | "category_click" | "filter_use"
  | "cta_click" | "view_app_landing" | "app_interest_click" | "begin_checkout" | "purchase"
  | "waitlist_signup" | "share" | "favorite_add" | "favorite_remove"
  | "spoiler_toggle" | "spoiler_reveal" | "submission_sent" | "video_play";

const KEY = "gs:consent";
export const getConsent = (): "granted" | "denied" | null => {
  try { return localStorage.getItem(KEY) as "granted" | "denied" | null; } catch { return null; }
};
export const setConsent = (v: "granted" | "denied") => {
  try { localStorage.setItem(KEY, v); } catch {}
  window.dispatchEvent(new CustomEvent("gs:consent", { detail: v }));
};

declare global { interface Window { dataLayer?: Record<string, unknown>[] } }

export function track(event: TrackEvent, params: Record<string, string | number | boolean | null | undefined> = {}) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
