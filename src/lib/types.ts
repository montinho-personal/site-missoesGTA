export type VerificationStatus = "testado" | "confirmado" | "provavel" | "nao_verificado" | "desmentido";
export type PinPrecision = "exato" | "perto" | "regiao";
export type EvidenceType = "oficial" | "teste_direto" | "relatos" | "teoria" | "vazamento" | "mod" | "outra_versao";
export type SpoilerLevel = "nenhum" | "leve" | "historia";
export type WorkflowStatus = "rascunho" | "revisao" | "aprovado" | "publicado" | "arquivado";
export type EntryKind = "descoberta" | "guia";

export interface Source { nome: string; url: string; tipo?: string; data?: string | null; nota?: string | null }
export interface Media { tipo: "imagem" | "video"; url: string; alt: string; credito?: string; largura?: number; altura?: number }
export interface Faq { q: string; a: string }
export interface Fix { problema: string; solucao: string }

export interface Category {
  id: string; game_id: string; slug: string; name: string; tagline: string; description: string;
  intro_md: string; icon: string; cta_key: string | null; seo_title: string | null; seo_description: string | null;
  faq: Faq[]; sort: number; published: boolean; entry_count?: number;
}
export interface Region { id: string; game_id: string; slug: string; name: string; description: string; source_url: string | null; sort: number; entry_count?: number }
export interface Author { id: string; slug: string; name: string; role: string; bio: string }
export interface Cta { key: string; eyebrow: string; headline: string; body: string; button_label: string; active: boolean }

export interface Entry {
  id: string; app_ref: string | null; game_id: string; category_id: string; region_id: string | null; author_id: string | null;
  kind: EntryKind; slug: string; title: string; direct_answer: string; summary: string; body_md: string;
  location_text: string | null; landmark: string | null; coords: { x: number; y: number } | null;
  pin_precision: PinPrecision | null; pin_evidence: string | null; chapter: number; reward_value: number | null;
  character_req: string | null; requirements: string | null; progress_required: string | null; conditions: string | null;
  steps: string[]; reward: string | null; reward_type: string | null; repeatable: string | null; missable: string | null;
  common_mistakes: string[]; troubleshooting: Fix[]; platform_tested: string | null; game_version: string | null;
  last_verified_on: string | null; verification_status: VerificationStatus; evidence_type: EvidenceType;
  spoiler_level: SpoilerLevel; sources: Source[]; media: Media[]; faq: Faq[]; related: string[]; tags: string[];
  seo_title: string | null; seo_description: string | null; workflow_status: WorkflowStatus; featured: boolean;
  reviewed_by: string | null; published_at: string | null; created_at: string; updated_at: string;
  // joins
  category_slug: string; category_name: string; category_icon: string; category_cta: string | null;
  region_slug: string | null; region_name: string | null; game_slug: string;
  author_name: string | null; author_slug: string | null;
}

export interface EntryChange { id: number; entry_id: string; changed_at: string; kind: string; note: string; is_public: boolean; title?: string; url?: string; verification_status?: VerificationStatus }

/** Versão enxuta enviada ao navegador (cards, filtros e busca). */
export interface EntryCardData {
  id: string; url: string; title: string; answer: string; kind: EntryKind;
  cat: string; catName: string; icon: string; region: string | null; regionName: string | null;
  status: VerificationStatus; spoiler: SpoilerLevel; rewardType: string | null; character: string | null;
  updated: string; tags: string[];
}
