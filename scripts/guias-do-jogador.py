import json
E=json.load(open('content/seed/entries.json'))
C=json.load(open('content/seed/categories.json'))
if not any(c['id']=='gta6-guia' for c in C):
    C.append({"id":"gta6-guia","game_id":"gta6","slug":"guia","name":"Guia do jogador","tagline":"Antes de sair de casa","icon":"compass","cta_key":None,"sort":8,
      "description":"As perguntas de quem vai jogar GTA 6: data de lançamento, preço no Brasil, plataformas e o que vem em cada edição, com a fonte de cada resposta.",
      "intro_md":"Antes de caçar segredo, todo mundo passa pelas mesmas dúvidas: quando sai, quanto custa, em que console roda. Aqui ficam as respostas, curtas e com fonte. A Nina confere cada número; o Brian só quer saber se dá para jogar hoje à noite.",
      "seo_title":"Guia do jogador de GTA 6: lançamento, preço e plataformas",
      "seo_description":"Data de lançamento, preço no Brasil, plataformas e edições de GTA 6, com resposta curta e a fonte de cada informação.","faq":[]})
    json.dump(C,open('content/seed/categories.json','w'),ensure_ascii=False,indent=1); open('content/seed/categories.json','a').write("\n")

def S(nome,url,tipo,data,nota): return {"nome":nome,"url":url,"tipo":tipo,"data":data,"nota":nota}
base=dict(app_ref=None,game_id="gta6",category_id="gta6-guia",region_id=None,author_id="redacao",kind="guia",landmark=None,coords=None,character_req="n/a",
  progress_required="n/a",conditions="n/a",reward="n/a",reward_type="nenhuma",repeatable="n/a",missable="n/a",troubleshooting=[],platform_tested=None,game_version=None,
  last_verified_on="2026-11-27",verification_status="confirmado",evidence_type="oficial",spoiler_level="nenhum",media=[],related=[],workflow_status="publicado",featured=False,
  reviewed_by=None,published_at="2026-11-27T03:00:00Z",created_at="2026-11-27T03:00:00Z",updated_at="2026-11-27T03:00:00Z",pin_precision=None,pin_evidence=None,chapter=0,reward_value=None,
  _change_note="Guia do site escrito a partir de fontes de imprensa e das lojas oficiais.")

lanc=dict(base,id="gta6-g001",slug="data-de-lancamento",
 title="Data de lançamento de GTA 6 no Brasil: dia, horário e plataformas",
 direct_answer="GTA 6 foi lançado em 19 de novembro de 2026 para PlayStation 5 e Xbox Series X|S. No Brasil, a liberação foi à meia-noite (0h, horário de Brasília) desse dia, no horário local de cada país. A versão de PC ainda não tem data oficial.",
 summary="Antes disso, o jogo foi adiado duas vezes: do fim de 2025 para 26 de maio de 2026 e, depois, para 19 de novembro de 2026. O pré-download abriu dias antes e pedia até 212 GB.",
 body_md="""Treze anos depois de GTA V, Leonida abriu as portas. Se você chegou aqui querendo saber se já dá para jogar: dá, desde 19 de novembro de 2026. O resto desta página é para quem quer o detalhe e para quem ainda está decidindo onde jogar.

## Data e horário, em uma tabela

| Plataforma | Data | Horário no Brasil |
|---|---|---|
| PlayStation 5, PS5 Slim e PS5 Pro | 19 de novembro de 2026 | 0h (meia-noite), horário de Brasília |
| Xbox Series X e Series S | 19 de novembro de 2026 | 0h (meia-noite), horário de Brasília |
| PC | Sem data oficial | — |
| PS4 e Xbox One | Não há versão anunciada | — |

A Rockstar liberou o jogo à meia-noite no horário local de cada região, então não houve um horário único no mundo. A página brasileira da PlayStation Store marcava 3h UTC, que é 0h em Brasília.

## O pré-download

Para jogar no primeiro minuto, o truque era baixar antes. O pré-download abriu cerca de uma semana antes do lançamento, com datas um pouco diferentes no Xbox e no PS5, e pedia **até 212 GB** de espaço livre, conforme a Rockstar. Se o seu console está no limite do SSD, vale abrir espaço antes de comprar: o jogo não instala pela metade.

## A linha do tempo dos adiamentos

GTA 6 mudou de data duas vezes antes de chegar:

1. **Primeiro plano:** lançamento no fim de 2025.
2. **Maio de 2025:** a Rockstar adiou para **26 de maio de 2026**.
3. **Novembro de 2025:** novo adiamento, para **19 de novembro de 2026**. Foi a data que valeu.

A explicação oficial nas duas vezes foi a mesma: mais tempo para polir o jogo. O Brian diz que já sabia desde o primeiro trailer. A Nina pediu a prova e ele mudou de assunto.

## E o PC?

Até agora, **não existe data oficial para a versão de PC**. Circulam palpites sobre 2027, mas nenhum deles vem da Rockstar. Quando houver anúncio, esta página muda no mesmo dia. Com GTA V foi assim também: o PC chegou depois dos consoles.

## Já saiu. E agora?

O mapa de Leonida é enorme, e a maior parte do que vale a pena não aparece no GPS. Três caminhos para começar sem perder tempo:

- [Todos os segredos já registrados](/gta-6/segredos/), com o selo de confiança de cada um.
- [O mapa por região](/gta-6/mapa/), para ver o que tem perto de onde você está.
- [Como salvar o jogo](/gta-6/dicas/como-salvar-o-jogo/), porque GTA 6 não tem replay de missão.

Quer saber quanto custa cada edição antes de comprar? Está no [guia de preço de GTA 6 no Brasil](/gta-6/guia/preco/).""",
 location_text="PlayStation 5 e Xbox Series X|S. PC sem data.",
 requirements="Console PS5 ou Xbox Series X|S e até 212 GB livres para instalar.",
 steps=["Confirme que o seu console é PS5 (qualquer modelo) ou Xbox Series X|S: são as plataformas do lançamento.","Libere até 212 GB no armazenamento antes de comprar.","Compre na PlayStation Store ou na loja do Xbox e deixe o download terminar.","Abra o jogo: a liberação no Brasil é à meia-noite, horário de Brasília."],
 common_mistakes=["Comprar sem espaço livre: o jogo pede até 212 GB.","Procurar a versão de PS4 ou Xbox One: ela não existe.","Acreditar em data de PC que não vem da Rockstar."],
 sources=[S("Engadget","https://www.engadget.com/gaming/grand-theft-auto-vi-is-delayed-to-november-19-2026-211848530.html","imprensa","2025-11-06","Adiamento para 19 de novembro de 2026, PS5 e Xbox Series."),
  S("Gematsu","https://www.gematsu.com/2025/11/grand-theft-auto-vi-delayed-to-november-19-2026","imprensa","2025-11-06","Confirma a data de 19/11/2026."),
  S("Game Informer","https://www.gameinformer.com/2025/05/02/grand-theft-auto-vi-delayed-to-may-2026","imprensa","2025-05-02","Primeiro adiamento, do fim de 2025 para 26/05/2026."),
  S("Omelete","https://www.omelete.com.br/games/gta-6-que-horas-jogo-sera-lancado-no-brasil","imprensa","2026-11","Horário de liberação no Brasil."),
  S("Critical Hits","https://criticalhits.com.br/games/gta-6-sera-liberado-a-meia-noite-de-19-de-novembro-no-brasil/","imprensa","2026-11","Liberação à meia-noite de 19 de novembro no Brasil; PlayStation Store marcava 3h UTC."),
  S("Fast Company Brasil","https://fastcompanybrasil.com/games/gta-6-pre-carregamento-precos-como-baixar/","imprensa","2026-11","Pré-download de até 212 GB."),
  S("Tecnoblog","https://tecnoblog.net/noticias/rockstar-muda-data-de-lancamento-de-gta-6-pela-segunda-vez/","imprensa","2025-11","Segundo adiamento; PC sem data.")],
 faq=[{"q":"Qual é a data de lançamento de GTA 6?","a":"19 de novembro de 2026, para PlayStation 5 e Xbox Series X|S."},
  {"q":"Que horas GTA 6 foi liberado no Brasil?","a":"À meia-noite (0h) de 19 de novembro, horário de Brasília. A Rockstar liberou no horário local de cada país."},
  {"q":"GTA 6 já foi lançado?","a":"Sim. Está disponível desde 19 de novembro de 2026 no PS5 e no Xbox Series X|S."},
  {"q":"Quando GTA 6 sai para PC?","a":"Ainda não há data oficial. Datas que circulam por aí não vêm da Rockstar."},
  {"q":"GTA 6 vai sair para PS4 ou Xbox One?","a":"Não há versão anunciada para PS4 nem para Xbox One. O jogo saiu só para PS5 e Xbox Series X|S."},
  {"q":"Quantas vezes GTA 6 foi adiado?","a":"Duas: do fim de 2025 para 26 de maio de 2026 e, depois, para 19 de novembro de 2026."},
  {"q":"Quantos GB precisa para instalar GTA 6?","a":"Até 212 GB, segundo a Rockstar no anúncio do pré-download. Pode variar entre os consoles e com atualizações."}],
 tags=["lançamento","data de lançamento","quando lança","horário","pré-download","adiamento","pc","ps5","xbox"],
 seo_title="Data de lançamento de GTA 6 no Brasil: dia e horário",
 seo_description="GTA 6 saiu em 19/11/2026 para PS5 e Xbox Series, à meia-noite no horário de Brasília. Veja o pré-download, os adiamentos e se tem data no PC.")

preco=dict(base,id="gta6-g002",slug="preco",
 title="Preço de GTA 6 no Brasil: quanto custa no PS5 e no Xbox",
 direct_answer="Nas lojas oficiais do PlayStation e do Xbox no Brasil, GTA 6 custa R$ 449,90 na edição padrão e R$ 549,90 na Ultimate Edition. O preço é o mesmo nos dois consoles. Lá fora, US$ 79,99 e US$ 99,99.",
 summary="A diferença entre as edições é de R$ 100, o mesmo valor do upgrade da padrão para a Ultimate na loja do Xbox. Quem comprou na pré-venda ganhou o pacote Vintage Vice City.",
 body_md="""R$ 449,90. Respira. É o preço da edição padrão de GTA 6 nas lojas oficiais do PS5 e do Xbox no Brasil, e é mais do que a maioria dos jogos grandes costuma custar. A Nina conferiu em várias fontes; o Brian conferiu a carteira e ficou quieto.

## Quanto custa cada edição

| Edição | PS5 e Xbox (Brasil) | EUA |
|---|---|---|
| Padrão | R$ 449,90 | US$ 79,99 |
| Ultimate | R$ 549,90 | US$ 99,99 |
| Upgrade para Ultimate | R$ 100 (loja do Xbox) | US$ 20 |

Preços das lojas digitais oficiais, conferidos em 27/11/2026. Em lojas de varejo e na mídia física o valor muda conforme a loja e a promoção.

## O que vem em cada edição

**Padrão:** o jogo completo. Quem reservou na pré-venda, em qualquer edição, ganhou o **pacote Vintage Vice City**, com veículos e roupas inspirados na Vice City dos anos 80. Na pré-venda digital, também veio um mês de GTA+.

**Ultimate Edition:** o jogo, mais itens exclusivos, como o carro '95 Grotti Cheetah, revólveres próprios e a oficina **Rideout Customs** para modificar veículos. Os bônus não chegam todos de uma vez: vão sendo liberados ao longo da história, ao fim de cada capítulo.

## Vale pagar a Ultimate?

Depende do que você quer do jogo. A história, o mapa e os segredos são os mesmos nas duas edições: nenhum segredo de Leonida fica trancado atrás da Ultimate. Ela vale para quem quer os carros e itens a mais e a oficina extra. Quem quer economizar não perde a aventura com a padrão, e pode fazer o upgrade depois.

## Onde comprar sem cair em golpe

- **Lojas oficiais:** PlayStation Store, no PS5, e loja do Xbox (Microsoft Store), no Xbox Series. O preço oficial é o de lá.
- **Varejo:** lojas grandes vendem a mídia física e códigos. Compare o preço, mas desconfie de "chave" muito abaixo do preço oficial vendida por desconhecidos: é o golpe mais comum em lançamento grande.
- **Não existe GTA 6 de graça nem APK para celular.** Qualquer site que ofereça isso quer o seu dado ou o seu dinheiro.

## Quanto custa ir além do óbvio

O jogo custa R$ 449,90. O [app do Missões Secretas GTA 6](/app/), com os 125 segredos, o pino no mapa e os vídeos de quem já fez, custa R$ 4,20, uma vez só. É o troco do jogo.

Antes de comprar, veja também a [data e o horário de lançamento](/gta-6/guia/data-de-lancamento/) e comece pelos [segredos que rendem dinheiro](/gta-6/dinheiro/), para recuperar no jogo o que saiu do bolso.""",
 location_text="PlayStation Store (PS5) e loja do Xbox (Xbox Series X|S).",
 requirements="PS5 ou Xbox Series X|S.",
 steps=["Escolha a edição: padrão (R$ 449,90) ou Ultimate (R$ 549,90).","Compre na PlayStation Store ou na loja do Xbox, ou em varejista conhecido.","Se começar pela padrão, dá para fazer o upgrade para a Ultimate depois."],
 common_mistakes=["Comprar chave muito barata de vendedor desconhecido.","Achar que a Ultimate libera segredos ou missões que a padrão não tem.","Cair em site que promete GTA 6 de graça ou para celular."],
 sources=[S("Omelete","https://www.omelete.com.br/games/gta-6-preco-quanto-custa","imprensa","2026-06","R$ 449,90 na edição padrão, PS5 e Xbox Series X|S."),
  S("Tecnoblog","https://tecnoblog.net/noticias/preco-de-gta-6-no-brasil-e-revelado-r-449/","imprensa","2026-06","Preço no Brasil revelado."),
  S("Legião dos Heróis","https://www.legiaodosherois.com.br/2026/gta-6-jogo-chega-custando-ate-r-550-no-brasil-veja-precos-das-edicoes.html","imprensa","2026","Preços das edições, até R$ 549,90 na Ultimate."),
  S("Critical Hits","https://criticalhits.com.br/games/gta-6-pre-venda-precos-bonus-e-como-reservar-no-ps5-e-xbox/","imprensa","2026-06","Preços, bônus de pré-venda e como reservar no PS5 e no Xbox."),
  S("TechRadar","https://techradar.com/gaming/gta-6-pre-orders-go-live-at-midnight-local-time-as-rockstar-unveils-the-ultimate-edition-that-amplifies-the-experience-with-exclusive-items","imprensa","2026-06","US$ 79,99 e US$ 99,99; upgrade de US$ 20; Vintage Vice City Pack; um mês de GTA+ na pré-venda digital."),
  S("Push Square","https://www.pushsquare.com/news/2026/06/gta-6-ultimate-edition-and-more-detailed-ahead-of-pre-orders-going-live","imprensa","2026-06","Conteúdo da Ultimate, incluindo a Rideout Customs."),
  S("Insider Gaming","https://insider-gaming.com/gta-6-ultimate-edition-and-pre-order-bonuses-revealed/","imprensa","2026-06","Itens exclusivos da Ultimate e liberação por capítulo.")],
 faq=[{"q":"Quanto custa GTA 6 no Brasil?","a":"R$ 449,90 na edição padrão e R$ 549,90 na Ultimate Edition, nas lojas oficiais do PS5 e do Xbox."},
  {"q":"O preço de GTA 6 é igual no PS5 e no Xbox?","a":"Sim. Nas lojas digitais oficiais, os dois consoles têm o mesmo preço."},
  {"q":"Qual a diferença entre a edição padrão e a Ultimate?","a":"A Ultimate traz itens extras, como o carro '95 Grotti Cheetah, revólveres próprios e a oficina Rideout Customs, liberados ao longo da história. O jogo, o mapa e os segredos são os mesmos."},
  {"q":"Quanto custa o upgrade para a Ultimate?","a":"R$ 100 na loja do Xbox no Brasil, ou US$ 20 lá fora: a diferença entre as duas edições."},
  {"q":"Por que GTA 6 é tão caro?","a":"A edição padrão custa US$ 79,99, acima dos US$ 69,99 que viraram padrão nos jogos grandes. Em reais, isso virou R$ 449,90."},
  {"q":"Tem GTA 6 de graça ou para celular?","a":"Não. Sites que oferecem GTA 6 de graça ou APK para celular são golpe."},
  {"q":"O que é o pacote Vintage Vice City?","a":"O bônus de quem reservou na pré-venda, em qualquer edição: veículos e roupas inspirados na Vice City dos anos 80."}],
 tags=["preço","quanto custa","valor","edição ultimate","upgrade","pré-venda","onde comprar","ps5","xbox"],
 seo_title="Preço de GTA 6 no Brasil: quanto custa no PS5 e Xbox",
 seo_description="GTA 6 custa R$ 449,90 (padrão) e R$ 549,90 (Ultimate) no PS5 e no Xbox. Veja o que vem em cada edição, o upgrade e onde comprar sem cair em golpe.")

E=[e for e in E if e['id'] not in ('gta6-g001','gta6-g002')]+[lanc,preco]
open("content/seed/entries.json","w").write("[\n"+",\n".join(" "+json.dumps(e,ensure_ascii=False,separators=(",",":")) for e in E)+"\n]\n")
print(len(E))
