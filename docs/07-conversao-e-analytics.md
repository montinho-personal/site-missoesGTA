# 07 · Estratégia comercial, CTAs e mensuração

## Princípio

O portal entrega a resposta inteira, de graça. O aplicativo vende **conveniência**: o que tem por perto, o que você já achou, o que falta. Nenhuma página esconde a resposta para empurrar a compra.

Caminho: busca (Google ou IA) → resposta resolvida → "tem mais disso por aqui" (relacionadas, região) → confiança (status, fontes) → CTA contextual → `/app/`.

## Estado atual da oferta

O aplicativo não tem dados fornecidos. A landing está em **modo "em preparação"**:

- CTA principal: lista de aviso por e-mail, com consentimento registrado.
- Seis funções listadas, todas com a etiqueta "Planejado". **Elas são hipóteses baseadas no briefing e precisam da sua confirmação** (`featuresConfirmed: false` em `src/lib/app-config.ts`).
- Preço, compatibilidade e reembolso aparecem como "a definir".
- A ilustração do celular leva o aviso "não é captura de tela".
- Sem contador, sem escassez, sem depoimento, sem nota.

Ao preencher `stage: "a_venda"`, `purchaseUrl` e `price`, a página troca os CTAs para compra, mostra o preço e passa a emitir o schema `SoftwareApplication`.

## CTAs contextuais (implementados, editáveis no painel)

| Onde | Chave | Chamada |
|---|---|---|
| Missões e encontros | `missoes` | "Tenha suas próximas descobertas organizadas enquanto joga." |
| Lugares secretos | `lugares` | "Transforme sua próxima sessão de jogo em uma verdadeira expedição." |
| Dinheiro | `dinheiro` | "Descubra outros esconderijos e recompensas sem precisar pesquisar um por um." |
| Veículos | `veiculos` | "Quer encontrar outras descobertas como esta?" |
| Colecionáveis | `colecionaveis` | "Acompanhe o que você já encontrou e o que ainda falta descobrir." |
| Mistérios | `misterios` | "Acompanhe os mistérios enquanto a comunidade investiga." |
| Dicas | `dicas` | "Você conhece GTA 6. Mas será que conhece tudo que ele esconde?" |
| Demais | `padrao` | "Menos tempo procurando. Mais tempo descobrindo." |

Posição: sempre **depois** da resposta e do bloco de credibilidade, nunca antes. Um CTA por página de conteúdo, mais o botão discreto no cabeçalho.

## Princípios de persuasão usados (e os recusados)

Usados: redução de esforço (comparativo "no improviso × com o aplicativo"), progresso e conclusão (checklist), autonomia (controle de spoiler), pertencimento (envio de descobertas com crédito), reciprocidade (valor antes do pedido).

Recusados: urgência falsa, prova social inventada, pré-seleção de consentimento, paywall da resposta.

## Mensuração

Ativação: `NEXT_PUBLIC_GTM_ID`. Sem ele, nada é carregado e o aviso de consentimento nem aparece. Com ele, o GTM só carrega **depois do aceite** (LGPD).

Eventos enviados ao `dataLayer` (`src/lib/analytics.ts`):

| Evento | Quando | Parâmetros |
|---|---|---|
| `search` / `search_no_results` | Busca interna (3+ letras) | `search_term`, `results` |
| `search_result_click` | Clique em resultado | `search_term`, `url` |
| `view_discovery` | Abertura de descoberta | `entry_id`, `category`, `status` |
| `filter_use` | Uso de filtro | `filter`, `value` |
| `cta_click` | Clique em CTA do app | `cta_key`, `placement`, `context` |
| `view_app_landing` | Visita a `/app/` | |
| `waitlist_signup` | Inscrição na lista | `source` |
| `begin_checkout` | Clique no botão de compra (quando existir) | `placement` |
| `share`, `favorite_add`, `favorite_remove` | Ações do jogador | `method`, `entry_id` |
| `spoiler_toggle`, `spoiler_reveal` | Uso do controle de spoiler | |
| `submission_sent` | Envio da comunidade | `kind` |

**A configurar por você no GTM/GA4** (não dá para fazer sem as contas): tags do GA4 para esses eventos, marcação de `waitlist_signup` e `purchase` como conversões, dimensões personalizadas (`cta_key`, `placement`, `category`), e o evento `purchase`, que precisa vir do checkout real. Também: verificar o domínio no Search Console e no Bing Webmaster Tools (as variáveis `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` já são lidas).

## Funil e leitura

1. Sessões orgânicas em descobertas → 2. `cta_click` → 3. `view_app_landing` → 4. `waitlist_signup` (hoje) ou `begin_checkout` → 5. `purchase`.

Relatórios que valem mais que pageview: conversão por categoria e por `cta_key`; páginas de entrada que mais geram clique no app; termos de `search_no_results` (pauta editorial); visitantes recorrentes; no painel, publicadas sem teste e sem revisor.

## Testes de CTA propostos

Só depois de haver tráfego suficiente; um teste por vez; métrica de guarda: rolagem até "Como sabemos" não pode cair.

1. Texto do CTA de dinheiro: "sem precisar pesquisar um por um" × "veja o que ainda falta buscar".
2. CTA depois das relacionadas × antes delas.
3. Landing: lista de aviso no topo × só no fim.

## Argumento do aplicativo dentro da ficha (26/11/2026)

A pedido do fundador, cada ficha de segredo traz, logo depois do passo a passo, um bloco "No aplicativo" com três argumentos montados com os dados da própria ficha (`src/components/AppPitch.tsx`):

1. **O pino no mapa**, dizendo a precisão real daquela ficha (exato, perto ou só a região).
2. **Os vídeos de quem já fez**, com a contagem real de vídeos da ficha, para assistir dentro do aplicativo.
3. **O que dá para fazer na mesma viagem:** os segredos a até 2 km, com nome, distância e link para as três mais próximas. A distância só é calculada entre pontos conhecidos (precisão exata ou perto). Quando o pino marca só a região, o bloco fala dos outros segredos da mesma região, sem inventar distância.

O bloco substitui o CTA genérico nas fichas (um CTA por página). Enquanto o aplicativo não for lançado, ele diz "em construção" e o botão leva à lista de aviso; com a venda ligada, o botão mostra o preço. Evento: `cta_click` com `cta_key = ficha_mapa`.
