import Link from "next/link";
import { Icon } from "./Icon";
import { statusInfo, spoilerLabel } from "@/lib/labels";
import type { Cta, EntryCardData, SpoilerLevel, VerificationStatus } from "@/lib/types";
import { FavButton, RevealButton, TrackLink } from "./client";

export function StatusBadge({ status, full }: { status: VerificationStatus; full?: boolean }) {
  const s = statusInfo[status];
  return (
    <span className={`badge tone-${s.tone}`} title={s.meaning}>
      <Icon name={status === "confirmado" ? "check" : status === "desmentido" ? "close" : "radar"} size={12} />
      {full ? s.label : s.short}
    </span>
  );
}

export function SpoilerBadge({ level }: { level: SpoilerLevel }) {
  if (level === "nenhum") return null;
  return <span className={`badge ${level === "historia" ? "tone-red" : "tone-gray"}`}><Icon name="eyeoff" size={12} />{spoilerLabel[level]}</span>;
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está em" className="text-sm text-fg-subtle">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((it, i) => (
          <li key={i} className={`items-center gap-1.5 ${!it.href && items.length > 2 ? "hidden sm:flex" : "flex"}`}>
            {i > 0 && <Icon name="chevron" size={12} />}
            {it.href ? <Link href={it.href} className="hover:text-fg underline-offset-4 hover:underline py-1">{it.name}</Link> : <span aria-current="page" className="text-fg-muted py-1">{it.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHead({ eyebrow, title, text, href, linkLabel, id }: { eyebrow?: string; title: string; text?: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        <div className="deco-rule mb-4" aria-hidden="true"><i /></div>
        {eyebrow && <p className="label text-pink mb-2">{eyebrow}</p>}
        <h2 id={id} className="text-[1.7rem] sm:text-4xl font-extrabold">{title}</h2>
        {text && <p className="mt-3 text-fg-muted">{text}</p>}
      </div>
      {href && <Link href={href} className="link inline-flex items-center gap-1.5 font-semibold py-2">{linkLabel}<Icon name="arrow" size={16} /></Link>}
    </div>
  );
}

/** Card de descoberta: categoria, status, título e a resposta curta. */
export function EntryCard({ e, headingLevel = 3 }: { e: EntryCardData; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <article className="card p-4 sm:p-5 flex flex-col gap-3 h-full" data-spoiler={e.spoiler}>
      <div className="flex items-center justify-between gap-2">
        <span className="label text-cyan inline-flex items-center gap-1.5"><Icon name={e.icon} size={15} />{e.catName}</span>
        <FavButton id={e.id} title={e.title} />
      </div>
      <div className="relative flex flex-col gap-2 grow">
        <div className="spoiler-content flex flex-col gap-2 grow">
          <H className="text-xl font-bold leading-snug">
            <Link href={e.url} className="card-cover hover:text-pink spoiler-hide">{e.title}</Link>
          </H>
          <p className="text-[0.97rem] text-fg-muted line-clamp-3">{e.answer}</p>
        </div>
        <div className="spoiler-veil absolute inset-0 z-10 flex-col items-start justify-center gap-2">
          <p className="font-semibold">Contém spoiler da história</p>
          <RevealButton />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <StatusBadge status={e.status} />
        <SpoilerBadge level={e.spoiler} />
        {e.regionName && <span className="text-sm text-fg-subtle inline-flex items-center gap-1"><Icon name="pin" size={14} />{e.regionName}</span>}
      </div>
    </article>
  );
}

export function EntryGrid({ entries }: { entries: EntryCardData[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((e) => <li key={e.id}><EntryCard e={e} /></li>)}
    </ul>
  );
}

export function AppCta({ cta, placement, context }: { cta: Cta | undefined; placement: string; context?: string }) {
  if (!cta) return null;
  return (
    <aside data-app-cta aria-label="Aplicativo" className="card overflow-hidden border-violet/40 no-print">
      <div className="grid-paper p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="grow">
          <p className="label text-violet mb-2 inline-flex items-center gap-2"><Icon name="phone" size={15} />{cta.eyebrow}</p>
          <p className="font-display text-2xl font-extrabold leading-tight">{cta.headline}</p>
          {cta.body && <p className="mt-2 text-fg-muted">{cta.body}</p>}
        </div>
        <TrackLink href="/app/" className="btn btn-app shrink-0" event="cta_click" params={{ cta_key: cta.key, placement, context: context ?? "" }}>
          {cta.button_label}<Icon name="arrow" size={18} />
        </TrackLink>
      </div>
    </aside>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((f, i) => (
        <details key={i} className="card group">
          <summary className="cursor-pointer list-none p-4 sm:p-5 font-semibold flex items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <span>{f.q}</span>
            <Icon name="chevron" size={18} className="mt-1 shrink-0 text-pink transition-transform group-open:rotate-90" />
          </summary>
          <p className="px-4 sm:px-5 pb-5 text-fg-muted max-w-3xl">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Callout({ icon = "info", title, children, tone = "cyan" }: { icon?: string; title?: string; children: React.ReactNode; tone?: string }) {
  return (
    <div className={`card p-4 sm:p-5 flex gap-3.5`}>
      <span className={`tone-${tone} mt-0.5 shrink-0`}><Icon name={icon} size={22} /></span>
      <div className="text-[0.97rem] text-fg-muted">
        {title && <p className="font-semibold text-fg mb-1">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card grid-paper p-6 sm:p-10 text-center">
      <span className="tone-violet inline-block mb-3"><Icon name="radar" size={36} /></span>
      <p className="font-display text-xl font-bold">{title}</p>
      <div className="mt-2 text-fg-muted max-w-xl mx-auto">{children}</div>
    </div>
  );
}
