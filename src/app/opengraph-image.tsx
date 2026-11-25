import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: segredos e descobertas de GTA 6`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function ogCard(title: string, eyebrow: string, footer: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, color: "#f5f3ff", background: "linear-gradient(180deg,#0c0b19 0%,#2a1650 62%,#8a1f6b 100%)" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
          <span>{site.wordmark[0]}</span><span style={{ color: "#ff4d9d", marginLeft: 12 }}>{site.wordmark[1]}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 26 }}>
            <div style={{ width: 96, height: 5, background: "#ff4d9d" }} /><div style={{ width: 64, height: 5, background: "#ff9257", marginTop: 6 }} /><div style={{ width: 32, height: 5, background: "#ffcb66", marginTop: 6 }} />
          </div>
          <div style={{ fontSize: 26, letterSpacing: 5, textTransform: "uppercase", color: "#5ce1f2", marginBottom: 14 }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 60 ? 54 : 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: "#bdb8d9" }}>{footer}</div>
      </div>
    ),
    size,
  );
}

export default function Image() {
  return ogCard("O GTA 6 esconde muito mais do que você imagina.", "Segredos de GTA 6", "Portal independente de fãs · fontes e status de verificação em cada descoberta");
}
