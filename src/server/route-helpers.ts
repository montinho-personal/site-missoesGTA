import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect, getGames } from "./content";

/** Antes do 404, confere se o endereço antigo tem redirecionamento cadastrado. */
export async function notFoundOrRedirect(path: string): Promise<never> {
  const r = await findRedirect(path);
  if (r) { if (r.code === 302) redirect(r.to_path); permanentRedirect(r.to_path); }
  notFound();
}

export async function requireGame(slug: string, path: string) {
  const game = (await getGames()).find((g) => g.slug === slug);
  if (!game) await notFoundOrRedirect(path);
  return game!;
}
