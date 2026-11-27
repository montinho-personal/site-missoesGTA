"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { getConsent, track } from "@/lib/analytics";
import { stickyCopyFor } from "@/lib/sticky-copy";
import { fillCount } from "@/lib/app-story";

const MEASURE = Boolean(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GTM_ID);
const subConsent = (cb: () => void) => { window.addEventListener("gs:consent", cb); return () => window.removeEventListener("gs:consent", cb); };
const KEY = "gs:sticky-off-until";
const PAUSE_DAYS = 3;
/** Guarda a pausa da barra (chamado só ao tocar em fechar). */
const savePause = () => { try { localStorage.setItem(KEY, String(Date.now() + PAUSE_DAYS * 864e5)); } catch {} };

const subScroll = (cb: () => void) => { window.addEventListener("scroll", cb, { passive: true }); window.addEventListener("resize", cb); return () => { window.removeEventListener("scroll", cb); window.removeEventListener("resize", cb); }; };
/** Só aparece depois que a pessoa rolou: 25% da página ou 520 px, o que vier primeiro. */
const deepEnough = () => window.scrollY > Math.min(520, document.documentElement.scrollHeight * 0.25);
const subDismiss = (cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); };
const readDismissed = () => { try { return Number(localStorage.getItem(KEY) ?? 0) > Date.now(); } catch { return false; } };

/**
 * O "rodapé que sobe": chamada fixa para a página do aplicativo.
 * Regras de respeito ao leitor (docs/15):
 * - só aparece depois que a pessoa rolou e leu alguma coisa;
 * - some quando outro bloco do aplicativo já está na tela (sem dois pedidos ao mesmo tempo);
 * - some perto do rodapé, para não cobrir links;
 * - fecha com um toque e fica fechada por 3 dias neste aparelho.
 */
export function StickyAppBar({ saleEnabled, priceLabel, secrets }: { saleEnabled: boolean; priceLabel: string | null; secrets: number | null }) {
  const path = usePathname();
  const copy = stickyCopyFor(path);
  // Lidos de fora do React (rolagem e preferência salva), sem setState dentro de efeito.
  const scrolled = useSyncExternalStore(subScroll, deepEnough, () => false);
  const dismissedRaw = useSyncExternalStore(subDismiss, readDismissed, () => true); // no servidor, fechada (evita piscar)
  const [dismissedNow, setDismissedNow] = useState(false);
  const dismissed = dismissedRaw || dismissedNow;
  const [blocked, setBlocked] = useState(false);
  // Enquanto o aviso de privacidade está aberto (mesmo lugar, embaixo da tela), a barra espera a resposta.
  const consentOpen = useSyncExternalStore(subConsent, () => MEASURE && getConsent() === null, () => true);

  useEffect(() => {
    // Blocos que já pedem a mesma coisa, e o rodapé: quando estão visíveis, a barra se recolhe.
    const targets = [...document.querySelectorAll("[data-app-cta], footer")];
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setBlocked(visible.size > 0);
    }, { rootMargin: "0px 0px -10% 0px" });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [path]);

  if (!copy) return null;
  const show = scrolled && !blocked && !dismissed && !consentOpen;
  const close = () => {
    savePause();
    setDismissedNow(true);
    track("cta_click", { cta_key: "sticky_fechar", placement: "sticky", context: copy.context });
  };
  const label = saleEnabled && priceLabel ? `Ver no mapa do app · ${priceLabel}` : "Ver no mapa do app";

  return (
    <div
      role="region"
      aria-label="Aplicativo"
      aria-hidden={!show}
      inert={!show}
      className={`fixed z-40 no-print transition-transform duration-300 inset-x-0 bottom-0 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[24rem] ${show ? "translate-y-0" : "translate-y-[120%] sm:translate-y-[calc(100%+2rem)]"}`}
    >
      {/* Painel que sobe do pé da tela: a frase, o X e um botão grande na largura toda. */}
      <div className="border-t sm:border border-violet/50 bg-ink-900/97 backdrop-blur-md sm:rounded-2xl shadow-[0_-16px_48px_-12px_rgb(109_67_224/0.55)] px-4 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 grow pt-1">
            <p className="font-display font-extrabold leading-tight text-[1.08rem] sm:text-xl">{fillCount(copy.title, secrets)}</p>
            <p className="hidden sm:block mt-1.5 text-sm text-fg-muted leading-snug">{fillCount(copy.line, secrets)}</p>
          </div>
          <button type="button" onClick={close} aria-label="Fechar a chamada do aplicativo por 3 dias" className="shrink-0 size-11 -mr-2 -mt-1 inline-flex items-center justify-center rounded-full text-fg-subtle hover:text-fg">
            <Icon name="close" size={22} />
          </button>
        </div>
        <Link
          href="/app/"
          className="btn btn-app w-full mt-3 !min-h-13 text-[1.05rem]"
          onClick={() => track("cta_click", { cta_key: "sticky", placement: "sticky", context: copy.context })}
        >
          <Icon name="pin" size={20} />{label}
        </Link>
      </div>
    </div>
  );
}
