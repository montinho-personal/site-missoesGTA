# 09 · Segurança, privacidade, acessibilidade e propriedade intelectual

## Segurança

| Risco | Medida | Estado |
|---|---|---|
| XSS | React escapa todo texto; Markdown renderizado sem HTML bruto; envios da comunidade exibidos como texto puro (testado com `<script>`); links de evidência só `http(s)` (testado com `javascript:`) | Implementado e testado |
| Injeção de SQL | Todas as consultas usam parâmetros; nenhum valor de usuário é concatenado | Implementado |
| CSRF | Ações de servidor do Next conferem a origem; cookie do painel é `SameSite=Strict`, `HttpOnly`, restrito a `/admin` | Implementado |
| Acesso ao painel | Toda página e toda ação chamam `requireAdmin()`; sem as variáveis o painel não existe; não há senha padrão; comparação em tempo constante; sessão de 8 h assinada com HMAC | Implementado e testado |
| Força bruta e spam | Limite por janela guardado no banco: 6 tentativas de login em 15 min, 5 envios por hora; campo isca e tempo mínimo de preenchimento | Implementado |
| Redirecionamento aberto | Redirecionamentos só aceitam caminhos internos | Implementado |
| Cabeçalhos | CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` | Implementado e testado |
| Segredos | Só em variáveis de ambiente; `.env*` fora do Git; nada sensível vai ao navegador | Implementado |

Pontos em aberto, por ordem de importância:

1. **CSP com `'unsafe-inline'` em scripts.** Foi a troca consciente para manter as páginas estáticas (nonce exigiria renderização por requisição). As demais diretivas são restritas. Melhorar com hashes quando o Next oferecer isso para páginas estáticas.
2. **Painel de um usuário só.** Para equipe, migrar para login individual com segundo fator (Supabase Auth ou similar) e registro de quem alterou o quê.
3. **Backups, registro de erros e monitoramento** dependem da infraestrutura escolhida: ativar backup diário do Postgres e um serviço de erros (Sentry ou equivalente) na publicação.
4. **Limite de requisições na borda** (WAF/Firewall da hospedagem) para as rotas de formulário, além do limite no banco.
5. Rodar `npm audit` no CI. Hoje: 0 vulnerabilidades reportadas na instalação.

## Privacidade e LGPD

- O site inteiro funciona **sem cadastro**. Favoritos, preferência de spoiler e histórico de busca ficam só no navegador; o histórico é opcional e desligado por padrão.
- Medição de audiência só carrega após aceite explícito; recusar tem o mesmo destaque que aceitar; a escolha pode ser revista no rodapé.
- Formulários coletam o mínimo; nome e e-mail são opcionais; consentimento por caixa não marcada.
- IP nunca é guardado: só um hash com sal, por até 24 h, para limitar abuso.
- `/privacidade/` e `/termos/` são **textos-base**. Antes do lançamento precisam de: identificação do controlador (nome ou razão social e CNPJ/CPF), canal de contato do encarregado, e revisão por advogado. Isso não foi inventado.

## Acessibilidade (WCAG 2.2 AA)

Implementado: contraste de todos os pares acima de 4,5:1; foco visível de 3 px; link "pular para o conteúdo"; navegação inteira por teclado; diálogos nativos (`<dialog>`) com foco preso e fechamento por Esc; rótulos em todos os campos; mensagens de erro ligadas ao campo e anunciadas; alvos de toque de 40 px ou mais; `prefers-reduced-motion` respeitado; ícones decorativos ocultos de leitores de tela; idioma declarado.

Verificado: axe-core sem violações em 6 páginas-modelo; Lighthouse acessibilidade 100 em 3 páginas.

**Não verificado:** teste manual com leitor de tela (NVDA, VoiceOver, TalkBack) e com usuários reais. Ferramenta automática encontra só parte dos problemas.

## Propriedade intelectual e independência

- Aviso de independência no rodapé de todas as páginas, no Sobre, nos Termos, na landing do aplicativo e no `llms.txt`.
- **Nenhum** logotipo, fonte, captura de tela, mapa, arte ou trilha da Rockstar/Take-Two é usado. Ilustração, ícones e paleta são originais.
- Nomes do jogo, de personagens e de lugares aparecem em uso nominativo, para identificar do que se fala.
- Conteúdo das descobertas: fatos apurados em veículos citados, redigidos com palavras próprias, com link para cada fonte. Nenhum texto foi copiado.
- Vazamentos e material obtido ilegalmente não são fonte, por regra editorial pública.

Pontos para avaliação jurídica (decisão sua): o uso de "GTA" no nome e no domínio; a política para capturas de tela e vídeos do jogo (em geral tolerados para comentário e guia, mas sujeitos às regras da editora); o uso da marca em anúncios e nas lojas de aplicativos, onde as regras são mais rígidas.
