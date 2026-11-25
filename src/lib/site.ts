// Fonte única de identidade do site. Domínio definido pelo fundador:
// missoessecretasgta.com.br. Nome exibido: Missões Secretas GTA.
export const DOMAIN = "missoessecretasgta.com.br";
const defaultUrl = process.env.NODE_ENV === "production" ? `https://${DOMAIN}` : "http://localhost:3000";

export const site = {
  name: "Missões Secretas GTA",
  wordmark: ["MISSÕES SECRETAS", "GTA"] as const,
  tagline: "A paixão de descobrir aquilo que o jogo não te conta.",
  description:
    "Portal independente de fãs sobre os segredos de GTA 6: missões secretas, lugares escondidos, easter eggs, mistérios e recompensas, com fontes e status de verificação em cada descoberta.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || defaultUrl).replace(/\/$/, ""),
  locale: "pt-BR",
  indexable: process.env.SITE_INDEXABLE === "true",
  contactEmail: null as string | null, // definir antes do lançamento
  independence:
    "Este é um portal independente, criado por fãs. Não é afiliado, patrocinado nem endossado pela Rockstar Games ou pela Take-Two Interactive. Grand Theft Auto e GTA são marcas de seus respectivos titulares, citadas aqui apenas para identificar o jogo sobre o qual escrevemos.",
};

export const abs = (path: string) => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;

// Navegação principal: poucos itens, rótulos de jogador.
export const mainNav = [
  { href: "/gta-6/segredos/", label: "Todos os segredos" },
  { href: "/gta-6/missoes-secretas/", label: "Missões secretas" },
  { href: "/gta-6/dinheiro/", label: "Dinheiro" },
  { href: "/gta-6/veiculos/", label: "Carros" },
  { href: "/gta-6/dicas/", label: "Dicas" },
  { href: "/radar/", label: "Radar" },
];
