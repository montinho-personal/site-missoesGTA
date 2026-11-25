import type { MetadataRoute } from "next";
import { abs, site } from "@/lib/site";

// Política de rastreadores (justificativa em docs/06-seo-aeo-geo-discover.md):
// - Busca tradicional e busca com IA que cita a fonte: liberadas.
// - Coleta para TREINAR modelos, sem retorno de tráfego: bloqueada.
const SEARCH_AND_ANSWER_BOTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User", "DuckAssistBot", "Applebot"];
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "anthropic-ai", "Google-Extended", "CCBot", "Applebot-Extended", "Bytespider", "meta-externalagent", "Amazonbot", "cohere-ai"];
const PRIVATE = ["/admin/", "/busca/", "/favoritos/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  // Antes do lançamento (SITE_INDEXABLE != true) ninguém rastreia nada.
  if (!site.indexable) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: SEARCH_AND_ANSWER_BOTS, allow: "/", disallow: PRIVATE },
      { userAgent: TRAINING_BOTS, disallow: "/" },
    ],
    sitemap: abs("/sitemap.xml"),
    host: site.url,
  };
}
