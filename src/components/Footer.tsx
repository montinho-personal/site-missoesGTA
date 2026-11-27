import Link from "next/link";
import { ConsentReopen, Wordmark } from "./Chrome";
import { SpoilerToggle } from "./client";
import { FooterTrailer } from "./TrailerVideo";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  const col = "flex flex-col gap-1 text-[0.95rem] text-fg-muted";
  const a = "hover:text-fg underline-offset-4 hover:underline py-1";
  return (
    <footer className="mt-20 border-t border-ink-600 bg-ink-900 no-print">
      <div className="wrap py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-3 text-fg-muted max-w-sm">{site.tagline}</p>
          <div className="mt-5"><SpoilerToggle /></div>
          <FooterTrailer />
        </div>
        <nav aria-label="Categorias de GTA 6" className={col}>
          <p className="label text-fg-subtle mb-2">GTA 6</p>
          <Link className={a} href="/gta-6/">Guia de GTA 6</Link>
          <Link className={a} href="/gta-6/segredos/">Todos os segredos</Link>
          {categories.map((c) => <Link key={c.id} className={a} href={`/gta-6/${c.slug}/`}>{c.name}</Link>)}
          <Link className={a} href="/gta-6/mapa/">Regiões do mapa</Link>
        </nav>
        <nav aria-label="Projeto" className={col}>
          <p className="label text-fg-subtle mb-2">Projeto</p>
          <Link className={a} href="/sobre/">Sobre o projeto</Link>
          <Link className={a} href="/metodologia/">Como verificamos</Link>
          <Link className={a} href="/radar/">Radar de descobertas</Link>
          <Link className={a} href="/app/">Aplicativo</Link>
          <Link className={a} href="/app/como-baixar-e-usar/">Como baixar e usar o app</Link>
          <Link className={a} href="/favoritos/">Meus favoritos</Link>
        </nav>
        <nav aria-label="Ajuda e termos" className={col}>
          <p className="label text-fg-subtle mb-2">Ajuda</p>
          <Link className={a} href="/ajuda/">Central de ajuda</Link>
          <Link className={a} href="/enviar-descoberta/">Enviar uma descoberta</Link>
          <Link className={a} href="/contato/">Contato</Link>
          <Link className={a} href="/privacidade/">Privacidade</Link>
          <Link className={a} href="/termos/">Termos de uso</Link>
          <ConsentReopen />
        </nav>
      </div>
      <div className="border-t border-ink-700">
        <p className="wrap py-6 text-sm text-fg-subtle max-w-none">{site.independence}</p>
      </div>
    </footer>
  );
}
