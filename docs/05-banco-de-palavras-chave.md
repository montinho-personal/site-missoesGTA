# 05 · Banco mestre de palavras-chave

## O que existe

| Arquivo | Conteúdo |
|---|---|
| `data/keywords/raw/serpapi-2026-11-25.json` | 698 linhas brutas: 550 do autocomplete do Google, 76 de pesquisas relacionadas, 72 de "As pessoas também perguntam". Brasil, pt-BR. |
| `data/keywords/raw/serp-snapshots-2026-11-25.json` | Top orgânico e recursos de SERP de 20 consultas. |
| `data/keywords/banco-mestre.csv` e `.json` | 587 termos únicos, classificados. Gerado por `npm run keywords`. |
| Tabela `keywords` no banco | O mesmo conteúdo, editável em `/admin/palavras-chave/`. Carregado por `npm run db:keywords`. |

## Campos

Palavra-chave, termos originais, fontes (com semente e data), primeira e última coleta, país, idioma, volume, tendência, dificuldade, relevância do autocomplete, intenção primária e secundária, cluster, subcluster, entidade, jogo, palavra-chave principal da página, URL planejada, URL existente, prioridade, potencial comercial, potencial de conversão para o app, status de produção, status de indexação, necessidade de atualização e notas.

**Volume, tendência e dificuldade estão vazios de propósito.** Nenhuma ferramenta que forneça esses números foi consultada, e eu não estimo. O único sinal numérico é a relevância do autocomplete, que serve para ordenar e não equivale a volume.

## Regras de importação (implementadas e testadas)

1. **Duplicatas e variantes:** termos que só diferem em acento, caixa, espaços ou "GTA VI/GTA6" viram uma linha. O termo original fica preservado em `termos originais`.
2. **Volumes nunca são somados** entre variantes: fica o maior valor informado.
3. **Nada é descartado sem justificativa.** Só linhas vazias são ignoradas, e a contagem aparece no resultado da importação. Para tirar um termo do planejamento, use o status "Descartado" com uma nota.
4. **Outros jogos** (GTA 5, San Andreas, GTA 4) são guardados com prioridade "futura" e sem URL planejada.
5. **Importação contínua:** envie um CSV em `/admin/palavras-chave/`. O importador reconhece separador (vírgula, ponto e vírgula, tabulação) e colunas de AnswerThePublic, Keyword Planner e Search Console (keyword, palavra-chave, query, volume, KD, tendência…). Reimportar o mesmo arquivo não duplica nada.
6. A classificação automática (`src/lib/keyword-rules.ts`) é uma heurística por expressão regular e pode ser corrigida linha a linha no painel.

## Retrato da demanda (GTA 6, 557 termos)

| Cluster | Termos | Exemplos reais | Leitura |
|---|---|---|---|
| Não classificado | 156 | "onde jogar", "onde se passa", "casas bahia" | Ruído pré-lançamento e comercial; revisar à mão |
| Produto e lançamento | 78 | "pc", "online vai lançar quando", "preço" | Fora do posicionamento; FAQ |
| Mapa | 64 | "mapa completo", "mapa oficial", "mapa ign" | Intenção forte de mapa interativo: ativo do aplicativo |
| História e missões | 42 | "final bom", "quantas missões", "detonado" | Roteiro, com controle de spoiler |
| Exploração e segredos | 41 | "vice city portal", "carros secretos", "misterios" | **Núcleo editorial** |
| Dicas e mecânicas | 37 | "como trocar de personagem", "como dar seta", "como salvar o jogo" | **Núcleo**; respostas curtas |
| Cheats e códigos | 35 | "dinheiro infinito", "códigos", "manhas" | Um guia, só com teste direto |
| Personagens | 31 | "jason duval", "troy baker" | Baixa prioridade (parte é busca de teor sexual, que não atendemos) |
| Veículos | 24 | "carro do brian", "carros lendarios", "como comprar carros" | Núcleo |
| Dinheiro e recompensas | 22 | "cofre boliche", "ganhar dinheiro" | Núcleo, alto potencial para o app |
| Armas e itens | 10 | "armas lendarias", "roda de armas" | Médio |
| Colecionáveis e 100% | 10 | "100 checklist", "guia platina", "troféus perdíveis" | Alto potencial para o app (checklist) |
| Comercial / app | 7 | "mapa interativo", "app android", "mapgenie" | Landing `/app/` |

Observações da coleta: o autocomplete ainda carrega muita busca de pré-lançamento; sementes como "dinheiro escondido", "melhores carros" e "aplicativo" não retornaram sugestões, então a demanda por essas expressões exatas **não está comprovada**; há contaminação por inglês e espanhol.

## Próximas coletas recomendadas

Search Console (assim que o site estiver indexado: é o dado mais confiável), Keyword Planner para volume, Google Trends para tendência, e nova rodada de autocomplete a cada duas semanas enquanto o jogo é novidade.
