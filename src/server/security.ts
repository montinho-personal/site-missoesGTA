import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { q } from "./db";

const secret = () => process.env.SESSION_SECRET || "";

/** Nunca guardamos IP puro: só um hash com sal, suficiente para limitar abuso. */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}|${secret() || "sem-sal"}`).digest("hex").slice(0, 32);
}

/** Limite por janela, guardado no banco para valer entre instâncias. */
export async function rateLimit(bucket: string, key: string, max: number, windowSec: number): Promise<boolean> {
  await q(`delete from rate_events where at < now() - interval '1 day'`);
  const [{ n }] = await q<{ n: number }>(`select count(*)::int as n from rate_events where bucket = $1 and key = $2 and at > now() - ($3 || ' seconds')::interval`, [bucket, key, String(windowSec)]);
  if (n >= max) return false;
  await q(`insert into rate_events (bucket, key) values ($1, $2)`, [bucket, key]);
  return true;
}

export function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
