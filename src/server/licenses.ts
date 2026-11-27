import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { q } from "./db";

// Sem 0/O, 1/I/L: o código é digitado no celular, com o controle na outra mão.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const grupo = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
export const newCode = () => `MS6-${grupo()}-${grupo()}-${grupo()}`;
// Limite de aparelhos por compra: 5 por dentro, "até 3 celulares" para o cliente (decisão do Montinho em 27/11/2026).
// A folga cobre o iPhone, onde o Safari e o app instalado contam como dois aparelhos.
export const DEVICES_PER_PURCHASE = 5;
export const DEVICES_ADVERTISED = 3;
export const newOrderId = () => randomBytes(16).toString("hex");
/** Aceita o código com ou sem hífens, em qualquer caixa. */
export const normalizeCode = (raw: string) => {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return c.length === 15 && c.startsWith("MS6") ? `MS6-${c.slice(3, 7)}-${c.slice(7, 11)}-${c.slice(11, 15)}` : null;
};

/** Só letras e números, em maiúsculas: é assim que dois códigos são comparados. */
export const compactCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Código escolhido pelo dono (ex.: "NINA-VIP"): letras, números e hífen, de 4 a 24 letras/números. */
export function customCode(raw: string): string | null {
  const c = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const n = compactCode(c).length;
  return n >= 4 && n <= 24 ? c : null;
}

export interface License { code: string; email: string | null; origin: "compra" | "cortesia"; status: "ativa" | "revogada"; order_id: string | null; note: string | null; created_at: string; last_used_at: string | null }

export interface CourtesyOptions { email: string | null; note: string | null; custom?: string | null; vagas?: number; quantidade?: number }

/**
 * Gera cortesias. Com nome escolhido e mais de um código, os códigos saem numerados (NINA-01, NINA-02...).
 * "vagas" é quantos aparelhos cada código libera (1 = individual). Devolve o lote e os códigos.
 */
export async function createCourtesy(o: CourtesyOptions): Promise<{ batch: string; codes: string[] }> {
  const qtd = Math.min(Math.max(o.quantidade ?? 1, 1), 200);
  const vagas = Math.min(Math.max(o.vagas ?? 1, 1), 10000);
  const width = String(qtd).length < 2 ? 2 : String(qtd).length;
  const wanted = Array.from({ length: qtd }, (_, i) => (o.custom ? (qtd === 1 ? o.custom : `${o.custom}-${String(i + 1).padStart(width, "0")}`) : newCode()));
  if (o.custom) {
    const dup = await q<{ code: string }>(`select code from licenses where regexp_replace(code, '[^A-Z0-9]', '', 'g') = any($1)`, [wanted.map(compactCode)]);
    if (dup.length) throw new Error(`codigo-repetido:${dup[0].code}`);
  }
  const batch = randomBytes(8).toString("hex");
  for (const code of wanted) await q(`insert into licenses (code, email, origin, note, max_uses, batch) values ($1, $2, 'cortesia', $3, $4, $5)`, [code, o.email, o.note, vagas > 1 ? vagas : null, batch]);
  return { batch, codes: wanted };
}

/** Chamado quando o pagamento é aprovado. Repetir a chamada devolve o mesmo código (o aviso do Mercado Pago chega mais de uma vez). */
export async function licenseForPaidOrder(orderId: string, email: string): Promise<string> {
  // Uma compra vale para até 3 aparelhos (o mesmo aparelho vale sempre).
  await q(`insert into licenses (code, email, origin, order_id, max_uses) values ($1, $2, 'compra', $3, ${DEVICES_PER_PURCHASE}) on conflict (order_id) do nothing`, [newCode(), email, orderId]);
  const [row] = await q<{ code: string }>(`select code from licenses where order_id = $1`, [orderId]);
  return row.code;
}

export type Validation = { valido: boolean; motivo?: "inexistente" | "cancelado" | "esgotado" | "aparelho" };

/**
 * Vale com ou sem hífen, em qualquer caixa. Código com vagas (max_uses) precisa do identificador do aparelho:
 * o mesmo aparelho continua valendo sempre; um aparelho novo ocupa uma vaga, até acabar.
 */
export async function checkCode(raw: string, device?: string | null): Promise<Validation> {
  const c = compactCode(raw);
  if (c.length < 4 || c.length > 24) return { valido: false, motivo: "inexistente" };
  const [lic] = await q<{ code: string; max_uses: number | null; status: string }>(`select code, max_uses, status from licenses where regexp_replace(code, '[^A-Z0-9]', '', 'g') = $1`, [c]);
  if (!lic) return { valido: false, motivo: "inexistente" };
  if (lic.status !== "ativa") return { valido: false, motivo: "cancelado" };
  if (lic.max_uses) {
    const dev = (device ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
    if (dev.length < 8) return { valido: false, motivo: "aparelho" };
    const again = await q(`update license_uses set last_at = now() where code = $1 and device = $2 returning code`, [lic.code, dev]);
    if (!again.length) {
      // Ocupa a vaga só se ainda houver: a contagem e a inserção vão na mesma instrução.
      const took = await q(`insert into license_uses (code, device) select $1, $2 where (select count(*) from license_uses where code = $1) < $3 on conflict do nothing returning code`, [lic.code, dev, lic.max_uses]);
      if (!took.length) return { valido: false, motivo: "esgotado" };
    }
  }
  await q(`update licenses set last_used_at = now() where code = $1`, [lic.code]);
  return { valido: true };
}

export async function isCodeValid(raw: string, device?: string | null): Promise<boolean> {
  return (await checkCode(raw, device)).valido;
}
