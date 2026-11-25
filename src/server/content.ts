import "server-only";
import { cache } from "react";
import { q } from "./db";
import type { Author, Category, Cta, Entry, EntryCardData, EntryChange, Region } from "@/lib/types";

const iso = (v: unknown): string | null => {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
};
const day = (v: unknown): string | null => {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
};
const arr = <T,>(v: unknown): T[] => {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
};
const obj = <T,>(v: unknown): T | null => {
  if (v == null) return null;
  if (typeof v === "string") { try { return JSON.parse(v) as T; } catch { return null; } }
  return v as T;
};

function mapEntry(r: Record<string, unknown>): Entry {
  return {
    ...(r as unknown as Entry),
    coords: obj(r.coords),
    steps: arr(r.steps), common_mistakes: arr(r.common_mistakes), troubleshooting: arr(r.troubleshooting),
    sources: arr(r.sources), media: arr(r.media), faq: arr(r.faq), related: arr(r.related), tags: arr(r.tags),
    last_verified_on: day(r.last_verified_on),
    published_at: iso(r.published_at), created_at: iso(r.created_at)!, updated_at: iso(r.updated_at)!,
  };
}

const ENTRY_SELECT = `
  select e.*, c.slug as category_slug, c.name as category_name, c.icon as category_icon, c.cta_key as category_cta,
         r.slug as region_slug, r.name as region_name, g.slug as game_slug,
         a.name as author_name, a.slug as author_slug
  from entries e
  join categories c on c.id = e.category_id
  join games g on g.id = e.game_id
  left join regions r on r.id = e.region_id
  left join authors a on a.id = e.author_id`;

// Só aparece no site o que passou pelo fluxo editorial e já chegou na data.
const PUBLIC = `e.workflow_status = 'publicado' and e.published_at is not null and e.published_at <= now() and g.published and c.published`;

export const entryUrl = (e: { game_slug: string; category_slug: string; slug: string }) =>
  `/${e.game_slug}/${e.category_slug}/${e.slug}/`;

export const getPublishedEntries = cache(async (gameSlug = "gta-6"): Promise<Entry[]> => {
  const rows = await q(`${ENTRY_SELECT} where ${PUBLIC} and g.slug = $1 order by e.featured desc, e.updated_at desc, e.id`, [gameSlug]);
  return rows.map(mapEntry);
});

export async function getEntry(gameSlug: string, categorySlug: string, slug: string): Promise<Entry | null> {
  return (await getPublishedEntries(gameSlug)).find((e) => e.category_slug === categorySlug && e.slug === slug) ?? null;
}

export const getCategories = cache(async (gameSlug = "gta-6"): Promise<Category[]> => {
  const rows = await q<Record<string, unknown>>(
    `select c.*, (select count(*)::int from entries e join games g on g.id = e.game_id where e.category_id = c.id and ${PUBLIC}) as entry_count
     from categories c join games g2 on g2.id = c.game_id where g2.slug = $1 and c.published and g2.published order by c.sort, c.name`, [gameSlug]);
  return rows.map((r) => ({ ...(r as unknown as Category), faq: arr(r.faq) }));
});

export const getRegions = cache(async (gameSlug = "gta-6"): Promise<Region[]> => {
  return q<Region>(
    `select r.*, (select count(*)::int from entries e join games g on g.id = e.game_id join categories c on c.id = e.category_id where e.region_id = r.id and ${PUBLIC}) as entry_count
     from regions r join games g2 on g2.id = r.game_id where g2.slug = $1 order by r.sort, r.name`, [gameSlug]);
});

export const getGames = cache(async () => q<{ id: string; slug: string; name: string; short_name: string }>(`select id, slug, name, short_name from games where published order by sort`));

export const getCtas = cache(async (): Promise<Record<string, Cta>> => {
  const rows = await q<Cta>(`select * from ctas where active`);
  return Object.fromEntries(rows.map((c) => [c.key, c]));
});

export const getAuthors = cache(async () => q<Author>(`select * from authors order by name`));

export async function getPublicChanges(limit = 30): Promise<EntryChange[]> {
  const rows = await q<Record<string, unknown>>(
    `select ch.*, e.title, e.slug, e.verification_status, c.slug as category_slug, g.slug as game_slug
     from entry_changes ch join entries e on e.id = ch.entry_id
     join categories c on c.id = e.category_id join games g on g.id = e.game_id
     where ch.is_public and ${PUBLIC} order by ch.changed_at desc, ch.id desc limit $1`, [limit]);
  return rows.map((r) => ({
    ...(r as unknown as EntryChange),
    changed_at: iso(r.changed_at)!,
    url: entryUrl(r as never),
  }));
}

export async function getEntryChanges(entryId: string): Promise<EntryChange[]> {
  const rows = await q<Record<string, unknown>>(`select * from entry_changes where entry_id = $1 and is_public order by changed_at desc, id desc`, [entryId]);
  return rows.map((r) => ({ ...(r as unknown as EntryChange), changed_at: iso(r.changed_at)! }));
}

export async function findRedirect(path: string): Promise<{ to_path: string; code: number } | null> {
  const norm = path.endsWith("/") ? path : `${path}/`;
  const rows = await q<{ to_path: string; code: number }>(`select to_path, code from redirects where from_path = $1 or from_path = $2 limit 1`, [norm, norm.slice(0, -1)]);
  return rows[0] ?? null;
}

export function toCard(e: Entry): EntryCardData {
  return {
    id: e.id, url: entryUrl(e), title: e.title, answer: e.direct_answer || e.summary, kind: e.kind,
    cat: e.category_slug, catName: e.category_name, icon: e.category_icon,
    region: e.region_slug, regionName: e.region_name, status: e.verification_status, spoiler: e.spoiler_level,
    rewardType: e.reward_type, character: e.character_req && e.character_req.toLowerCase() !== "n/a" ? e.character_req : null,
    updated: e.updated_at, tags: e.tags,
  };
}

/** Relacionados: escolha editorial primeiro, depois mesma região e mesma categoria. */
export function relatedEntries(e: Entry, all: Entry[], limit = 3): Entry[] {
  const picked = e.related.map((id) => all.find((x) => x.id === id)).filter((x): x is Entry => Boolean(x));
  const rest = all
    .filter((x) => x.id !== e.id && !picked.includes(x))
    .map((x) => ({ x, score: (x.region_id && x.region_id === e.region_id ? 2 : 0) + (x.category_id === e.category_id ? 1 : 0) + x.tags.filter((t) => e.tags.includes(t)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.x);
  return [...picked, ...rest].slice(0, limit);
}
