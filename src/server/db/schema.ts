// Migrações versionadas. Cada item roda uma única vez (tabela _migrations).
// O mesmo SQL serve para Postgres (Supabase) e para o PGlite local.
export const migrations: { id: string; sql: string }[] = [
  {
    id: "001_init",
    sql: `
create table games (
  id text primary key,
  slug text not null unique,
  name text not null,
  short_name text not null,
  released_on date,
  published boolean not null default false,
  sort int not null default 0
);

create table categories (
  id text primary key,
  game_id text not null references games(id),
  slug text not null,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  intro_md text not null default '',
  icon text not null default 'compass',
  cta_key text,
  seo_title text,
  seo_description text,
  faq jsonb not null default '[]',
  sort int not null default 0,
  published boolean not null default true,
  unique (game_id, slug)
);

create table regions (
  id text primary key,
  game_id text not null references games(id),
  slug text not null,
  name text not null,
  description text not null default '',
  source_url text,
  sort int not null default 0,
  unique (game_id, slug)
);

create table authors (
  id text primary key,
  slug text not null unique,
  name text not null,
  role text not null default '',
  bio text not null default ''
);

create table entries (
  id text primary key,
  app_ref text,
  game_id text not null references games(id),
  category_id text not null references categories(id),
  region_id text references regions(id),
  author_id text references authors(id),
  kind text not null default 'descoberta' check (kind in ('descoberta','guia')),
  slug text not null,
  title text not null,
  direct_answer text not null default '',
  summary text not null default '',
  body_md text not null default '',
  location_text text,
  landmark text,
  coords jsonb,
  character_req text,
  requirements text,
  progress_required text,
  conditions text,
  steps jsonb not null default '[]',
  reward text,
  reward_type text,
  repeatable text,
  missable text,
  common_mistakes jsonb not null default '[]',
  troubleshooting jsonb not null default '[]',
  platform_tested text,
  game_version text,
  last_verified_on date,
  verification_status text not null default 'investigacao'
    check (verification_status in ('confirmado','relato','investigacao','desmentido','desatualizado','mod')),
  evidence_type text not null default 'relatos'
    check (evidence_type in ('oficial','teste_direto','relatos','teoria','vazamento','mod','outra_versao')),
  spoiler_level text not null default 'nenhum' check (spoiler_level in ('nenhum','leve','historia')),
  sources jsonb not null default '[]',
  media jsonb not null default '[]',
  faq jsonb not null default '[]',
  related jsonb not null default '[]',
  tags jsonb not null default '[]',
  seo_title text,
  seo_description text,
  workflow_status text not null default 'rascunho'
    check (workflow_status in ('rascunho','revisao','aprovado','publicado','arquivado')),
  featured boolean not null default false,
  reviewed_by text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);
create index entries_public_idx on entries (workflow_status, published_at);

create table entry_changes (
  id serial primary key,
  entry_id text not null references entries(id) on delete cascade,
  changed_at timestamptz not null default now(),
  kind text not null default 'atualizacao',
  note text not null,
  is_public boolean not null default true
);

create table keywords (
  id serial primary key,
  keyword text not null,
  keyword_norm text not null unique,
  original_terms jsonb not null default '[]',
  sources jsonb not null default '[]',
  first_collected date,
  last_collected date,
  country text,
  language text,
  volume int,
  trend text,
  difficulty int,
  relevance int,
  intent_primary text,
  intent_secondary text,
  cluster text,
  subcluster text,
  entity text,
  game text,
  page_primary_keyword text,
  is_page_primary boolean not null default false,
  planned_url text,
  existing_url text,
  priority text,
  commercial_potential text,
  app_conversion_potential text,
  production_status text not null default 'nao_iniciado',
  indexing_status text,
  needs_update boolean not null default false,
  notes text
);

create table redirects (
  id serial primary key,
  from_path text not null unique,
  to_path text not null,
  code int not null default 301,
  created_at timestamptz not null default now()
);

create table ctas (
  key text primary key,
  eyebrow text not null default '',
  headline text not null,
  body text not null default '',
  button_label text not null,
  active boolean not null default true
);

create table submissions (
  id serial primary key,
  kind text not null check (kind in ('descoberta','correcao','contato')),
  status text not null default 'pendente' check (status in ('pendente','aprovado','rejeitado','spam')),
  name text,
  email text,
  payload jsonb not null default '{}',
  entry_id text,
  ip_hash text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_note text
);

create table waitlist (
  id serial primary key,
  email text not null unique,
  source text,
  consent_at timestamptz not null default now()
);

create table rate_events (
  bucket text not null,
  key text not null,
  at timestamptz not null default now()
);
create index rate_events_idx on rate_events (bucket, key, at);
`,
  },
  {
    // Alinhamento com o aplicativo: mesma regra de selos e as fichas dele como fonte única.
    id: "002_selos_e_fichas_do_app",
    sql: `
alter table entries add column if not exists pin_precision text;
alter table entries add column if not exists pin_evidence text;
alter table entries add column if not exists chapter int not null default 0;
alter table entries add column if not exists reward_value int;
alter table entries drop constraint if exists entries_verification_status_check;
update entries set verification_status = case verification_status
  when 'relato' then 'provavel' when 'investigacao' then 'nao_verificado'
  when 'desatualizado' then 'desmentido' when 'mod' then 'desmentido' else verification_status end;
alter table entries alter column verification_status set default 'nao_verificado';
alter table entries add constraint entries_verification_status_check
  check (verification_status in ('testado','confirmado','provavel','nao_verificado','desmentido'));
delete from entries where reviewed_by is null;
update entries set region_id = null;
delete from regions;
delete from categories c where not exists (select 1 from entries e where e.category_id = c.id);
delete from ctas;
`,
  },
  {
    // Venda do aplicativo: pedidos (Mercado Pago) e acessos (compra ou cortesia).
    id: "003_pedidos_e_acessos",
    sql: `
create table orders (
  id text primary key,
  email text not null,
  amount_cents int not null,
  status text not null default 'pendente' check (status in ('pendente','pago','recusado','estornado')),
  payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create table licenses (
  code text primary key,
  email text,
  origin text not null check (origin in ('compra','cortesia')),
  status text not null default 'ativa' check (status in ('ativa','revogada')),
  order_id text unique references orders(id),
  note text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
`,
  },
  {
    // Ajustes que o dono muda pelo painel, sem novo deploy (ex.: preço do aplicativo).
    id: "004_ajustes",
    sql: `
create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
`,
  },
  {
    // Pix direto no site: o QR Code fica guardado no pedido para a página de acesso mostrar.
    id: "005_pix",
    sql: `
alter table orders add column pix_qr text;
alter table orders add column pix_qr_b64 text;
alter table orders add column pix_expires_at timestamptz;
`,
  },
  {
    // Cortesias em quantidade: um código com várias vagas (cada aparelho ocupa uma) e lotes de códigos.
    id: "006_vagas_e_lotes",
    sql: `
alter table licenses add column max_uses int;
alter table licenses add column batch text;
create index licenses_batch on licenses (batch);
create table license_uses (
  code text not null references licenses(code) on delete cascade,
  device text not null,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (code, device)
);
`,
  },
  {
    // Acesso entregue: quando o e-mail de confirmação saiu (vazio = compra paga sem acesso entregue).
    id: "007_entrega_do_acesso",
    sql: `
alter table orders add column access_email_at timestamptz;
alter table orders add column access_email_error text;
`,
  },
  {
    // "Já comprei" no app instalado do iPhone: código de 6 dígitos por e-mail, válido por 15 minutos.
    id: "008_codigo_de_entrada",
    sql: `
create table login_codes (
  id bigserial primary key,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  used_at timestamptz
);
create index login_codes_email on login_codes (email, expires_at);
`,
  },
  {
    // Conta do comprador: e-mail e senha (só o resumo scrypt fica guardado) e pedidos de nova senha.
    id: "009_contas",
    sql: `
create table accounts (
  email text primary key,
  pass_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table password_resets (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz
);
`,
  },
  {
    // Sem mudança de tabela: só faz o conteúdo-semente rodar de novo e trazer a categoria
    // "Guia do jogador" e os guias novos (o seed nunca sobrescreve o que já existe).
    id: "010_guia_do_jogador",
    sql: `select 1;`,
  },
  {
    // Conceito central do app (27/11/2026): "O segredo a gente revela. A aventura é você quem vive."
    id: "011_chamadas_do_app",
    sql: `
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'O segredo a gente revela. A aventura é você quem vive.', body = 'Segredos, localizações, orientações e vídeos de quem já fez, no seu bolso. R$ 4,20, pagamento único, sem mensalidade.', button_label = 'Conhecer o aplicativo' where key = 'padrao';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'A missão que o jogo não te mostra. O app mostra onde ela começa.', body = 'O resto, a perseguição e o caos, é história sua. O segredo a gente revela; a aventura é você quem vive.', button_label = 'Conhecer o aplicativo' where key = 'missoes';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'O app mostra a porta. Entrar é com você.', body = 'Bunkers e esconderijos com localização e vídeo de quem já foi. O segredo a gente revela; a aventura é sua.', button_label = 'Conhecer o aplicativo' where key = 'lugares';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Saber onde está o dinheiro é metade do assalto.', body = 'A outra metade é escapar com ele. O app mostra o esconderijo e o caminho; a fuga é com você.', button_label = 'Conhecer o aplicativo' where key = 'dinheiro';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Saber onde está o carro não faz a polícia facilitar.', body = 'O app mostra o pino e o vídeo de quem já pegou. Chegar lá inteiro é com você.', button_label = 'Conhecer o aplicativo' where key = 'veiculos';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Quanta aventura você já deixou para trás?', body = 'O app lembra o que você achou e mostra o que ainda falta. O segredo a gente revela; a aventura é sua.', button_label = 'Conhecer o aplicativo' where key = 'colecionaveis';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Tem coisa em Leonida que pouca gente viu.', body = 'O app mostra onde procurar. O que acontece lá é história sua.', button_label = 'Conhecer o aplicativo' where key = 'misterios';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Você conhece GTA 6. Mas conhece tudo que ele esconde?', body = 'Segredos, localizações e vídeos no seu bolso, por R$ 4,20. O segredo a gente revela; a aventura é você quem vive.', button_label = 'Conhecer o aplicativo' where key = 'dicas';
`,
  },
  {
    // Voz da rua (27/11/2026, decisão do Montinho): gíria, sátira e humor nas chamadas do app. "{n} segredos pra meter o loko."
    id: "012_chamadas_na_lingua_da_rua",
    sql: `
update ctas set eyebrow = '{n} segredos pra meter o loko', headline = 'O segredo a gente revela. A aventura é você quem vive.', body = 'Onde tá a grana, o carro raro e o bunker, com mapa e vídeo de quem já fez. R$ 4,20, uma vez só, sem mensalidade.' where key = 'padrao';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Missão que o jogo esconde? A gente entrega onde começa.', body = 'A perseguição e o caos ficam por sua conta, parça. O segredo a gente revela; a aventura é você quem vive.' where key = 'missoes';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'O app mostra a porta. Entrar é contigo, mano.', body = 'Bunker e esconderijo com localização e vídeo de quem já colou lá. O segredo a gente revela; a aventura é sua.' where key = 'lugares';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Saber onde tá a grana é metade do assalto.', body = 'A outra metade é sair vazado com ela. O app mostra o esconderijo e o caminho; a fuga é contigo.' where key = 'dinheiro';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Achar o carro raro é fácil. Quero ver despistar os homi.', body = 'O app dá o pino no mapa e o vídeo de quem já pegou. Chegar lá inteiro é contigo.' where key = 'veiculos';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Quanto rolê você já deixou passar batido?', body = 'O app lembra o que você já achou e mostra o que falta, sem caô. O segredo a gente revela; a aventura é sua.' where key = 'colecionaveis';
update ctas set eyebrow = 'Seu comparsa de bolso', headline = 'Tem coisa em Leonida que pouca gente viu, tá ligado?', body = 'O app mostra onde procurar. O que rola lá é história sua.' where key = 'misterios';
update ctas set eyebrow = '{n} segredos pra meter o loko', headline = 'Tu manja de GTA 6. Mas manja do que ele esconde?', body = 'Mapa, passo a passo e vídeo de quem já fez, por R$ 4,20. Sim, 4,20. Entendedores entenderão.' where key = 'dicas';
`,
  },
  {
    // A 012 chegou ao banco com o número escrito à mão (128). O número agora vem do app: "{n}" vira a contagem do dia.
    id: "013_numero_de_segredos_automatico",
    sql: `
update ctas set eyebrow = replace(eyebrow, '128 segredos', '{n} segredos'), headline = replace(headline, '128 segredos', '{n} segredos'), body = replace(body, '128 segredos', '{n} segredos');
`,
  },
  {
    // De onde veio cada compra: UTM, clique de anúncio e site de origem (primeiro e último toque), quando a pessoa aceitou a medição.
    id: "014_origem_do_pedido",
    sql: `alter table orders add column if not exists attribution jsonb;`,
  },
  {
    // Treino de Leonida: vídeos de dica (YouTube e TikTok tocam; Instagram é link), sempre de terceiros, com crédito.
    // Entram como rascunho e só aparecem depois de aprovados no painel. Cada vídeo pode pertencer a uma dica (entries).
    id: "015_videos_de_dica",
    sql: `
create table if not exists tip_videos (
  id serial primary key,
  entry_id text references entries(id) on delete set null,
  platform text not null check (platform in ('youtube','tiktok','instagram')),
  video_id text not null,
  url text not null,
  title text not null default '',
  creator_name text not null default '',
  creator_url text,
  theme text,
  status text not null default 'rascunho' check (status in ('rascunho','aprovado','rejeitado')),
  note text,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (platform, video_id)
);
create index if not exists tip_videos_entry on tip_videos (entry_id, status, sort);
`,
  },
  {
    // Primeira leva do Treino de Leonida (pesquisa de 27/11/2026): 6 dicas e 24 vídeos, TUDO como rascunho, no conteúdo-semente
    // (content/seed/tips-entries.json e tip-videos.json). Sem mudança de tabela: só faz o seed rodar de novo.
    id: "016_treino_primeira_leva",
    sql: `select 1;`,
  },
  {
    // Treino de Leonida: textos das 6 dicas conferidos nos artigos completos (27/11/2026). Só troca o que ainda é rascunho intocado.
    id: "017_treino_textos_conferidos",
    sql: `
update entries set title = 'Comandos do GTA 6 no PS5 e no Xbox: o que mudou', verification_status = 'provavel', direct_answer = 'No esquema padrão, correr não é mais apertar o X várias vezes: você clica o analógico esquerdo (L3) para correr. Se preferir o jeito antigo, o esquema Clássico troca os botões de correr e agachar, e ainda tem a opção para canhotos. Tudo isso fica em Configurações > Esquema de controle, com prévia de cada botão.', sources = '[{"nome": "GTABase: guia completo de controles", "url": "https://www.gtabase.com/articles/gta-6/gta-6-controls-guide-ps5-xbox-button-layout", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}, {"nome": "Shacknews: controles no PS5", "url": "https://www.shacknews.com/article/151396/gta6-ps5-controls", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}, {"nome": "Push Square: o fim de apertar X para correr", "url": "https://www.pushsquare.com/news/2026/09/its-a-miracle-gta-6-wont-make-you-mash-the-x-button-to-sprint", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}]'::jsonb where id = 'gta6-dica-comandos' and workflow_status = 'rascunho' and reviewed_by is null;
update entries set title = 'Melhores configurações de mira no GTA 6', verification_status = 'provavel', direct_answer = 'Os guias recomendam o modo de mira Parcial: ele ajuda a apontar sem travar no inimigo. Como ponto de partida, a Critical Hits sugere sensibilidade de mira 5 (horizontal) e 6 (vertical) com aceleração 5; a Dexerto sugere 5 e 5, aceleração 4 e zona morta 2 nos dois analógicos. São gostos pessoais: ajuste aos poucos até ficar do teu jeito.', sources = '[{"nome": "Critical Hits: melhores configurações para PS5 e Xbox", "url": "https://criticalhits.com.br/dicas/gta-6-melhores-configuracoes-para-ps5-e-xbox-series-xs", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}, {"nome": "Dexerto: melhores configurações de controle", "url": "https://www.dexerto.com/wikis/gta-6/best-controller-settings/", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}]'::jsonb where id = 'gta6-dica-mira' and workflow_status = 'rascunho' and reviewed_by is null;
update entries set title = 'Como fazer um assalto sem dar errado no GTA 6', verification_status = 'provavel', direct_answer = 'Comece pelos mercadinhos: aponte a arma para o caixa e ameace para ele abrir a registradora. Rende pouco, mas é o assalto mais simples do começo. Joalherias e casas de penhores pagam mais e têm mais segurança, então faça o reconhecimento antes. Bancos só depois que uma missão te der o bloqueador de tinta; lá, o maior risco é alguém disparar o alarme.', sources = '[{"nome": "VGC: como ganhar dinheiro", "url": "https://www.videogameschronicle.com/guide/how-to-make-money-in-gta-6/", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}, {"nome": "PC Gamer: os jeitos mais rápidos de ganhar dinheiro", "url": "https://www.pcgamer.com/games/grand-theft-auto/gta-6-how-to-make-money/", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}]'::jsonb where id = 'gta6-dica-assaltos' and workflow_status = 'rascunho' and reviewed_by is null;
update entries set title = 'Como ganhar dinheiro rápido no começo do GTA 6', verification_status = 'provavel', direct_answer = 'No começo, assaltar mercadinho é rápido mas rende pouco; as missões principais e secundárias pagam bem melhor. A partir do Capítulo 2 dá para vender carros sem rastreador para o Moses, de US$ 1.000 a US$ 5.000 cada, segundo a VGC. E leve a grana ao banco: o dinheiro do bolso pode ser perdido se você for preso ou morrer.', sources = '[{"nome": "VGC: como ganhar dinheiro", "url": "https://www.videogameschronicle.com/guide/how-to-make-money-in-gta-6/", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}, {"nome": "PC Gamer: os jeitos mais rápidos de ganhar dinheiro", "url": "https://www.pcgamer.com/games/grand-theft-auto/gta-6-how-to-make-money/", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}]'::jsonb where id = 'gta6-dica-dinheiro' and workflow_status = 'rascunho' and reviewed_by is null;
update entries set title = 'Como despistar a polícia no GTA 6', verification_status = 'provavel', direct_answer = 'O nível de procurado vai até 6 estrelas. Para fugir, entre em becos e ruas laterais para quebrar a linha de visão e saia da área de busca sem ser visto: as estrelas piscam e somem. Mas a polícia continua procurando na área quente marcada no mapa. Se for voltar lá, troque de roupa numa loja e de carro, ou pinte o seu na oficina. Se a polícia procura um casal, separe Jason e Lucia.', sources = '[{"nome": "GTABase: procurado e área quente", "url": "https://www.gtabase.com/articles/gta-6/gta-6-wanted-level-explained-police-system-guide", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}, {"nome": "Dexerto: como despistar a polícia", "url": "https://www.dexerto.com/wikis/gta-6/how-to-lose-the-police/", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}]'::jsonb where id = 'gta6-dica-direcao' and workflow_status = 'rascunho' and reviewed_by is null;
update entries set title = 'Combate no GTA 6: o básico', verification_status = 'nao_verificado', direct_answer = 'No corpo a corpo, o contra-ataque e a esquiva funcionam logo antes do golpe do inimigo chegar. Em cobertura, dá para contornar a quina sem se expor. E o menu de equipamento reúne armas, itens, acessórios e colete: deixe tudo pronto antes do tiroteio.', sources = '[{"nome": "GTABase: guia completo de controles", "url": "https://www.gtabase.com/articles/gta-6/gta-6-controls-guide-ps5-xbox-button-layout", "tipo": "imprensa", "data": "2026-11-27", "nota": "Lido na íntegra em 27/11/2026."}]'::jsonb where id = 'gta6-dica-combate' and workflow_status = 'rascunho' and reviewed_by is null;
`,
  },
  {
    // O Montinho mandou publicar as 6 dicas do Treino de Leonida (27/11/2026, depois de aprovar os vídeos no painel).
    id: "018_treino_publicar_dicas",
    sql: `
update entries set workflow_status = 'publicado', reviewed_by = 'Montinho', published_at = now(), updated_at = now()
  where category_id = 'gta6-dicas' and tags @> '["treino-de-leonida"]'::jsonb and workflow_status = 'rascunho';
insert into entry_changes (entry_id, kind, note)
  select id, 'criacao', 'Dica do Treino de Leonida publicada, com fontes lidas e vídeos aprovados.' from entries e
  where category_id = 'gta6-dicas' and tags @> '["treino-de-leonida"]'::jsonb and workflow_status = 'publicado'
    and not exists (select 1 from entry_changes c where c.entry_id = e.id);
`,
  },
  {
    // Duas fichas novas pedidas pelo Montinho em 28/11/2026 (bonés do Mario e Growler rosa da Vanessa), no conteúdo-semente
    // (content/seed/radar-entries.json). Sem mudança de tabela: só faz o seed rodar de novo.
    id: "019_fichas_do_radar_28_11",
    sql: `select 1;`,
  },
];
