import { Shell } from "@/components/Shell";
import { Favorites } from "@/components/Favorites";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Meus favoritos", description: "As descobertas que você salvou neste aparelho.", path: "/favoritos/", noindex: true });

export default function Favoritos() {
  return <Shell title="Meus favoritos" path="/favoritos/" lead="Fica salvo só neste aparelho, sem cadastro." wide><Favorites /></Shell>;
}
