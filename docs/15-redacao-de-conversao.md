# 15 · Redação de conversão: como o site anuncia o aplicativo

Data: 26/11/2026. Pedido do fundador: "estratégias poderosas de anunciar esse app", com um painel que sobe do pé da tela em toda página (no formato do montinhopersonal.com.br), e o texto encaixado no tom da narrativa e na página onde aparece.

## A estratégia em uma frase

**O site responde. O aplicativo mostra no mapa.** Toda chamada parte do que a pessoa acabou de ler na página e oferece o próximo passo natural: ver onde fica, ver o que tem em volta e riscar o que já fez.

## Os três pontos de contato

| Onde | O que é | Quando aparece |
|---|---|---|
| **Painel que sobe** (`StickyAppBar`) | Frase + X + botão grande "Ver no mapa do app". No celular, ocupa o pé da tela; no computador, um cartão no canto | Em quase todas as páginas, depois de rolar um quarto da página (ou 520 px) |
| **Bloco "No aplicativo" da ficha** (`AppPitch`) | Três argumentos com os dados da ficha: o pino, os vídeos de quem já fez e os segredos a até 2 km | Em cada ficha, logo depois do passo a passo |
| **CTA de categoria** (`AppCta`) e seção da home | Chamada por categoria, editável no painel | No fim das listas e na home |

## Regras de respeito ao leitor (o que separa anúncio de spam)

1. **Valor antes do pedido.** O painel só sobe depois que a pessoa rolou e leu.
2. **Um pedido por vez.** Quando outro bloco do aplicativo já está na tela, o painel se recolhe. Ele também some perto do rodapé.
3. **Um toque fecha, e fecha de verdade.** O X esconde o painel por 3 dias neste aparelho, em todas as páginas.
4. **Fora de onde atrapalha:** não aparece na própria página do aplicativo, na compra, nos formulários, na busca, nem em privacidade e termos.
5. **Nada de urgência falsa.** Sem "últimas vagas", "só hoje" ou contador. Um teste automático barra essas palavras.
6. **Nada de promessa sem lastro.** Só se fala do que o aplicativo tem ou terá (mapa, vídeos, checklist), e a ficha diz quando ele ainda está em construção.

## O texto por página

A frase de cima vende o benefício, na voz do arquivo. A de baixo (visível no computador) diz o que acontece ao tocar.

| Página | Frase |
|---|---|
| Início | O arquivo inteiro, com mapa, no bolso. |
| Todos os segredos | Todos esses segredos. Um mapa só. |
| Missões secretas (lista / ficha) | Missão sem pino no mapa é passeio. / Leu o passo a passo? Veja onde fica. |
| Bunkers | Bunker não tem placa. O mapa tem pino. / A porta é essa. Falta achar o caminho. |
| Easter eggs | Piada interna, agora com endereço. / Achou graça? Tem mais por perto. |
| Dinheiro | Grana escondida rende mais com mapa. / Esse é um. Quantos tem no caminho? |
| Carros | A garagem dos sonhos começa no mapa. / Viu o carro. Agora vá buscar. |
| Armas | Arma única não fica na vitrine. / Sabe o que é. Falta saber onde. |
| Dicas | Aprendeu o básico? Hora de explorar. / Resolvido. E agora, o que fazer? |
| Mapa / região | As regiões viram pinos no aplicativo. / Essa região inteira, pino por pino. |
| Sobre | A Nina e o Brian cabem no seu bolso. |
| Como verificamos | Mesma régua. Agora com mapa. |
| Radar | O arquivo cresce. Seu mapa também. |
| Favoritos | Porta-luvas é bom. Mapa é melhor. |
| Ajuda | Dúvida resolvida? Hora de jogar. |

Botão: "Ver no mapa do app" enquanto o aplicativo não está à venda; com a venda ligada, "Ver no mapa do app · R$ X". Os textos ficam em `src/lib/sticky-copy.ts`.

## Mensuração

Cada clique manda `cta_click` com `placement` (`sticky`, `entry_after_steps`, `category`…) e `context` (a página: `ficha_dinheiro`, `cat_bunkers`…). Fechar o painel manda `cta_key = sticky_fechar`. Assim dá para comparar, por página, quem clicou e quem fechou.

## Testes A/B sugeridos (quando houver tráfego)

1. **Momento:** painel depois de 25% da página × depois do passo a passo.
2. **Botão:** "Ver no mapa do app" × "Abrir o mapa" × o preço no botão.
3. **Frase da ficha:** pergunta ("Quantos tem no caminho?") × afirmação ("Tem mais 7 aqui perto").
4. **Pausa ao fechar:** 3 dias × 7 dias. Métrica de guarda: rolagem até "Como sabemos" não pode cair.

## O que ainda não foi feito

- O painel não usa a contagem real de segredos por perto (isso está no bloco da ficha, que já tem o dado).
- Não há variação por origem do visitante (busca, rede social, link direto).
- Nenhum desses textos foi testado com jogadores.
