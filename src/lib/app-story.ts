// O conceito central do aplicativo (decisão do Montinho em 27/11/2026).
// Tudo que fala do app parte daqui: página do app, chamadas, painel que sobe, menu, fichas e o próprio app.
// A ideia: o app revela o segredo; a aventura (a fuga, o caos, a história) é do jogador.
// Atenção: a piada do 4,20 depende do preço. Se o preço mudar no painel, revise estes textos,
// o cartão do menu (Chrome.tsx), o painel que sobe (sticky-copy.ts) e as chamadas (migração 011).

export const appStory = {
  /** A assinatura. Vai em toda chamada principal. */
  tagline: "O segredo a gente revela. A aventura é você quem vive.",
  taglineShort: "O segredo a gente revela. A aventura é sua.",
  /** O que o app é, em uma frase. */
  promise: "Seu comparsa de bolso: segredos, localizações, orientações e vídeos de quem já fez.",
  /** O manifesto, em parágrafos curtos (página do app). */
  manifesto: [
    "Desde moleque a gente sabe: GTA nunca foi só seguir a seta amarela.",
    "É liberdade. Adrenalina. Fazer o que ninguém esperava. Viver uma história que nenhum outro jogador viveu do mesmo jeito.",
    "Agora pensa em quanta aventura você está deixando para trás só por não saber que ela existe. Carro raro. Dinheiro escondido. Lugar secreto. Missão que o jogo não te mostra.",
    "Foi por isso que nasceu o Missões Secretas GTA 6.",
  ],
  /** O contraste: saber onde não é a mesma coisa que conseguir. */
  contrast: [
    "Mas saber onde está o dinheiro não quer dizer que você vai escapar com ele.",
    "Saber onde está o carro não quer dizer que a polícia vai facilitar a sua fuga.",
    "Porque em GTA nenhuma aventura se repete.",
  ],
  /** O preço e a piada. */
  price: "R$ 4,20. Pagamento único. Sem mensalidade.",
  joke: ["Sim… 4,20. 😏", "Entendedores entenderão.", "Não entendeu? Pergunta pro Donnie ou pro Brian."],
};
