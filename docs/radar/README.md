# Radar diário de GTA 6

Um agente roda **todo dia às 05:37 (horário de Brasília)** e procura o que saiu de novo sobre GTA 6: atualizações (patches), segredos e descobertas, cheats e códigos, notícias oficiais da Rockstar, polêmicas e boatos.

## O que ele entrega
- Um relatório por dia em `docs/radar/AAAA-MM-DD.md`, com cada novidade, a fonte e o selo pela mesma régua do site (Confirmado = 3+ fontes independentes; Muito provável = 2; Não verificado = 1 ou fontes que se contradizem).
- Uma linha por dia em `data/radar/contagem.csv`, para medir quantas novidades saem e recalibrar a frequência.
- Tudo vai para o branch `claude/radar-diario`. **O agente não publica nada no site nem no aplicativo**: o que entra nas fichas passa por revisão.

## Recalibração
Depois de 14 dias de contagem, o próprio relatório traz uma recomendação: manter diário, passar a dias alternados ou subir para duas vezes por dia, conforme o volume.

## Custo
Cada execução usa uma sessão do Claude e no máximo 3 consultas pagas à SerpAPI por dia (cota única de todos os sites do Renato, 1.000 por mês; decisão de 26/11/2026). A busca comum (WebSearch) vem primeiro. Com cota esgotada ou limite de requisições, segue só com o WebSearch e avisa no resumo.
