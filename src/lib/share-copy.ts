// Textos de compartilhamento: o que a pessoa manda para um amigo no WhatsApp.
// Regra de ouro (docs/16): soa como gente falando com gente, entrega o que é e onde está,
// e nunca entrega o spoiler da história. Sem número inventado, sem "clique aqui".

export type ShareKind = "ficha" | "app" | "acesso" | "home";
export type ShareChannel = "whatsapp" | "instagram" | "copia";

export interface ShareContext {
  kind: ShareKind;
  url: string; // absoluto, sem parâmetros
  title?: string;
  category?: string; // slug da categoria
  spoiler?: "nenhum" | "leve" | "historia";
  priceLabel?: string | null;
}

/** Marca a origem para a mensuração, sem mexer no endereço canônico. */
export function withUtm(url: string, channel: ShareChannel, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", channel === "copia" ? "link" : channel);
  u.searchParams.set("utm_medium", "compartilhamento");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

const BY_CATEGORY: Record<string, (t: string) => string> = {
  dinheiro: (t) => `Achei grana escondida no GTA 6: ${t}. Tem o lugar e o passo a passo aqui 👇`,
  veiculos: (t) => `Bora buscar esse carro no GTA 6? ${t}. Onde fica e como pegar 👇`,
  "missoes-secretas": (t) => `Sabia dessa missão escondida no GTA 6? ${t}. O jogo não marca no mapa, mas tá tudo aqui 👇`,
  "easter-eggs": (t) => `Olha esse easter egg do GTA 6 que quase ninguém viu: ${t} 👇`,
  "lugares-secretos": (t) => `Tem um esconderijo no GTA 6 que o GPS não mostra: ${t} 👇`,
  "armas-e-itens": (t) => `Arma que não tem na loja do GTA 6: ${t}. Onde pegar 👇`,
  dicas: (t) => `Isso aqui salva no GTA 6: ${t} 👇`,
};

/** A mensagem pronta para o WhatsApp (conversa individual ou grupo). */
export function whatsappText(ctx: ShareContext): string {
  const link = withUtm(ctx.url, "whatsapp", ctx.kind === "ficha" ? `ficha_${ctx.category ?? "geral"}` : ctx.kind);
  if (ctx.kind === "ficha") {
    if (ctx.spoiler === "historia") return `Segredo do GTA 6 aqui. Tem spoiler da história: só abre se você já passou dessa parte 👇\n${link}`;
    const line = (BY_CATEGORY[ctx.category ?? ""] ?? ((t: string) => `Segredo do GTA 6: ${t} 👇`))(ctx.title ?? "");
    return `${line}\n${link}`;
  }
  if (ctx.kind === "app") {
    const price = ctx.priceLabel ? ` Custa ${ctx.priceLabel}, e sim, o número é de propósito.` : "";
    return `Achei um app que mostra no mapa onde fica cada segredo do GTA 6, com vídeo de quem já fez e a lista do que você já pegou.${price} 👇\n${link}`;
  }
  if (ctx.kind === "acesso") {
    return `Peguei o mapa de segredos do GTA 6. Pino de cada missão escondida, vídeo de quem fez e o que dá pra fazer na mesma viagem. Pega aí pra gente caçar junto 👇\n${link}`;
  }
  return `Tem um site que lista os segredos do GTA 6 com o passo a passo e separa o que é verdade do que é boato 👇\n${link}`;
}

/** Frase grande da imagem de Stories/Status, por categoria. É o gancho: uma pergunta. */
export const STORY_HOOK: Record<string, string> = {
  dinheiro: "Você já pegou essa grana?",
  veiculos: "Você já achou esse carro?",
  "missoes-secretas": "Você já fez essa missão?",
  "easter-eggs": "Você já viu esse easter egg?",
  "lugares-secretos": "Você já entrou aqui?",
  "armas-e-itens": "Você já pegou essa arma?",
  dicas: "Você sabia disso?",
};

/**
 * Mensagem de WhatsApp para quem ganhou uma cortesia: um link que abre o app já liberado (ninguém digita código)
 * e como deixar o ícone na tela. Com vagas, serve para divulgar a um grupo.
 */
export interface CourtesyMessageOpts {
  /** Teste grátis: horas de acesso a partir do primeiro uso. */
  trialHours?: number | null;
  /** "instagram": texto para o direct, sem os asteriscos do WhatsApp, com a origem certa no link. */
  canal?: "whatsapp" | "instagram";
  /** Preço exibido depois do teste (ex.: "R$ 4,20"). */
  preco?: string;
}

const prazo = (h: number) => (h % 24 === 0 ? (h / 24 === 1 ? "24 horas" : `${h / 24} dias`) : `${h} horas`);

export function courtesyMessage(code: string, nome?: string | null, site = "", vagas?: number | null, appUrl = "https://app.missoessecretasgta.com.br", opts: CourtesyMessageOpts = {}): string {
  const grupo = Boolean(vagas && vagas > 1);
  const ig = opts.canal === "instagram";
  const b = (t: string) => (ig ? t : `*${t}*`);
  const teste = opts.trialHours && opts.trialHours > 0 ? prazo(opts.trialHours) : null;
  const campanha = teste ? `teste_${opts.trialHours}h` : "acesso_app";
  const origem = ig ? "utm_source=instagram&utm_medium=dm" : `utm_source=whatsapp&utm_medium=${teste ? "teste" : "cortesia"}`;
  const oi = nome ? `Fala, ${nome.split(" ")[0]}!` : grupo ? "Fala, galera!" : "Fala, parceiro!";
  const link = `${appUrl.replace(/\/$/, "")}/entrar?chave=${code.toUpperCase().replace(/[^A-Z0-9]/g, "")}&${origem}&utm_campaign=${campanha}`;
  const abre = teste
    ? grupo
      ? `${oi} 🕵️ Liberei ${teste} de ${b("Missões Secretas GTA 6")} com tudo liberado para as primeiras ${vagas!.toLocaleString("pt-BR")} pessoas que abrirem este link.`
      : `${oi} 🕵️ Liberei pra você ${b(`${teste} com tudo liberado`)} no app ${b("Missões Secretas GTA 6")}. Na faixa, sem cartão.`
    : grupo
      ? `${oi} 🕵️ Liberei o app ${b("Missões Secretas GTA 6")} de graça para as primeiras ${vagas!.toLocaleString("pt-BR")} pessoas que abrirem este link.`
      : `${oi} 🕵️ Liberei pra você o acesso ao app ${b("Missões Secretas GTA 6")}, na faixa.`;
  const fim = teste
    ? `O relógio de ${teste} começa quando você abrir o link. Curtiu? Depois é ${opts.preco ?? "R$ 4,20"}, uma vez só, sem mensalidade. Sim, 4,20. 😏`
    : grupo ? "Quando acabarem as vagas, o link para de funcionar. Corre. 🏃" : "O link é só seu, não espalha. 🤫";
  return [
    abre,
    "",
    `👉 ${b("Toque aqui no celular e o app abre já liberado:")}`,
    link,
    "",
    `📲 ${b("Para ficar com o ícone na tela (sem loja de aplicativos):")}`,
    `${b("Android (Chrome):")} toque nos três pontinhos ⋮ lá em cima e em ${b("Instalar app")} (se não aparecer, ${b("Adicionar à tela inicial")}).`,
    `${b("Samsung Internet:")} toque em ≡ embaixo, ${b("Adicionar página a")} e ${b("Tela inicial")}.`,
    `${b("iPhone (use o Safari):")} toque em ${b("Compartilhar")} (o quadrado com a seta ⬆️), role e toque em ${b("Adicionar à Tela de Início")}.`,
    "",
    `Passo a passo com mais detalhes: ${site}/app/como-baixar-e-usar/#instalar`,
    "",
    `Lá dentro tem o arquivo inteiro: missões secretas, carros raros, dinheiro escondido e lugares que o GPS não mostra, com local e passo a passo. ${fim}`,
  ].join("\n");
}

/** Link do WhatsApp: com número abre a conversa com a pessoa; sem número, deixa escolher o contato. */
export const whatsappLink = (text: string, tel?: string | null) => {
  const n = (tel ?? "").replace(/\D/g, "");
  const full = n.length === 10 || n.length === 11 ? `55${n}` : n;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
};
