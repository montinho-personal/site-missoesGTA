# 14 · Venda do aplicativo e códigos de acesso

Decisões do fundador (26/11/2026): aplicativo inteiro pago, vendido no site, pelo **Mercado Pago**, com a possibilidade de o dono liberar acesso de graça. Dois pontos ele não respondeu e ficaram no padrão recomendado, fáceis de trocar: **pagamento único** e **cortesia por código**.

## Como funciona

1. Em `/app/`, a pessoa informa o e-mail, aceita os termos e clica em comprar.
2. O site abre um pedido e manda a pessoa para a página de pagamento do Mercado Pago (Checkout Pro: Pix ou cartão). Nenhum dado de cartão passa pelo site.
3. O Mercado Pago avisa o site (webhook). O site confere a assinatura do aviso, busca o pagamento na API e confere valor e moeda.
4. Pagamento aprovado: o site gera um **código de acesso** (formato `MS6-XXXX-XXXX-XXXX`) e mostra em `/app/acesso/?pedido=…`.
5. No aplicativo, a pessoa digita o código. O aplicativo pergunta ao site se ele vale.
6. Estorno, devolução ou cancelamento: o código é desativado sozinho.

**Cortesia:** em `/admin/acessos/`, o dono gera um código (com e-mail e anotação opcionais) e envia para quem quiser. O mesmo painel lista todos os códigos, mostra o último uso, permite revogar e soma vendas e receita.

## Para ligar a venda

A venda fica **desligada** enquanto faltar qualquer um destes itens, e a página `/app/` mostra a lista de aviso no lugar do botão de compra:

| Variável (no painel da Vercel) | De onde vem |
|---|---|
| `DATABASE_URL` | Banco Postgres (Neon) |
| `MP_ACCESS_TOKEN` | Mercado Pago > Suas integrações > sua aplicação > Credenciais de produção |
| `MP_WEBHOOK_SECRET` | Mesma aplicação > Webhooks > assinatura secreta. URL do webhook: `https://missoessecretasgta.com.br/api/mercadopago/webhook/`, evento "Pagamentos" |
| Preço | Definido pelo dono em `/admin/acessos/`, campo "Preço do aplicativo". Vale na hora, sem novo deploy. (A variável `APP_PRICE_BRL` continua aceita como reserva.) |

Depois de definir as variáveis, é preciso refazer o deploy uma vez. O preço não pede deploy: muda pelo painel.

## Contrato com o aplicativo

```
POST https://missoessecretasgta.com.br/api/acesso/validar/
Content-Type: application/json
{ "codigo": "MS6-ABCD-EFGH-JKMN" }

200 { "valido": true | false }
429 { "valido": false, "motivo": "muitas_tentativas" }   (20 tentativas a cada 10 minutos por origem)
```

Aceita o código com ou sem hífens, em qualquer caixa. A resposta nunca traz e-mail nem dado do comprador. O aplicativo deve guardar o resultado no aparelho e revalidar de tempos em tempos, para continuar funcionando sem internet e para respeitar revogação e estorno.

## O que foi testado, e o que não foi

Testado com um **Mercado Pago simulado** (`tests/pagamento.mjs`, 18 verificações, em PostgreSQL real): venda desligada sem preço, preço definido pelo painel, preço na página, criação do pedido e da preferência, página sem código antes do pagamento, aviso com assinatura errada recusado, valor menor que o pedido não libera, aviso repetido não gera dois códigos, código exibido e validado, código inventado recusado, pedido inexistente não revela nada, cortesia, revogação e estorno.

**Não testado:** nenhuma chamada ao Mercado Pago de verdade. A integração segue a documentação pública (preferência de Checkout Pro; assinatura `x-signature` com HMAC-SHA256 do manifesto `id:…;request-id:…;ts:…;`), mas só um pagamento real em modo de teste, com as credenciais do dono, confirma que os campos batem. **Faça uma compra de teste antes de divulgar.**

## Limites conhecidos

- **Sem envio de e-mail.** O código aparece na tela depois do pagamento. Quem fechar a página e perder o endereço precisa pedir pelo contato; o dono acha o código pelo e-mail em `/admin/acessos/`. Vale ligar um serviço de e-mail transacional.
- **Um código não é preso a um aparelho.** Pode ser compartilhado. O painel mostra o último uso, e o dono pode revogar. Limite por aparelho depende de conta no aplicativo.
- **Nota fiscal** não é emitida pelo site.
- **Bloqueio no aplicativo** ainda não existe: é trabalho do repositório do aplicativo.
- **Direito de arrependimento:** a página informa os 7 dias do Código de Defesa do Consumidor; a devolução é feita pelo dono no painel do Mercado Pago, e o aviso de estorno desativa o código.
- **Risco de marca:** produto pago com o nome do jogo. Recomenda-se consulta jurídica antes de abrir a venda.

## Preço de lançamento (26/11/2026)

O fundador definiu **R$ 4,20** como preço de lançamento, com a piada "entendedores entenderão" e o aviso de que o valor pode subir no futuro. Está em `LAUNCH_PRICE_CENTS` (`src/lib/app-config.ts`) e vale quando o painel não tem outro preço gravado. Trocar o preço no painel sobrepõe; apagar o campo volta aos R$ 4,20.

O aviso de aumento é verdadeiro e não é urgência falsa: não há prazo nem contador, e quem compra agora paga uma vez só (pagamento único), sem pagar a diferença depois.

A página também passou a vender a **revisão diária** do arquivo, com números calculados do próprio conteúdo (fichas, fontes, vídeos e data da última revisão de ficha).
