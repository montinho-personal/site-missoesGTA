# 06 · SEO técnico, AEO/GEO e Google Discover

Nenhuma destas medidas garante posição no Google nem citação por IA. O que está aqui é o que foi implementado e por quê.

## SEO técnico (implementado e testado)

| Item | Como está |
|---|---|
| Renderização | Páginas públicas geradas como HTML estático (SSG) e revalidadas a cada 10 minutos ou na hora, quando o painel salva. O conteúdo principal está no HTML, sem depender de JavaScript. |
| Códigos HTTP | 404 real para endereço inexistente; 301/308 para slug alterado; redirecionamentos manuais no painel. |
| Títulos e descrições | Únicos por página, com campo próprio no painel. Teste automático limita a 65 e 165 caracteres e barra títulos repetidos. |
| H1 e hierarquia | Um H1 por página (testado); H2/H3 em ordem. |
| Canonical | Em todas as páginas, sem parâmetros. |
| Sitemap | `/sitemap.xml` dinâmico, com data de modificação real e imagens quando houver. Exclui painel, busca, favoritos e regiões vazias. |
| robots.txt | Gerado por código (`src/app/robots.ts`). |
| Dados estruturados | `Organization`, `WebSite` (com busca), `BreadcrumbList`, `Article`, `CollectionPage` + `ItemList`, `FAQPage` (só onde as perguntas estão visíveis), `AboutPage`. `SoftwareApplication` só é emitido quando houver produto à venda com preço real. Nenhuma avaliação ou preço fictício (testado). |
| Open Graph | Imagem 1200×630 gerada por página, com título, categoria e status. Descobertas com spoiler da história não mostram o título na imagem. |
| Paginação e filtros | Listas completas em uma página; filtros não geram URL. |
| Idioma | `lang="pt-BR"`, `inLanguage` no schema. |
| Chave de publicação | Sem `SITE_INDEXABLE=true`, todo o site responde `noindex` e o robots bloqueia tudo. Previews nunca são indexados por acidente. |

Não implementado por falta de insumo: sitemap de vídeos e `VideoObject` (não há vídeos próprios), `hreflang` (um idioma só).

## Política de rastreadores

Decisão: **quem traz leitor entra; quem só coleta para treinar modelo fica de fora.**

| Grupo | Robôs | Regra |
|---|---|---|
| Busca tradicional | Googlebot, Bingbot, Applebot | Liberados |
| Busca e resposta com IA, que citam a fonte | OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, DuckAssistBot | Liberados |
| Coleta para treinamento | GPTBot, ClaudeBot, anthropic-ai, Google-Extended, CCBot, Applebot-Extended, Bytespider, meta-externalagent, Amazonbot, cohere-ai | Bloqueados |

Ressalvas: `Google-Extended` controla o uso em Gemini e Vertex, e bloqueá-lo não tira o site dos resumos de IA da busca do Google, que usam o Googlebot. Os nomes dos robôs mudam; revisar a lista a cada trimestre. A decisão é reversível em um arquivo.

`/llms.txt` existe e lista páginas, categorias e cada descoberta com seu status. É **experimental**: não há evidência de que influencie posicionamento ou citação.

## AEO / GEO: como as páginas foram escritas para serem citadas

19 das 20 SERPs coletadas mostram resumo de IA. O formato da página de descoberta responde, nesta ordem, às seis perguntas do briefing:

| Pergunta | Onde está na página |
|---|---|
| O que é? | Título + "Resposta rápida" (1 a 2 frases, primeiro bloco) |
| Onde fica? | Ficha: "Onde fica", "Ponto de referência", região |
| Como encontrar? | "Passo a passo" numerado |
| Quais os requisitos? | Ficha: personagem, requisitos, progresso, horário |
| Qual a recompensa? | Ficha: recompensa e tipo |
| Como sabemos? | Bloco "Como sabemos": status, tipo de evidência, plataforma, versão, data, fontes com link, histórico |

Outros cuidados: cada página se explica sozinha (nome do jogo e do lugar no texto); campo sem dado diz "Ainda não confirmado" em vez de ser omitido; divergência entre fontes tem seção própria; datas de publicação e atualização são reais e vêm do banco; autoria e metodologia têm páginas públicas.

## Google Discover

Requisitos atendidos: `max-image-preview:large` (ligado junto com a indexação), títulos que o conteúdo cumpre, datas e autoria visíveis.

**Lacuna:** o Discover favorece páginas com imagem grande e atraente (1.200 px ou mais). Hoje as descobertas não têm fotos, só a imagem de compartilhamento gerada. Sem capturas próprias, a chance de aparecer no Discover é baixa. O campo de mídia no painel já aceita largura e altura.

Pautas com gancho de curiosidade legítima, a partir do que já está apurado:

1. "O ovo de Páscoa de GTA 6 é um ovo de Páscoa de verdade, e fica no topo de uma torre"
2. "A foto misteriosa de San Andreas virou uma casa em GTA 6"
3. "O que as fontes ainda não sabem dizer sobre o monumento de Manifest Canyon"
4. "Um papagaio entrega um esconderijo de dinheiro em GTA 6. A referência é de 2004"
5. Série "Antes de avançar": o que dá para perder em cada capítulo
6. "O que mudou nos segredos de GTA 6 depois da atualização de 23/11" (só após teste)

Regras: sem número inventado no título, sem "você não vai acreditar", e o status de verificação aparece no texto.

## SEO de imagens e vídeos (quando existirem)

Capturas próprias, 1.600 px de largura, nome de arquivo descritivo, texto alternativo obrigatório (o painel recusa imagem sem ele), crédito e legenda. Vídeo próprio curto por descoberta testada, hospedado no YouTube e incorporado por `youtube-nocookie` (já liberado na CSP).
