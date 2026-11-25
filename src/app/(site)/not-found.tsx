import Link from "next/link";
import { SearchTrigger } from "@/components/Search";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="wrap wrap-narrow pt-16 pb-8 text-center">
      <span className="tone-violet inline-block"><Icon name="compass" size={56} /></span>
      <p className="label text-pink mt-4">Erro 404</p>
      <h1 className="mt-2 text-4xl sm:text-5xl font-black">Esse lugar não está no mapa</h1>
      <p className="mt-4 text-lg text-fg-muted">A página pode ter mudado de endereço ou nunca ter existido. Tente a busca ou volte para um ponto conhecido.</p>
      <div className="mt-7 text-left"><SearchTrigger variant="hero" /></div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link href="/gta-6/segredos/" className="btn btn-primary">Ver todos os segredos</Link>
        <Link href="/" className="btn btn-ghost">Página inicial</Link>
      </div>
    </div>
  );
}
