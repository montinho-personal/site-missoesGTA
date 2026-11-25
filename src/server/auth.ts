import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { safeEqual, sign } from "./security";

const COOKIE = "gs_adm";
const MAX_AGE = 60 * 60 * 8; // 8 horas

/** Sem as duas variáveis o painel simplesmente não existe. Não há senha padrão. */
export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && (process.env.SESSION_SECRET ?? "").length >= 16);

export function checkPassword(input: string): boolean {
  const h = (s: string) => createHash("sha256").update(s).digest("hex");
  return adminConfigured() && safeEqual(h(input), h(process.env.ADMIN_PASSWORD!));
}

export async function startSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: MAX_AGE });
}
export async function endSession() { (await cookies()).delete({ name: COOKIE, path: "/admin" }); }

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value ?? "";
  const [exp, sig] = raw.split(".");
  return Boolean(exp && sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now());
}

/** Chamado em TODA página e TODA ação do painel. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login/");
}
