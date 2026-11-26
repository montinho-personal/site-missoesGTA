# GTA 6: dúvidas mais frequentes e novidades da semana

Pesquisa de 26/11/2026, uma semana depois do lançamento (19/11/2026, PS5 e Xbox Series X|S). Público: jogadores brasileiros.

## Como esta pesquisa foi feita (leia antes de usar)

- **Ferramentas:** WebSearch (modo "extended") e SerpApi (busca Google com `hl=pt-br`, `gl=br` e leitura de página com `extract`).
- **Limites encontrados:**
  - A leitura direta de páginas pelo WebFetch está bloqueada pela rede desta sessão. Foram recusados fortune.com, pcguide.com, gamesradar.com, tecnoblog.net, ocapixaba.com.br e espacodopovo.com.br.
  - A SerpApi entrou em "Rate limit exceeded" depois de 6 chamadas bem-sucedidas: 3 buscas Google e 3 leituras de página. Houve ainda cerca de 25 tentativas recusadas pelo limite. Não sei se a SerpApi cobra as recusadas. Vale conferir o consumo na conta.
- **Nível de confiança de cada linha:**
  - **[L]** Li a página inteira: o comunicado da Take-Two, a matéria da Fortune, a do Hardware.com.br e as três páginas de resultado do Google Brasil.
  - **[B]** Li o trecho que a busca indexou e resumiu, sem abrir a página inteira. Trate como "provável, conferir antes de publicar".
  - **[R]** Relato de jogador (Reddit, X), sem confirmação oficial.
- **O que ficou de fora:** vazamentos, mods e "cópias de PC". Este último aparece só como alerta de segurança (seção 1.5).
- **Comparação com a coleta de 25/11:** os arquivos `data/keywords/banco-mestre.json` (587 termos) e `data/keywords/raw/serp-snapshots-2026-11-25.json` foram lidos antes. Os snapshots de 25/11 guardam os blocos que apareceram na página e os links orgânicos, mas não o texto das perguntas do "As pessoas também perguntam" (People Also Ask, PAA). As 60 perguntas desse bloco guardadas no banco eram, em boa parte, sobre GTA V ou de antes do lançamento ("quando lança", "vai ter PS4"). As perguntas novas estão na seção 1.6.

---

## 1. Dúvidas mais frequentes, por tema

### 1.1 Técnicas: desempenho, travamentos, tamanho, HDR

**Como as pessoas escrevem:** "gta 6 travando", "GTA VI TRAVANDO" (título de tópico no r/gtabrasil), "Qual a configuração recomendada para GTA 6?", "O que fazer quando o jogo fica travando?", "GTA 6 continua travando mesmo após a atualização", "Meu GTA está travando por causa da TV" [L, página de resultados do Google BR para "gta 6 travando"].

| Pergunta | Resposta curta | Fonte |
|---|---|---|
| Por que o GTA 6 trava ou fecha no PS5? | Desde 19/11 há relatos de fechamentos com o código **CE-108255-1**, inclusive no PS5 Pro e no Slim. A PlayStation descreve esse código como erro genérico do jogo ou app. Uma assistência técnica mostrou um PS5 com 100,9 °C na APU e 15 desligamentos por calor. Para ela, o CE-108255-1 só indica que o jogo travou, e o desligamento por calor é outra coisa. A causa geral não foi identificada. | [L] https://www.hardware.com.br/noticias/gta-6-ps5-travamentos-superaquecimento/ |
| O que o jogador tentou para resolver? | Reinstalar o jogo, limpar o cache, reconstruir o banco de dados e restaurar licenças (relatos no r/PS5HelpSupport). | [L] mesma matéria do Hardware.com.br |
| Saiu correção? | Sim. A atualização de 23/11 é a versão 01.002.002 no PS5 e 1.0.2.2 no Xbox. Corrige travamentos, salvamento automático, chamadas que não disparavam, nível de procurado que não baixava, clima que não mudava, entre outros. Rockstar não detalhou quais travamentos. Não prometeu ganho de desempenho. | [B] https://windowsreport.com/gta-6-post-launch-update-for-ps5-xbox-series-xs-fixes-crashes-autosaving-wanted-levels-weather-and-more/ ; [B] https://space4games.com/en/games-en/gta-6-patch-notes-updates/ |
| Depois do patch ainda trava? | Há relatos de que sim, no Xbox e no PS5. Um guia diz que o CE-108255-1 foi corrigido só em parte. | [R] https://www.reddit.com/r/XboxSupport/comments/1y3y3rh/gta_6_still_crashing_even_after_update_requested/ ; [B] https://howtovideogame.com/gta-6-crashing-fix/ |
| Perdi progresso. Por quê? | Matéria de 19/11 relata perda de horas de progresso por travamentos, mesmo com salvamento automático. O patch de 23/11 cita correção no salvamento automático. | [L, título e trecho no Google] https://www.notebookcheck.info/Travamentos-de-GTA-6-no-PS5-e-no-Xbox-fazem-jogadores-perderem-horas-de-progresso-apesar-do-sistema-de-salvamento-automatico.1454293.0.html |
| Precisa atualizar o PS5? | A PlayStation pediu a versão de sistema 26.07-14.23.00 antes de jogar (aviso de 18/11, segundo a busca). | [B] resumo da busca a partir de PC Guide e How To Video Game (pcguide.com bloqueado para leitura direta) |
| Quanto espaço ocupa? | A Rockstar fala em **até 212 GB** livres. No PS5, a pré-carga mostrava cerca de 209,75 GB de download. No Xbox, cerca de 209,9 GB na tela do console; a loja mostra cerca de 225 GB porque mede em outra unidade. | [B] https://timesaver.gg/blog/gta-6-file-size-storage-ps5-xbox ; [B] https://www.vice.com/en/article/gta-6-download-size-ps5/ |
| Tem 60 fps? | Não. Pela análise da Digital Foundry de 18/11, os quatro consoles miram **30 fps**, sem modo de 40 ou 60. **PS5 Pro:** renderiza em 1440p com PSSR, tem sombras com ray tracing e segurou 30 fps quase sempre (mínimo de 24). **PS5 base:** cai a 23 fps em explosões pesadas. **Series S:** renderiza em cerca de 720p, sai em cerca de 1080p e fica na casa dos 20 e poucos fps. As fontes secundárias divergem em detalhes (tipo de reconstrução de imagem no PS5 base). | [B] https://www.altchar.com/game-news/gta-vi-dips-as-low-as-23fps-on-base-ps5-in-heavy-action-digital-foundry-finds-aJybE7x7IsZa ; [B] https://www.tomsguide.com/gaming/whats-the-point-in-ps5-pro-if-i-cant-play-gta-6-in-60-fps-on-it ; [B] https://www.techpowerup.com/355004/gta-6-reportedly-plays-best-on-ps5-pro-xbox-series-s-struggles |
| Vale a pena no Series S? | O TechTudo jogou no Series S e aprovou desempenho e gráfico. Aponta 1080p e o peso de mais de 210 GB no SSD pequeno. **Divergência:** a Digital Foundry fala em cerca de 720p interno, reconstruído para cerca de 1080p. | [B] https://www.techtudo.com.br/guia/2026/11/gta-6-roda-bem-xbox-series-s-edjogos.ghtml |
| Melhor ajuste de HDR? | Vincent Teoh (HDTVTest) diz que o jogo ignora a calibração de HDR do PS5. Para TVs de 1.000 nits ou mais, ele sugere começar com **Brilho máximo 2.000, Níveis de preto 20 e Branco de papel 35**. Os guias divergem nos números. Consenso: modo Jogo na TV, HGiG ligado e mapeamento dinâmico de tons desligado. | [B] https://www.techtimes.com/articles/331195/20261120/gta-6-hdr-settings-game-ignores-ps5-setup-vincent-teoh-urges-2000-max-brightness-1000-nit-tvs.htm ; [B] https://www.purexbox.com/news/2026/11/hdr-expert-shares-their-three-recommended-display-settings-for-gta-6 |

### 1.2 Jogabilidade

**Como as pessoas escrevem:** "como salvar no gta 6", "tem códigos no gta 6?", "o gta 6 terá códigos?", "como trocar de personagem", "como platinar gta 6?" (banco de 25/11) [B e L].

| Pergunta | Resposta curta | Fonte |
|---|---|---|
| Como salvo o jogo? | Menu de pausa, aba Jogo, Salvar. São **15 espaços manuais e 1 automático**. O salvamento automático é pouco confiável, segundo o TechTudo. O salvamento manual não funciona durante missões nem com trapaça ativa. | [B] https://www.techtudo.com.br/dicas-e-tutoriais/2026/11/como-salvar-gta-6-edjogos.ghtml ; [B] https://criticalhits.com.br/dicas/gta-6-como-salvar-o-jogo-manualmente-e-usar-o-salvamento-automatico/ |
| Tem códigos (cheats)? | Sim. Entram pelo celular do jogo, segurando L1+R1 (ou LB+RB) e apertando o direcional. **Números de telefone do GTA V não funcionam.** Os sites divergem na contagem: fala-se em 61 códigos, com 19 a 21 confirmados até agora. Há listas falsas que reciclam códigos do GTA V (PAINKILLER, TURTLE). | [B] https://www.redbull.com/us-en/gta-6-cheat-codes ; [B] https://www.gamespot.com/articles/all-gta-6-cheats-and-how-to-unlock-them/ ; [B] https://thedroidguy.com/gta-6-cheat-codes-confirmed-or-fake-1293209 |
| Cheat desliga troféu? | Um guia diz que sim (e que bloqueia o salvamento na sessão). Outro diz que a Rockstar não confirmou a parte dos troféus. **Divergência.** | [B] mesmas fontes acima |
| Como troco entre Jason e Lucia? | Pelo menu de parceiro (direcional para a direita, depois R1/RB), só depois que a troca livre é liberada no Capítulo 2. **Divergência** sobre a missão exata que libera. Missões marcadas com "J" ou "L" exigem um personagem específico. Rob Nelson (Rockstar North) disse que a troca é limitada pela história. | [B] https://www.keengamer.com/articles/guides/how-to-switch-between-jason-and-lucia-in-gta-6/ ; [B] https://www.pcgamer.com/games/grand-theft-auto/gta-6s-story-is-too-important-for-rockstar-to-let-you-swap-between-lucia-and-jason-whenever-you-want/ |
| Dá para perder coisas para sempre? | Sim, segundo os guias. Não há repetição de missão. Missões opcionais com ícone de ampulheta expiram. Antes do principal ponto sem volta (no Capítulo 1), os guias recomendam guardar um save manual separado. | [B] https://game8.co/games/GTA-6/archives/638531 ; [B] https://vicedex.app/gta-6-missables/ |
| Tem modo foto? | Segundo as análises de 18/11, sim: o "Photo Studio", no menu de pausa, com luzes e controle de abertura e profundidade. Não muda pose nem expressão. Não achei post oficial da Rockstar. | [B] https://www.newsbytesapp.com/news/science/gta-vi-introduces-pause-menu-photo-studio-for-vice-city-photos/tldr |

### 1.3 História, sem spoiler

**Como as pessoas escrevem:** "quantas missões tem o gta 6?", "quantos capítulos tem no gta 6?", "is gta 6 going to have multiple endings?" (banco de 25/11).

| Pergunta | Resposta curta | Fonte |
|---|---|---|
| Quantos capítulos e missões? | Os guias falam em prólogo + **5 capítulos** e cerca de **91 missões de história**. A Rockstar não publicou um número oficial. | [B] https://www.redbull.com/int-en/gta-6-complete-mission-list ; [B] https://game8.co/games/GTA-6/archives/639925 |
| Quanto tempo dura? | Estimativas de guias: de 50 a 70 horas só na história, cerca de 80 horas com atividades paralelas. A Rockstar não publicou duração oficial. | [B] https://hablamosdegamers.com/en/gta6/gta-6-missions-how-long-to-beat/ ; [B] https://www.gta6hype.com/blog/gta6-story-length-speculation/ |
| Tem mais de um final? | Os guias de "missables" dizem que sim e que os finais não podem ser repetidos. Detalhes ficam de fora aqui por serem spoiler. | [B] https://game8.co/games/GTA-6/archives/638531 |
| O romance de Jason e Lucia é obrigatório? | Rob Nelson disse que o romance é opcional, mas que cuidar ou não da relação muda como a história do casal se desenrola. | [L] https://fortune.com/2026/11/25/gta6-gtavi-video-games-take-two-interactive-investors-mark-zuckerberg-elon-musk-meta-priscilla-chan/ |

### 1.4 Compra: edições, preço, mídia física, PC, online, crossplay

**Como as pessoas escrevem:** "gta 6 preço", "gta 6 preço midia fisica", "gta 6 se vende fisico", "gta 6 vai ficar mais barato na black friday", "gta 6 pc", "gta 6 online vai ser pago", "gta 6 online terá crossplay", "gta 6 tem dublagem em português" (banco de 25/11 e Google BR de 26/11).

| Pergunta | Resposta curta | Fonte |
|---|---|---|
| Quanto custa no Brasil? | Preço de tabela: **R$ 449,90** (Standard) e **R$ 549,90** (Ultimate), na PlayStation Store e na Xbox Store. A Melhoria Ultimate sai por **R$ 100**. | [B] https://tecnoblog.net/noticias/preco-de-gta-6-no-brasil-e-revelado-r-449/ ; [B] https://www.cnnbrasil.com.br/economia/money/tecnologia/gta-6-pre-venda-tem-inicio-no-brasil-veja-valores/ ; [B] https://atlasgta6.com/pt-BR/price |
| E mais barato? | Em lojas, a caixa Standard apareceu abaixo da tabela. Valores citados: R$ 418,40 à vista na Amazon, R$ 404,91 no Mercado Livre e R$ 373 com cupom Prime. **Preço de loja muda todo dia: não publicar sem data.** | [B] https://www.adrenaline.com.br/games/playstation/onde-comprar-gta-6-mais-barato-em-edicao-fisica-para-ps5/ ; [B] https://bpmoney.com.br/inovacao/tecnologia/gta-6-preco-onde-comprar-mais-barato-como-parcelar/ |
| A mídia física tem disco? | **Não.** A caixa traz um código de download, segundo o suporte da Rockstar citado pela VGC. Não existe Ultimate física. Quem compra a caixa não recebe o mês de GTA+ (vale só para o digital). | [B] https://www.videogameschronicle.com/news/rockstar-confirms-there-will-be-no-disc-version-of-gta6-at-launch/ ; [B] https://www.gtaboom.com/the-gta-6-physical-copy-controversy-explained-3866 |
| Comprei a caixa e veio sem código. E agora? | Há relatos nos EUA de caixas sem código ou com código já usado. Até a publicação das matérias, a Rockstar não tinha comentado. Conselho da imprensa: abrir na hora, de preferência na loja. Não achei relato do Brasil. | [B] https://kotaku.com/some-gta-6-box-copies-reported-to-have-download-code-issues-2000756883 ; [B] https://cybernews.com/news/gta6-box-no-code/ |
| Qual a diferença da Ultimate? | É o mesmo jogo, mapa e história. A Ultimate soma veículos, armas, roupas, uma garagem, destinos e atividades extras. Os guias divergem na lista e na duração do conteúdo extra. O pacote de pré-venda (Vintage Vice City Pack) vale para as duas edições compradas até 20/11. | [B] https://esports.gg/guides/grand-theft-auto-6/gta-6-ultimate-edition-versus-standard-edition-whats-the-difference/ ; [B] https://www.dlcompare.com/gaming-news/gta-6-editions-compared-standard-vs-ultimate-85365 |
| O que é o GTA+ no GTA 6? | Assinatura que dá carro, garagem e descontos. Gerou reclamação de "paywall" num jogo para um jogador. O preço varia por fonte (US$ 7,99 ou US$ 8 por mês). Pré-venda digital ganha 1 mês. Um guia diz que os itens resgatados ficam com o jogador depois de cancelar. | [B] https://www.gamespot.com/articles/gta-6-gta-subscription-includes-a-free-supercar-discounts-and-more/ ; [B] https://www.ladbible.com/entertainment/gaming/gta-6-in-game-paywall-032970-20261119 ; [B] https://outputlag.com/guides/gta-6-gta-plus/ |
| Tem para PC? | **Não há versão para PC anunciada.** Strauss Zelnick (Take-Two) disse em 09/11 que o jogo sai "inicialmente" em dois consoles e não quis falar de PC. A data de "início de 2027" vem de fontes anônimas da GamesBeat: **rumor**. Um post da GameGPU fala em março de 2027, sem confirmação. | [B] https://www.videogameschronicle.com/guide/gta-6-pc-version/ ; [B] https://shattered.io/gta-6-pc-march-2027-gamegpu-leak-zero-rockstar-confirmations-nov-25 |
| Roda no PS4 ou no Xbox One? | Não há versão nativa. **No Xbox One dá para jogar pela nuvem** (Xbox Cloud Gaming), com o jogo comprado e tempo de nuvem (Game Pass ou compra avulsa). A transmissão usa os ajustes do Series S e fica restrita a consoles Xbox. Não achei opção de nuvem no PS4. | [B] https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/ ; [B] https://www.windowscentral.com/gaming/xbox/grand-theft-auto-6-will-be-playable-on-xbox-cloud-gaming-but-there-are-a-few-catches |
| Tem online? Quando sai o GTA 6 Online? | O jogo saiu **só com o modo história**. A Rockstar **não anunciou data** do online. Analistas e Jason Schreier (Bloomberg) apontam 2027. Um "comunicado" que circula com data de março de 2027 é **falso**. Um jornal paquistanês fala em "aceleração" do online; não achei confirmação disso. | [L] SERP Google BR "gta 6 online quando lança" (resumo de IA com fontes IGN Brasil, TechTudo e Omelete) ; [B] https://www.omelete.com.br/gta-6/gta-6-modo-online-deve-chegar-em-2027-diz-banco-americano ; [B] https://www.talkesport.com/gta-6/gta-6-online-march-2027-press-release-fake/ ; [B] https://tribune.com.pk/story/2641881/rockstar-reportedly-fast-tracking-gta-online-for-gta-6-amid-player-backlash |
| Tem crossplay? | Ninguém sabe ainda: o online nem foi anunciado. O GTA Online do GTA V nunca teve crossplay. | [B] https://www.dlcompare.com/gaming-news/is-gta-6-cross-platform-crossplay-and-cross-progression-explained |
| Tem dublagem em português? | **Não.** O jogo tem legendas, menus e interface em português do Brasil. As vozes ficam em inglês. | [L] SERP Google BR "gta 6 tem dublagem em português" ; [B] https://www.estadao.com.br/tecmundo/voxel/504716-rockstar-confirma-que-gta-6-sera-localizado-em-portugues-brasileiro/ |
| Que horas liberou no Brasil? | 0h de 19/11 (Brasília). Pela nuvem do Xbox, 3h. A PSN teve instabilidade em 18/11, e a Sony confirmou o problema. | [B] https://criticalhits.com.br/games/gta-6-tera-desbloqueio-a-meia-noite-no-brasil-e-horarios-diversos-ao-redor-do-globo/ ; [B] https://www.levelup.com/en/news/playstation-network-goes-down-just-hours-before-gta-6-launch-leaving-players-unable-to-sign-in-or-download-rockstars-game/ |

### 1.5 Segurança (dúvida real e risco para o leitor)

As buscas "gta 6 pc", "port gta 6" e "portwatch gta 6 pc" estão entre as relacionadas do Google BR [L]. Em 25/11 o autocomplete já trazia "gta 6 pc port progress", "pc github" e "pc port cyberleek". Há posts no r/gamesEcultura e no r/jogatina sobre o jogo "rodando no PC" [L, vídeos na SERP]. **Não há versão oficial para PC.** A imprensa de segurança registra golpes com "GTA 6 para PC", torrents e "acesso antecipado" que instalam vírus ou cobram em criptomoeda [B]:

- https://canaltech.com.br/games/cuidado-falso-gta-6-para-pc-espalha-virus-e-pode-roubar-seu-dinheiro/
- https://www.welivesecurity.com/pt/golpes-fraudes/gta-6-golpes-com-downloads-falsos-e-malware-aumentam-antes-do-lancamento/
- https://www.tecmundo.com.br/voxel/505185-suposta-copia-vazada-de-gta-6-circula-em-sites-piratas-e-torrents-em-forma-de-virus-entenda.htm

O site deve tratar isso só como alerta, sem link para nada do gênero.

### 1.6 O que mudou nas perguntas de 25/11 para 26/11

| Em 25/11 (banco-mestre) | Novo em 26/11 (Google BR) [L] |
|---|---|
| Muitas perguntas do bloco PAA sobre GTA V e de antes do lançamento ("quando lança", "vai ter PS4", "quanto custou") | "Por que meu GTA Online está travando tanto?", "Qual a configuração recomendada para GTA 6?", "O que fazer quando o jogo fica travando?" |
| "gta 6 online vai lançar quando", "gta 6 online vai ser pago" (autocomplete) | No bloco PAA: "Quanto vai custar o GTA 6 online?", "O que vai acontecer com o GTA 5 online depois do GTA 6?", "Vai lançar GTA 7?" |
| — | "Porque GTA não é dublado?", "Vai ter Brasil no GTA 6?" |
| Buscas relacionadas de compra | Relacionadas novas: "Portwatch gta 6 pc", "Port gta 6", "Gta 6 vai ter multiplayer local", "Pq gta 6 não vai ser dublado", "Gta 6 dubladores" |

Leitura: a curiosidade de antes do lançamento ("quando, quanto") deu lugar a **problema técnico**, **online** e **PC**.

---

## 2. Novidades da última semana (19 a 26/11)

### 2.1 Números oficiais

| Fato | Fonte |
|---|---|
| **US$ 3,79 bilhões** em vendas no varejo no 1º dia (estimativa da empresa até o fim de 19/11, mundial). É o maior lançamento de entretenimento da história, segundo a Take-Two. | [L] https://www.take2games.com/ir/news/grand-theft-auto-vi-shatters-entertainment-box-office-records |
| **32,5 milhões de unidades** vendidas antes do lançamento (recorde, segundo a Take-Two). | [L] mesmo comunicado (20/11/2026) |
| **Nota 99 no Metacritic.** Segundo a imprensa, empata com Ocarina of Time. A contagem de análises varia. No OpenCritic aparece 98 ou 99. | [L] comunicado ; [B] https://www.ggrecon.com/articles/gta-6-reviews-metacritic-99/ |
| A série GTA soma quase 480 milhões de unidades; o GTA V, quase 235 milhões. | [L] comunicado da Take-Two |
| O valor é de varejo (o que o consumidor gastou), não a receita da Take-Two. O 1º dia do GTA V (2013) foi de cerca de US$ 800 milhões. | [L] https://fortune.com/2026/11/25/gta6-gtavi-video-games-take-two-interactive-investors-mark-zuckerberg-elon-musk-meta-priscilla-chan/ |
| Estimativa de terceiros: a Alinea Analytics calcula **44,9 milhões** de cópias até o fim do 1º fim de semana, acima de US$ 4 bilhões. **A Take-Two não confirmou.** | [L] Fortune |
| As ações da Take-Two caíram quase 4% no dia do lançamento. A empresa manteve a previsão de US$ 8 bi a 8,2 bi de reservas líquidas no ano fiscal de 2027. | [L] Fortune |
| Divergência: um site (BigGo) cita US$ 1,65 bi no 1º dia. O número oficial é o de US$ 3,79 bi. | [B] https://finance.biggo.com/news/27aca2cb9e7c40f8 |

### 2.2 Recordes de audiência (lives), com destaque para o Brasil

| Fato | Fonte |
|---|---|
| Pico de cerca de 7,9 milhões de espectadores simultâneos nas plataformas de live (dados preliminares do Streams Charts). As fontes divergem na divisão entre Twitch, YouTube e Kick. | [B] https://www.adrenaline.com.br/games/gta-6-bate-recorde-historico-de-streaming-com-quase-8-milhoes-de-usuarios-simultaneos/ ; [B] https://antihype.com.br/c/games/gta-6-recorde-audiencia-lives-twitch-youtube-kick/ |
| Brasileiros entre as maiores lives do mundo: **alanzoka** (Twitch), **Paulinho o Loko** e **LOUD Coringa** (YouTube), **Gameplayrj** (YouTube). Os números variam conforme a fonte e a métrica. Segundo o Omelete, os primeiros jogaram com contas de outros países. | [B] https://omelete.com.br/games/gta-6-brasileiros-tem-duas-das-tres-maiores-lives-do-mundo ; [B] https://exame.com/pop/gta-6-vira-fenomeno-de-audiencia-e-soma-mais-de-200-milhoes-de-horas-em-lives/ ; [B] https://viciados.net/gta-6-recorde-twitch-4-brasileiros-picos-lancamento/ |
| Primeira "speedrun": o streamer BrycexD diz ter terminado a história em 39h38min, sem pausa. Não há verificação nem tabela oficial no speedrun.com. A alegação de cerca de 7 horas do N3on é contestada. | [B] https://www.gamesradar.com/games/grand-theft-auto/the-first-gta-6-speedrun-is-less-than-40-hours-with-no-breaks-from-a-streamer-who-stayed-up-for-50-plus-hours/ |

### 2.3 Polêmicas

| Tema | Resumo | Fonte |
|---|---|---|
| Ataque de notas negativas no Metacritic | Nota 99 da crítica contra cerca de 5,6 do público (PS5, de 21 a 23/11). Muitas notas zero de contas novas e de quem não jogou. Na PS Store, onde só comprador avalia, a nota foi de cerca de 4,84 de 5. Fãs revidaram com notas negativas para Ocarina of Time. | [B] https://www.videogameschronicle.com/news/as-gta-6-gets-review-bombed-on-metacritic-gta-fans-have-started-review-bombing-ocarina-of-time-in-response/ ; [B] https://www.gtabase.com/gta-6/articles/gta-6-review-bombed-on-metacritic |
| Reclamações de jogadores | 30 fps, falhas, ritmo lento e missões "de tarefa doméstica" ligadas ao romance. | [B] https://www.technobezz.com/news/gta-6-review-bombing-user-score ; [B] https://www.ibtimes.co.uk/gta-6-early-review-backlash-fans-1833257 |
| GTA+ e "paywall" | Itens no modo história atrás da assinatura. | [B] https://www.ladbible.com/entertainment/gaming/gta-6-in-game-paywall-032970-20261119 |
| Caixa sem disco e caixa sem código | Ver seção 1.4. | [B] https://kotaku.com/some-gta-6-box-copies-reported-to-have-download-code-issues-2000756883 |
| Travamentos e calor no PS5 | Ver seção 1.1. | [L] https://www.hardware.com.br/noticias/gta-6-ps5-travamentos-superaquecimento/ |
| Viral de Zuckerberg | Em 20/11, Mark Zuckerberg postou uma missão editada de "comprar mantimentos" para Priscilla. Elon Musk respondeu com risada. | [L] Fortune |

### 2.4 Descobertas e mistérios em alta (relatos da comunidade)

| Achado | Status | Fonte |
|---|---|---|
| NPCs num bar conversam sobre o mistério do Monte Chiliad (GTA V), com bunker, jetpack e ovos. | [R] relato no Reddit, noticiado | [B] https://www.gamingbible.com/news/gta-6-gta-5-mount-chiliad-mystery-easter-egg-802897-20261120 |
| Bar "Skeeter's", no sul de Hamlet, seria homenagem a South Park. | [R] teoria de jogador | [B] https://gamerant.com/gta-6-south-park-easter-egg/ |
| "Monumento" de quatro cavalos com símbolos em Manifest Canyon, com vibração e bipes como possíveis pistas. Aparece como mistério não resolvido. | [R] | [B] https://www.gamingbible.com/news/gta-6-easter-eggs-778903-20261120 ; [B] https://gtaculture.com/guides/gta-6-secrets-and-mysteries |
| Skunk Ape (o "pé-grande" de Leonida), com missão de Kirk a partir de um panfleto no Skeeter's. Dado como "resolvido" por guias. | [B] guias, não oficial | [B] https://gtaculture.com/guides/gta-6-secrets-and-mysteries |
| OVNI, fantasmas de estrada e farol "assombrado". Bunker em Grassrivers "confirmado, mas lacrado". Torre de vigia e enigma de QR code em aberto. | [R] e [B]. Os guias divergem sobre o que está confirmado. | [B] https://gta6map.city/secrets/mysteries/ ; [B] https://www.middleeastgamer.com/gta-6-mysteries-found-so-far/ |
| "Easter egg que é um ovo": jogá-lo de uma torre libera uma cena. | [B] matéria isolada, conferir | [B] https://www.ibtimes.co.uk/gta-6-player-discovers-literal-easter-egg-leonida-1833342 |
| Lista em português com 10 easter eggs. | [B] | [B] https://www.correiobraziliense.com.br/diversao-e-arte/2026/11/7542721-gta-6-esconde-surpresas-inusitadas-veja-10-easter-eggs-encontrados-ate-agora.html |

> Regra do app (Prompt Mestre §11, regra 1): nada desta tabela vira ficha sem fonte própria e conferência. Vários "status" vêm de sites de SEO, que se contradizem.

---

## 3. Onde a comunidade se reúne

### 3.1 Comunidades

| Onde | O que tem | Fonte do dado |
|---|---|---|
| r/GTA6 — https://www.reddit.com/r/GTA6/ | Maior subreddit do jogo. Cerca de 1,5 a 1,8 milhão de membros, segundo terceiros. Publica FAQ semanal, descobertas e relatos de falhas. | [B] https://thehiveindex.com/communities/r-gta6/ |
| r/gtabrasil — https://www.reddit.com/r/gtabrasil/ | Comunidade brasileira: dúvidas de travamento e de compra. | [L] SERP "gta 6 travando" |
| r/jogatina e r/gamesEcultura | Discussões gerais em português; trataram de "GTA no PC" e de dublagem. | [L] SERPs de 26/11 |
| r/PS5HelpSupport, r/XboxSupport, r/XboxSeriesS | Suporte técnico com relatos de travamento. | [L] SERP ; [L] Hardware.com.br |
| Discord oficial da Rockstar | O link sai do comunicado da Take-Two. Há também servidores de fãs ligados ao r/GTA6, com contagens variáveis. | [L] comunicado ; [B] https://discord.com/invite/gta6hub |

### 3.2 Criadores e perfis mais citados

**No Brasil (citados pela audiência de lançamento):**

- **alanzoka:** Twitch
- **Paulinho o Loko:** YouTube
- **LOUD Coringa:** YouTube
- **Gameplayrj (Davy Jones):** YouTube
- **Adams Kong:** YouTube, vídeo sobre a 1ª atualização
- **Saimon Oliveira:** YouTube, vídeo sobre travamentos e FPS

Fontes: [B] Omelete, Exame e Viciados (links na seção 2.2) e [L] vídeos na SERP de "gta 6 travando".

**Fora do Brasil:**

- **Digital Foundry:** técnica
- **Vincent Teoh (HDTVTest):** HDR
- **Jason Schreier (Bloomberg):** bastidores
- **Tom Henderson (Insider Gaming):** bastidores

Fonte: [B] links das seções 1.1 e 1.4, mais https://www.tweaktown.com/news/80378/trusted-games-reporter-comments-on-gta-6s-2025-rumors/index.html

**Cuidado:** um diretório alerta que todo perfil "Cyberleek" no X seria impostor. Não verifiquei essa afirmação, mas fica o sinal para não usar perfis "🚨 BREAKING" como fonte ([B] https://34-118-28-63.sslip.io/sources).

### 3.3 Fontes para um agente diário monitorar

| URL | O que costuma publicar | Prioridade |
|---|---|---|
| https://www.rockstargames.com/br/newswire | Anúncios oficiais em PT-BR: atualizações, GTA+, online. | Alta |
| https://support.rockstargames.com (artigo "Grand Theft Auto VI Launch Updates (PS5 / XBOX Series X\|S)") | Notas de atualização oficiais. Em 25/11, a nota mais recente era a de 23/11. | Alta |
| https://www.take2games.com/ir/news | Números oficiais de vendas e resultados. | Alta (nos dias de resultado) |
| https://news.xbox.com/en-us/ e https://blog.playstation.com/ | Nuvem, sistema e promoções. | Média |
| https://www.playstation.com/pt-br/support/error-codes/ps5/ce-108255-1/ | Código de erro mais citado. | Média |
| https://www.reddit.com/r/GTA6/new/ | Descobertas e mistérios antes da imprensa. | Alta (sempre [R]) |
| https://www.reddit.com/r/gtabrasil/new/ | Dúvidas reais em português. | Alta |
| https://www.techtudo.com.br/ (busca "gta 6") | Guias práticos em PT-BR (salvar, Series S, online). | Alta |
| https://br.ign.com/grand-theft-auto-vi/ | Notícias e guias em PT-BR. | Alta |
| https://www.tecmundo.com.br/voxel | Notícias e alertas de golpe. | Média |
| https://www.omelete.com.br/gta-6 | Notícias, audiência e online. | Média |
| https://www.adrenaline.com.br/ | Preço e onde comprar, desempenho. | Média |
| https://criticalhits.com.br/ | Notícias e dicas rápidas. | Média |
| https://canaltech.com.br/games/ | Golpes, horários e preços. | Média |
| https://www.hardware.com.br/noticias/ | Hardware, travamentos e calor. | Média |
| https://www.videogameschronicle.com/ | Confirmações oficiais (mídia física, PC). | Alta |
| https://www.eurogamer.net/digitalfoundry | Análises técnicas e mudanças de desempenho após patches. | Média |
| https://www.gamesradar.com/games/grand-theft-auto/ | Recordes, guias e notícias. | Média |
| https://kotaku.com/ | Polêmicas e problemas de consumo. | Média |
| https://streamscharts.com/ | Audiência de lives (útil para os "recordes"). | Baixa |
| https://www.metacritic.com/game/grand-theft-auto-vi/ | Nota da crítica e do público. | Baixa |

---

## 4. Oportunidades de conteúdo para o site

Ideias de pauta tiradas das dúvidas acima. Todas seguem as regras do projeto: sem inventar conteúdo de jogo, com fonte e data, e sem imagem da Rockstar.

1. **"GTA 6 travando no PS5 ou Xbox: o que fazer"**, em PT-BR. É a dúvida técnica nº 1 desta semana. Explicar o CE-108255-1 com a página oficial da PlayStation, os passos que a comunidade usa, o patch de 23/11 e o alerta de calor. Atualizar a cada patch, com a data.
2. **"Notas de atualização do GTA 6 em português".** Página viva que traduz e resume as notas oficiais do suporte da Rockstar. Ninguém em PT-BR parece manter isso como rastreador (impressão, não medida).
3. **"Quanto espaço o GTA 6 ocupa e cabe no Series S?"** Números da Rockstar e do console, explicando a diferença entre 209,9 GB e 225 GB.
4. **"GTA 6 tem 60 fps? Desempenho em cada console"**, resumindo a Digital Foundry com crédito e sem copiar.
5. **"HDR no GTA 6: ponto de partida"**, deixando claro que os números são de um especialista e que a TV de cada um muda tudo.
6. **"GTA 6 tem dublagem? O que vem em português"**. Pergunta recorrente e com resposta clara.
7. **"GTA 6 Online: o que é oficial e o que é boato"**. Tabela com "confirmado / rumor / falso", incluindo o comunicado falso de março de 2027. Atualizar quando a Rockstar falar.
8. **"GTA 6 no PC: não existe. Cuidado com golpes"**. Cobre "gta 6 pc", "port gta 6" e "portwatch" sem linkar nada pirata, e protege o leitor.
9. **"Mídia física sem disco: o que vem na caixa e o que fazer se vier sem código"**, com o adendo de que a caixa não dá o mês de GTA+.
10. **"Standard ou Ultimate? E o GTA+ vale?"**, com preços em R$ e a data da consulta.
11. **"Como salvar no GTA 6 e não perder progresso"**: 15 espaços manuais, o salvamento automático pouco confiável e o save antes do ponto sem volta. Liga direto com o tema do app (o que se perde e o que fica escondido).
12. **"O que dá para perder para sempre no GTA 6 (sem spoiler)"**. Ponte natural para o app e o assunto que mais converte para quem caça segredo. Só entra com fonte por item.
13. **"Mistérios do GTA 6 em aberto"** (Monumento de Manifest Canyon, bunker de Grassrivers, OVNI, fantasmas, QR code), com etiquetas "confirmado / relato / não verificado". É a vitrine do app, mas cada item precisa de prova antes de virar ficha.
14. **"Códigos do GTA 6: lista conferida e as falsas"**. A dúvida "tem códigos no gta 6?" já estava no banco de 25/11. Separar o confirmado do reciclado do GTA V.
15. **Números do lançamento**, em nota curta e datada (US$ 3,79 bi, 32,5 mi antes do lançamento, 99 no Metacritic). Serve de prova social para o site, sem inflar nada.
16. **"Jogar GTA 6 no Xbox One pela nuvem: como funciona"**. Dúvida de quem não tem console novo; pouca cobertura em PT-BR (impressão).

### Perguntas que ainda não têm resposta confiável (não publicar como fato)

- Data do GTA 6 Online, crossplay e preço.
- Data e requisitos do PC.
- Vendas da primeira semana (a Take-Two só deu o 1º dia; o resto é estimativa de terceiros).
- Causa dos travamentos no PS5.
- Número oficial de missões e duração da história.
