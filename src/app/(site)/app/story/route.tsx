import { storyCard } from "@/app/story-card";
import { saleConfig } from "@/server/mercadopago";

export const revalidate = 600;

export async function GET() {
  const sale = await saleConfig();
  return storyCard({
    hook: "O GTA 6 esconde muito.",
    title: "Agora cada segredo tem pino no mapa.",
    chips: ["Vídeo de quem já fez", "O que falta pegar", sale.priceLabel ?? ""],
    footer: "Conheça o aplicativo:",
    accent: "#a98bff",
    art: "hero",
  });
}
