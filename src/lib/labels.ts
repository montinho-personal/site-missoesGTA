import type { EvidenceType, SpoilerLevel, VerificationStatus, WorkflowStatus } from "./types";

export const statusInfo: Record<VerificationStatus, { label: string; short: string; tone: string; meaning: string }> = {
  confirmado: { label: "Confirmado", short: "Confirmado", tone: "ok", meaning: "Testado diretamente pela nossa equipe ou confirmado por fonte oficial." },
  relato: { label: "Relato da comunidade", short: "Relato", tone: "gold", meaning: "Publicado por jogadores ou veículos que citamos, mas ainda não reproduzido por nós dentro do jogo." },
  investigacao: { label: "Em investigação", short: "Investigando", tone: "violet", meaning: "Há indícios, mas falta evidência suficiente ou as fontes divergem." },
  desmentido: { label: "Desmentido", short: "Desmentido", tone: "red", meaning: "Circulou como verdade e foi comprovado falso." },
  desatualizado: { label: "Desatualizado", short: "Desatualizado", tone: "gray", meaning: "Funcionava em versão anterior do jogo e deixou de funcionar." },
  mod: { label: "Somente com modificação", short: "Mod", tone: "orange", meaning: "Não existe no jogo original; depende de mod." },
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
