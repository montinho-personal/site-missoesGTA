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

declare global { interface Window { gtag?: (...args: unknown[]) => void } }

/** Nomes recomendados do GA4 (aparecem prontos nos relatórios). Os outros vão com o nome daqui. */
const GA4_NAME: Partial<Record<TrackEvent, string>> = { waitlist_signup: "generate_lead", search: "search" };

type Params = Record<string, unknown>;

export function track(event: TrackEvent, params: Params = {}) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  if (window.gtag) window.gtag("event", GA4_NAME[event] ?? event, params);
  else { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event, ...params }); }
}

/** O produto, no formato de comércio eletrônico do GA4. */
export const APP_ITEM = { item_id: "app-ms6", item_name: "App Missões Secretas GTA 6", item_category: "Aplicativo", quantity: 1 };
export const ecommerce = (cents: number, extra: Params = {}): Params => ({ currency: "BRL", value: cents / 100, items: [{ ...APP_ITEM, price: cents / 100 }], ...extra });
