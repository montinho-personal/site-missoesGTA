import Link from "next/link";
import { Callout, FaqList, JsonLd } from "@/components/ui";
import { TrackView } from "@/components/client";
import { BuyForm, WaitlistForm } from "@/components/Forms";
import { ShareSheet } from "@/components/ShareSheet";
import { saleConfig } from "@/server/mercadopago";
import { getPublishedEntries } from "@/server/content";
import { formatDate } from "@/lib/labels";
import { Icon } from "@/components/Icon";
import { Breadcrumbs } from "@/components/ui";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { appConfig, featureStatusLabel, type FeatureStatus } from "@/lib/app-config";
import { abs, site } from "@/lib/site";
import { appStory, fillCount, hookFor } from "@/lib/app-story";
import { TrailerFeature } from "@/components/TrailerVideo";
import { trailerLd } from "@/lib/trailer";
import { appSecretCount } from "@/server/app-count";

export const metadata = pageMeta({
  title: "App de segredos de GTA 6: segredos pra meter o loko",
  description: "App para explorar GTA 6 a fundo: descobertas por região, checklist do que você já achou e controle de spoiler. Revisado todo dia. Veja o que já existe.",
  path: "/app/",
});

const tone: Record<FeatureStatus, string> = { disponivel: "tone-ok", em_desenvolvimento: "tone-gold", planejado: "tone-violet" };
const icons: Record<string, string> = { fichas: "file", mapa: "pin", checklist: "check", filtros: "grid", spoilers: "shield", requisitos: "file", atualizacoes: "radar" };

const compare = [
  ["Achar o que fazer por perto", "Abrir vários vídeos e torcer para o ponto estar certo", "Descobertas da região onde você está, numa tela só"],
  ["Saber o que falta", "Lembrar de cabeça ou anotar em papel", "Checklist marcado conforme você encontra"],
  ["Evitar spoilers", "Ler o título errado e estragar uma cena", "Conteúdo da história coberto até você liberar"],
  ["Confiar na informação", "Não saber se é boato, mod ou verdade", "O mesmo status de verificação do portal em cada item"],
];



export const revalidate = 600;

export default async function AppPage() {
  // A venda liga sozinha quando existirem: credenciais do Mercado Pago, preço e banco permanente.
  const [sale, entries, secrets] = await Promise.all([saleConfig(), getPublishedEntries(), appSecretCount()]);
  // Números reais do arquivo, para o argumento da revisão diária.
  const fichas = entries.filter((e) => e.app_ref).length;
  const fontes = new Set(entries.flatMap((e) => e.sources.filter((s) => s.tipo !== "video").map((s) => s.url))).size;
  const videos = new Set(entries.flatMap((e) => e.sources.filter((s) => s.tipo === "video").map((s) => s.url))).size;
  const ultimaRevisao = entries.map((e) => e.last_verified_on).filter(Boolean).sort().at(-1) ?? null;
  const selling = sale.enabled;
  const faq = [
  { q: "O aplicativo já está disponível?", a: appConfig.stage === "a_venda" ? "Sim. Veja acima as condições e a compatibilidade." : "Ainda não. Estamos preparando o lançamento. Deixe seu e-mail e avisamos quando sair." },
  { q: "Vai ser pago?", a: sale.isLaunchPrice ? `Sim: ${sale.priceLabel}, pagamento único. É o preço de lançamento e pode subir no futuro; quem compra agora paga uma vez só.` : sale.enabled ? `Sim: ${sale.priceLabel}, pagamento único. Depois de pagar, o app abre liberado na hora e a confirmação chega por e-mail.` : "Sim, o aplicativo será pago. O preço ainda não foi definido e vai aparecer nesta página, junto com a política de reembolso, antes de qualquer cobrança. As fichas continuam abertas e gratuitas aqui no portal." },
  { q: "É aplicativo de loja?", a: "Não. É um aplicativo web: abre pelo navegador do celular e pode ser instalado na tela de início, sem passar pela App Store nem pelo Google Play." },
  { q: "Em quais aparelhos vai funcionar?", a: "Em qualquer celular ou computador com navegador atual. Foi desenhado primeiro para o celular, com o console ligado ao lado." },
  { q: "Preciso do aplicativo para usar o portal?", a: "Não. As respostas continuam completas e gratuitas no portal. O aplicativo é para quem quer organização e acompanhamento durante o jogo." },
  { q: "O aplicativo é oficial da Rockstar?", a: "Não. Assim como o portal, é um projeto independente feito por fãs, sem ligação com a Rockstar Games ou a Take-Two Interactive." },
  { q: "O aplicativo altera o jogo ou acessa meu console?", a: "Não. É um guia de consulta: não modifica o jogo, não é mod e não se conecta ao console." },
];
  const crumbs = [{ name: "Início", href: "/" }, { name: "Aplicativo" }];
  const ld: unknown[] = [breadcrumbLd(crumbs, "/app/"), faqLd(faq)];
  // SoftwareApplication só entra com produto real à venda: nada de preço ou nota fictícios.
  if (selling && appConfig.name) {
    ld.push({ "@type": "SoftwareApplication", name: appConfig.name, applicationCategory: "GameApplication", operatingSystem: appConfig.platforms?.join(", "), url: abs("/app/"),
      offers: { "@type": "Offer", price: sale.cents / 100, priceCurrency: "BRL", url: abs("/app/") } });
  }
  const primaryCta = selling
    ? <a href="#avise-me" className="btn btn-app">Comprar por {sale.priceLabel}<Icon name="arrow" size={18} /></a>
    : <a href="#avise-me" className="btn btn-app">Quero ser avisado do lançamento<Icon name="arrow" size={18} /></a>;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [...ld, trailerLd()] }} />
      <TrackView event="view_app_landing" />
      <section className="border-b border-ink-600 grid-paper">
        <div className="wrap pt-6 pb-14 sm:pb-20">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="label text-violet mb-4">{hookFor(secrets)}</p>
              <h1 className="text-[2.3rem] leading-[1.05] sm:text-6xl font-black">O segredo a gente revela. A aventura é você quem vive.</h1>
              <p className="mt-5 text-lg sm:text-xl text-fg-muted max-w-xl">Carro raro, grana escondida, lugar secreto e missão que o jogo não te mostra. Seu comparsa de bolso entrega a localização, o passo a passo e o vídeo de quem já fez. O resto é contigo, mano.</p>
              <div className="mt-7 flex flex-wrap gap-3">{primaryCta}<Link href="/app/como-baixar-e-usar/" className="btn btn-ghost">Como baixar e usar</Link></div>
              <p className="mt-5 inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-xl border border-gold/50 bg-ink-950/60 px-4 py-2.5">
                <span className="font-display text-3xl font-black text-gold">{sale.priceLabel}</span>
                <span className="text-sm text-fg-muted">pagamento único · sem mensalidade</span>
              </p>
              {!selling && <p className="mt-4 text-sm text-fg-subtle max-w-lg">Transparência: o aplicativo está em construção e ainda não foi lançado. Abaixo, cada função traz o estado real em que se encontra.</p>}
            </div>
            <TrailerFeature placement="app_hero" caption="O app em ação, com telas reais, em 1 minuto." />
          </div>
        </div>
      </section>

      <div className="wrap">
        {appConfig.screenshots.length > 0 && (
          <section className="pt-16" aria-labelledby="h-telas">
            <h2 id="h-telas" className="text-3xl font-extrabold mb-6">O aplicativo por dentro</h2>
            <div className="scroll-x">{appConfig.screenshots.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s.src} src={s.src} alt={s.alt} width={s.width} height={s.height} loading="lazy" className="h-[28rem] w-auto rounded-2xl border border-ink-600" />
            ))}</div>
          </section>
        )}

        {/* O manifesto do app: o conceito central (src/lib/app-story.ts). */}
        <section className="pt-16 sm:pt-24" aria-labelledby="h-porque">
          <div className="max-w-3xl">
            <div className="deco-rule mb-4" aria-hidden="true"><i /></div>
            <h2 id="h-porque" className="text-3xl sm:text-4xl font-extrabold">GTA nunca foi só cumprir missão.</h2>
            <div className="mt-5 text-lg text-fg-muted flex flex-col gap-4">
              {appStory.manifesto.map((t, i) => <p key={i} className={i === appStory.manifesto.length - 1 ? "text-fg font-semibold" : undefined}>{t}</p>)}
              <p>{fillCount(appStory.promise, secrets)}</p>
            </div>
            <div className="mt-8 card border-pink/40 p-5 sm:p-7">
              <div className="flex flex-col gap-2 text-lg">
                {appStory.contrast.map((t) => <p key={t}>{t}</p>)}
              </div>
              <p className="mt-5 font-display text-2xl sm:text-3xl font-black leading-tight">{appStory.tagline}</p>
            </div>
          </div>
        </section>

        <section className="pt-16 sm:pt-24" aria-labelledby="h-revisao">
          <div className="card grid-paper overflow-hidden p-6 sm:p-10">
            <p className="label text-cyan inline-flex items-center gap-2"><Icon name="radar" size={16} />Revisado todo dia</p>
            <h2 id="h-revisao" className="mt-3 text-3xl sm:text-4xl font-extrabold max-w-2xl">Um arquivo que acorda antes de você.</h2>
            <div className="mt-4 text-lg text-fg-muted flex flex-col gap-3 max-w-2xl">
              <p>GTA 6 muda toda semana: patch novo, segredo novo, boato que cai. Por isso o arquivo passa por uma revisão todos os dias. Ela confere fichas, pinos no mapa e vídeos, lê o que saiu de novo e cruza com o que publicam os guias, os canais e os jogadores que estão explorando Leonida pelo mundo.</p>
              <p>O que muda entra no aplicativo com o selo atualizado. O que era boato e caiu, a Nina carimba como desmentido. O que o Brian jurava e três fontes confirmaram, sobe de nível.</p>
            </div>
            <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                [String(fichas), "segredos no arquivo"],
                [String(fontes), "fontes acompanhadas"],
                [String(videos), "vídeos de quem já fez"],
                [ultimaRevisao ? formatDate(ultimaRevisao, true) : "diária", "última revisão de ficha"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl border border-ink-600 bg-ink-900/70 p-4 flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-sm text-fg-muted">{l}</dt>
                  <dd className="font-display text-3xl font-black">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-fg-subtle">Números do arquivo de hoje. Você paga uma vez e recebe as atualizações sem pagar de novo.</p>
          </div>
        </section>

        <section id="funcoes" className="pt-16 sm:pt-24 scroll-mt-24" aria-labelledby="h-func">
          <h2 id="h-func" className="text-3xl sm:text-4xl font-extrabold">Funções e em que pé cada uma está</h2>
          <p className="mt-3 text-fg-muted max-w-2xl">Promessa vaga a gente deixa para os políticos de Leonida. Cada função tem uma etiqueta: disponível, em desenvolvimento ou planejada. O passo a passo completo está no <Link href="/app/como-baixar-e-usar/" className="link">manual de como baixar e usar</Link>.</p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {appConfig.features.map((f) => (
              <li key={f.key} className="card p-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2"><span className="text-violet"><Icon name={icons[f.key] ?? "compass"} size={26} /></span><span className={`badge ${tone[f.status]}`}>{featureStatusLabel[f.status]}</span></div>
                <h3 className="font-display text-xl font-bold">{f.title}</h3>
                <p className="text-fg-muted text-[0.97rem]">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-16 sm:pt-24" aria-labelledby="h-comp">
          <h2 id="h-comp" className="text-3xl sm:text-4xl font-extrabold mb-7">Explorar no improviso ou com um comparsa</h2>
          <div className="card overflow-x-auto" tabIndex={0} role="region" aria-labelledby="h-comp">
            <table className="w-full text-left text-[0.97rem] min-w-[36rem]">
              <thead><tr className="border-b border-ink-600"><th scope="col" className="p-4 label text-fg-subtle">Situação</th><th scope="col" className="p-4 label text-fg-subtle">No improviso</th><th scope="col" className="p-4 label text-violet">Com o aplicativo</th></tr></thead>
              <tbody>{compare.map((r) => <tr key={r[0]} className="border-b border-ink-700 last:border-0"><th scope="row" className="p-4 font-semibold align-top">{r[0]}</th><td className="p-4 text-fg-muted align-top">{r[1]}</td><td className="p-4 align-top">{r[2]}</td></tr>)}</tbody>
            </table>
          </div>
          {!appConfig.featuresConfirmed && <p className="mt-3 text-sm text-fg-subtle">A coluna do aplicativo descreve o produto como está sendo planejado. Atualizaremos esta página conforme cada função for entregue.</p>}
        </section>

        <section className="pt-16 sm:pt-24 grid gap-4 md:grid-cols-3" aria-label="Condições">
          <div className="card border-gold/50 p-5">
            <p className="label text-gold mb-2">Preço</p>
            <p className="font-display text-4xl font-black text-gold">{sale.priceLabel}</p>
            {sale.isLaunchPrice && <p className="mt-2 text-[0.97rem]">{appStory.joke.join(" ")}</p>}
            <p className="mt-2 text-sm text-fg-muted">{sale.isLaunchPrice ? "Pagamento único, por Pix. Sem mensalidade. É o preço de lançamento e pode subir no futuro, conforme o arquivo cresce; quem compra agora paga uma vez e não paga a diferença depois." : "Pagamento único, por Pix. Sem mensalidade."}</p>
          </div>
          <div className="card p-5"><p className="label text-fg-subtle mb-2">Compatibilidade</p><p>{appConfig.platforms ? appConfig.platforms.join(", ") + "." : <span className="text-fg-muted">A anunciar.</span>}</p></div>
          <div className="card p-5"><p className="label text-fg-subtle mb-2">Reembolso e suporte</p><p className="text-fg-muted">{selling ? "Você pode desistir em até 7 dias depois da compra e receber o valor de volta, como prevê o Código de Defesa do Consumidor." : "A política de cancelamento e reembolso será publicada junto com o preço."} {!appConfig.supportContact && <>Enquanto isso, fale com a gente pelo <Link className="link" href="/contato/">contato</Link>.</>}</p></div>
        </section>

        {/* "#comprar" é o endereço que o app usa no botão de compra; "#avise-me" fica pelos links antigos. */}
        <span id="comprar" className="block scroll-mt-24" aria-hidden="true" />
        <section id="avise-me" className="pt-16 sm:pt-24 scroll-mt-24" aria-labelledby="h-avise">
          <div className="card border-violet/40 p-6 sm:p-10 grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="label text-violet mb-3">{selling ? "Pronto para explorar?" : "Lista de aviso"}</p>
              <h2 id="h-avise" className="text-3xl sm:text-4xl font-extrabold">Seu próximo segredo está esperando para ser descoberto.</h2>
              <p className="mt-3 text-fg-muted">{selling ? `${appStory.price} O app abre liberado na hora e a confirmação chega no seu e-mail. O segredo a gente revela; a aventura é sua.` : "Deixe seu e-mail e a gente avisa no dia do lançamento. Um aviso só. Quem manda dez e-mails por semana é a seguradora."}</p>
            </div>
            {selling ? <BuyForm priceLabel={sale.priceLabel!} /> : <WaitlistForm source="app_landing" />}
          </div>
        </section>

        <section className="pt-16 sm:pt-24 max-w-3xl" aria-labelledby="h-indique">
          <div className="card p-6 sm:p-8">
            <p className="label text-pink">Conhece alguém que vive caçando segredo?</p>
            <h2 id="h-indique" className="mt-2 text-2xl sm:text-3xl font-extrabold">Todo grupo tem aquele amigo que jura que achou um carro escondido.</h2>
            <p className="mt-2 text-fg-muted">Manda pra ele. Agora ele vai ter como provar.</p>
            <div className="mt-5"><ShareSheet ctx={{ kind: "app", url: abs("/app/"), priceLabel: sale.priceLabel }} storyPath="/app/story/" /></div>
          </div>
        </section>

        <section className="pt-16 sm:pt-24 max-w-3xl" aria-labelledby="h-faq">
          <h2 id="h-faq" className="text-3xl font-extrabold mb-6">Perguntas frequentes</h2>
          <FaqList items={faq} />
        </section>
        <div className="pt-10 max-w-3xl"><Callout icon="info" title="Projeto independente"><p>{site.independence}</p></Callout></div>
      </div>
    </>
  );
}
