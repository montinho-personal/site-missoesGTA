import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";

const archivo = localFont({ src: "../fonts/archivo.woff2", variable: "--font-archivo", weight: "100 900", display: "swap" });
const inter = localFont({ src: "../fonts/inter.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: segredos, missões secretas e descobertas de GTA 6`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  // Chave de publicação: sem SITE_INDEXABLE=true nada é indexado.
  robots: site.indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false },
  openGraph: { type: "website", siteName: site.name, locale: "pt_BR" },
  twitter: { card: "summary_large_image" },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#07060f", colorScheme: "dark", width: "device-width", initialScale: 1 };

// Aplica a preferência de spoilers antes da primeira pintura (sem piscar).
const boot = `try{document.documentElement.dataset.spoilers=localStorage.getItem("gs:spoilers")==="off"?"off":"on"}catch(e){document.documentElement.dataset.spoilers="on"}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-spoilers="on" className={`${archivo.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: boot }} /></head>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
