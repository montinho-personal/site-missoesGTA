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
];
