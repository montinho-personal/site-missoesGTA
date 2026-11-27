import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Imagem vertical 1080 × 1920 para Stories do Instagram e Status do WhatsApp.
// Arte da categoria no topo, gancho em pergunta, título grande, e o terço de baixo
// com espaço para o adesivo de link que a pessoa cola por cima.
export const STORY_SIZE = { width: 1080, height: 1920 };

const root = process.cwd();
const load = (p: string) => readFile(path.join(root, p));
let fonts: Promise<{ name: string; data: Buffer; weight: 600 | 800; style: "normal" }[]> | null = null;
const getFonts = () => (fonts ??= Promise.all([
  load("src/fonts/archivo-800.woff").then((data) => ({ name: "Archivo", data, weight: 800 as const, style: "normal" as const })),
  load("src/fonts/archivo-600.woff").then((data) => ({ name: "Archivo", data, weight: 600 as const, style: "normal" as const })),
]));

async function art(name: string): Promise<string | null> {
  try { return `data:image/jpeg;base64,${(await load(`public/arte/story/${name}.jpg`)).toString("base64")}`; } catch { return null; }
}

export async function storyCard(o: { hook: string; title: string; chips: string[]; footer: string; art: string; accent?: string }) {
  const accent = o.accent ?? "#ff4d9d";
  const domain = site.url.replace(/^https?:\/\//, "");
  const [f, img] = await Promise.all([getFonts(), art(o.art)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", color: "#f5f3ff", fontFamily: "Archivo", background: "linear-gradient(180deg,#0c0b19 0%,#140f2c 55%,#3a1450 82%,#8a1f6b 100%)" }}>
        <div style={{ position: "relative", display: "flex", width: 1080, height: 760 }}>
          {/* Satori (gerador da imagem) só entende <img> puro; next/image não se aplica aqui. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt="" width={1080} height={760} style={{ position: "absolute", top: 0, left: 0 }} />}
          <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 760, background: "linear-gradient(180deg,rgba(12,11,25,.75) 0%,rgba(12,11,25,0) 26%,rgba(12,11,25,0) 62%,#0c0b19 100%)" }} />
          <div style={{ position: "absolute", top: 70, left: 84, display: "flex", fontSize: 46, fontWeight: 800, letterSpacing: -1 }}>
            <span>MISSÕES SECRETAS</span><span style={{ color: accent, marginLeft: 14 }}>GTA 6</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "0 84px", marginTop: -40 }}>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 34 }}>
            <div style={{ width: 150, height: 9, background: accent }} /><div style={{ width: 100, height: 9, background: "#ff9257", marginTop: 10 }} /><div style={{ width: 50, height: 9, background: "#ffcb66", marginTop: 10 }} />
          </div>
          <div style={{ fontSize: 62, fontWeight: 600, color: "#5ce1f2", marginBottom: 22 }}>{o.hook}</div>
          <div style={{ fontSize: o.title.length > 44 ? 92 : 112, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>{o.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 40 }}>
            {o.chips.filter(Boolean).map((c) => (
              <div key={c} style={{ display: "flex", fontSize: 36, fontWeight: 600, padding: "12px 26px", borderRadius: 999, border: "3px solid rgba(245,243,255,.6)", marginRight: 18, marginBottom: 18 }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", padding: "0 84px 120px" }}>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{o.footer}</div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: "#0c0b19", background: "#f5f3ff", padding: "14px 28px", borderRadius: 18, marginTop: 22, alignSelf: "flex-start" }}>{domain}</div>
        </div>
      </div>
    ),
    { ...STORY_SIZE, fonts: f },
  );
}
