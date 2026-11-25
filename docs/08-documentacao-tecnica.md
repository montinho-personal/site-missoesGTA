# 08 · Documentação técnica

## Pilha e justificativa

| Escolha | Por quê | Alternativa descartada |
|---|---|---|
| **Next.js 16 (App Router) + React 19 + TypeScript** | HTML estático com revalidação (bom para SEO e Core Web Vitals), ações de servidor para formulários e painel, um só projeto | Astro: ótimo para conteúdo, mas o painel e as ações pediriam um segundo serviço |
| **Modelo de cache clássico** (`cacheComponents: false`) | Garante HTML completo e status 404 real. O modelo novo (Cache Components) serve uma casca com conteúdo em streaming para endereços desconhecidos, o que arrisca "soft 404" | Cache Components: reavaliar quando estabilizar |
| **Tailwind CSS 4** + tokens em CSS | Design system em um arquivo, CSS final pequeno | CSS-in-JS: custo de execução no cliente |
| **PostgreSQL** | Fonte única para site e aplicativo; JSONB para campos de lista; qualquer provedor serve | CMS de terceiros: custo e dependência; Markdown no Git: sem painel |
| **PGlite** (Postgres em WebAssembly) quando não há `DATABASE_URL` | Mesmo SQL em desenvolvimento, teste e build; o projeto roda com `npm run dev` sem instalar nada | SQLite: SQL diferente do de produção |
| **MiniSearch** no navegador | Busca instantânea com tolerância a erro, sem serviço pago; o índice é um JSON estático de poucos KB | Algolia/Typesense: desnecessário neste volume. Rever acima de ~2.000 registros |
| Fontes locais, ícones e ilustração próprios | Zero requisição a terceiros na primeira carga | |

## Estrutura

```
content/seed/            conteúdo inicial (jogos, categorias, regiões, autores, CTAs, descobertas)
data/keywords/           coleta bruta e banco mestre de palavras-chave
data/research/           apuração com fontes que originou o conteúdo inicial
docs/                    esta documentação
scripts/db.ts            migrações, seed e carga de palavras-chave
scripts/keywords.ts      gera o banco mestre em CSV/JSON
src/app/(site)/          páginas públicas
src/app/admin/           painel
src/components/          design system
src/lib/                 configuração, tipos, rótulos, busca, analytics, regras de palavras-chave
src/server/              banco, consultas, ações, autenticação, segurança
tests/                   testes unitários (vitest) e de ponta a ponta (Playwright)
```

## Comandos

```bash
npm run dev            # desenvolvimento (banco local em .data/)
npm run build && npm start
npm test               # testes unitários
npm run lint && npm run typecheck
npm run keywords       # regenera data/keywords/banco-mestre.*
npm run db:migrate     # aplica migrações (use com DATABASE_URL)
npm run db:seed        # carrega o conteúdo inicial, sem sobrescrever
npm run db:keywords    # carrega a coleta de palavras-chave no banco
BASE=http://localhost:3000 ADMIN_PASSWORD=... node tests/e2e.mjs
```

## Variáveis de ambiente

Ver `.env.example`. As que mudam comportamento: `SITE_INDEXABLE` (chave de publicação), `DATABASE_URL` (sem ela o banco é local/efêmero e os formulários ficam desativados em produção), `ADMIN_PASSWORD` + `SESSION_SECRET` (sem elas o painel não existe), `NEXT_PUBLIC_GTM_ID`.

## Modelo de dados

`games` → `categories`, `regions` → `entries` (descobertas e guias) → `entry_changes` (histórico público). Apoio: `authors`, `ctas`, `redirects`, `keywords`, `submissions`, `waitlist`, `rate_events`.

Campos de `entries` cobrem os 25 itens do padrão editorial do briefing. Três convenções:

- Campo de texto `null` = "Ainda não confirmado"; valor `n/a` = "Não se aplica".
- `workflow_status` (rascunho → revisão → aprovado → publicado → arquivado) é separado de `verification_status` (confirmado, relato, investigação, desmentido, desatualizado, mod).
- Só aparece no site o que está `publicado` **e** com `published_at` no passado. Data futura é agendamento.

Colunas JSONB recebem texto com cast `$n::text::jsonb` (ver comentário em `src/server/db/index.ts`; o cast direto grava JSON duplamente codificado no driver `postgres`).

## Painel (`/admin/`)

| Tela | Faz |
|---|---|
| Visão geral | Contagens por fluxo e por verificação, envios pendentes, lista de espera, agendadas, publicadas sem fonte, sem revisor e sem teste há mais de 60 dias |
| Descobertas e guias | Criar e editar todos os campos, SEO, fontes, mídia, FAQ, relacionados, agendamento, nota de histórico |
| Envios da comunidade | Aprovar, rejeitar, marcar spam, com nota interna |
| Categorias | Textos, SEO, FAQ, CTA, ordem, visibilidade |
| Palavras-chave | Filtrar, classificar, planejar URL, importar CSV |
| CTAs | Criar e editar chamadas por chave |
| Redirecionamentos | Criar e remover (só caminhos internos) |

Travas editoriais no servidor (valem também para texto gerado por IA): publicar exige resposta rápida, ao menos uma fonte (ou teste direto) e nome do revisor; "Confirmado" exige fonte oficial ou teste direto com plataforma e data.

**Limitações conhecidas do painel:** um único usuário (senha em variável de ambiente), sem perfis nem trilha de quem alterou; imagens entram por URL (não há upload, porque depende do serviço de armazenamento a contratar); autores e regiões são editados por seed/SQL; aprovar um envio não cria o registro automaticamente.

## Integração com o aplicativo (preparada, não ligada)

- Cada descoberta tem identificador estável (`gta6-0001`), exibido como "Arquivo", e o campo `app_ref` para o identificador correspondente no aplicativo.
- Com `deepLinkBase` definido em `app-config.ts`, a página mostra "Abrir esta descoberta no aplicativo".
- O banco Postgres pode ser a fonte única para os dois produtos. Recomendo expor ao aplicativo uma **API de leitura própria, versionada**, em vez de acesso direto às tabelas.
- `/search-index.json` é público e contém só o que o site já mostra. Nada premium deve ser exposto por rota pública.
- Atribuição de conversão: padronizar `utm_source=portal&utm_content={id}` no link de compra quando ele existir.

Nada disso foi conectado, porque não há aplicativo para analisar. Não modifiquei nenhum sistema existente.

## Publicação (passo a passo)

1. Criar o banco Postgres e definir `DATABASE_URL`.
2. `npm run db:migrate && npm run db:seed && npm run db:keywords`.
3. Definir `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (32+ caracteres aleatórios).
4. Publicar (Vercel ou qualquer host Node). Conferir o site ainda com `noindex`.
5. Revisar cada descoberta no painel, assinar a revisão e, de preferência, testar no jogo.
6. Só então definir `SITE_INDEXABLE=true`, enviar o sitemap ao Search Console e ao Bing.

## Domínio e HostGator

Domínio: `missoessecretasgta.com.br`, na HostGator.

O site **não roda em hospedagem compartilhada comum** (cPanel só com PHP): ele precisa de um servidor Node.js para o painel, os formulários, os redirecionamentos e a revalidação das páginas, além de um banco PostgreSQL. Caminhos possíveis:

| Caminho | O que muda | Avaliação |
|---|---|---|
| **A. Domínio continua na HostGator, site na Vercel** | Só o DNS: na zona do domínio, os registros que a Vercel indicar ao adicionar o domínio ao projeto (um registro A para a raiz e um CNAME para `www`). E-mail e registro seguem na HostGator. | **Recomendado.** CDN, HTTPS e deploy automático a cada push. |
| B. VPS da HostGator | Instalar Node 22, Postgres, proxy reverso, certificado, processo sempre ativo, backups. | Funciona, mas a manutenção é toda manual. |
| C. Exportação estática para o cPanel | Subir só HTML/CSS/JS. | **Não recomendado:** perde painel, envio de descobertas, lista de aviso, redirecionamentos e atualização sem rebuild. |

Canônico: `https://missoessecretasgta.com.br` (sem `www`); `www` deve redirecionar para a raiz, o que a Vercel faz ao configurar os dois nomes.
