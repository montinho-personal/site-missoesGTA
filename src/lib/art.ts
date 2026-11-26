// Ilustrações originais do projeto (geradas sob encomenda, personagens próprios).
// Nenhuma reproduz personagens, logotipos ou artes oficiais do jogo.
export const heroArt = { src: "/arte/hero.webp", width: 1920, height: 1072 };

/** Capa por categoria (slug). Categoria sem capa usa a arte vetorial padrão. */
export const categoryArt: Record<string, { src: string; position?: string }> = {
  "missoes-secretas": { src: "/arte/missoes-secretas.webp", position: "50% 40%" },
  dinheiro: { src: "/arte/dinheiro.webp", position: "50% 45%" },
  veiculos: { src: "/arte/veiculos.webp", position: "50% 55%" },
  dicas: { src: "/arte/dicas.webp", position: "50% 40%" },
  "easter-eggs": { src: "/arte/easter-eggs.webp", position: "55% 35%" },
  "armas-e-itens": { src: "/arte/armas-e-itens.webp", position: "50% 55%" },
  "lugares-secretos": { src: "/arte/lugares-secretos.webp", position: "50% 50%" },
};
