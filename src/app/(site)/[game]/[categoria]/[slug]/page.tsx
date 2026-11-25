import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppCta, Breadcrumbs, EntryGrid, FaqList, JsonLd, SpoilerBadge, StatusBadge } from "@/components/ui";
import { FavButton, RevealButton, ShareButton, TrackView } from "@/components/client";
import { Icon } from "@/components/Icon";
import { entryUrl, getCtas, getEntry, getEntryChanges, getPublishedEntries, relatedEntries, toCard } from "@/server/content";
import { notFoundOrRedirect } from "@/server/route-helpers";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { evidenceLabel, factValue, formatDate, rewardTypeLabel, statusInfo } from "@/lib/labels";
import { abs, site } from "@/lib/site";
import { appConfig } from "@/lib/app-config";

export const revalidate = 600;
export async function generateStaticParams() {
  return (await getPublishedEntries()).map((e) => ({ game: e.game_slug, categoria: e.category_slug, slug: e.slug }));
}

type Props = PageProps<"/[game]/[categoria]/[slug]">;

export async function generateMetadata({ params }: Props) {
  const { game, categoria, slug } = await params;
  const e = await getEntry(game, categoria, slug);
  if (!e) return {};
  return pageMeta({
    title: e.seo_title || `${e.title} (GTA 6)`, description: e.seo_description || e.direct_answer || e.summary,
    path: entryUrl(e), type: "article", published: e.published_at, modified: e.updated_at,
  });
}

function Fact({ label, value, icon }: { label: string; value: string | null; icon: string }) {
  const f = factValue(value);
  return (
    <div className="p-4">
      <dt className="label text-fg-subtle flex items-center gap-2"><span className="text-cyan"><Icon name={icon} size={17} /></span>{label}</dt>
      <dd className={`mt-1.5 ${f.known ? "" : "text-fg-subtle italic"}`}>{f.text}</dd>
    </div>
  );
}

export default async function EntryPage({ params }: Props) {
  const { game, categoria, slug } = await params;
  const path = `/${game}/${categoria}/${slug}/`;
  const e = await getEntry(game, categoria, slug);
  if (!e) await notFoundOrRedirect(path);
  const entry = e!;
  const [all, ctas, changes] = await Promise.all([getPublishedEntries(game), getCtas(), getEntryChanges(entry.id)]);
  const related = relatedEntries(entry, all);
  const st = statusInfo[entry.verification_status];
  const isGuide = entry.kind === "guia";
  const crumbs = [{ name: "Início", href: "/" }, { name: "GTA 6", href: `/${game}/` }, { name: entry.category_name, href: `/${game}/${categoria}/` }, { name: entry.title }];
  const url = abs(path);

  const toc = [
    !isGuide && { id: "ficha", label: "Ficha da descoberta" },
    entry.steps.length > 0 && { id: "passo-a-passo", label: "Passo a passo" },
    entry.body_md && { id: "detalhes", label: "Detalhes" },
    entry.common_mistakes.length > 0 && { id: "erros-comuns", label: "Erros comuns" },
    entry.troubleshooting.length > 0 && { id: "problemas", label: "Se não funcionar" },
    { id: "verificacao", label: "Como sabemos" },
    entry.faq.length > 0 && { id: "perguntas", label: "Perguntas frequentes" },
  ].filter(Boolean) as { id: string; label: string }[];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbLd(crumbs, path),
      {
        "@type": "Article", "@id": `${url}#article`, mainEntityOfPage: url, headline: entry.title, description: entry.direct_answer || entry.summary,
        inLanguage: "pt-BR", datePublished: entry.published_at, dateModified: entry.updated_at, articleSection: entry.category_name,
        author: { "@type": "Organization", name: entry.author_name ?? site.name, url: abs("/sobre/") },
        publisher: { "@type": "Organization", name: site.name, url: abs("/") },
        about: { "@type": "VideoGame", name: "Grand Theft Auto VI" },
        ...(entry.media.filter((m) => m.tipo === "imagem").length ? { image: entry.media.filter((m) => m.tipo === "imagem").map((m) => m.url) } : {}),
        citation: entry.sources.map((s) => s.url),
      },
      ...(entry.faq.length ? [faqLd(entry.faq)] : []),
    ],
  };

  return (
    <article className="wrap pt-6" data-spoiler={entry.spoiler_level}>
      <JsonLd data={ld} />
      <TrackView event="view_discovery" params={{ entry_id: entry.id, category: categoria, status: entry.verification_status }} />
      <Breadcrumbs items={crumbs} />

      <header className="mt-6 max-w-3xl">
        <p className="label text-cyan inline-flex items-center gap-2"><Icon name={entry.category_icon} size={16} />{entry.category_name}</p>
        <p className="label text-fg-subtle mt-1.5">Arquivo {entry.id.toUpperCase()}</p>
        <h1 className="mt-3 text-[2rem] leading-[1.08] sm:text-5xl font-black">{entry.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.verification_status} full />
          <SpoilerBadge level={entry.spoiler_level} />
        </div>
        <p className="mt-3 text-sm text-fg-subtle">
          Por <Link href="/sobre/" className="underline underline-offset-2 hover:text-fg">{entry.author_name ?? site.name}</Link>
          {" · "}Atualizado em <time dateTime={entry.updated_at}>{formatDate(entry.updated_at)}</time>
        </p>
      </header>

      <div className="relative mt-6">
        <div className="spoiler-veil absolute inset-x-0 top-0 z-10 card p-6 flex-col items-start gap-3 max-w-3xl">
          <p className="font-display text-xl font-bold">Esta página tem spoilers da história</p>
          <p className="text-fg-muted">Sua proteção contra spoilers está ligada. O conteúdo fica coberto até você decidir ver.</p>
          <RevealButton />
        </div>

        <div className="spoiler-content grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0 flex flex-col gap-10">
            {/* Resposta primeiro */}
            <section aria-labelledby="h-resposta" className="card border-pink/50 p-5 sm:p-6 max-w-3xl">
              <h2 id="h-resposta" className="label text-pink mb-2">Resposta rápida</h2>
              <p className="text-lg sm:text-xl leading-relaxed">{entry.direct_answer || entry.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2.5 no-print">
                <FavButton id={entry.id} title={entry.title} withLabel />
                <ShareButton title={entry.title} url={url} />
              </div>
            </section>

            {entry.summary && entry.direct_answer && <p className="max-w-3xl text-fg-muted text-lg">{entry.summary}</p>}

            {!isGuide && (
              <section aria-labelledby="ficha" className="max-w-3xl">
                <h2 id="ficha" className="text-2xl font-extrabold mb-4">Ficha da descoberta</h2>
                <dl className="card grid sm:grid-cols-2 [&>div]:border-b [&>div]:border-ink-600 sm:[&>div:nth-child(odd)]:border-r overflow-hidden">
                  <Fact icon="pin" label="Onde fica" value={entry.location_text} />
                  {entry.region_name && <Fact icon="compass" label="Região" value={entry.region_name} />}
                  <Fact icon="flag" label="Ponto de referência" value={entry.landmark} />
                  <Fact icon="users" label="Personagem necessário" value={entry.character_req} />
                  <Fact icon="shield" label="Requisitos" value={entry.requirements} />
                  <Fact icon="file" label="Progresso necessário" value={entry.progress_required} />
                  <Fact icon="clock" label="Horário ou condições" value={entry.conditions} />
                  <Fact icon="cash" label="Recompensa" value={entry.reward ?? (entry.reward_type === "nenhuma" ? "n/a" : null)} />
                  <Fact icon="radar" label="Dá para repetir?" value={entry.repeatable} />
                  <Fact icon="info" label="Dá para perder?" value={entry.missable} />
                </dl>
                {entry.reward_type && rewardTypeLabel[entry.reward_type] && <p className="mt-2 text-sm text-fg-subtle">Tipo de recompensa: {rewardTypeLabel[entry.reward_type]}.</p>}
              </section>
            )}

            {entry.steps.length > 0 && (
              <section aria-labelledby="passo-a-passo" className="max-w-3xl">
                <h2 id="passo-a-passo" className="text-2xl font-extrabold mb-4">Passo a passo</h2>
                <ol className="flex flex-col gap-3">
                  {entry.steps.map((s, i) => (
                    <li key={i} className="card p-4 flex gap-4">
                      <span className="font-display font-black text-2xl text-pink leading-none w-7 shrink-0" aria-hidden="true">{i + 1}</span>
                      <p>{s}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {entry.media.length > 0 && (
              <section aria-label="Imagens e vídeos" className="max-w-3xl flex flex-col gap-4">
                {entry.media.map((m, i) => m.tipo === "imagem" ? (
                  <figure key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt} width={m.largura ?? 1200} height={m.altura ?? 675} loading="lazy" decoding="async" className="rounded-xl border border-ink-600 w-full h-auto" />
                    {m.credito && <figcaption className="mt-1.5 text-sm text-fg-subtle">{m.credito}</figcaption>}
                  </figure>
                ) : (
                  <p key={i}><a className="link" href={m.url} rel="noopener nofollow">Assistir ao vídeo: {m.alt}</a></p>
                ))}
              </section>
            )}

            {entry.body_md && (
              <section aria-labelledby="detalhes">
                <h2 id="detalhes" className="text-2xl font-extrabold mb-4">Detalhes</h2>
                <div className="prose"><Markdown remarkPlugins={[remarkGfm]} components={{ h1: "h3", a: ({ href, children }) => <a href={href} rel={href?.startsWith("http") ? "noopener nofollow" : undefined}>{children}</a> }}>{entry.body_md}</Markdown></div>
              </section>
            )}

            {entry.common_mistakes.length > 0 && (
              <section aria-labelledby="erros-comuns" className="max-w-3xl">
                <h2 id="erros-comuns" className="text-2xl font-extrabold mb-4">Erros comuns</h2>
                <ul className="flex flex-col gap-2.5">{entry.common_mistakes.map((m, i) => <li key={i} className="flex gap-3"><Icon name="close" size={19} className="text-red shrink-0 mt-1" /><span>{m}</span></li>)}</ul>
              </section>
            )}

            {entry.troubleshooting.length > 0 && (
              <section aria-labelledby="problemas" className="max-w-3xl">
                <h2 id="problemas" className="text-2xl font-extrabold mb-4">Se não funcionar</h2>
                <dl className="flex flex-col gap-3">{entry.troubleshooting.map((t, i) => <div key={i} className="card p-4"><dt className="font-semibold">{t.problema}</dt><dd className="mt-1 text-fg-muted">{t.solucao}</dd></div>)}</dl>
              </section>
            )}

            {/* Credibilidade */}
            <section aria-labelledby="verificacao" className="max-w-3xl">
              <h2 id="verificacao" className="text-2xl font-extrabold mb-4">Como sabemos</h2>
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-ink-600">
                  <StatusBadge status={entry.verification_status} full />
                  <p className="mt-2.5 text-fg-muted">{st.meaning}</p>
                </div>
                <dl className="grid sm:grid-cols-2 [&>div]:p-4 [&>div]:border-b [&>div]:border-ink-600 sm:[&>div:nth-child(odd)]:border-r">
                  <div><dt className="label text-fg-subtle">Tipo de evidência</dt><dd className="mt-1">{evidenceLabel[entry.evidence_type]}</dd></div>
                  <div><dt className="label text-fg-subtle">Última verificação nossa</dt><dd className="mt-1">{entry.last_verified_on ? formatDate(entry.last_verified_on) : <span className="text-fg-subtle italic">Ainda não testamos no jogo</span>}</dd></div>
                  <div><dt className="label text-fg-subtle">Plataforma testada</dt><dd className="mt-1">{entry.platform_tested ?? <span className="text-fg-subtle italic">Não se aplica ainda</span>}</dd></div>
                  <div><dt className="label text-fg-subtle">Versão do jogo</dt><dd className="mt-1">{entry.game_version ?? <span className="text-fg-subtle italic">Não registrada</span>}</dd></div>
                </dl>
                <div className="p-5">
                  <h3 className="label text-fg-subtle mb-2.5">Fontes</h3>
                  {entry.sources.length === 0 ? <p className="text-fg-subtle italic">Sem fontes externas registradas.</p> : (
                    <ul className="flex flex-col gap-2.5">
                      {entry.sources.map((s, i) => (
                        <li key={i} className="text-[0.97rem]">
                          <a href={s.url} rel="noopener nofollow" className="link font-medium">{s.nome}</a>
                          {s.data && <span className="text-fg-subtle"> · {formatDate(s.data) || s.data}</span>}
                          {s.nota && <span className="block text-fg-muted text-sm">{s.nota}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {changes.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-fg-muted py-2">Histórico de alterações ({changes.length})</summary>
                  <ol className="mt-1 flex flex-col gap-1.5 text-sm text-fg-muted">{changes.map((c) => <li key={c.id}><time dateTime={c.changed_at} className="text-fg-subtle">{formatDate(c.changed_at)}</time>: {c.note}</li>)}</ol>
                </details>
              )}
              <p className="mt-4 text-sm"><Link className="link" href={`/enviar-descoberta/?tipo=correcao&ref=${entry.id}`}>Encontrou um erro ou tem uma prova? Envie uma correção.</Link></p>
            </section>

            <div className="max-w-3xl"><AppCta cta={ctas[entry.category_cta ?? "padrao"] ?? ctas.padrao} placement="entry" context={entry.id} /></div>
            {appConfig.deepLinkBase && entry.app_ref && <p className="max-w-3xl -mt-6"><a className="link" href={`${appConfig.deepLinkBase}${entry.app_ref}`}>Abrir esta descoberta no aplicativo</a></p>}

            {entry.faq.length > 0 && (
              <section aria-labelledby="perguntas" className="max-w-3xl">
                <h2 id="perguntas" className="text-2xl font-extrabold mb-4">Perguntas frequentes</h2>
                <FaqList items={entry.faq} />
              </section>
            )}
          </div>

          {toc.length > 2 && (
            <aside className="hidden lg:block no-print">
              <nav aria-label="Nesta página" className="sticky top-24 card p-5">
                <p className="label text-fg-subtle mb-3">Nesta página</p>
                <ol className="flex flex-col gap-1 text-[0.95rem]">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="block py-1.5 text-fg-muted hover:text-pink">{t.label}</a></li>)}</ol>
              </nav>
            </aside>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="h-rel">
          <h2 id="h-rel" className="text-2xl sm:text-3xl font-extrabold mb-5">Descobertas relacionadas</h2>
          <EntryGrid entries={related.map(toCard)} />
        </section>
      )}
    </article>
  );
}
