// Regras de normalização e classificação do banco mestre de palavras-chave.
// São heurísticas transparentes: o painel permite corrigir qualquer linha à mão.

export const normKeyword = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9%$ ]+/g, " ")
    .replace(/\bgta\s*(vi|six)\b/g, "gta 6").replace(/\bgta6\b/g, "gta 6").replace(/\s+/g, " ").trim();

/** Pesquisas sobre outros jogos ficam guardadas, separadas, para uso futuro. */
export function detectGame(n: string): string {
  if (/\bgta ?(5|v)\b|gta online|los santos/.test(n) && !/gta 6/.test(n)) return "gta-5";
  if (/san andreas/.test(n) && !/foto|easter|referencia/.test(n)) return "gta-san-andreas";
  if (/\bgta ?(4|iv)\b/.test(n)) return "gta-4";
  if (/rdr|red dead/.test(n) && !/gta 6/.test(n)) return "outro";
  return "gta-6";
}

type Rule = { cluster: string; sub?: string; re: RegExp; url: string | null; priority: "alta" | "media" | "baixa"; app: "alto" | "medio" | "baixo" };
// A ordem importa: a primeira regra que casar define o cluster.
const RULES: Rule[] = [
  { cluster: "comercial-app", re: /\b(app|aplicativo|apk)\b|mapa interativo|interactive map|mapgenie|map genie/, url: "/app/", priority: "alta", app: "alto" },
  { cluster: "cheats-e-codigos", re: /codigo|cheat|manha|infinit|trapaca|glitch/, url: "/gta-6/dicas/", priority: "media", app: "baixo" },
  { cluster: "exploracao-e-segredos", sub: "misterios", re: /misterio|bigfoot|pe grande|skunk|ovni|ufo|alien|esfinge|fantasma|ritual|sata|demonio|monumento/, url: "/gta-6/easter-eggs/", priority: "alta", app: "alto" },
  { cluster: "exploracao-e-segredos", sub: "easter-eggs", re: /easter|dexter|referencia|\bcj\b|tommy|portal/, url: "/gta-6/easter-eggs/", priority: "alta", app: "medio" },
  { cluster: "exploracao-e-segredos", sub: "missoes-secretas", re: /miss(ao|oes) secret|secret mission|missoes? secundaria|side mission|estranhos|strangers|evento|encontro/, url: "/gta-6/missoes-secretas/", priority: "alta", app: "alto" },
  { cluster: "exploracao-e-segredos", sub: "lugares-secretos", re: /lugar|bunker|local secreto|secret location|naufragio|interior/, url: "/gta-6/lugares-secretos/", priority: "alta", app: "alto" },
  { cluster: "exploracao-e-segredos", sub: "segredos", re: /segredo|secret|escondid|hidden/, url: "/gta-6/segredos/", priority: "alta", app: "alto" },
  { cluster: "dinheiro-e-recompensas", re: /dinheiro|money|grana|tesouro|treasure|cofre|safe\b|cripto|cassino|rico|recompensa|reward/, url: "/gta-6/dinheiro/", priority: "alta", app: "alto" },
  { cluster: "veiculos", re: /carro|\bcars?\b|veiculo|vehicle|moto\b|motos|bugatti|garagem|garage|\bbike|helicoptero|aviao|barco|tanque|registrar/, url: "/gta-6/veiculos/", priority: "alta", app: "medio" },
  { cluster: "armas-e-itens", re: /\barmas?\b|weapon|municao|\bitens?\b|\bitems?\b|roupa|outfit|equipamento/, url: "/gta-6/armas-e-itens/", priority: "media", app: "medio" },
  { cluster: "colecionaveis-e-100", re: /colecionav|collectible|100 ?%|\b100\b.*(checklist|percent|por cento)|checklist|platina|trofe|trophy|conquista/, url: "/gta-6/segredos/", priority: "alta", app: "alto" },
  { cluster: "historia-e-missoes", re: /miss(ao|oes)|mission|capitulo|chapter|final\b|finais|ending|detonado|walkthrough|historia|story/, url: null, priority: "media", app: "medio" },
  { cluster: "mapa", re: /\bmapa\b|\bmap\b|localiza|location|regi(ao|oes)|leonida|vice city|keys|gellhorn/, url: "/gta-6/mapa/", priority: "media", app: "alto" },
  { cluster: "dicas-e-mecanicas", re: /^gta 6 como |\bcomo\b|how to|dica|\btips\b|salvar|trocar|guardar|vender|comprar|iniciante|beginner|guia|guide|por que|o que acontece/, url: "/gta-6/dicas/", priority: "alta", app: "medio" },
  { cluster: "personagens", re: /jason|lucia|ator|atriz|actor|troy baker|personagem|character/, url: null, priority: "baixa", app: "baixo" },
  { cluster: "produto-e-lancamento", re: /preco|price|pre ?venda|pre ?order|\bpc\b|xbox|ps5|ps4|playstation|lancamento|release|trailer|online|crossplay|fisic|edicao|edition|collector|metacritic|black friday|requisito|tamanho|\bgb\b|barato|reais|dolar|download|nota|review/, url: null, priority: "baixa", app: "baixo" },
];

export function classify(keyword: string) {
  const n = normKeyword(keyword);
  const game = detectGame(n);
  const rule = RULES.find((r) => r.re.test(n));
  const intent = /\b(app|aplicativo|comprar|preco|price|pre ?venda)\b/.test(n) ? "comercial"
    : /\b(ign|mapgenie|rockstar|reddit|youtube|wiki)\b/.test(n) ? "navegacional"
    : /\bonde\b|localiza|location|where/.test(n) ? "localizacao"
    : /\bcomo\b|how to|por que|why/.test(n) ? "como-fazer" : "informacional";
  const other = game !== "gta-6";
  return {
    keyword_norm: n, game,
    cluster: rule?.cluster ?? "nao-classificado", subcluster: rule?.sub ?? null,
    intent_primary: intent,
    planned_url: other ? null : rule?.url ?? null,
    priority: other ? "futura" : rule?.priority ?? "baixa",
    app_conversion_potential: other ? "baixo" : rule?.app ?? "baixo",
    commercial_potential: rule?.cluster === "comercial-app" ? "alto" : rule?.app === "alto" ? "medio" : "baixo",
  };
}
