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

/** Mensagem de WhatsApp para quem ganhou um código de cortesia. */
export function courtesyMessage(code: string, nome?: string | null, site = ""): string {
  const oi = nome ? `Fala, ${nome.split(" ")[0]}!` : "Fala, parceiro!";
  return [
    `${oi} 🕵️ Liberei pra você o acesso ao app *Missões Secretas GTA 6*, na faixa.`,
    "",
    `Seu código: *${code}*`,
    "",
    `Como ativar (leva 1 minuto): ${site}/app/como-baixar-e-usar/#instalar`,
    "",
    "Lá dentro tem o arquivo inteiro: missões secretas, carros raros, dinheiro escondido e lugares que o GPS não mostra, com local e passo a passo. O código é só seu, não espalha. 😉",
  ].join("\n");
}

/** Link do WhatsApp: com número abre a conversa com a pessoa; sem número, deixa escolher o contato. */
export const whatsappLink = (text: string, tel?: string | null) => {
  const n = (tel ?? "").replace(/\D/g, "");
  const full = n.length === 10 || n.length === 11 ? `55${n}` : n;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
};
