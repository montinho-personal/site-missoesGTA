import Link from "next/link";
import { q } from "@/server/db";
import { workflowLabel, statusInfo, formatDate } from "@/lib/labels";
import type { VerificationStatus, WorkflowStatus } from "@/lib/types";

export const metadata = { title: "Visão geral" };

const Tile = ({ label, value, href }: { label: string; value: React.ReactNode; href?: string }) => (
    <div className="card p-4"><p className="label text-fg-subtle">{label}</p><p className="font-display text-3xl font-black mt-1">{href ? <Link href={href} className="hover:text-pink">{value}</Link> : value}</p></div>
);

export default async function Dashboard() {
  const [wf, vs, pend, wait, kw, stale, scheduled, noSrc] = await Promise.all([
    q<{ k: WorkflowStatus; n: number }>(`select workflow_status as k, count(*)::int as n from entries group by 1`),
    q<{ k: VerificationStatus; n: number }>(`select verification_status as k, count(*)::int as n from entries where workflow_status = 'publicado' group by 1`),
    q<{ n: number }>(`select count(*)::int as n from submissions where status = 'pendente'`),
    q<{ n: number }>(`select count(*)::int as n from waitlist`),
    q<{ n: number; todo: number }>(`select count(*)::int as n, count(*) filter (where production_status = 'nao_iniciado' and priority = 'alta')::int as todo from keywords`),
    // Desatualizadas: publicadas sem teste nosso, ou testadas há mais de 60 dias.
    q<{ id: string; title: string; last_verified_on: string | null; updated_at: string }>(`select id, title, last_verified_on::text, updated_at::text from entries where workflow_status = 'publicado' and (last_verified_on is null or last_verified_on < now() - interval '60 days') order by last_verified_on nulls first, updated_at limit 12`),
    q<{ id: string; title: string; published_at: string }>(`select id, title, published_at::text from entries where workflow_status = 'publicado' and published_at > now() order by published_at`),
    q<{ n: number; unrev: number }>(`select count(*) filter (where jsonb_array_length(sources) = 0)::int as n, count(*) filter (where reviewed_by is null)::int as unrev from entries where workflow_status = 'publicado'`),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-black">Visão geral</h1>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <Tile label="Publicadas" value={wf.find((x) => x.k === "publicado")?.n ?? 0} href="/admin/entradas/?wf=publicado" />
        <Tile label="Em revisão" value={wf.find((x) => x.k === "revisao")?.n ?? 0} href="/admin/entradas/?wf=revisao" />
        <Tile label="Envios pendentes" value={pend[0].n} href="/admin/envios/" />
        <Tile label="Lista de espera do app" value={wait[0].n} />
        <Tile label="Palavras-chave" value={kw[0].n} href="/admin/palavras-chave/" />
      </div>
      <section><h2 className="text-xl font-bold mb-3">Fluxo editorial</h2>
        <div className="flex flex-wrap gap-2">{(Object.keys(workflowLabel) as WorkflowStatus[]).map((k) => <Link key={k} href={`/admin/entradas/?wf=${k}`} className="chip">{workflowLabel[k]} <b>{wf.find((x) => x.k === k)?.n ?? 0}</b></Link>)}</div></section>
      <section><h2 className="text-xl font-bold mb-3">Qualidade do que está no ar</h2>
        <div className="flex flex-wrap gap-2">{(Object.keys(statusInfo) as VerificationStatus[]).map((k) => <span key={k} className={`badge tone-${statusInfo[k].tone}`}>{statusInfo[k].label}: {vs.find((x) => x.k === k)?.n ?? 0}</span>)}</div>
        <p className="mt-3 text-fg-muted">Publicadas sem nenhuma fonte: <b className={noSrc[0].n ? "text-red" : "text-ok"}>{noSrc[0].n}</b> · Publicadas sem revisor humano registrado: <b className={noSrc[0].unrev ? "text-orange" : "text-ok"}>{noSrc[0].unrev}</b> · Palavras-chave de prioridade alta sem conteúdo iniciado: <b>{kw[0].todo}</b></p></section>
      {scheduled.length > 0 && <section><h2 className="text-xl font-bold mb-3">Agendadas</h2><ul className="card divide-y divide-ink-600">{scheduled.map((e) => <li key={e.id} className="p-3 flex justify-between gap-4"><Link className="link" href={`/admin/entradas/${e.id}/`}>{e.title}</Link><span className="text-fg-subtle">{formatDate(e.published_at)}</span></li>)}</ul></section>}
      <section><h2 className="text-xl font-bold mb-1">Precisam de verificação</h2><p className="text-fg-muted mb-3">Publicadas que nunca testamos no jogo, ou testadas há mais de 60 dias.</p>
        <ul className="card divide-y divide-ink-600">{stale.length === 0 && <li className="p-3 text-fg-muted">Tudo em dia.</li>}{stale.map((e) => <li key={e.id} className="p-3 flex justify-between gap-4"><Link className="link" href={`/admin/entradas/${e.id}/`}>{e.title}</Link><span className="text-fg-subtle shrink-0">{e.last_verified_on ? `testada em ${formatDate(e.last_verified_on)}` : "nunca testada"}</span></li>)}</ul></section>
    </div>
  );
}
