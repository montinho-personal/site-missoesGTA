import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { q } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
export const PASSWORD_MIN = 8;

/** Guarda só o resumo da senha (scrypt com sal aleatório), nunca a senha. */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 32);
  return ["scrypt", salt.toString("hex"), hash.toString("hex")].join(":");
}

export async function checkPassword(pw: string, stored: string): Promise<boolean> {
  const [kind, salt, hash] = stored.split(":");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const got = await scrypt(pw, Buffer.from(salt, "hex"), 32);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function accountExists(email: string): Promise<boolean> {
  return (await q(`select 1 from accounts where email = $1`, [email])).length > 0;
}

/** Cria a conta ou troca a senha. */
export async function setPassword(email: string, pw: string): Promise<void> {
  await q(`insert into accounts (email, pass_hash) values ($1, $2) on conflict (email) do update set pass_hash = excluded.pass_hash, updated_at = now()`, [email, await hashPassword(pw)]);
}

/** Confere e-mail e senha. Sem conta, responde como senha errada (não revela quem tem conta). */
export async function verifyLogin(email: string, pw: string): Promise<boolean> {
  const [row] = await q<{ pass_hash: string }>(`select pass_hash from accounts where email = $1`, [email]);
  if (!row) { await hashPassword(pw); return false; } // gasta o mesmo tempo
  return checkPassword(pw, row.pass_hash);
}

const tokenHash = (t: string) => createHash("sha256").update(t).digest("hex");

/** Link de nova senha: vale 1 hora e uma vez só. Só o resumo do token fica guardado. */
export async function newResetToken(email: string): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await q(`insert into password_resets (token_hash, email, expires_at) values ($1, $2, now() + interval '1 hour')`, [tokenHash(token), email]);
  return token;
}

export async function resetEmailFor(token: string): Promise<string | null> {
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const [row] = await q<{ email: string }>(`select email from password_resets where token_hash = $1 and used_at is null and expires_at > now()`, [tokenHash(token)]);
  return row?.email ?? null;
}

export async function redeemResetToken(token: string, pw: string): Promise<string | null> {
  const email = await resetEmailFor(token);
  if (!email) return null;
  await q(`update password_resets set used_at = now() where token_hash = $1`, [tokenHash(token)]);
  await setPassword(email, pw);
  return email;
}

/** Acesso ativo mais recente do e-mail (compra primeiro, depois cortesia). */
export async function activeLicenseFor(email: string): Promise<string | null> {
  const [lic] = await q<{ code: string }>(`select code from licenses where lower(email) = $1 and status = 'ativa' and (expires_at is null or expires_at > now()) order by (origin = 'compra') desc, created_at desc limit 1`, [email]);
  return lic?.code ?? null;
}
