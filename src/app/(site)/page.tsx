import Link from "next/link";
import Image from "next/image";
import { heroArt } from "@/lib/art";
import { Icon } from "@/components/Icon";
import { SearchTrigger } from "@/components/Search";
import { CategoryCard } from "@/components/CategoryCard";
import { AppCta, EntryGrid, FaqList, JsonLd, SectionHead, StatusBadge } from "@/components/ui";
import { TrackLink } from "@/components/client";
import { getCategories, getCtas, getPublicChanges, getPublishedEntries, toCard } from "@/server/content";
import { faqLd, pageMeta, websiteLd } from "@/lib/seo";
import { homeFaq } from "@/lib/game-facts";
import { formatDate } from "@/lib/labels";
import { site } from "@/lib/site";
import { appConfig } from "@/lib/app-config";

export const metadata = pageMeta({
  title: `${site.name}: segredos, easter eggs e descobertas de GTA 6`,
  absoluteTitle: true,
  description: "Missões secretas, lugares escondidos, dinheiro, carros raros e mistérios de GTA 6, com fontes e status de verificação. Feito por jogadores, para quem quer ir além da história.",
  path: "/",
});

export default async function Home() {
  const [entries, categories, changes, ctas] = await Promise.all([getPublishedEntries(), getCategories(), getPublicChanges(6), getCtas()]);
  const featured = entries.filter((e) => e.featured && e.spoiler_level !== "historia").slice(0, 6);
  const investigating = entries.filter((e) => e.verification_status === "investigacao").slice(0, 3);

  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd data={{ "@context": "https://schema.org", ...faqLd(homeFaq) }} />

      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden border-b border-ink-600">
        {/* celular: faixa ilustrada no topo; telas largas: arte à direita do texto */}
        <div className="absolute inset-x-0 top-0 -z-10 h-56 md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[72%]">
          <Image src={heroArt.src} alt="" width={heroArt.width} height={heroArt.height} priority sizes="(min-width: 768px) 72vw, 100vw" className="h-full w-full object-cover object-[78%_50%] md:object-[70%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-transparent to-ink-950 md:bg-gradient-to-r md:from-ink-950 md:via-ink-950/50 md:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-b from-transparent to-ink-950 md:block" />
        </div>
        <div className="wrap pt-48 pb-12 md:pt-20 md:pb-24">
          <div className="max-w-2xl">
            <p className="label text-pink mb-4">Para quem vai além do óbvio</p>
            <h1 className="text-[2.35rem] leading-[1.05] sm:text-6xl font-black">O GTA 6 esconde muito mais do que você imagina.</h1>
            <p className="mt-5 text-lg sm:text-xl text-fg-muted max-w-xl">Missões secretas, carros raros, dinheiro escondido, lugares misteriosos e tudo aquilo que o jogo não te conta.</p>
            <div className="mt-7 max-w-xl"><SearchTrigger variant="hero" /></div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 max-w-xl">
              <Link href="/gta-6/segredos/" className="btn btn-primary grow">Explorar os segredos<Icon name="arrow" size={18} /></Link>
              <TrackLink href="/app/" className="btn btn-ghost" event="cta_click" params={{ cta_key: "hero", placement: "home_hero" }}>Conhecer o aplicativo</TrackLink>
            </div>
            <p className="mt-5 text-sm text-fg-subtle inline-flex items-center gap-2"><Icon name="shield" size={16} className="text-ok" />Proteção contra spoilers ligada por padrão.</p>
          </div>
        </div>
      </section>

      {/* 2. Categorias */}
      <section className="wrap pt-14 sm:pt-20" aria-labelledby="h-cat">
        <SectionHead id="h-cat" eyebrow="Escolha sua próxima descoberta" title="O que você quer descobrir?" />
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((c) => <li key={c.id}><CategoryCard c={c} /></li>)}
        </ul>
      </section>

      {/* 3. Destaques */}
      {featured.length > 0 && (
        <section className="wrap pt-16 sm:pt-24" aria-labelledby="h-dest">
          <SectionHead id="h-dest" eyebrow="Descobertas em destaque" title="Comece por aqui" text="Uma seleção da redação. O selo de cada card diz o quanto aquilo já foi verificado." href="/gta-6/segredos/" linkLabel="Ver todos" />
          <EntryGrid entries={featured.map(toCard)} />
        </section>
      )}

      {/* 4. Radar */}
      <section className="wrap pt-16 sm:pt-24" aria-labelledby="h-radar">
        <SectionHead id="h-radar" eyebrow="Radar de descobertas" title="O que mudou por último" text="Registros novos, mudanças de status e casos que ainda estamos investigando." href="/radar/" linkLabel="Abrir o radar" />
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <ol className="card divide-y divide-ink-600">
            {changes.length === 0 && <li className="p-5 text-fg-muted">Nenhuma atualização registrada ainda.</li>}
            {changes.map((ch) => (
              <li key={ch.id} className="p-4 sm:p-5 flex gap-4">
                <time dateTime={ch.changed_at} className="label text-fg-subtle w-14 shrink-0 pt-1">{formatDate(ch.changed_at, true)}</time>
                <div className="min-w-0">
                  <Link href={ch.url!} className="font-display font-bold text-lg leading-snug hover:text-pink">{ch.title}</Link>
                  <p className="text-sm text-fg-muted mt-0.5">{ch.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="card grid-paper p-5 sm:p-6">
            <p className="label text-violet inline-flex items-center gap-2"><Icon name="radar" size={16} />Em investigação</p>
            {investigating.length === 0 ? <p className="mt-3 text-fg-muted">Nenhum caso aberto no momento.</p> : (
              <ul className="mt-4 flex flex-col gap-4">
                {investigating.map((e) => (
                  <li key={e.id}>
                    <Link href={`/${e.game_slug}/${e.category_slug}/${e.slug}/`} className="font-display font-bold text-lg leading-snug hover:text-pink">{e.title}</Link>
                    <div className="mt-1.5"><StatusBadge status={e.verification_status} full /></div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/metodologia/" className="link mt-5 inline-block text-sm">Como decidimos o status de cada descoberta</Link>
          </div>
        </div>
      </section>

      {/* 5. Aplicativo */}
      <section className="wrap pt-16 sm:pt-24" aria-labelledby="h-app">
        <div className="card overflow-hidden border-violet/40">
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <div className="p-6 sm:p-10">
              <p className="label text-violet mb-3">Seu companheiro de jogo</p>
              <h2 id="h-app" className="text-3xl sm:text-4xl font-extrabold">Cada segredo. Cada descoberta. Uma nova aventura.</h2>
              <p className="mt-4 text-fg-muted">O portal responde a dúvida de agora. O aplicativo foi pensado para a sessão inteira: o que tem perto de você, o que você já achou e o que ainda falta.</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {appConfig.features.slice(0, 3).map((f) => (
                  <li key={f.key} className="flex gap-3"><Icon name="check" size={20} className="text-violet shrink-0 mt-1" /><span><strong className="font-semibold">{f.title}.</strong> <span className="text-fg-muted">{f.text}</span></span></li>
                ))}
              </ul>
              <TrackLink href="/app/" className="btn btn-app mt-7" event="cta_click" params={{ cta_key: "home_app", placement: "home_app_section" }}>Conhecer o aplicativo<Icon name="arrow" size={18} /></TrackLink>
              {appConfig.stage === "pre_lancamento" && <p className="mt-3 text-sm text-fg-subtle">Em preparação. Na página do aplicativo dizemos o que já existe e o que ainda é plano.</p>}
            </div>
            <div className="grid-paper relative min-h-56 border-t md:border-t-0 md:border-l border-ink-600 flex items-center justify-center p-8" aria-hidden="true">
              <div className="w-44 rounded-[1.7rem] border-2 border-ink-500 bg-ink-900 p-3 shadow-2xl rotate-3">
                <div className="h-2 w-12 rounded-full bg-ink-600 mx-auto mb-3" />
                {["target", "cash", "car", "eye"].map((ic, i) => (
                  <div key={ic} className="flex items-center gap-2.5 rounded-lg border border-ink-600 p-2 mb-2">
                    <span className={i === 0 ? "text-ok" : "text-violet"}><Icon name={i === 0 ? "check" : ic} size={18} /></span>
                    <span className="grow"><span className="block h-1.5 rounded bg-ink-500 w-full" /><span className="block h-1.5 rounded bg-ink-600 w-2/3 mt-1.5" /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dúvidas */}
      <section className="wrap pt-16 sm:pt-24" aria-labelledby="h-faq">
        <SectionHead id="h-faq" eyebrow="Dúvidas frequentes dos jogadores" title="Respostas rápidas" href="/ajuda/" linkLabel="Central de ajuda" />
        <FaqList items={homeFaq} />
      </section>

      {/* 7. Nossa paixão */}
      <section className="wrap pt-16 sm:pt-24" aria-labelledby="h-nos">
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <div className="deco-rule mb-4" aria-hidden="true"><i /></div>
            <p className="label text-pink mb-2">Nossa paixão pelo GTA</p>
            <h2 id="h-nos" className="text-3xl sm:text-4xl font-extrabold">Você lembra da primeira vez?</h2>
          </div>
          <div className="text-lg text-fg-muted flex flex-col gap-4">
            <p>De explorar o mapa sem saber o que ia encontrar. De ouvir um amigo jurar que existia um carro escondido, uma missão que ninguém tinha feito, um lugar que não estava em revista nenhuma.</p>
            <p>A gente cresceu, os gráficos mudaram, os mapas ficaram enormes. A vontade de descobrir o que existe além do óbvio continua a mesma.</p>
            <p className="text-fg">Este projeto é para quem não quer só terminar GTA 6. É para quem quer descobrir o que ele esconde.</p>
            <Link href="/sobre/" className="link self-start font-semibold">Conheça o projeto</Link>
          </div>
        </div>
      </section>

      {/* 8. Comunidade */}
      <section className="wrap pt-16 sm:pt-24" aria-labelledby="h-com">
        <div className="card p-6 sm:p-10 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="label text-cyan mb-3 inline-flex items-center gap-2"><Icon name="users" size={16} />Comunidade</p>
            <h2 id="h-com" className="text-2xl sm:text-3xl font-extrabold">Achou algo que não está aqui?</h2>
            <p className="mt-3 text-fg-muted">Mande o que você encontrou, de preferência com print ou vídeo. A gente apura, publica com o status certo e corrige quando errar.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/enviar-descoberta/" className="btn btn-primary">Enviar uma descoberta</Link>
            <Link href="/enviar-descoberta/?tipo=correcao" className="btn btn-ghost">Sugerir uma correção</Link>
          </div>
        </div>
      </section>

      {/* 9. Conversão final */}
      <section className="wrap pt-10"><AppCta cta={ctas.padrao} placement="home_final" /></section>
    </>
  );
}
