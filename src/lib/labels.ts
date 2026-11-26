import type { EvidenceType, SpoilerLevel, VerificationStatus, WorkflowStatus } from "./types";

// A MESMA regra de selos do aplicativo (C, P, N, X), mais um nível acima: "Testado por nós".
export const statusInfo: Record<VerificationStatus, { label: string; short: string; tone: string; meaning: string }> = {
  testado: { label: "Testado por nós", short: "Testado", tone: "cyan", meaning: "Alguém da equipe reproduziu dentro do jogo. A página registra plataforma, versão e data." },
  confirmado: { label: "Confirmado", short: "Confirmado", tone: "ok", meaning: "O mesmo local, passos e prêmio em três ou mais fontes independentes, com gameplay." },
  provavel: { label: "Muito provável", short: "Provável", tone: "gold", meaning: "Duas fontes independentes, ou uma que afirma ter testado." },
  nao_verificado: { label: "Não verificado", short: "Não verificado", tone: "violet", meaning: "Uma fonte só, ou fontes que se contradizem." },
  desmentido: { label: "Desmentido ou corrigido", short: "Desmentido", tone: "red", meaning: "Deixou de funcionar depois de um patch, ou foi desmentido." },
};

export const precisionInfo: Record<string, { label: string; text: string }> = {
  exato: { label: "Ponto exato", text: "A localização é a do próprio lugar." },
  perto: { label: "Perto daqui", text: "O lugar vizinho é conhecido, o ponto certo ainda não: procure em volta, a até uns 300 m." },
  regiao: { label: "Só a região", text: "Só a região é conhecida: o ponto certo pode estar a mais de 1 km." },
};

export const evidenceLabel: Record<EvidenceType, string> = {
  oficial: "Conteúdo oficial",
  teste_direto: "Testado diretamente por nós",
  relatos: "Relatos independentes",
  teoria: "Teoria",
  vazamento: "Vazamento",
  mod: "Modificação",
  outra_versao: "Outra versão do jogo",
};

export const spoilerLabel: Record<SpoilerLevel, string> = {
  nenhum: "Sem spoilers",
  leve: "Spoiler leve",
  historia: "Spoiler da história",
};

export const workflowLabel: Record<WorkflowStatus, string> = {
  rascunho: "Rascunho", revisao: "Em revisão", aprovado: "Aprovado", publicado: "Publicado", arquivado: "Arquivado",
};

export const rewardTypeLabel: Record<string, string> = {
  dinheiro: "Dinheiro", veiculo: "Veículo", arma: "Arma", item: "Item", roupa: "Roupa", cena: "Cena ou referência", conquista: "Troféu ou conquista", nenhuma: "Sem recompensa",
};

/** Campo vazio nunca vira invenção: ou não se aplica, ou ainda não sabemos. */
export function factValue(v: string | null | undefined): { text: string; known: boolean } {
  if (v == null || v.trim() === "") return { text: "Ainda não confirmado", known: false };
  if (v.trim().toLowerCase() === "n/a") return { text: "Não se aplica", known: true };
  return { text: v, known: true };
}

const fmtDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
const fmtShort = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });
export function formatDate(iso: string | null | undefined, short = false): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return "";
  return (short ? fmtShort : fmtDate).format(d);
}
