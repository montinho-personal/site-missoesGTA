"use client";
import { useMemo, useState } from "react";
import { EntryCard, EmptyState } from "./ui";
import { SpoilerToggle } from "./client";
import { Icon } from "./Icon";
import { statusInfo, rewardTypeLabel } from "@/lib/labels";
import { track } from "@/lib/analytics";
import type { EntryCardData } from "@/lib/types";
import Link from "next/link";

type Key = "cat" | "status" | "region" | "rewardType" | "character";
const LABELS: Record<Key, string> = { cat: "Tipo de descoberta", status: "Verificação", region: "Região", rewardType: "Recompensa", character: "Personagem" };

/**
 * Lista com filtros no cliente. Todos os itens saem no HTML do servidor;
 * os filtros só escondem. Nenhuma combinação vira URL (nada de páginas infinitas para indexar).
 */
export function Explorer({ entries, show }: { entries: EntryCardData[]; show: Key[] }) {
  const [sel, setSel] = useState<Partial<Record<Key, string>>>({});
  const [noSpoilers, setNoSpoilers] = useState(false);
  const [open, setOpen] = useState(false);

  const facets = useMemo(() => {
    const out = {} as Record<Key, { value: string; label: string; n: number }[]>;
    for (const k of show) {
      const m = new Map<string, { label: string; n: number }>();
      for (const e of entries) {
        const value = k === "cat" ? e.cat : k === "status" ? e.status : k === "region" ? e.region : k === "rewardType" ? e.rewardType : e.character;
        if (!value) continue;
        const label = k === "cat" ? e.catName : k === "status" ? statusInfo[e.status].label : k === "region" ? e.regionName! : k === "rewardType" ? (rewardTypeLabel[value] ?? value) : value;
        m.set(value, { label, n: (m.get(value)?.n ?? 0) + 1 });
      }
      out[k] = [...m].map(([value, v]) => ({ value, ...v })).sort((a, b) => b.n - a.n);
    }
    return out;
  }, [entries, show]);

  const visible = entries.filter((e) => {
    if (noSpoilers && e.spoiler !== "nenhum") return false;
    for (const k of show) {
      const want = sel[k]; if (!want) continue;
      const have = k === "cat" ? e.cat : k === "status" ? e.status : k === "region" ? e.region : k === "rewardType" ? e.rewardType : e.character;
      if (have !== want) return false;
    }
    return true;
  });

  const active = Object.values(sel).filter(Boolean).length + (noSpoilers ? 1 : 0);
  const usable = show.filter((k) => facets[k].length > 1);
  const pick = (k: Key, v: string) => {
    setSel((s) => ({ ...s, [k]: s[k] === v ? undefined : v }));
    track("filter_use", { filter: k, value: v });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        {usable.length > 0 && (
          <button type="button" className="chip" aria-expanded={open} aria-controls="filtros" onClick={() => setOpen(!open)}>
            <Icon name="grid" size={16} />Filtros{active > 0 && <span className="rounded-full bg-pink-strong text-white text-xs font-bold px-1.5">{active}</span>}
          </button>
        )}
        <button type="button" className="chip" aria-pressed={noSpoilers} onClick={() => { setNoSpoilers(!noSpoilers); track("filter_use", { filter: "sem_spoilers", value: String(!noSpoilers) }); }}>
          <Icon name="shield" size={16} />Só sem spoilers
        </button>
        <SpoilerToggle compact />
        <p className="ml-auto text-sm text-fg-subtle" aria-live="polite">{visible.length} de {entries.length}</p>
      </div>

      {usable.length > 0 && (
        <div id="filtros" hidden={!open} className="card p-4 sm:p-5 mb-5 flex flex-col gap-4">
          {usable.map((k) => (
            <fieldset key={k}>
              <legend className="label text-fg-subtle mb-2">{LABELS[k]}</legend>
              <div className="flex flex-wrap gap-2">
                {facets[k].map((f) => (
                  <button key={f.value} type="button" className="chip" aria-pressed={sel[k] === f.value} onClick={() => pick(k, f.value)}>
                    {f.label}<span className="opacity-60 text-xs">{f.n}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          {active > 0 && <button type="button" className="link self-start py-1" onClick={() => { setSel({}); setNoSpoilers(false); }}>Limpar filtros</button>}
        </div>
      )}

      {visible.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => <li key={e.id}><EntryCard e={e} headingLevel={2} /></li>)}
        </ul>
      ) : entries.length > 0 ? (
        <EmptyState title="Nada com essa combinação de filtros">
          <p>Tire um filtro ou <button type="button" className="link" onClick={() => { setSel({}); setNoSpoilers(false); }}>limpe todos</button>.</p>
        </EmptyState>
      ) : (
        <EmptyState title="Ainda estamos apurando esta categoria">
          <p>Não publicamos nada sem fonte. Assim que houver registros verificáveis, eles aparecem aqui. Encontrou algo? <Link className="link" href="/enviar-descoberta/">Envie para a gente</Link>.</p>
        </EmptyState>
      )}
    </div>
  );
}
