import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A imagem que aparece quando alguém manda um link do site no WhatsApp, Instagram, X ou Telegram.
// Identidade do app: céu de anoitecer, sol de fim de tarde riscado, coqueiros e o pino no mapa (o lugar vem primeiro).
// Tudo desenhado aqui: nada da Rockstar.
export const OG_SIZE = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/fonts/archivo-800.woff")),
  readFile(join(process.cwd(), "src/fonts/archivo-600.woff")),
]);

const C = { fundo: "#150d2b", painel: "#2b1d57", texto: "#fdf4ff", apagado: "#cfc0ea", rosa: "#ff5c9d", laranja: "#ff8a5c", ouro: "#ffc457" };
const POENTE = `linear-gradient(90deg, ${C.rosa} 0%, ${C.laranja} 60%, ${C.ouro} 100%)`;

export interface OgCard {
  eyebrow: string;
  title: string;
  /** Selos embaixo do título (status, região, preço...). */
  chips?: string[];
  /** Chamada no botão. */
  cta: string;
  /** Cor do pino (a cor da categoria no mapa do app). */
  pin?: string;
  /** O que vai dentro do pino: "?" (segredo), "$", "R$"... */
  glyph?: string;
}

function Palm({ x, h, flip }: { x: number; h: number; flip?: boolean }) {
  // Coqueiro em silhueta: tronco curvo e seis folhas.
  return (
    <svg width={220} height={h} viewBox="0 0 220 400" style={{ position: "absolute", left: x, bottom: 0, ...(flip ? { transform: "scaleX(-1)" } : {}) }}>
      <path d="M112 400 C 108 320, 96 240, 118 150 L 126 150 C 108 240, 122 320, 128 400 Z" fill="#0b0716" />
      <path d="M122 150 C 80 120, 40 125, 6 160 C 46 140, 84 142, 122 156 Z" fill="#0b0716" />
      <path d="M122 150 C 150 110, 190 104, 218 126 C 182 118, 152 128, 124 158 Z" fill="#0b0716" />
      <path d="M122 150 C 110 100, 76 72, 36 70 C 74 86, 100 112, 118 156 Z" fill="#0b0716" />
      <path d="M122 150 C 140 96, 172 70, 206 66 C 172 88, 146 116, 126 158 Z" fill="#0b0716" />
      <path d="M122 150 C 96 150, 66 178, 52 214 C 76 186, 98 170, 124 158 Z" fill="#0b0716" />
      <path d="M122 150 C 150 154, 176 180, 186 214 C 164 188, 146 172, 122 160 Z" fill="#0b0716" />
    </svg>
  );
}

export async function ogImage(card: OgCard): Promise<ImageResponse> {
  const [a800, a600] = await fonts;
  const t = card.title;
  const size = t.length > 70 ? 50 : t.length > 48 ? 58 : t.length > 30 ? 66 : 76;
  const pin = card.pin ?? C.rosa;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: `linear-gradient(180deg, ${C.painel} 0%, ${C.fundo} 55%, #3a1a4e 100%)`, fontFamily: "Archivo", color: C.texto }}>
        {/* Sol de fim de tarde, riscado embaixo */}
        <div style={{ position: "absolute", right: 70, top: 150, width: 380, height: 380, borderRadius: 999, display: "flex", background: `linear-gradient(180deg, ${C.ouro} 0%, ${C.laranja} 52%, ${C.rosa} 100%)`, boxShadow: "0 0 120px rgba(255,92,157,0.55)" }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", right: 60, top: 352 + i * 30, width: 400, height: 6 + i * 2, background: C.fundo, display: "flex" }} />
        ))}
        {/* Horizonte e mar */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 108, display: "flex", background: "linear-gradient(180deg, #2a1240 0%, #120a24 100%)", borderTop: `3px solid ${C.rosa}` }} />
        <Palm x={690} h={360} />
        <Palm x={1010} h={300} flip />
        {/* O pino: o lugar vem primeiro */}
        <div style={{ position: "absolute", right: 205, top: 78, width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "75px 75px 75px 0", transform: "rotate(-45deg)", background: pin, border: `8px solid ${C.texto}`, boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
          <div style={{ display: "flex", transform: "rotate(45deg)", fontSize: card.glyph && card.glyph.length > 1 ? 46 : 70, fontWeight: 800, color: C.fundo }}>{card.glyph ?? "?"}</div>
        </div>
        {/* Texto */}
        <div style={{ position: "absolute", left: 64, top: 52, width: 640, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
            <span>MISSÕES SECRETAS</span><span style={{ marginLeft: 10, color: C.rosa }}>GTA 6</span>
          </div>
          <div style={{ display: "flex", marginTop: 46, fontSize: 24, fontWeight: 600, letterSpacing: 4, color: C.ouro, textTransform: "uppercase" }}>{card.eyebrow}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: size, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>{t}</div>
          {card.chips && card.chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 22 }}>
              {card.chips.slice(0, 3).map((c) => (
                <div key={c} style={{ display: "flex", marginRight: 12, marginBottom: 10, padding: "8px 18px", borderRadius: 999, border: `2px solid ${C.apagado}`, fontSize: 22, fontWeight: 600, color: C.texto, background: "rgba(21,13,43,0.75)" }}>{c}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ position: "absolute", left: 64, bottom: 30, display: "flex", alignItems: "center", padding: "14px 28px", borderRadius: 999, background: POENTE, color: "#2a0618", fontSize: 28, fontWeight: 800, boxShadow: "0 10px 30px rgba(255,92,157,0.5)" }}>{card.cta} →</div>
        <div style={{ position: "absolute", right: 28, bottom: 14, display: "flex", fontSize: 16, fontWeight: 600, color: C.apagado }}>Guia não oficial de fãs</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Archivo", data: a800, weight: 800, style: "normal" }, { name: "Archivo", data: a600, weight: 600, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
