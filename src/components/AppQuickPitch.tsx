import { Icon } from "./Icon";
import { TrackLink } from "./client";
import type { Entry } from "@/lib/types";

/**
 * Chamada curta do aplicativo logo depois da resposta rápida da ficha.
 * Ensina em 3 passos como fazer ESTA descoberta no app, com os dados dela (pino, vídeos, vizinhos),
 * e mostra o preço. Só afirma o que os dados da ficha sustentam.
 */
export function AppQuickPitch({ entry, nearby, sameRegion, total, sale }: { entry: Entry; nearby: number; sameRegion: number; total: number; sale: { enabled: boolean; priceLabel: string | null } }) {
  const videos = entry.sources.filter((s) => s.tipo === "video").length;
  const steps: { icon: string; title: string; text: string }[] = [];
  if (entry.coords) steps.push({ icon: "pin", title: "Abra o pino no mapa", text: entry.pin_precision === "exato" ? "Ponto exato: você vai direto, sem comparar print." : "O pino mostra onde procurar, e avisa quando é só a região." });
  if (videos > 0) steps.push({ icon: "eye", title: videos === 1 ? "Assista ao vídeo de quem já fez" : `Assista aos ${videos} vídeos de quem já fez`, text: "Dentro da própria ficha, com o controle na mão." });
  steps.push({ icon: "check", title: "Siga o passo a passo e marque cada etapa", text: "O app lembra onde você parou e o que já achou." });
  const near = nearby > 0 ? nearby : sameRegion;
  if (near > 0) steps.push({ icon: "compass", title: `Aproveita o rolê: mais ${near} ${near === 1 ? "segredo" : "segredos"} ${nearby > 0 ? "a até 2 km" : `em ${entry.region_name ?? "na região"}`}`, text: "Todos no mesmo mapa, para montar a rota." });
  const shown = steps.slice(0, 3);
  const price = sale.priceLabel ?? "R$ 4,20";
  return (
    <aside data-app-cta aria-labelledby="h-quick" className="card overflow-hidden border-violet/50 max-w-3xl no-print bg-gradient-to-br from-violet-strong/25 via-ink-800 to-ink-800">
      <div className="p-5 sm:p-6">
        <p className="label text-violet inline-flex items-center gap-2"><Icon name="phone" size={15} />No aplicativo · {price}, pagamento único</p>
        <h2 id="h-quick" className="mt-2 font-display text-xl sm:text-2xl font-extrabold leading-tight">Mete o loko nesta em {shown.length} passos, sem errar o caminho</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {shown.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-strong font-display font-black text-white">{i + 1}</span>
              <p className="pt-0.5"><strong className="font-semibold">{s.title}.</strong> <span className="text-fg-muted">{s.text}</span></p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/5 px-3.5 py-2.5 text-[0.97rem]">
          <strong className="text-gold font-display">{price}</strong> libera <strong>os {total} segredos</strong> do arquivo. Pagamento único, sem mensalidade. O segredo a gente revela; a aventura é sua.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <TrackLink href="/app/#comprar" className="btn btn-app" event="cta_click" params={{ cta_key: "ficha_rapida", placement: "entry_after_answer", context: entry.id }}>
            {sale.enabled ? `Liberar tudo por ${price}` : "Quero ser avisado do lançamento"}<Icon name="arrow" size={18} />
          </TrackLink>
          <TrackLink href="/app/como-baixar-e-usar/" className="link text-[0.97rem]" event="cta_click" params={{ cta_key: "ficha_rapida_como", placement: "entry_after_answer", context: entry.id }}>Ver como funciona</TrackLink>
        </div>
      </div>
    </aside>
  );
}
