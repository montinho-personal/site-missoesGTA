// O trailer do aplicativo (Short publicado no YouTube do Montinho em 27/11/2026).
// Uma fonte só para o player, o JSON-LD e os testes.
import { abs } from "./site";
export const trailer = {
  youtubeId: "5ust0uuEm50",
  title: "Trailer do app Missões Secretas GTA 6",
  description: "Em 1 minuto: o que o app Missões Secretas GTA 6 faz, com telas reais do aplicativo. Guia não oficial, feito por fãs; as cenas de ação foram criadas por IA e não são imagens do jogo.",
  /** Duração do vídeo publicado (74 s). */
  duration: "PT1M14S",
  durationLabel: "1 min",
  uploadDate: "2026-11-27",
  poster: "/video/trailer-app.webp",
  posterJpg: "/video/trailer-app.jpg",
  watchUrl: "https://www.youtube.com/shorts/5ust0uuEm50",
  embedUrl: "https://www.youtube-nocookie.com/embed/5ust0uuEm50",
};

export function trailerLd() {
  return {
    "@type": "VideoObject",
    name: trailer.title,
    description: trailer.description,
    thumbnailUrl: [abs(trailer.posterJpg)],
    uploadDate: trailer.uploadDate,
    duration: trailer.duration,
    embedUrl: trailer.embedUrl,
    url: trailer.watchUrl,
    inLanguage: "pt-BR",
  };
}
