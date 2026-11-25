# 04 · Identidade visual e design system "Arquivo Leonida"

Conceito: **noite tropical + dossiê de investigação.** O clima vem de Miami, art déco e neon; a organização vem de um arquivo de casos (número de arquivo, selo de status, ficha). Nada usa logotipo, tipografia ou arte da Rockstar.

Fonte da verdade: `src/app/globals.css` (tokens em `@theme`) e `src/components/`.

## Cores e função

Cada cor tem um papel. Usar fora do papel é erro.

| Token | Hex | Papel | Contraste medido |
|---|---|---|---|
| `ink-950` | #07060F | fundo da página | |
| `ink-800` | #131127 | cartões | |
| `ink-600 / 500` | #2A2650 / #3D3870 | bordas | |
| `fg` | #F5F3FF | texto principal | 18,4:1 sobre o fundo |
| `fg-muted` | #BDB8D9 | texto de apoio | 9,7:1 sobre cartão |
| `fg-subtle` | #9690B8 | metadados | 6,1:1 sobre cartão |
| `pink` | #FF4D9D | destaque, eyebrow, hover | 6,5:1 sobre o fundo |
| `pink-strong` | #D4166F | **fundo do botão primário** | texto branco 5,1:1 |
| `cyan` | #5CE1F2 | links, navegação, informação | 11,9:1 |
| `gold` | #FFCB66 | recompensa, favorito, status "Relato" | 12,3:1 |
| `violet` / `violet-strong` | #A98BFF / #6D43E0 | **tudo que é do aplicativo** | 6,9:1 / branco 5,9:1 |
| `ok`, `red`, `orange` | #62E2A8, #FF7B7B, #FF9257 | confirmado, desmentido/spoiler, mod/alerta | 11,4 / 7,4 / 8,4 |

Todos os pares usados passam de 4,5:1 (WCAG AA). O rosa claro nunca é fundo de texto branco: para isso existe o `pink-strong`.

Regras: rosa = ação editorial; roxo = aplicativo (o usuário aprende a reconhecer o que é comercial); gradiente só no hero e nas capas de categoria; brilho neon só em hover de botão.

## Tipografia

- **Archivo** (variável, 35 KB) em títulos, rótulos e botões. Peso 800–900 nos títulos.
- **Inter** (variável, 48 KB) no texto. Corpo de 17 px, entrelinha 1,65.
- Rótulo de arquivo (`.label`): caixa alta, 12 px, espaçamento 0,16 em. Usado em eyebrows e metadados.
- Fontes servidas do próprio domínio, com `font-display: swap`.

## Componentes

| Componente | Arquivo | Uso |
|---|---|---|
| Botões `.btn-primary / -app / -ghost / -sm` | globals.css | Altura mínima de 48 px (40 no pequeno) |
| `EntryCard` | ui.tsx | Card de descoberta: categoria, título, resposta, status, spoiler, região, favorito |
| `CategoryCard` | CategoryCard.tsx | Capa com luz própria por categoria e ícone grande |
| `StatusBadge`, `SpoilerBadge` | ui.tsx | Indicadores de verificação e spoiler |
| `Breadcrumbs` | ui.tsx | Trilha; no celular esconde o item atual |
| `SectionHead` + `.deco-rule` | ui.tsx | Título de seção com a régua art déco de três traços |
| `Explorer` | Explorer.tsx | Lista com filtros por tipo, região, recompensa, verificação, personagem e "só sem spoilers" |
| `SearchDialog` / `SearchPanel` | Search.tsx | Busca global (tecla `/`), sugestões, histórico opcional |
| `AppCta` | ui.tsx | CTA contextual, texto vindo do banco |
| `Callout`, `FaqList`, `EmptyState` | ui.tsx | Caixa de informação, perguntas, estado vazio honesto |
| `FavButton`, `ShareButton`, `SpoilerToggle`, `RevealButton` | client.tsx | Ações do jogador |
| Ficha da descoberta, "Como sabemos" | página de descoberta | Lista de definição com os fatos e o bloco de credibilidade |
| `HeroArt`, `Icon` | componentes | Ilustração e 28 ícones próprios em SVG |
| `.grid-paper` | globals.css | Grade de mapa de investigação, só em blocos de destaque |

## Movimento

Transições de 150 ms em cor e borda; uma translação de 4 px no ícone da capa. Com `prefers-reduced-motion`, tudo é desligado. Nenhuma animação em laço, nenhum parallax.

## O que evitar

Mais de uma cor de destaque por bloco; neon em texto corrido; cartões dentro de cartões; texto abaixo de 14 px; imagem do jogo sem crédito e texto alternativo; captura de tela falsa do aplicativo (a ilustração atual leva o aviso "não é captura de tela").
