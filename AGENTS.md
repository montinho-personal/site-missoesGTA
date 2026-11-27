<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SerpApi: cota única de todos os sites

- A conta do SerpApi é uma só para todos os sites do Renato (plano de 1.000 buscas por mês).
- Este site usa no máximo **3 chamadas por dia** no Radar diário (~90 por mês) e até **24 na rotina mensal do dia 16** (visão de IA e ideias de artigo).
- A busca comum (WebSearch) vem primeiro.
- Se o SerpApi disser que a cota acabou ou der limite de requisições, pare de usá-lo e avise o Renato. Nada de pesquisar às cegas.
