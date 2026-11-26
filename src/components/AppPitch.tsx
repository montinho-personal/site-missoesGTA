import Link from "next/link";
import { Icon } from "./Icon";
import { TrackLink } from "./client";
import { precisionInfo } from "@/lib/labels";
import type { Entry } from "@/lib/types";

const dist = (m: number) => (m < 950 ? `${Math.max(50, Math.round(m / 50) * 50)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);

/**
 * O argumento do aplicativo dentro da ficha, montado com os dados DESTA ficha:
 * o pino no mapa, os vídeos de quem já fez e o que dá para fazer na mesma viagem.
 * Só afirma o que os dados sustentam, e diz quando o aplicativo ainda não foi lançado.
 */
export function AppPitch({ entry, nearby, sameRegion, sale }: { entry: Entry; nearby: { entry: Entry; meters: number }[]; sameRegion: number; sale: { enabled: boolean; priceLabel: string | null } }) {
  const videos = entry.sources.filter((s) => s.tipo === "video").length;
  const hasPin = Boolean(entry.coords);
  if (!hasPin && videos === 0 && nearby.length === 0 && sameRegion === 0) return null;
  const top = nearby.slice(0, 3);
  const url = (e: Entry) => `/${e.game_slug}/${e.category_slug}/${e.slug}/`;
  return (
    <aside data-app-cta aria-labelledby="h-pitch" className="card overflow-hidden border-violet/40 max-w-3xl no-print">
      <div className="grid-paper p-5 sm:p-7">
        <p className="label text-violet inline-flex items-center gap-2"><Icon name="phone" size={15} />No aplicativo{!sale.enabled && " · em construção"}</p>
        <h2 id="h-pitch" className="font-display text-2xl sm:text-[1.7rem] font-extrabold leading-tight mt-2">Leu o passo a passo. Agora veja no mapa.</h2>
        <ul className="mt-5 flex flex-col gap-4">
          {hasPin && (
            <li className="flex gap-3.5">
              <span className="text-violet shrink-0 mt-0.5"><Icon name="pin" size={24} /></span>
              <p><strong className="font-semibold">O pino desta missão no mapa.</strong> <span className="text-fg-muted">{entry.pin_precision === "exato" ? "Aqui o ponto é exato: você abre o mapa e vai direto, sem ficar comparando print." : entry.pin_precision ? `Aqui a precisão é “${precisionInfo[entry.pin_precision].label.toLowerCase()}”, e o formato do pino já avisa isso antes de você sair.` : "Você abre o mapa e vê onde fica, em vez de adivinhar pela descrição."}</span></p>
            </li>
          )}
          {videos > 0 && (
            <li className="flex gap-3.5">
              <span className="text-violet shrink-0 mt-0.5"><Icon name="eye" size={24} /></span>
              <p><strong className="font-semibold">{videos === 1 ? "O vídeo de quem já fez" : `${videos} vídeos de quem já fez`}, dentro da ficha.</strong> <span className="text-fg-muted">Você assiste ali mesmo, com o console ligado ao lado, sem sair caçando link.</span></p>
            </li>
          )}
          {nearby.length === 0 && sameRegion > 0 && entry.region_name && (
            <li className="flex gap-3.5">
              <span className="text-violet shrink-0 mt-0.5"><Icon name="compass" size={24} /></span>
              <p><strong className="font-semibold">{sameRegion === 1 ? "Mais 1 segredo" : `Mais ${sameRegion} segredos`} em {entry.region_name}.</strong> <span className="text-fg-muted">Já que você vai até lá, dá para aproveitar a viagem. No mapa do aplicativo você vê todos da região de uma vez. <Link href={`/${entry.game_slug}/mapa/${entry.region_slug}/`} className="link">Ver a lista da região</Link>.</span></p>
            </li>
          )}
          {nearby.length > 0 && (
            <li className="flex gap-3.5">
              <span className="text-violet shrink-0 mt-0.5"><Icon name="compass" size={24} /></span>
              <div>
                <p><strong className="font-semibold">{nearby.length === 1 ? "Mais 1 segredo" : `Mais ${nearby.length} segredos`} a até 2 km daqui.</strong> <span className="text-fg-muted">Dá para resolver na mesma viagem. No mapa do aplicativo você vê todos de uma vez e monta a rota.</span></p>
                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {top.map((n) => (
                    <li key={n.entry.id} className="text-[0.97rem]"><Link href={url(n.entry)} className="link">{n.entry.title}</Link> <span className="text-fg-subtle">· a {dist(n.meters)}</span></li>
                  ))}
                  {nearby.length > top.length && <li className="text-[0.97rem] text-fg-subtle">e mais {nearby.length - top.length} no mapa do aplicativo</li>}
                </ul>
              </div>
            </li>
          )}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <TrackLink href="/app/#avise-me" className="btn btn-app" event="cta_click" params={{ cta_key: "ficha_mapa", placement: "entry_after_steps", context: entry.id }}>
            {sale.enabled ? `Ter o aplicativo por ${sale.priceLabel}` : "Quero ser avisado do lançamento"}<Icon name="arrow" size={18} />
          </TrackLink>
          <Link href="/app/" className="link text-[0.97rem]">Ver como o aplicativo funciona</Link>
        </div>
        {!sale.enabled && <p className="mt-3 text-sm text-fg-subtle">O aplicativo ainda não foi lançado. A ficha completa continua aqui, de graça.</p>}
      </div>
    </aside>
  );
}
