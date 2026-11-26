import Link from "next/link";
import { Callout, FaqList, JsonLd } from "@/components/ui";
import { TrackLink, TrackView } from "@/components/client";
import { WaitlistForm } from "@/components/Forms";
import { Icon } from "@/components/Icon";
import { Breadcrumbs } from "@/components/ui";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { appConfig, featureStatusLabel, type FeatureStatus } from "@/lib/app-config";
import { abs, site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Aplicativo de segredos de GTA 6: seu companheiro de exploração",
  description: "Um aplicativo para explorar GTA 6 a fundo: descobertas organizadas por região, checklist do que você já achou e controle de spoilers. Veja o que já existe e o que está planejado.",
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

const faq = [
  { q: "O aplicativo já está disponível?", a: appConfig.stage === "a_venda" ? "Sim. Veja acima as condições e a compatibilidade." : "Ainda não. Estamos preparando o lançamento. Deixe seu e-mail e avisamos quando sair." },
  { q: "Vai ser pago?", a: appConfig.price ? "Sim, e o preço está indicado nesta página." : "Sim, o aplicativo será pago. O preço ainda não foi definido e vai aparecer nesta página, junto com a política de reembolso, antes de qualquer cobrança. As fichas continuam abertas e gratuitas aqui no portal." },
  { q: "É aplicativo de loja?", a: "Não. É um aplicativo web: abre pelo navegador do celular e pode ser instalado na tela de início, sem passar pela App Store nem pelo Google Play." },
  { q: "Em quais aparelhos vai funcionar?", a: "Em qualquer celular ou computador com navegador atual. Foi desenhado primeiro para o celular, com o console ligado ao lado." },
  { q: "Preciso do aplicativo para usar o portal?", a: "Não. As respostas continuam completas e gratuitas no portal. O aplicativo é para quem quer organização e acompanhamento durante o jogo." },
  { q: "O aplicativo é oficial da Rockstar?", a: "Não. Assim como o portal, é um projeto independente feito por fãs, sem ligação com a Rockstar Games ou a Take-Two Interactive." },
  { q: "O aplicativo altera o jogo ou acessa meu console?", a: "Não. É um guia de consulta: não modifica o jogo, não é mod e não se conecta ao console." },
];

export default function AppPage() {
  const selling = appConfig.stage === "a_venda" && appConfig.purchaseUrl;
  const crumbs = [{ name: "Início", href: "/" }, { name: "Aplicativo" }];
  const ld: unknown[] = [breadcrumbLd(crumbs, "/app/"), faqLd(faq)];
  // SoftwareApplication só entra com produto real à venda: nada de preço ou nota fictícios.
  if (selling && appConfig.name && appConfig.price) {
    ld.push({ "@type": "SoftwareApplication", name: appConfig.name, applicationCategory: "GameApplication", operatingSystem: appConfig.platforms?.join(", "), url: abs("/app/"),
      offers: { "@type": "Offer", price: appConfig.price.amount, priceCurrency: appConfig.price.currency, url: appConfig.purchaseUrl } });
  }
  const primaryCta = selling
    ? <TrackLink external href={appConfig.purchaseUrl!} className="btn btn-app" event="begin_checkout" params={{ placement: "app_hero" }}>Comprar o aplicativo<Icon name="arrow" size={18} /></TrackLink>
    : <a href="#avise-me" className="btn btn-app">Quero ser avisado do lançamento<Icon name="arrow" size={18} /></a>;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": ld }} />
      <TrackView event="view_app_landing" />
      <section className="border-b border-ink-600 grid-paper">
        <div className="wrap pt-6 pb-14 sm:pb-20">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="label text-violet mb-4">{appConfig.stage === "a_venda" ? "Aplicativo" : "Aplicativo · em preparação"}</p>
              <h1 className="text-[2.3rem] leading-[1.05] sm:text-6xl font-black">Não jogue GTA 6 deixando metade da aventura para trás.</h1>
              <p className="mt-5 text-lg sm:text-xl text-fg-muted max-w-xl">Para quem não quer apenas zerar. Um comparsa de bolso que sabe o que tem por perto, lembra o que você já achou e respeita o seu ritmo na história. Não pede parte do assalto.</p>
              <div className="mt-7 flex flex-wrap gap-3">{primaryCta}<a href="#funcoes" className="btn btn-ghost">Ver as funções</a></div>
              {!selling && <p className="mt-4 text-sm text-fg-subtle max-w-lg">Transparência: o aplicativo está em construção e ainda não foi lançado. Abaixo, cada função traz o estado real em que se encontra.</p>}
            </div>
            <div aria-hidden="true" className="flex justify-center">
              <div className="w-60 rounded-[2.2rem] border-2 border-ink-500 bg-ink-900 p-4 shadow-2xl">
                <div className="h-2 w-16 rounded-full bg-ink-600 mx-auto mb-4" />
                <p className="label text-violet mb-2">Perto de você</p>
                {[["target", "ok"], ["cash", "violet"], ["car", "violet"], ["eye", "violet"], ["egg", "violet"]].map(([ic, t], i) => (
                  <div key={ic} className="flex items-center gap-3 rounded-xl border border-ink-600 p-2.5 mb-2">
                    <span className={`tone-${t}`}><Icon name={i === 0 ? "check" : ic} size={20} /></span>
                    <span className="grow"><span className="block h-2 rounded bg-ink-500" style={{ width: `${90 - i * 9}%` }} /><span className="block h-1.5 rounded bg-ink-600 w-1/2 mt-1.5" /></span>
                  </div>
                ))}
                <p className="text-[0.65rem] text-fg-subtle text-center mt-3">Ilustração conceitual, não é captura de tela.</p>
              </div>
            </div>
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

        <section className="pt-16 sm:pt-24" aria-labelledby="h-porque">
          <div className="max-w-3xl">
            <div className="deco-rule mb-4" aria-hidden="true"><i /></div>
            <h2 id="h-porque" className="text-3xl sm:text-4xl font-extrabold">Menos tempo procurando. Mais tempo descobrindo.</h2>
            <div className="mt-4 text-lg text-fg-muted flex flex-col gap-4">
              <p>Você conhece a cena: jogo pausado, celular na mão, três abas abertas e um vídeo de doze minutos, com patrocínio no meio, para explicar uma coisa que cabia em uma frase. Quando você acha, a polícia já chegou.</p>
              <p>O portal resolve a pergunta de agora. O aplicativo fica com o resto do serviço: o que mais existe naquela região, o que você já riscou da lista e o que ainda está te esperando. É o arquivo da Nina com a memória do Bira, só que no seu bolso e sem as histórias repetidas.</p>
            </div>
          </div>
        </section>

        <section id="funcoes" className="pt-16 sm:pt-24 scroll-mt-24" aria-labelledby="h-func">
          <h2 id="h-func" className="text-3xl sm:text-4xl font-extrabold">Funções e em que pé cada uma está</h2>
          <p className="mt-3 text-fg-muted max-w-2xl">Promessa vaga a gente deixa para os políticos de Leonida. Cada função tem uma etiqueta: disponível, em desenvolvimento ou planejada.</p>
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
          <div className="card p-5"><p className="label text-fg-subtle mb-2">Preço</p><p>{appConfig.price ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(appConfig.price.amount) : <span className="text-fg-muted">O aplicativo será pago. Valor a definir; as fichas seguem gratuitas no portal.</span>}</p></div>
          <div className="card p-5"><p className="label text-fg-subtle mb-2">Compatibilidade</p><p>{appConfig.platforms ? appConfig.platforms.join(", ") + "." : <span className="text-fg-muted">A anunciar.</span>}</p></div>
          <div className="card p-5"><p className="label text-fg-subtle mb-2">Reembolso e suporte</p><p className="text-fg-muted">{appConfig.refundPolicy ?? "A política de cancelamento e reembolso será publicada junto com o preço."} {!appConfig.supportContact && <>Enquanto isso, fale com a gente pelo <Link className="link" href="/contato/">contato</Link>.</>}</p></div>
        </section>

        <section id="avise-me" className="pt-16 sm:pt-24 scroll-mt-24" aria-labelledby="h-avise">
          <div className="card border-violet/40 p-6 sm:p-10 grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="label text-violet mb-3">{selling ? "Pronto para explorar?" : "Lista de aviso"}</p>
              <h2 id="h-avise" className="text-3xl sm:text-4xl font-extrabold">Seu próximo segredo está esperando para ser descoberto.</h2>
              <p className="mt-3 text-fg-muted">{selling ? "Leve o portal inteiro no bolso e acompanhe seu progresso." : "Deixe seu e-mail e a gente avisa no dia do lançamento. Um aviso só. Quem manda dez e-mails por semana é a seguradora."}</p>
            </div>
            {selling ? <div>{primaryCta}</div> : <WaitlistForm source="app_landing" />}
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
