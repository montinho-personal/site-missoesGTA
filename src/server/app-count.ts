import "server-only";
import { cache } from "react";
import { q } from "./db";
import { appUrl } from "./access";

/**
 * Quantos segredos o aplicativo mostra hoje. Mesma conta do app (resumoDoGuia): toda ficha menos as desmentidas.
 * Lê a cópia publicada do app (/dados/v1/segredos.json), guardada por 1 hora. Se o app não responder,
 * usa as fichas do app já importadas no site. Sem nenhum dos dois, devolve null e o texto sai sem número.
 */
export const appSecretCount = cache(async (): Promise<number | null> => {
  try {
    const r = await fetch(`${await appUrl()}/dados/v1/segredos.json`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const lista = (await r.json()) as { selo?: string }[];
      if (Array.isArray(lista) && lista.length > 0) return lista.filter((f) => f.selo !== "X").length;
    }
  } catch { /* cai na reserva */ }
  try {
    const [row] = await q<{ n: string | number }>(`select count(*) as n from entries where app_ref is not null and workflow_status = 'publicado' and verification_status <> 'desmentido'`);
    const n = Number(row?.n ?? 0);
    return n > 0 ? n : null;
  } catch { return null; }
});
