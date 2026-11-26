# 01 · Diagnóstico, posicionamento e narrativa

Data: 25/11/2026. Tudo aqui parte do que foi verificado no ambiente e em pesquisa real; onde é hipótese, está escrito "hipótese".

## 1. Diagnóstico do ponto de partida

| Item | O que encontrei |
|---|---|
| Repositório | Vazio (só um README). Projeto novo, nada a preservar. |
| Aplicativo | **Nenhuma informação disponível.** Não há código, banco, API, capturas de tela, preço nem lista de funções. Nos projetos Supabase e Vercel da conta não existe nada relacionado a GTA. |
| Arquivos de pesquisa | Nenhum foi fornecido. A coleta inicial foi feita por mim (ver doc 05). |
| O jogo | GTA 6 **foi lançado em 19/11/2026** (PS5 e Xbox Series X\|S). Isso muda o projeto: já existe conteúdo real e a janela de maior demanda é agora. |
| SERPs em pt-BR | 19 de 20 consultas testadas mostram resumo de IA; vídeo e redes sociais ocupam cerca de 45% do top 10; o concorrente editorial mais presente é o GTABase. |

## 2. Posicionamento

**Para quem:** o jogador brasileiro adulto que cresceu com a série e quer explorar GTA 6 além da história, com o celular na mão enquanto joga.

**O que somos:** o portal que diz o que existe, onde fica, o que precisa e **o quanto aquilo já foi comprovado**.

**Por que somos diferentes** (cada item responde a uma lacuna observada na concorrência, doc 02):

1. **Selo de verificação por página.** Nenhum concorrente visitado informa versão testada e data de verificação por guia. Nós mostramos status, tipo de evidência, plataforma, versão e data.
2. **Divergências à mostra.** As fontes se contradizem (91 ou 93 missões; local do OVNI; código da instalação). Em vez de escolher uma versão, mostramos o conflito.
3. **Português nativo com nome original ao lado.** O topo das buscas é de sites traduzidos, e não há padrão de nomes em português. Títulos trazem o nome localizado e o original em inglês.
4. **Anti-spoiler de verdade.** Na web, o padrão é um aviso em texto. Aqui o conteúdo fica coberto até o jogador liberar, inclusive na busca e na imagem de compartilhamento.
5. **Resposta primeiro.** A resposta fica na primeira dobra, antes de qualquer contexto.

**O que não somos:** site de notícias, agregador de vazamentos, wiki exaustiva de marcadores. MapGenie, GTABase e apps já têm milhares de pins; competir em volume de marcadores seria perder.

## 3. Narrativa

**Essência:** a paixão de descobrir aquilo que o jogo não te conta.

**Texto-base (institucional):**
> Você lembra da primeira vez? De explorar o mapa sem saber o que ia encontrar. De ouvir um amigo jurar que existia um carro escondido, uma missão que ninguém tinha feito, um lugar que não estava em revista nenhuma. A gente cresceu, os gráficos mudaram, os mapas ficaram enormes. A vontade de descobrir o que existe além do óbvio continua a mesma. Este projeto é para quem não quer só terminar GTA 6. É para quem quer descobrir o que ele esconde.

**Variações por canal**

| Onde | Texto |
|---|---|
| Hero da home | "O GTA 6 esconde muito mais do que você imagina." |
| Página Sobre | "GTA nunca foi só um jogo para a gente. Foi tarde inteira no San Andreas, código anotado em folha de caderno…" (implementado em `/sobre/`) |
| Landing do app | "Não jogue GTA 6 deixando metade da aventura para trás." / "Menos tempo procurando. Mais tempo descobrindo." |
| CTA em missões | "Tenha suas próximas descobertas organizadas enquanto joga." |
| Redes sociais (curto) | "Metade do que te contaram sobre GTA 6 é boato. A gente separa qual metade." |
| Redes sociais (nostalgia) | "Em 2004 a gente anotava código em papel. Em 2026 o mapa é dez vezes maior. A curiosidade é a mesma." |
| Campanha de comunidade | "Achou algo que ninguém viu? Manda. A gente apura e dá o crédito." |
| E-mail de lançamento do app | "Você pediu para ser avisado. Chegou a hora de explorar com mapa na mão." |

**Regras de tom:** frases curtas, de jogador para jogador. Nostalgia aparece na home e no Sobre, e não nos guias. Nos guias, o tom é de quem responde rápido a um amigo. Nada de superlativo sem prova, nada de "o guia definitivo".

## 4. Como a "equipe" discordou (decisões e contrapontos)

| Tema | Tensão | Decisão |
|---|---|---|
| Publicar muito agora ou pouco e certo | SEO queria volume na janela pós-lançamento; o especialista em GTA e o editor de credibilidade lembraram o histórico de boatos da série | 20 fichas com fontes, nenhuma "Confirmado". O site inteiro fica `noindex` até revisão humana (variável `SITE_INDEXABLE`). |
| Mapa interativo | Produto e CRO queriam um mapa; arquitetura e editorial apontaram que não há coordenadas conferidas nem base cartográfica própria | Sem mapa por ora. Regiões como páginas, com ponto de referência textual. Mapa curado fica para o aplicativo e para o roteiro. |
| Estética neon | Direção de arte queria mais brilho; acessibilidade e performance pediram contenção | Neon só como luz de destaque. Uma ilustração vetorial no hero (3 KB), zero imagem raster, zero animação decorativa. |
| Landing do app | Copywriter queria prova social e preço; monetização e jurídico barraram: nada disso existe | Página em modo "em preparação", com lista de espera e etiqueta de estado em cada função. |
| Categoria "Eventos e encontros" | Separada, competiria com "Missões secretas" pela mesma intenção | Unificadas em "Missões secretas e encontros". |
| Nome da marca | SEO gosta de "GTA" no nome; propriedade intelectual alerta para o risco de usar marca de terceiro no nome e no domínio | Nome provisório, isolado em `src/lib/site.ts`. **Decisão do fundador** (seção 6). |
| CSP com nonce | Segurança preferia nonce; performance mostrou que nonce força renderização dinâmica | CSP sem nonce, com as demais diretivas restritas. Risco documentado (doc 09). |

## 5. Oportunidades que não estavam no briefing

1. **Página pública de divergências** ("O que as fontes dizem diferente sobre GTA 6"): formato inédito, altamente citável por IA.
2. **Guias "antes de avançar o capítulo"** (perdíveis): demanda real ("troféus perdíveis", "última missão do capítulo 1") e quase ausente em pt-BR.
3. **Glossário bilíngue** de missões, lugares e itens, alimentando a busca do site.
4. **Códigos e cheats**: 35 termos coletados. Vale um guia único, publicado só com teste direto, porque a lista circula com erros.
5. **Cluster "História e missões"** (42 termos: quantas missões, capítulos, finais): demanda alta, mas é spoiler puro. Só entra com o controle de spoiler já testado em produção.
6. **Vídeo curto**: YouTube e Shorts dominam as SERPs. Cada descoberta testada deveria gerar um clipe próprio de 20–40 s, que serve de evidência na página e de porta de entrada no YouTube.
7. **Perguntas de produto** (PC, online, preço): volume grande, fora do posicionamento. Resolvidas em FAQ no hub, sem virar editoria de notícias.

## 6. Decisões que dependem de você

| # | Decisão | Por que é sua | O que já está pronto |
|---|---|---|---|
| 1 | ~~Nome e domínio~~ **Decidido:** marca "Missões Secretas GTA", domínio `missoessecretasgta.com.br`. | O risco de usar "GTA" no nome e no domínio foi assumido pelo fundador. | Aplicado em `src/lib/site.ts`. |
| 2 | **Dados reais do aplicativo:** nome, plataformas, funções existentes, preço, link de compra, política de reembolso, capturas de tela. | Não invento nada sobre o produto. | `src/lib/app-config.ts` com todos os campos; a landing muda sozinha para modo de venda. |
| 3 | **Banco de dados de produção** (Supabase ou outro Postgres). | Tem custo mensal. | Migrações e seed testados em Postgres 16; basta `DATABASE_URL`. |
| 4 | **Hospedagem e deploy** (Vercel). | Custo e vínculo de conta. | Build de produção validado. |
| 5 | **Quem testa no jogo.** | Sem teste humano, nada vira "Confirmado". | Painel com campos de plataforma, versão e data. |
| 6 | **Responsável legal e canal de contato** para a política de privacidade (LGPD). | Identificação do controlador. | Textos-base em `/privacidade/` e `/termos/`, a revisar por advogado. |
| 7 | **Política de imagens** (capturas próprias do jogo). | Uso de material de terceiro. | Site funciona sem nenhuma imagem do jogo; campo de mídia com crédito e texto alternativo no painel. |
| 8 | **Modelo de preço do app.** Decidido em 26/11: aplicativo inteiro pago, com cortesia liberada pelo dono. Falta o valor e o meio de pagamento. | Comercial. | Insumo: nas lojas o padrão é grátis; preços visíveis de R$ 6,90 (pago único) a R$ 19,99–64,99 (compras internas). Hipótese: núcleo grátis + desbloqueio único abaixo de R$ 30. |
