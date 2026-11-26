// Textos da barra fixa do aplicativo (o "rodapé que sobe").
// Cada página fala do que o leitor acabou de fazer nela, na voz do arquivo (docs/15).
// Regra: a frase de cima vende o benefício; a de baixo diz o que acontece ao tocar. Sem número inventado,
// sem urgência falsa, sem prometer função que o aplicativo não tem.

export interface StickyCopy { title: string; line: string; context: string }

const CATEGORY: Record<string, { list: StickyCopy; entry: StickyCopy }> = {
  "missoes-secretas": {
    list: { title: "Missão sem pino no mapa é passeio.", line: "No aplicativo, cada encontro tem lugar marcado e o vídeo de quem já fez.", context: "cat_missoes" },
    entry: { title: "Leu o passo a passo? Veja onde fica.", line: "O pino desta missão no mapa, e o que mais dá para fazer na mesma viagem.", context: "ficha_missoes" },
  },
  "lugares-secretos": {
    list: { title: "Bunker não tem placa. O mapa tem pino.", line: "Todos os esconderijos no mapa do aplicativo, com a precisão de cada um.", context: "cat_bunkers" },
    entry: { title: "A porta é essa. Falta achar o caminho.", line: "No mapa do aplicativo você vê o ponto e o que tem em volta.", context: "ficha_bunkers" },
  },
  "easter-eggs": {
    list: { title: "Piada interna, agora com endereço.", line: "Os easter eggs no mapa do aplicativo, e a lista do que você já viu.", context: "cat_easter" },
    entry: { title: "Achou graça? Tem mais por perto.", line: "No mapa do aplicativo, os outros segredos em volta deste.", context: "ficha_easter" },
  },
  dinheiro: {
    list: { title: "Grana escondida rende mais com mapa.", line: "Filtre só o que paga, veja no mapa e risque o que já pegou.", context: "cat_dinheiro" },
    entry: { title: "Esse é um. Quantos tem no caminho?", line: "No mapa do aplicativo, os outros esconderijos perto deste.", context: "ficha_dinheiro" },
  },
  veiculos: {
    list: { title: "A garagem dos sonhos começa no mapa.", line: "Cada carro raro com pino, condição para aparecer e vídeo.", context: "cat_veiculos" },
    entry: { title: "Viu o carro. Agora vá buscar.", line: "O pino no mapa do aplicativo, sem ficar comparando print.", context: "ficha_veiculos" },
  },
  "armas-e-itens": {
    list: { title: "Arma única não fica na vitrine.", line: "Fica no mapa do aplicativo, com o ponto e o vídeo de quem pegou.", context: "cat_armas" },
    entry: { title: "Sabe o que é. Falta saber onde.", line: "O pino desta arma no mapa, e o que mais tem por perto.", context: "ficha_armas" },
  },
  dicas: {
    list: { title: "Aprendeu o básico? Hora de explorar.", line: "O aplicativo mostra o que procurar em seguida, no mapa.", context: "cat_dicas" },
    entry: { title: "Resolvido. E agora, o que fazer?", line: "O aplicativo separa os segredos mais fáceis para começar.", context: "ficha_dicas" },
  },
};

const PAGES: Record<string, StickyCopy> = {
  home: { title: "O arquivo inteiro, com mapa, no bolso.", line: "Pino, vídeo e o que você já achou, com o console ligado ao lado.", context: "home" },
  segredos: { title: "Todos esses segredos. Um mapa só.", line: "No aplicativo você vê tudo no mapa e risca o que já fez.", context: "segredos" },
  jogo: { title: "Leonida é grande. O mapa ajuda.", line: "Cada segredo com pino, vídeo e a sua lista do que falta.", context: "hub" },
  mapa: { title: "As regiões viram pinos no aplicativo.", line: "O mapa que este site não tem: ponto por ponto, com precisão.", context: "mapa" },
  regiao: { title: "Essa região inteira, pino por pino.", line: "No aplicativo você monta a rota e faz tudo na mesma viagem.", context: "regiao" },
  sobre: { title: "A Nina e o Bira cabem no seu bolso.", line: "O mesmo arquivo, com mapa e a lista do que você já achou.", context: "sobre" },
  metodologia: { title: "Mesma régua. Agora com mapa.", line: "O selo de cada ficha vai junto para o aplicativo.", context: "metodologia" },
  radar: { title: "O arquivo cresce. Seu mapa também.", line: "No aplicativo, as fichas novas aparecem no mapa.", context: "radar" },
  favoritos: { title: "Porta-luvas é bom. Mapa é melhor.", line: "No aplicativo, o que você salvou vira pino e checklist.", context: "favoritos" },
  ajuda: { title: "Dúvida resolvida? Hora de jogar.", line: "O aplicativo mostra o que fazer perto de onde você está.", context: "ajuda" },
  padrao: { title: "Menos tempo procurando. Mais jogando.", line: "O arquivo inteiro no mapa do aplicativo.", context: "padrao" },
};

/** Onde a barra NÃO aparece: a própria página do app, compra, formulários e textos legais. */
const HIDDEN = [/^\/app(\/|$)/, // inclui o manual de instalação
  /^\/admin(\/|$)/, /^\/privacidade\//, /^\/termos\//, /^\/contato\//, /^\/enviar-descoberta\//, /^\/busca\//];

export function stickyCopyFor(pathname: string): StickyCopy | null {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (HIDDEN.some((r) => r.test(path))) return null;
  if (path === "/") return PAGES.home;
  const parts = path.split("/").filter(Boolean);
  const [first, second, third] = parts;
  if (PAGES[first] && parts.length === 1) return PAGES[first];
  if (first?.startsWith("gta-")) {
    if (parts.length === 1) return PAGES.jogo;
    if (second === "segredos") return PAGES.segredos;
    if (second === "mapa") return third ? PAGES.regiao : PAGES.mapa;
    const cat = CATEGORY[second];
    if (cat) return parts.length >= 3 ? cat.entry : cat.list;
  }
  return PAGES.padrao;
}

export const allStickyCopies = (): StickyCopy[] => [...Object.values(PAGES), ...Object.values(CATEGORY).flatMap((c) => [c.list, c.entry])];
