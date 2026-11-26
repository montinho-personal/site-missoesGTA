import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { q } from "./db";

// Sem 0/O, 1/I/L: o código é digitado no celular, com o controle na outra mão.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const grupo = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
export const newCode = () => `MS6-${grupo()}-${grupo()}-${grupo()}`;
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

export async function createCourtesy(email: string | null, note: string | null, custom?: string | null): Promise<string> {
  const code = custom || newCode();
  const [dup] = await q(`select 1 from licenses where regexp_replace(code, '[^A-Z0-9]', '', 'g') = $1`, [compactCode(code)]);
  if (dup) throw new Error("codigo-repetido");
  await q(`insert into licenses (code, email, origin, note) values ($1, $2, 'cortesia', $3)`, [code, email, note]);
  return code;
}

/** Chamado quando o pagamento é aprovado. Repetir a chamada devolve o mesmo código (o aviso do Mercado Pago chega mais de uma vez). */
export async function licenseForPaidOrder(orderId: string, email: string): Promise<string> {
  await q(`insert into licenses (code, email, origin, order_id) values ($1, $2, 'compra', $3) on conflict (order_id) do nothing`, [newCode(), email, orderId]);
  const [row] = await q<{ code: string }>(`select code from licenses where order_id = $1`, [orderId]);
  return row.code;
}

export async function isCodeValid(raw: string): Promise<boolean> {
  // Vale com ou sem hífen, em qualquer caixa: "ms6abcd..." e "nina vip" acham "MS6-ABCD-..." e "NINA-VIP".
  const c = compactCode(raw);
  if (c.length < 4 || c.length > 24) return false;
  const rows = await q(`update licenses set last_used_at = now() where regexp_replace(code, '[^A-Z0-9]', '', 'g') = $1 and status = 'ativa' returning code`, [c]);
  return rows.length === 1;
}
