# 16 · Estratégia de compartilhamento

Pedido do fundador (26/11/2026): compartilhamento para Stories do Instagram, Status do WhatsApp e mensagem individual no WhatsApp, em lugares estratégicos e com texto forte.

## Os três formatos

| Formato | Como funciona | Onde está |
|---|---|---|
| **WhatsApp (conversa ou grupo)** | Abre o WhatsApp com a mensagem pronta: gancho por categoria, título da ficha e link rastreável | `src/lib/share-copy.ts` |
| **Stories e Status** | Gera uma imagem vertical 1080 × 1920 da ficha (arte da categoria, pergunta-gancho, título, região e selo) e abre o compartilhamento do celular. O link vai junto para a área de transferência, para colar no adesivo Link do Instagram. Sem suporte, a imagem é baixada | `/<ficha>/story/`, `/app/story/` |
| **Copiar link** | Link com marcação de origem | |

Todo link compartilhado leva `utm_source` (whatsapp, instagram, link), `utm_medium=compartilhamento` e `utm_campaign` (ex.: `ficha_dinheiro`, `app`, `acesso`). O endereço canônico não muda.

## Onde aparece (e por quê)

| Lugar | Momento do leitor |
|---|---|
| Logo abaixo da resposta rápida da ficha | Acabou de achar a resposta: quer mandar para quem perguntou |
| Bloco "Manda pro parceiro de jogatina", depois do passo a passo | Momento de sucesso: entendeu como fazer e quer chamar alguém |
| Página do aplicativo, "Conhece alguém que vive caçando segredo?" | Indicação: todo grupo tem o amigo que jura ter visto um carro escondido |
| Página do código de acesso, depois da compra | Pico de entusiasmo: "Caçar sozinho é mais lento. Chama o parceiro" |

## A copy

Mensagens de WhatsApp (o título entra no lugar de X):

| Categoria | Mensagem |
|---|---|
| Dinheiro | Achei grana escondida no GTA 6: X. Tem o lugar e o passo a passo aqui 👇 |
| Carros | Bora buscar esse carro no GTA 6? X. Onde fica e como pegar 👇 |
| Missões | Sabia dessa missão escondida no GTA 6? X. O jogo não marca no mapa, mas tá tudo aqui 👇 |
| Easter eggs | Olha esse easter egg do GTA 6 que quase ninguém viu: X 👇 |
| Bunkers | Tem um esconderijo no GTA 6 que o GPS não mostra: X 👇 |
| Armas | Arma que não tem na loja do GTA 6: X. Onde pegar 👇 |
| Dicas | Isso aqui salva no GTA 6: X 👇 |
| App | Achei um app que mostra no mapa onde fica cada segredo do GTA 6, com vídeo de quem já fez e a lista do que você já pegou. Custa R$ 4,20, e sim, o número é de propósito. |
| Depois da compra | Peguei o mapa de segredos do GTA 6 (...). Pega aí pra gente caçar junto |

Gancho das imagens de Stories: uma pergunta ("Você já pegou essa grana?", "Você já achou esse carro?", "Você já entrou aqui?"). Pergunta convida resposta, e resposta em Stories vira conversa.

Regras: soa como gente falando com gente; nunca entrega spoiler da história (fichas com spoiler mandam texto e imagem genéricos); sem número inventado nem urgência falsa.

## Mensuração

Evento `share` com `method` (whatsapp, stories, copy) e `context`. Com a mensuração ligada, as visitas que chegam pelo compartilhamento aparecem por `utm_source` e `utm_campaign`.

## Próximos passos sugeridos

- Medir quais categorias mais são compartilhadas e reforçar o gancho delas.
- Testar a pergunta-gancho contra uma afirmação ("Tem grana escondida aqui") nas imagens.
- Uma imagem de progresso para o aplicativo ("Já achei 23 de 125"), quando o checklist existir.
