import Link from "next/link";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { evidenceLabel, statusInfo } from "@/lib/labels";
import type { EvidenceType, VerificationStatus } from "@/lib/types";

export const metadata = pageMeta({ title: "Como verificamos cada descoberta", description: "Os critérios para classificar uma descoberta de GTA 6 como confirmada, relato da comunidade, em investigação, desmentida ou desatualizada, e como corrigimos erros.", path: "/metodologia/" });

const evidenceNotes: Record<EvidenceType, string> = {
  oficial: "Publicado pela Rockstar Games em seus canais.",
  teste_direto: "Alguém da equipe reproduziu dentro do jogo. A página registra plataforma, versão e data.",
  relatos: "Jogadores ou veículos diferentes relataram a mesma coisa, sem dependerem um do outro.",
  teoria: "Interpretação da comunidade sobre algo que existe, sem prova do que significa.",
  vazamento: "Material não oficial. Não usamos como base para publicar.",
  mod: "Só existe com modificação do jogo.",
  outra_versao: "Vale para outra versão ou plataforma e pode não se aplicar à sua.",
};

export default function Metodologia() {
  return (
    <Shell title="Como verificamos cada descoberta" eyebrow="Credibilidade" path="/metodologia/" lead="A série GTA tem um histórico longo de boatos, vídeos editados e mods apresentados como segredos. Aqui, toda página diz o quanto aquela informação já foi comprovada.">
      <div className="prose text-fg-muted">
        <h2>Os status</h2>
      </div>
      <dl className="mt-4 flex flex-col gap-3">
        {(Object.keys(statusInfo) as VerificationStatus[]).map((k) => (
          <div key={k} className="card p-4 sm:p-5"><dt><StatusBadge status={k} full /></dt><dd className="mt-2 text-fg-muted">{statusInfo[k].meaning}</dd></div>
        ))}
      </dl>
      <div className="prose text-fg-muted mt-10">
        <h2>Regras que seguimos</h2>
        <ul>
          <li><strong>“Confirmado” exige teste nosso ou fonte oficial.</strong> Dez sites repetindo a mesma coisa ainda são um relato, porque podem estar copiando uns dos outros.</li>
          <li><strong>Divergência entre fontes aparece na página.</strong> Se um veículo diz um lugar e outro diz outro, mostramos os dois e não escolhemos no palpite.</li>
          <li><strong>Código, senha e sequência de botões só entram quando conferidos.</strong> Publicar um código errado faz você perder tempo.</li>
          <li><strong>Vazamentos não são fonte.</strong> Não usamos material obtido de forma ilegal.</li>
          <li><strong>Atualizações do jogo mudam as coisas.</strong> Quando um patch quebra um método, o status vira “Desatualizado” e a página explica.</li>
        </ul>
        <h2>Tipos de evidência</h2>
      </div>
      <dl className="mt-4 card divide-y divide-ink-600">
        {(Object.keys(evidenceLabel) as EvidenceType[]).map((k) => <div key={k} className="p-4"><dt className="font-semibold">{evidenceLabel[k]}</dt><dd className="text-fg-muted mt-0.5">{evidenceNotes[k]}</dd></div>)}
      </dl>
      <div className="prose text-fg-muted mt-10">
        <h2>Correções</h2>
        <p>Erramos? <Link href="/enviar-descoberta/?tipo=correcao">Envie uma correção</Link>. Toda mudança relevante fica registrada no histórico da própria página e no <Link href="/radar/">Radar de descobertas</Link>.</p>
        <h2>Uso de inteligência artificial</h2>
        <p>Usamos ferramentas de IA para organizar pesquisa e rascunhar textos. Nenhuma página é publicada sem fontes identificadas, e nenhuma descoberta recebe o status “Confirmado” sem teste humano dentro do jogo.</p>
      </div>
    </Shell>
  );
}
