// O conceito central do aplicativo (decisão do Montinho em 27/11/2026).
// Tudo que fala do app parte daqui: página do app, chamadas, painel que sobe, menu, fichas e o próprio app.
// A ideia: o app revela o segredo; a aventura (a fuga, o caos, a história) é do jogador.
// Atenção: a piada do 4,20 depende do preço. Se o preço mudar no painel, revise estes textos,
// o cartão do menu (Chrome.tsx), o painel que sobe (sticky-copy.ts) e as chamadas (migração 011).

/**
 * O gancho na língua da rua (decisão do Montinho em 27/11/2026): "{n} segredos pra meter o loko".
 * O número não fica escrito à mão: vem da contagem do próprio app (src/server/app-count.ts).
 * Sem número disponível, "{n} segredos" vira "Segredos" e a frase continua de pé.
 */
export function fillCount(text: string, n: number | null): string {
  if (n) return text.replace(/\{n\}/g, String(n));
  return text.replace(/(^|[.!?:]\s+)\{n\} segredos/g, "$1Segredos").replace(/\{n\} segredos/g, "segredos");
}
export const hookFor = (n: number | null) => fillCount("{n} segredos pra meter o loko", n);

export const appStory = {
  /** A assinatura. Vai em toda chamada principal. */
  tagline: "O segredo a gente revela. A aventura é você quem vive.",
  taglineShort: "O segredo a gente revela. A aventura é sua.",
  /** O que o app é, em uma frase. "{n} segredos" vira o número do dia (fillCount). */
  promise: "Seu comparsa de bolso: {n} segredos pra meter o loko, com o mapa, o passo a passo e o vídeo de quem já fez.",
  /** O manifesto, em parágrafos curtos (página do app). */
  manifesto: [
    "Desde moleque a gente tá ligado: GTA nunca foi só seguir a seta amarela.",
    "É liberdade. Adrenalina. Meter o loko quando ninguém espera. Viver um rolê que nenhum outro jogador viveu do mesmo jeito.",
    "Agora pensa em quanto rolê você tá deixando passar batido só por não saber que ele existe. Carro raro. Grana escondida. Lugar secreto. Missão que o jogo não te mostra.",
    "Foi por isso que nasceu o Missões Secretas GTA 6.",
  ],
  /** O contraste: saber onde não é a mesma coisa que conseguir. */
  contrast: [
    "Mas saber onde tá a grana não quer dizer que você vai sair vazado com ela.",
    "Saber onde tá o carro não quer dizer que os homi vão facilitar a sua fuga.",
    "Porque em GTA nenhum rolê se repete, parça.",
  ],
  /** O preço e a piada. */
  price: "R$ 4,20. Pagamento único. Sem mensalidade.",
  joke: ["Sim… 4,20. 😏", "Entendedores entenderão.", "Não entendeu? Pergunta pro Donnie ou pro Brian."],
};
