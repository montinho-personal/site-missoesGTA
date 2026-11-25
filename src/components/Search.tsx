"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { loadIndex, runSearch, type SearchHit } from "@/lib/search";
import { history } from "@/lib/store";
import { track } from "@/lib/analytics";
import { statusInfo } from "@/lib/labels";
import { useSpoilersOn } from "./client";

const QUICK = [
  { href: "/gta-6/missoes-secretas/", label: "Missões secretas" },
  { href: "/gta-6/dinheiro/", label: "Dinheiro escondido" },
  { href: "/gta-6/veiculos/", label: "Carros raros" },
  { href: "/gta-6/misterios/", label: "Mistérios" },
  { href: "/gta-6/dicas/", label: "Dicas" },
];

const subHist = (cb: () => void) => { window.addEventListener("gs:hist", cb); return () => window.removeEventListener("gs:hist", cb); };

export function SearchPanel({ initial = "", autoFocus, onNavigate }: { initial?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const [query, setQuery] = useState(initial);
  const [found, setHits] = useState<SearchHit[] | null>(null);
  const hits = query.trim().length >= 2 ? found : null; // menos de 2 letras: volta aos atalhos
  const [failed, setFailed] = useState(false);
  const listId = useId();
  const spoilersOn = useSpoilersOn();
  const histRaw = useSyncExternalStore(subHist, () => JSON.stringify({ on: history.enabled(), items: history.all() }), () => '{"on":false,"items":[]}');
  const hist = JSON.parse(histRaw) as { on: boolean; items: string[] };
  const lastTracked = useRef("");

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const ms = await loadIndex();
        if (!alive) return;
        const res = runSearch(ms, term);
        setHits(res); setFailed(false);
        if (lastTracked.current !== term && term.length >= 3) {
          lastTracked.current = term;
          track(res.length ? "search" : "search_no_results", { search_term: term, results: res.length });
        }
      } catch { if (alive) setFailed(true); }
    }, 140);
    return () => { alive = false; clearTimeout(t); };
  }, [query]);

  const go = (hit?: SearchHit) => { history.add(query); if (hit) track("search_result_click", { search_term: query.trim(), url: hit.url }); onNavigate?.(); };

  return (
    <div>
      <form role="search" action="/busca/" onSubmit={() => history.add(query)} className="relative">
        <label htmlFor={`${listId}-in`} className="sr-only">Buscar no site</label>
        <Icon name="search" size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
        <input id={`${listId}-in`} name="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus={autoFocus}
          autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search"
          placeholder="O que você quer descobrir?" aria-controls={listId}
          className="field !pl-12 !min-h-14 text-lg" />
      </form>

      <div id={listId} aria-live="polite" className="mt-4">
        {failed && <p className="text-fg-muted">Não foi possível carregar a busca agora. Tente de novo em instantes.</p>}

        {hits === null && !failed && (
          <div className="flex flex-col gap-5">
            {hist.items.length > 0 && (
              <div>
                <div className="flex items-center justify-between"><p className="label text-fg-subtle">Suas últimas buscas</p>
                  <button type="button" className="link text-sm py-2" onClick={() => history.clear()}>Limpar</button></div>
                <div className="flex flex-wrap gap-2 mt-2">{hist.items.map((h) => <button key={h} type="button" className="chip" onClick={() => setQuery(h)}><Icon name="clock" size={15} />{h}</button>)}</div>
              </div>
            )}
            <div>
              <p className="label text-fg-subtle">Atalhos</p>
              <div className="flex flex-wrap gap-2 mt-2">{QUICK.map((qk) => <Link key={qk.href} href={qk.href} className="chip" onClick={() => onNavigate?.()}>{qk.label}</Link>)}</div>
            </div>
            <label className="flex items-start gap-3 text-sm text-fg-muted cursor-pointer">
              <input type="checkbox" className="mt-1 size-5 accent-[#ff4d9d]" checked={hist.on} onChange={(e) => history.setEnabled(e.target.checked)} />
              <span>Guardar minhas buscas neste aparelho. Fica só no seu navegador e você pode apagar quando quiser.</span>
            </label>
          </div>
        )}

        {hits && hits.length > 0 && (
          <ul className="flex flex-col gap-2">
            {hits.map((h) => {
              const veiled = spoilersOn && h.spoiler === "historia";
              return (
                <li key={h.id}>
                  <Link href={h.url} onClick={() => go(h)} className="card flex gap-3.5 p-3.5 sm:p-4 items-start">
                    <span className="text-cyan mt-0.5 shrink-0"><Icon name={h.icon} size={22} /></span>
                    <span className="min-w-0 grow">
                      <span className="block font-display font-bold text-lg leading-snug">{veiled ? "Descoberta com spoiler da história" : h.title}</span>
                      <span className="block text-sm text-fg-muted line-clamp-2">{veiled ? "Desligue a proteção contra spoilers ou abra para ver." : h.answer}</span>
                      <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-subtle">
                        <span>{h.catName}</span>{h.regionName && <span>{h.regionName}</span>}
                        <span className={`tone-${statusInfo[h.status].tone} font-semibold`}>{statusInfo[h.status].short}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {hits && hits.length === 0 && (
          <div className="card p-5">
            <p className="font-display text-lg font-bold">Ainda não temos nada sobre “{query.trim()}”.</p>
            <p className="text-fg-muted mt-1.5">Preferimos dizer isso a inventar uma resposta. Se você encontrou algo no jogo, conte para a gente e nós investigamos.</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/enviar-descoberta/" className="btn btn-primary btn-sm" onClick={() => onNavigate?.()}>Enviar uma descoberta</Link>
              <Link href="/gta-6/segredos/" className="btn btn-ghost btn-sm" onClick={() => onNavigate?.()}>Ver todos os segredos</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Diálogo global de busca. Abre pelo cabeçalho, pelo hero ou com a tecla "/". */
export function SearchDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => { setOpen(true); ref.current?.showModal(); };
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !el.isContentEditable) { e.preventDefault(); show(); }
    };
    window.addEventListener("gs:open-search", show); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("gs:open-search", show); window.removeEventListener("keydown", key); };
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog ref={ref} aria-label="Busca" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) close(); }}
      className="m-0 w-full max-w-none h-dvh max-h-none sm:mx-auto sm:mt-[8vh] sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-2xl bg-ink-900 border-ink-600 sm:border p-0 overflow-y-auto">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="label text-pink">Buscar em GTA 6</p>
          <button type="button" onClick={close} className="size-11 -mr-2 inline-flex items-center justify-center rounded-full text-fg-muted hover:text-fg" aria-label="Fechar busca"><Icon name="close" size={22} /></button>
        </div>
        {open && <SearchPanel autoFocus onNavigate={close} />}
      </div>
    </dialog>
  );
}

export const openSearch = () => window.dispatchEvent(new Event("gs:open-search"));

export function SearchTrigger({ variant }: { variant: "icon" | "hero" }) {
  if (variant === "icon") {
    return <button type="button" onClick={openSearch} className="size-11 inline-flex items-center justify-center rounded-full text-fg hover:text-pink" aria-label="Abrir busca"><Icon name="search" size={23} /></button>;
  }
  return (
    <button type="button" onClick={openSearch} className="field !min-h-14 flex items-center gap-3 text-left text-fg-subtle text-lg hover:border-cyan cursor-text">
      <Icon name="search" size={22} /><span className="grow">O que você quer descobrir?</span>
      <kbd className="hidden sm:inline-block text-xs border border-ink-500 rounded px-1.5 py-0.5">/</kbd>
    </button>
  );
}
