# 03 · Arquitetura do site, URLs, autoridade temática e linkagem interna

## Estrutura de URLs (implementada)

```
/                                   home
/gta-6/                             pilar do jogo (fatos básicos, categorias, regiões, FAQ)
/gta-6/segredos/                    pilar "todos os segredos" (lista completa com filtros)
/gta-6/{categoria}/                 hub de categoria (9 categorias)
/gta-6/{categoria}/{slug}/          descoberta ou guia
/gta-6/mapa/                        regiões de Leonida
/gta-6/mapa/{regiao}/               descobertas de uma região
/app/                               landing do aplicativo
/radar/  /metodologia/  /sobre/  /ajuda/  /contato/  /enviar-descoberta/
/privacidade/  /termos/
/busca/  /favoritos/                noindex
/admin/…                            noindex, bloqueado no robots
```

- Barra final em todas as URLs, minúsculas, sem acento, sem parâmetros.
- O segmento do jogo é dinâmico (`[game]`): publicar `/gta-5/` no futuro é inserir linhas no banco. **Nenhuma página de outro jogo existe hoje**; `/gta-5/` responde 404.
- Mudança de slug ou de categoria de um registro publicado cria o redirecionamento 301 sozinha (testado).

## Categorias: o que foi validado com dados

| Categoria publicada | Sugestões do briefing absorvidas | Evidência |
|---|---|---|
| Missões secretas e encontros | Missões secretas + Eventos e encontros | Mesma intenção; "missão secreta do Bigfoot", "missões secundárias" |
| Lugares secretos | | "bunker secreto", "lugares" (ainda sem registro confiável: página aparece como "Em apuração") |
| Easter eggs | | "easter eggs tower", "dexter", "cj", "vice city portal" |
| Mistérios | | "mistérios", "localização das esfinges" |
| Dinheiro e recompensas | Dinheiro + Tesouros + Cofres | "cofre boliche", "tesouros", "dinheiro infinito" |
| Carros e veículos | | "carro do brian", "carros lendários", "como registrar um carro" |
| Armas e itens raros | Armas e equipamentos + Itens raros | Demanda pequena e sobreposta (10 termos) |
| Colecionáveis | | Atenção: a SERP de "colecionáveis" é dominada pela **edição de colecionador**. A página deixa claro que trata do que há dentro do jogo. |
| Dicas e tutoriais | Dicas + Guias para iniciantes + parte da Central de ajuda | "como trocar de personagem", "como salvar o jogo", "como dar seta" |

Não viraram categoria agora, com justificativa: **História e missões** (spoiler; roteiro), **Códigos** (um guia dentro de Dicas, quando testado), **Personagens** e **Produto/lançamento** (fora do posicionamento; FAQ).

## Mapa de autoridade temática

```
                       /gta-6/  (pilar do jogo)
                          │
        ┌─────────────────┼──────────────────────┐
  /gta-6/segredos/   /gta-6/mapa/           /gta-6/dicas/
  (pilar exploração)  (pilar regiões)       (pilar mecânicas)
        │                  │                      │
  missões · lugares ·   vice-city · keys ·   salvar · guardar carros ·
  easter eggs ·         port-gellhorn · …    trocar personagem · dinheiro
  mistérios · dinheiro ·
  veículos · armas ·
  colecionáveis
        │
   descobertas (satélites): cada uma liga para a categoria, a região,
   3 relacionadas, a metodologia e o CTA contextual do aplicativo
```

Regra de canibalização: **uma intenção, uma página.** Variações de palavra-chave ficam como tags e sinônimos de busca dentro do registro, e não como páginas novas. O banco de palavras-chave marca a "palavra-chave principal da página" para impedir duas páginas com o mesmo alvo.

## Linkagem interna (implementada)

| De | Para | Como |
|---|---|---|
| Home | 9 categorias, destaques, radar, app | Cards e listas |
| Hub do jogo | categorias, regiões, guias de iniciante | Cards e chips |
| Categoria | todas as suas descobertas; demais categorias | Lista completa no HTML + navegação "Outras categorias" |
| Descoberta | categoria (trilha), 3 relacionadas, metodologia, envio de correção, app | Relacionadas: escolha editorial primeiro, depois mesma região, mesma categoria e tags em comum |
| Região | descobertas da região | Lista |
| Rodapé | todas as categorias e páginas institucionais | Em todas as páginas |
| Radar | descobertas alteradas | Histórico |

Toda descoberta fica a no máximo 2 cliques da home (home → categoria → descoberta) e a 1 clique pela busca.

## Controle de indexação

- `noindex`: busca interna, favoritos, painel, regiões sem nenhum registro.
- Filtros funcionam no navegador e **não geram URL**; não existe combinação de filtro indexável.
- Regiões vazias também ficam fora do sitemap até terem conteúdo.
- Categoria vazia continua indexável, porque tem texto próprio e explica o estado "em apuração". Hipótese a revisar no Search Console: se "Lugares secretos" seguir vazia por semanas, aplicar `noindex`.
