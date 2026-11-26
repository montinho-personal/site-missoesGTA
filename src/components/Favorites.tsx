"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EntryCard, EmptyState } from "./ui";
import { useFavIds } from "./client";
import type { EntryCardData } from "@/lib/types";

export function Favorites() {
  const ids = useFavIds();
  const [all, setAll] = useState<EntryCardData[] | null>(null);
  useEffect(() => { fetch("/search-index.json").then((r) => r.json()).then(setAll).catch(() => setAll([])); }, []);
  if (all === null) return <p className="text-fg-muted" aria-live="polite">Carregando…</p>;
  const mine = all.filter((e) => ids.includes(e.id));
  if (mine.length === 0) return <EmptyState title="Seu porta-luvas está vazio"><p>Toque na estrela de qualquer descoberta para guardá-la aqui. <Link className="link" href="/gta-6/segredos/">Ver os segredos</Link>.</p></EmptyState>;
  return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{mine.map((e) => <li key={e.id}><EntryCard e={e} headingLevel={2} /></li>)}</ul>;
}
