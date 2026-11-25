import Link from "next/link";
import { Shell } from "@/components/Shell";
import { EmptyState, StatusBadge } from "@/components/ui";
import { getPublicChanges } from "@/server/content";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/labels";

export const revalidate = 600;
export const metadata = pageMeta({ title: "Radar de descobertas de GTA 6", description: "As atualizações mais recentes do portal: novas descobertas de GTA 6, mudanças de status de verificação e correções.", path: "/radar/" });

export default async function Radar() {
  const changes = await getPublicChanges(60);
  return (
    <Shell title="Radar de descobertas" eyebrow="O que mudou" path="/radar/" lead="Registros novos, mudanças de status e correções, do mais recente para o mais antigo.">
      {changes.length === 0 ? <EmptyState title="Nada por aqui ainda"><p>As atualizações aparecem assim que publicarmos os primeiros registros.</p></EmptyState> : (
        <ol className="card divide-y divide-ink-600">
          {changes.map((ch) => (
            <li key={ch.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-1.5 sm:gap-5">
              <time dateTime={ch.changed_at} className="label text-fg-subtle sm:w-36 shrink-0 sm:pt-1">{formatDate(ch.changed_at)}</time>
              <div>
                <Link href={ch.url!} className="font-display font-bold text-lg leading-snug hover:text-pink">{ch.title}</Link>
                <p className="text-fg-muted mt-0.5">{ch.note}</p>
                {ch.verification_status && <div className="mt-2"><StatusBadge status={ch.verification_status} full /></div>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Shell>
  );
}
