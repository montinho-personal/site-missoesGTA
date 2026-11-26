"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { SearchDialog, SearchTrigger } from "./Search";
import { SpoilerToggle } from "./client";
import { getConsent, setConsent, track } from "@/lib/analytics";
import { mainNav, site } from "@/lib/site";

export function Wordmark() {
  return (
    <span className="font-display font-black text-[0.88rem] min-[360px]:text-[1.02rem] min-[420px]:text-[1.2rem] lg:text-[1.3rem] tracking-tight leading-none whitespace-nowrap">
      <span className="text-fg">{site.wordmark[0]}</span>{" "}
      <span className="text-pink">{site.wordmark[1]}</span>
    </span>
  );
}

export function Header() {
  const path = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  useEffect(() => { menu.current?.close(); }, [path]);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-600/70 bg-ink-950/90 backdrop-blur-md">
      <div className="wrap flex h-16 items-center gap-3">
        <Link href="/" className="py-2 shrink-0" aria-label={`${site.name}, página inicial`}><Wordmark /></Link>
        <nav aria-label="Principal" className="hidden xl:flex items-center gap-0.5 ml-6 grow">
          {mainNav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}
              className="px-2.5 py-2 rounded-lg text-[0.95rem] font-medium whitespace-nowrap text-fg-muted hover:text-fg aria-[current=page]:text-pink">{n.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger variant="icon" />
          <Link href="/app/" className="btn btn-app btn-sm hidden sm:inline-flex" onClick={() => track("cta_click", { cta_key: "header", placement: "header" })}>Aplicativo</Link>
          <button type="button" className="xl:hidden size-11 inline-flex items-center justify-center rounded-full" aria-label="Abrir menu" onClick={() => menu.current?.showModal()}><Icon name="menu" size={24} /></button>
        </div>
      </div>

      <dialog ref={menu} aria-label="Menu" onClick={(e) => { if (e.target === menu.current) menu.current?.close(); }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,90vw)] max-w-none bg-ink-900 border-l border-ink-600 p-0">
        <div className="flex h-full flex-col p-5 overflow-y-auto">
          <div className="flex items-center justify-between">
            <Wordmark />
            <button type="button" className="size-11 -mr-2 inline-flex items-center justify-center" aria-label="Fechar menu" onClick={() => menu.current?.close()}><Icon name="close" size={24} /></button>
          </div>
          <nav aria-label="Menu" className="mt-6 flex flex-col">
            {[...mainNav, { href: "/favoritos/", label: "Meus favoritos" }, { href: "/enviar-descoberta/", label: "Enviar uma descoberta" }, { href: "/ajuda/", label: "Central de ajuda" }, { href: "/sobre/", label: "Sobre o projeto" }].map((n) => (
              <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}
                className="flex items-center justify-between border-b border-ink-700 py-3.5 font-display text-lg font-semibold aria-[current=page]:text-pink">
                {n.label}<Icon name="chevron" size={18} className="text-fg-subtle" />
              </Link>
            ))}
          </nav>
          <div className="mt-6"><SpoilerToggle /></div>
          <Link href="/app/" className="btn btn-app mt-auto" onClick={() => track("cta_click", { cta_key: "menu", placement: "menu_mobile" })}>Conhecer o aplicativo</Link>
        </div>
      </dialog>
      <SearchDialog />
    </header>
  );
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

function loadGtm() {
  if (!GTM_ID || document.getElementById("gtm-js")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-js"; s.async = true; s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(s);
}

/** Aviso de consentimento. Só aparece quando existe mensuração configurada. */
const subConsent = (cb: () => void) => { window.addEventListener("gs:consent", cb); return () => window.removeEventListener("gs:consent", cb); };

export function Consent() {
  // "ssr" no servidor e na hidratação: o aviso só aparece depois de lermos a escolha salva.
  const consent = useSyncExternalStore(subConsent, () => getConsent() ?? "none", () => "ssr");
  const [reopened, setReopened] = useState(false);
  useEffect(() => {
    if (consent === "granted") loadGtm();
    const reopen = () => setReopened(true);
    window.addEventListener("gs:consent-open", reopen);
    return () => window.removeEventListener("gs:consent-open", reopen);
  }, [consent]);
  if (!GTM_ID || !(consent === "none" || reopened)) return null;
  const choose = (v: "granted" | "denied") => { setConsent(v); if (v === "granted") loadGtm(); setReopened(false); };
  return (
    <div role="region" aria-label="Privacidade" className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-600 bg-ink-900 no-print">
      <div className="wrap py-4 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm text-fg-muted grow">Usamos medição de audiência para saber quais guias ajudam de verdade. Ela só é ativada se você aceitar. <Link href="/privacidade/" className="link">Como tratamos seus dados</Link>.</p>
        <div className="flex gap-2.5 shrink-0">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose("denied")}>Recusar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => choose("granted")}>Aceitar</button>
        </div>
      </div>
    </div>
  );
}

export function ConsentReopen() {
  if (!GTM_ID) return null;
  return <button type="button" className="hover:text-fg underline-offset-4 hover:underline text-left py-1" onClick={() => window.dispatchEvent(new Event("gs:consent-open"))}>Preferências de privacidade</button>;
}
