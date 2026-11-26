# 13 · Alinhamento entre o site e o aplicativo

Data: 26/11/2026. O aplicativo foi lido no repositório `APP-MISSOES-SECRETAS-GTA`, branch `claude/confident-rubin-g2e8kc`, commit `0363108`, **somente leitura**. Nada foi alterado lá.

## O que foi unificado (feito no site)

| Tema | Antes | Agora |
|---|---|---|
| Nome | Missões Secretas GTA | **Missões Secretas GTA 6**, igual ao do aplicativo |
| Fatos | 20 fichas escritas para o site | **As 125 fichas do aplicativo**, importadas por `npm run importar:app`. O site guarda mais 3 guias próprios (salvar, guardar carros, dinheiro no início) |
| Selos | 6 status próprios | **Os 4 do aplicativo** (Confirmado, Muito provável, Não verificado, Desmentido ou corrigido), com a mesma definição, mais "Testado por nós" acima |
| Precisão do local | Não existia | Ponto exato, Perto daqui ou Só a região, com o mesmo texto do aplicativo |
| Categorias | 9 | 6 do aplicativo + Dicas. Saíram "Mistérios" e "Colecionáveis" |
| Regiões | 6, da Wikipedia | As 10 do aplicativo |
| Códigos de cofre e porta | O site não publicava | Publica como o aplicativo, com o aviso de que o código vale o que vale o selo |
| Página `/app/` | "Em preparação", preço a definir | Diz o que é verdade: aplicativo web, instalável pelo navegador, em construção |

Correspondência de categorias: dinheiro → `/gta-6/dinheiro/`; arma → `/gta-6/armas-e-itens/`; veículo → `/gta-6/veiculos/`; bunker → `/gta-6/lugares-secretos/`; encontro → `/gta-6/missoes-secretas/`; easter egg → `/gta-6/easter-eggs/`.

Cada ficha do site guarda o `id` do aplicativo (campo `app_ref`) e usa esse mesmo `id` no endereço. Isso deixa pronto o link "abrir no aplicativo".

**Regra daqui para a frente:** fato se corrige no aplicativo e se importa de novo. O site não edita ficha importada.

## Nível de spoiler

O aplicativo guarda o capítulo de cada ficha. O site derivou o nível assim: capítulo 0 ou 1, sem spoiler; capítulos 2 e 3, ou ficha que rende cena de história, spoiler leve; capítulo 4 em diante, spoiler da história. É uma regra minha, a confirmar com a equipe do aplicativo.

## O que ainda diverge (não mexi, porque é do aplicativo ou é decisão do dono)

| Tema | Site | Aplicativo | Sugestão |
|---|---|---|---|
| Visual | Archivo + Inter, fundo #07060F | Big Shoulders + Barlow, fundo #150D2B | Tratar como dois produtos da mesma família: mesmo sol, mesmas cores de categoria. Levar as cores de categoria do aplicativo para o site numa próxima rodada |
| Voz | Sátira na moldura, com Nina e Brian | Sóbria | Adotar as duas camadas do doc 12 também no aplicativo: humor só em início, avisos e estados vazios; ficha seca |
| Personagens | Nina e Brian (originais) | A especificação desaconselhava personagens; a capa já usa personagens originais (D-018) | Usar os mesmos dois, com a mesma arte |
| Endereço | missoessecretasgta.com.br | missoes-secretas.vercel.app | Subdomínio `app.missoessecretasgta.com.br`, quando o aplicativo for divulgado |
| Venda | A página `/app/` não promete preço | Pergunta 9 (D-016) em aberto | Ver abaixo |
| Rota, coleções, regras de dinheiro, boatos | Não usados | Existem em `meta.json` | Viram páginas do site: "Rota sugerida", "Só no Capítulo 1", "Boatos que não se confirmaram" |
| Mapa | O site não tem | Mapa próprio, com coordenadas | O site guarda as coordenadas; o mapa fica como diferencial do aplicativo |

## A pergunta de venda (D-016 no aplicativo)

- **(a) Aplicativo inteiro pago:** só abre para quem comprou no site.
- **(b) Aplicativo aberto, com um extra pago:** as fichas ficam gratuitas, e paga-se por recursos a mais (por exemplo, progresso sincronizado em conta, rotas, avisos).
- **(c) Aplicativo gratuito:** o site só divulga e leva as pessoas até ele.

A equipe do aplicativo recomendou (b) ou (c), e eu também.

**Decisão do fundador, em 26/11/2026: opção (a), aplicativo inteiro pago, com a possibilidade de o dono liberar acesso de graça (cortesia).**

O que essa decisão implica:

- **Divisão de papéis:** o site é a porta aberta (fichas gratuitas, achadas pela busca); o aplicativo é o produto pago (mapa, progresso, rota, uso com o console ao lado). As "páginas públicas" previstas na especificação do aplicativo passam a ser papel do site.
- **Controle de acesso no aplicativo:** exige conta ou código de acesso, o que antecipa parte da Fase 7 (conta) do aplicativo.
- **Cortesia:** o dono precisa de uma tela para liberar acesso sem pagamento (por e-mail ou por código), com registro de quem recebeu e quando.
- **Venda:** preço, meio de pagamento, nota fiscal e reembolso (o Código de Defesa do Consumidor dá 7 dias de arrependimento em compra pela internet).
- **Risco de marca:** cobrar por um guia com o nome do jogo aumenta a chance de pedido de retirada. Vale a consulta jurídica antes de abrir a venda.

Ainda falta decidir: preço e modelo (pagamento único ou assinatura), meio de pagamento, e como a cortesia é concedida.

### O que fica aberto: decisão do fundador em 26/11/2026

**O site é completo e gratuito.** As 125 fichas ficam abertas no site, com passo a passo, local e códigos. O aplicativo pago vende a ferramenta: mapa, progresso, rota e uso com o console ao lado.

Consequências:

- A proposta registrada no aplicativo (D-020, item 1: ficha aberta só com o resumo, e passo a passo, mapa e códigos para quem comprou) **não vale para o site**. As páginas públicas achadas pela busca são as do site; o aplicativo não precisa ter páginas abertas próprias.
- O motivo para pagar precisa estar na ferramenta. A página `/app/` deve mostrar o mapa, o progresso e a rota funcionando assim que existirem.
- Os links "abrir no aplicativo" de cada ficha do site passam a ser o principal caminho de venda.

## Recado para a sessão que cuida do aplicativo

1. O site passou a consumir `conteudo/segredos.json` e `conteudo/meta.json` (regiões, fontes, coleção "comece", `jogo`). Mudança de formato nesses arquivos quebra a importação do site: avisar antes.
2. O `id` da ficha virou parte do endereço público do site (`/gta-6/<categoria>/<id>/`). A regra "nunca mude o id" agora protege também os links do site.
3. A categoria de uma ficha também está no endereço. Trocar `cat` muda a URL do site (ele cria o redirecionamento se a troca for feita pelo painel, mas não na importação).
4. Vale decidir juntos: a regra de spoiler por capítulo, a voz em duas camadas e o uso de Nina e Brian.
5. A venda e os códigos de acesso ficam no site. O contrato para o aplicativo validar um código está em `docs/14-venda-e-acessos.md` (um `POST` que responde sim ou não). O bloqueio de quem não comprou é do lado do aplicativo.
