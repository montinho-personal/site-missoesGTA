import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import type { Category } from "@/lib/types";
import { categoryArt } from "@/lib/art";

// Cada categoria tem uma cor de luz própria, sempre sobre a mesma base escura.
const glow: Record<string, [string, string]> = {
  target: ["#ff4d9d", "#6d43e0"], door: ["#5ce1f2", "#6d43e0"], egg: ["#ffcb66", "#ff4d9d"], eye: ["#a98bff", "#5ce1f2"],
  cash: ["#62e2a8", "#ffcb66"], car: ["#ff9257", "#ff4d9d"], crate: ["#ff7b7b", "#ff9257"], grid: ["#5ce1f2", "#62e2a8"], bulb: ["#ffcb66", "#ff9257"],
};

export function CategoryCard({ c, gameSlug = "gta-6" }: { c: Category; gameSlug?: string }) {
  const [a, b] = glow[c.icon] ?? glow.target;
  const n = c.entry_count ?? 0;
  const art = categoryArt[c.slug];
  const count = n > 0 ? `${n} ${n === 1 ? "registro" : "registros"}` : "Em apuração";
  return (
    <Link href={`/${gameSlug}/${c.slug}/`} className="card group overflow-hidden flex flex-col h-full">
      {art ? (
        <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-ink-900">
          {/* decorativa: o nome da categoria vem logo abaixo, em texto */}
          <Image src={art.src} alt="" fill sizes="(min-width: 1024px) 360px, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" style={{ objectPosition: art.position }} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent" />
          <span className="absolute left-3 top-2.5 label text-fg rounded bg-ink-950/75 px-2 py-1">{count}</span>
        </div>
      ) : (
        <div className="relative aspect-[16/10] sm:aspect-[16/9] grid-paper overflow-hidden" style={{ background: `radial-gradient(120% 140% at 0% 100%, ${a}40, transparent 60%), radial-gradient(90% 120% at 100% 0%, ${b}38, transparent 65%)` }}>
          <span className="absolute -right-3 -bottom-5 opacity-90 transition-transform duration-300 group-hover:-translate-y-1" style={{ color: a }}><Icon name={c.icon} size={104} /></span>
          <span className="absolute left-3.5 top-3 label text-fg/80">{count}</span>
        </div>
      )}
      <div className="p-4 flex flex-col gap-1 grow">
        <h3 className="font-display text-lg sm:text-xl font-bold leading-tight group-hover:text-pink">{c.name}</h3>
        <p className="text-sm text-fg-muted">{c.tagline}</p>
      </div>
    </Link>
  );
}
