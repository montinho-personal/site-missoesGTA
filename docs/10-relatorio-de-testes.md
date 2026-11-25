# 10 · Relatório de testes

Data: 25/11/2026. Ambiente: build de produção, servidor local, Chromium via Playwright.

## Resumo

| Bateria | Resultado |
|---|---|
| Testes unitários (`npm test`) | 12 de 12 |
| Ponta a ponta com PGlite | 94 de 94 |
| Ponta a ponta com PostgreSQL 16 real | 94 de 94 |
| Lint e tipos | Sem erros |
| Build de produção | 58 páginas estáticas geradas |
| Lighthouse (laboratório, celular simulado) | ver abaixo |

O relatório detalhado da última execução fica em `docs/relatorios/e2e-ultimo.json`.

## Lighthouse (laboratório)

| Página | Performance | Acessibilidade | Boas práticas | LCP | TBT | CLS |
|---|---|---|---|---|---|---|
| Home | 97 | 100 | 100 | 0,9 s | 200 ms | 0 |
| Descoberta | 100 | 100 | 100 | 0,9 s | 80 ms | 0 |
| Todos os segredos | 100 | 100 | 100 | 0,9 s | 80 ms | 0 |

SEO marcou 66 nas três **somente** porque o site está com `noindex` de propósito (chave de publicação desligada). É o único item reprovado.

Ressalva: são medidas de laboratório em servidor local. As metas do briefing (LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 no percentil 75) são de **dados reais de usuários** e só poderão ser conferidas com tráfego, no relatório de Core Web Vitals do Search Console.

## O que o teste de ponta a ponta cobre

- **Rotas:** 22 endereços respondem 200; 4 endereços inexistentes respondem 404 real; `/gta-5/` não existe; o painel redireciona para o login.
- **SEO técnico:** um H1, canonical, resposta no HTML do servidor, JSON-LD válido, ausência de avaliação ou preço fictício, `noindex` e robots fechados antes do lançamento, cabeçalhos de segurança, sitemap sem áreas privadas.
- **Responsividade:** sem rolagem horizontal em 360, 390, 768 e 1280 px, em 4 páginas-modelo; alvos de toque de 40 px ou mais na home.
- **Acessibilidade:** axe-core (WCAG 2.0 a 2.2 AA) sem violações em 6 páginas.
- **Jornada:** busca com erro de digitação ("bigfot"), sinônimo ("grana"), busca sem resultado, da home à resposta, favoritos, spoiler ligado por padrão e persistente, filtros sem mudar a URL, teclado, menu.
- **Formulários:** validação, valores preservados após erro, bloqueio de `javascript:`, envio aceito, lista de espera.
- **Painel:** senha errada e certa, indicadores, moderação, texto malicioso exibido como texto, trava do "Confirmado", exigência de revisor, slug alterado gerando 301, novo endereço no ar, histórico no Radar, rascunho fora do site, publicação sem fonte bloqueada.

## Defeitos encontrados pelos testes e corrigidos

| Defeito | Como apareceu | Correção |
|---|---|---|
| Formulário apagava tudo o que a pessoa digitou quando a validação falhava | Jornada do envio de descoberta | A ação devolve os valores e o formulário os restaura |
| No PostgreSQL real, campos JSON eram gravados com dupla codificação | Painel falhava só no Postgres | Cast `::text::jsonb`; convenção documentada |
| Ficha da descoberta com lista de definição inválida para leitores de tela | axe-core | Estrutura `dt`/`dd` refeita |
| Tabela comparativa rolável sem acesso por teclado | axe-core | Região focável e rotulada |
| Hero com a ilustração por trás do texto | Revisão visual das capturas | Arte à direita no desktop e em faixa no topo no celular |

## Perfis de jogador (percurso simulado)

Não são testes com pessoas: são percursos que executei no navegador automatizado, anotando cliques e atritos.

| Perfil | Tarefa | Caminho | Resultado e atrito |
|---|---|---|---|
| Iniciante | Como salvar o jogo | Home → busca "salvar" → resultado | 2 toques e uma palavra. Resposta na primeira tela. |
| Casual | Dinheiro fácil | Home → card "Dinheiro e recompensas" → descoberta | 2 toques. Só 2 registros na categoria: **pouco conteúdo é o maior atrito hoje.** |
| Nostálgico | Reviver a exploração | Home → "Nossa paixão" → Sobre → Easter eggs | A casa de Belville e o papagaio conectam com San Andreas. Falta imagem. |
| Caçador de segredos | Algo pouco conhecido | Todos os segredos → filtro "Em investigação" | 1 caso aberto. O status e a seção "O que ainda não se sabe" funcionam; o volume é pequeno. |
| Completionista | Acompanhar o que achou | Estrela → Meus favoritos | Favorito não é checklist. É exatamente o espaço do aplicativo. |
| Evita spoilers | Navegar sem risco | Proteção ligada por padrão; filtro "Só sem spoilers" | Funciona. Limitação: o filtro é por nível de spoiler, e não por capítulo jogado, porque não há dado confiável de progresso por descoberta. |
| Potencial comprador | Por que pagar | CTA → `/app/` | Fica claro o que é e o que não existe ainda. **Barreira: sem preço, sem capturas, sem produto.** Hoje a conversão possível é a lista de aviso. |

## O que NÃO foi testado

- Aparelhos físicos (iPhone, Android intermediário) e navegadores Safari e Firefox. Só Chromium, em tamanhos de tela emulados.
- Leitores de tela e usuários reais.
- Carga, concorrência e comportamento sob ataque.
- Deploy na Vercel e banco gerenciado (testado localmente com Postgres 16).
- Integrações externas: GTM/GA4, Search Console, envio de e-mail da lista de aviso (os e-mails são guardados; **não há disparo configurado**).
- A veracidade das descobertas dentro do jogo.
