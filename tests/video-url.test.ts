import { describe, expect, it } from "vitest";
import { embedUrl, parseVideoUrl, themeOf } from "@/lib/video-url";

describe("links de vídeo", () => {
  it("YouTube em todos os formatos", () => {
    for (const u of ["https://youtu.be/5ust0uuEm50", "https://www.youtube.com/watch?v=5ust0uuEm50&t=3", "https://youtube.com/shorts/5ust0uuEm50?is=abc", "https://m.youtube.com/shorts/5ust0uuEm50"])
      expect(parseVideoUrl(u)).toEqual({ platform: "youtube", id: "5ust0uuEm50", url: "https://www.youtube.com/watch?v=5ust0uuEm50" });
  });
  it("TikTok e Instagram", () => {
    expect(parseVideoUrl("https://www.tiktok.com/@criador.br/video/7312345678901234567?lang=pt")).toEqual({ platform: "tiktok", id: "7312345678901234567", url: "https://www.tiktok.com/@criador.br/video/7312345678901234567" });
    expect(parseVideoUrl("https://www.instagram.com/reel/C1a2B3c4D5e/?igsh=x")?.platform).toBe("instagram");
  });
  it("recusa o que não é vídeo", () => {
    for (const u of ["javascript:alert(1)", "https://evil.com/watch?v=5ust0uuEm50", "https://youtube.com/watch?v=curto", "nada"]) expect(parseVideoUrl(u)).toBeNull();
  });
  it("player só para YouTube e TikTok", () => {
    expect(embedUrl({ platform: "youtube", id: "5ust0uuEm50" })).toContain("youtube-nocookie.com/embed/5ust0uuEm50");
    expect(embedUrl({ platform: "instagram", id: "x" })).toBeNull();
    expect(themeOf(["gta6", "tema:mira"])).toBe("mira");
    expect(themeOf(["tema:inventado"])).toBeNull();
  });
});
