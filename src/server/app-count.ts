import "server-only";
import { cache } from "react";
import { q } from "./db";
import { appUrl } from "./access";

/**
 * Quantos segredos o aplicativo mostra hoje: o mesmo total que o app exibe.
 * Lê o índice da cópia publicada do app (/dados/v1/indice.json, campo "fichas"), guardado por 5 minutos. Se o app não responder,
 * usa as fichas do app já importadas no site. Sem nenhum dos dois, devolve null e o texto sai sem número.
 */
export const appSecretCount = cache(async (): Promise<number | null> => {
  try {
    // O índice da cópia publicada já traz o total que o app mostra ("fichas").
    const r = await fetch(`${await appUrl()}/dados/v1/indice.json`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const n = Number(((await r.json()) as { fichas?: unknown }).fichas);
      if (Number.isInteger(n) && n > 0) return n;
    }
  } catch { /* cai na reserva */ }
  try {
    const [row] = await q<{ n: string | number }>(`select count(*) as n from entries where app_ref is not null and workflow_status = 'publicado' and verification_status <> 'desmentido'`);
    const n = Number(row?.n ?? 0);
    return n > 0 ? n : null;
  } catch { return null; }
});
