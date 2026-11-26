# Missões Secretas GTA

Portal independente de fãs sobre os segredos de GTA 6: missões secretas, lugares escondidos, easter eggs, mistérios, dinheiro e veículos, com fontes e status de verificação em cada página. Não é afiliado à Rockstar Games nem à Take-Two Interactive.

## Rodar

```bash
npm install
cp .env.example .env.local   # defina ADMIN_PASSWORD e SESSION_SECRET para usar o painel
npm run dev                  # http://localhost:3000  ·  painel em /admin/
```

Sem `DATABASE_URL`, o projeto usa um Postgres embutido (PGlite) em `.data/`, já com o conteúdo de `content/seed/`.

## Estado

- O site sobe com `noindex` em tudo. A indexação só é liberada com `SITE_INDEXABLE=true`, depois da revisão humana do conteúdo.
- As 125 fichas vêm do repositório do aplicativo, que é a fonte única dos fatos (`npm run importar:app -- caminho/do/app/conteudo`). Site e aplicativo usam a mesma régua de selos. Nenhuma ficha é "Testado por nós" ainda.
- A landing do aplicativo está em modo "em preparação": os dados reais do produto entram em `src/lib/app-config.ts`.

## Documentação

| Documento | Assunto |
|---|---|
| [01](docs/01-diagnostico-e-estrategia.md) | Diagnóstico, posicionamento, narrativa e **decisões que dependem do fundador** |
| [02](docs/02-analise-concorrencia.md) | Análise de concorrência e lacunas |
| [03](docs/03-arquitetura-urls-e-autoridade.md) | Arquitetura, URLs, autoridade temática, linkagem interna |
| [04](docs/04-design-system.md) | Identidade visual e design system |
| [05](docs/05-banco-de-palavras-chave.md) | Banco mestre de palavras-chave |
| [06](docs/06-seo-aeo-geo-discover.md) | SEO técnico, AEO/GEO, Discover, política de robôs |
| [07](docs/07-conversao-e-analytics.md) | Estratégia comercial, CTAs e mensuração |
| [08](docs/08-documentacao-tecnica.md) | Pilha, dados, painel, integração com o app, publicação |
| [09](docs/09-seguranca-privacidade-e-propriedade-intelectual.md) | Segurança, LGPD, acessibilidade, propriedade intelectual |
| [10](docs/10-relatorio-de-testes.md) | Relatório de testes |
| [11](docs/11-roadmap.md) | Roteiro de crescimento |
| [12](docs/12-auditoria-de-narrativa.md) | Auditoria de narrativa e guia de voz |
| [13](docs/13-alinhamento-site-e-app.md) | Alinhamento entre site e aplicativo |
