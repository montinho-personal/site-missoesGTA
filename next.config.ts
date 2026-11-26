import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CSP sem nonce de propósito: nonce obrigaria renderização dinâmica e mataria
// o HTML estático. Ver docs/09-seguranca-privacidade.md.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://sdk.mercadopago.com https://*.mercadopago.com https://http2.mlstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  // Mercado Pago: o formulário de cartão (Card Payment Brick) roda em iframes e scripts deles.
  "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com",
  "frame-src https://www.youtube-nocookie.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.mercadopago.com.br https://sandbox.mercadopago.com.br",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Modelo de cache clássico (ISR + revalidatePath): HTML 100% estático e
  // status 404 real para slugs inexistentes. Ver docs/08-documentacao-tecnica.md.
  cacheComponents: false,
  trailingSlash: true,
  poweredByHeader: false,
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  // As imagens de Stories leem a fonte e as artes do disco: precisam ir junto para a função.
  outputFileTracingIncludes: {
    "/[game]/[categoria]/[slug]/story": ["./src/fonts/*.woff", "./public/arte/story/*.jpg"],
    "/app/story": ["./src/fonts/*.woff", "./public/arte/story/*.jpg"],
  },
  images: { formats: ["image/avif", "image/webp"] },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
