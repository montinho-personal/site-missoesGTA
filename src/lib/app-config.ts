// Tudo o que o site afirma sobre o aplicativo sai DAQUI. Nada é inventado:
// enquanto o fundador não confirmar um dado, ele fica null e a interface
// mostra o estado "em preparação" em vez de preencher com suposições.
/** Preço de lançamento, decidido pelo fundador em 26/11/2026: R$ 4,20. Pode subir no futuro; o painel sobrepõe. */
export const LAUNCH_PRICE_CENTS = 420;

export type FeatureStatus = "disponivel" | "em_desenvolvimento" | "planejado";

export const appConfig = {
  // Decisão do fundador em 26/11/2026: o aplicativo é inteiro pago, e o dono pode liberar acesso de graça (cortesia).
  // Falta definir preço, meio de pagamento e como a cortesia é concedida (docs/13).
  /** "pre_lancamento" = lista de espera; "a_venda" = CTA de compra */
  stage: "pre_lancamento" as "pre_lancamento" | "a_venda",
  name: "Missões Secretas GTA 6" as string | null,
  purchaseUrl: null as string | null,
  price: null as { amount: number; currency: "BRL"; model: "unico" | "assinatura_mensal" | "assinatura_anual" } | null,
  // O aplicativo é web: abre no navegador e pode ser instalado na tela de início. Não é app de loja.
  platforms: ["Celular ou computador, pelo navegador", "instalável na tela de início"] as string[] | null,
  refundPolicy: null as string | null,
  supportContact: null as string | null,
  screenshots: [] as { src: string; alt: string; width: number; height: number }[],
  demoVideoId: null as string | null,
  deepLinkBase: null as string | null, // ex.: "gtasegredos://descoberta/"
  /**
   * Funcionalidades. O status de cada uma precisa ser confirmado pelo
   * fundador; "planejado" é o padrão conservador e a página diz isso.
   */
  // Conferido no repositório do aplicativo em 26/11/2026: conteúdo e identidade prontos, mapa em desenho, telas ainda não construídas.
  featuresConfirmed: true,
  features: [
    { key: "fichas", title: "As mesmas fichas, o mesmo selo", text: "O arquivo inteiro que você lê aqui, com a mesma régua de confiança. O que muda é a forma de usar.", status: "disponivel" },
    { key: "mapa", title: "Mapa de descobertas", text: "Cada segredo com um pino no mapa, e a forma do pino dizendo se o ponto é exato, perto ou só a região. Para planejar a rota antes de sair cantando pneu.", status: "em_desenvolvimento" },
    { key: "checklist", title: "Checklist do que você já achou", text: "Marque o que encontrou e veja o que ainda falta, por categoria e por região. Adeus, caderninho.", status: "planejado" },
    { key: "filtros", title: "Filtros por tipo e recompensa", text: "Só dinheiro, só carros, só mistérios: você escolhe o problema de hoje.", status: "planejado" },
    { key: "spoilers", title: "Controle de spoilers", text: "Esconde o que depende de partes da história que você ainda não jogou.", status: "planejado" },
    { key: "requisitos", title: "Requisitos à vista", text: "Personagem, horário e progresso necessários aparecem antes de você atravessar o mapa à toa e voltar xingando.", status: "planejado" },
    { key: "atualizacoes", title: "Descobertas novas", text: "O que a comunidade encontra entra no aplicativo com o mesmo status de verificação do portal.", status: "planejado" },
  ] as { key: string; title: string; text: string; status: FeatureStatus }[],
};

export const featureStatusLabel: Record<FeatureStatus, string> = {
  disponivel: "Disponível",
  em_desenvolvimento: "Em desenvolvimento",
  planejado: "Planejado",
};
