import Link from "next/link";
import { Breadcrumbs, Callout, FaqList, JsonLd } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { saleConfig } from "@/server/mercadopago";

export const revalidate = 600;
export const metadata = pageMeta({
  title: "Como baixar e usar o aplicativo Missões Secretas GTA 6",
  description: "Passo a passo para comprar, instalar no Android, no iPhone e no computador, ativar o código de acesso e usar o mapa, a lista, a rota e o modo sem spoiler.",
  path: "/app/como-baixar-e-usar/",
});

const toc = [
  ["antes", "Antes de começar"],
  ["comprar", "1. Comprar e receber o código"],
  ["instalar", "2. Instalar no aparelho"],
  ["ativar", "3. Ativar com o código"],
  ["usar", "4. Usar no dia a dia"],
  ["dicas", "Dicas de quem joga"],
  ["duvidas", "Dúvidas"],
] as const;

function Passos({ itens }: { itens: React.ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {itens.map((t, i) => (
        <li key={i} className="card p-4 flex gap-4">
          <span className="font-display font-black text-2xl text-pink leading-none w-6 shrink-0" aria-hidden="true">{i + 1}</span>
          <div className="text-[0.98rem]">{t}</div>
        </li>
      ))}
    </ol>
  );
}

function Plataforma({ id, icone, titulo, nota, children }: { id: string; icone: string; titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h3 id={id} className="font-display text-xl font-bold inline-flex items-center gap-2.5"><span className="text-cyan"><Icon name={icone} size={22} /></span>{titulo}</h3>
      {nota && <p className="mt-1 mb-3 text-sm text-fg-subtle">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <strong className="text-fg font-semibold">{children}</strong>;

const faq = [
  { q: "Preciso baixar na Play Store ou na App Store?", a: "Não. É um aplicativo web: você abre o endereço no navegador e adiciona à tela de início. Ele ganha ícone, abre em tela cheia e funciona como um aplicativo de loja, sem ocupar o espaço de um." },
  { q: "Perdi o código de acesso. E agora?", a: "Volte ao endereço que apareceu depois do pagamento (ele continua mostrando o código) ou fale com a gente pelo contato, usando o e-mail da compra. Achamos o seu código pelo e-mail." },
  { q: "Troquei de celular. Perco o acesso?", a: "Não. Instale de novo no aparelho novo e digite o mesmo código." },
  { q: "Funciona sem internet?", a: "A ideia é funcionar: depois do primeiro acesso com internet, o aplicativo guarda as fichas no aparelho para você consultar sem sinal. Essa parte ainda está em construção." },
  { q: "Ocupa muito espaço?", a: "Pouco. Um aplicativo web não instala um pacote grande: guarda só as fichas e o mapa do arquivo." },
  { q: "O aplicativo mexe no jogo ou no console?", a: "Não. É um guia de consulta: não é mod, não se conecta ao console e não altera nada no jogo." },
  { q: "Posso desistir da compra?", a: "Pode, em até 7 dias depois da compra, como prevê o Código de Defesa do Consumidor. O valor volta e o código deixa de valer." },
  { q: "É oficial da Rockstar?", a: "Não. É um guia independente feito por fãs, sem ligação com a Rockstar Games ou com a Take-Two Interactive." },
];

export default async function ComoBaixarEUsar() {
  const sale = await saleConfig();
  const crumbs = [{ name: "Início", href: "/" }, { name: "Aplicativo", href: "/app/" }, { name: "Como baixar e usar" }];
  return (
    <div className="wrap pt-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbLd(crumbs, "/app/como-baixar-e-usar/"), faqLd(faq)] }} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 max-w-3xl">
        <p className="label text-violet mb-3">Manual do comparsa de bolso</p>
        <h1 className="text-4xl sm:text-5xl font-black">Como baixar e usar o aplicativo</h1>
        <p className="mt-4 text-lg text-fg-muted">Do pagamento ao primeiro pino no mapa, em três passos. O Bira jura que leva dois minutos. A Nina cronometrou: são uns cinco.</p>
      </header>

      <div className="mt-6 max-w-3xl">
        <Callout icon="info" title="O aplicativo está em construção">
          <p>Este manual descreve como ele vai funcionar no lançamento, a partir da especificação do projeto. Quando algo ainda não existe, a gente avisa no próprio texto. {sale.enabled ? "A compra já está aberta." : "A compra ainda não está aberta: deixe seu e-mail na página do aplicativo para ser avisado."}</p>
        </Callout>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 max-w-3xl">
          <section id="antes" aria-labelledby="h-antes" className="scroll-mt-24">
            <h2 id="h-antes" className="text-2xl sm:text-3xl font-extrabold">Antes de começar</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["phone", "Um celular ou computador", "Com navegador atualizado: Chrome, Safari, Edge ou Samsung Internet."],
                ["radar", "Internet no primeiro acesso", "Para instalar e baixar as fichas. Depois, a ideia é funcionar também sem sinal."],
                ["file", "Seu código de acesso", "Ele aparece na tela logo depois do pagamento (formato MS6-XXXX-XXXX-XXXX)."],
                ["shield", "Nada de loja de aplicativos", "Não precisa de Play Store nem App Store, nem de conta Google ou Apple."],
              ].map(([ic, t, d]) => (
                <li key={t} className="card p-4 flex gap-3"><span className="text-cyan shrink-0 mt-0.5"><Icon name={ic} size={22} /></span><div><p className="font-semibold">{t}</p><p className="text-sm text-fg-muted mt-0.5">{d}</p></div></li>
              ))}
            </ul>
          </section>

          <section id="comprar" aria-labelledby="h-comprar" className="mt-14 scroll-mt-24">
            <h2 id="h-comprar" className="text-2xl sm:text-3xl font-extrabold">1. Comprar e receber o código</h2>
            <div className="mt-4">
              <Passos itens={[
                <>Abra a <Link href="/app/" className="link">página do aplicativo</Link> e desça até o formulário de compra.</>,
                <>Digite seu <B>e-mail</B>, aceite os termos e toque em <B>Comprar</B>. Use um e-mail que você lê: é por ele que a gente acha o seu código se você perder.</>,
                <>Você vai para a página do <B>Mercado Pago</B>. Pague com <B>Pix</B> ou <B>cartão</B>. Nenhum dado de cartão passa pelo nosso site.</>,
                <>Depois de pagar, você volta para a página <B>Seu acesso ao aplicativo</B>. Pix costuma confirmar em instantes; cartão pode levar alguns minutos. Se aparecer “Aguardando a confirmação”, espere um pouco e atualize a página.</>,
                <>Com o pagamento confirmado, aparece o seu <B>código de acesso</B>. <B>Salve a página nos favoritos</B> e anote o código. É ele que libera o aplicativo.</>,
              ]} />
            </div>
            <p className="mt-3 text-sm text-fg-subtle">Ganhou um código de cortesia? Pule esta etapa e vá direto para a instalação.</p>
          </section>

          <section id="instalar" aria-labelledby="h-instalar" className="mt-14 scroll-mt-24">
            <h2 id="h-instalar" className="text-2xl sm:text-3xl font-extrabold">2. Instalar no aparelho</h2>
            <p className="mt-3 text-fg-muted">O aplicativo é instalado pelo navegador. Ele ganha ícone na tela de início, abre em tela cheia e se comporta como um aplicativo de loja. O endereço do aplicativo aparece na página do seu código e no e-mail de lançamento.</p>

            <Plataforma id="h-android" icone="phone" titulo="Android (Chrome)">
              <Passos itens={[
                <>Abra o endereço do aplicativo no <B>Chrome</B>.</>,
                <>Toque no menu de <B>três pontinhos</B> (⋮), no canto superior direito.</>,
                <>Toque em <B>Instalar app</B>. Se não aparecer, toque em <B>Adicionar à tela inicial</B>.</>,
                <>Confirme em <B>Instalar</B>. O ícone aparece na tela de início em alguns segundos.</>,
              ]} />
            </Plataforma>

            <Plataforma id="h-samsung" icone="phone" titulo="Android (Samsung Internet)">
              <Passos itens={[
                <>Abra o endereço do aplicativo no <B>Samsung Internet</B>.</>,
                <>Toque no menu de <B>três tracinhos</B> (≡), na barra de baixo.</>,
                <>Toque em <B>Adicionar página a</B> e depois em <B>Tela inicial</B>.</>,
              ]} />
            </Plataforma>

            <Plataforma id="h-iphone" icone="phone" titulo="iPhone e iPad (Safari)" nota="No iPhone, use o Safari: é o caminho que funciona em qualquer versão do sistema.">
              <Passos itens={[
                <>Abra o endereço do aplicativo no <B>Safari</B>.</>,
                <>Toque no botão <B>Compartilhar</B>: o quadrado com uma seta para cima, na barra de baixo (no iPad, fica no alto).</>,
                <>Role a lista e toque em <B>Adicionar à Tela de Início</B>.</>,
                <>Toque em <B>Adicionar</B>, no canto superior direito. O ícone aparece junto dos outros aplicativos.</>,
              ]} />
            </Plataforma>

            <Plataforma id="h-pc" icone="grid" titulo="Computador (Chrome ou Edge)" nota="Útil para deixar o mapa aberto numa segunda tela enquanto joga.">
              <Passos itens={[
                <>Abra o endereço do aplicativo no <B>Chrome</B> ou no <B>Edge</B>.</>,
                <>Clique no ícone de <B>instalar</B>, no fim da barra de endereço (uma tela com uma seta), ou abra o menu e escolha <B>Instalar Missões Secretas GTA 6</B>.</>,
                <>Confirme em <B>Instalar</B>. O aplicativo abre em janela própria e fica no menu Iniciar ou no Dock.</>,
              ]} />
            </Plataforma>

            <p className="mt-6 text-sm text-fg-subtle">Os nomes dos botões podem mudar um pouco conforme a versão do navegador. Se não achar a opção, procure por “instalar” ou “tela de início” no menu.</p>
          </section>

          <section id="ativar" aria-labelledby="h-ativar" className="mt-14 scroll-mt-24">
            <h2 id="h-ativar" className="text-2xl sm:text-3xl font-extrabold">3. Ativar com o código</h2>
            <div className="mt-4">
              <Passos itens={[
                <>Abra o aplicativo pelo ícone na tela de início.</>,
                <>Na primeira vez, ele pede o <B>código de acesso</B>. Digite como está na página do seu código. Pode ser com ou sem os hífens, em maiúsculas ou minúsculas.</>,
                <>Pronto. O aplicativo baixa as fichas e abre no <B>Início</B>.</>,
              ]} />
            </div>
            <p className="mt-3 text-sm text-fg-subtle">Em construção: a tela que pede o código ainda está sendo feita no aplicativo. O código em si já funciona e já é conferido pelo nosso site.</p>
          </section>

          <section id="usar" aria-labelledby="h-usar" className="mt-14 scroll-mt-24">
            <h2 id="h-usar" className="text-2xl sm:text-3xl font-extrabold">4. Usar no dia a dia</h2>
            <p className="mt-3 text-fg-muted">O aplicativo tem seis abas na barra de baixo. No computador, a lista fica à esquerda e o mapa fixo à direita.</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["compass", "Início", "Quanto você já fez, quanto de dinheiro escondido já pegou, a próxima parada e o que some no fim do seu capítulo."],
                ["pin", "Mapa", "Os segredos como pinos, com a cor da categoria. Toque num pino para ver nome, prêmio, selo e capítulo, abrir o passo a passo ou marcar como feito."],
                ["grid", "Lista", "Filtre por categoria, só os confiáveis, só do seu capítulo, ou esconda o que já fez. Ordene por região, por dinheiro ou pelo que está mais perto."],
                ["flag", "Rota", "Uma ordem sugerida por capítulo, em voltas, para fazer vários segredos na mesma viagem. Dá para ver a rota desenhada no mapa."],
                ["file", "Códigos", "Todos os códigos de cofre e teclado num lugar só, com dígitos grandes para ler de longe, do sofá."],
                ["menu", "Mais", "Modo sem spoiler, como ler selos e pinos, sugerir um segredo, compartilhar o seu progresso e o aviso de guia não oficial."],
              ].map(([ic, t, d]) => (
                <div key={t} className="card p-4">
                  <dt className="font-display text-lg font-bold inline-flex items-center gap-2"><span className="text-violet"><Icon name={ic} size={20} /></span>{t}</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-fg-muted">{d}</dd>
                </div>
              ))}
            </dl>

            <h3 className="font-display text-xl font-bold mt-10">Como ler um pino</h3>
            <p className="mt-2 text-fg-muted">A cor diz a categoria. A forma diz o quanto o lugar é certo, o mesmo selo de precisão que você vê nas fichas deste site:</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {[
                ["Pino cheio", "Ponto exato: o próprio lugar foi identificado."],
                ["Pino vazado", "Perto daqui: o lugar fica a até uns 300 m. Ao tocar, aparece um círculo com essa área."],
                ["Pino tracejado", "Só a região: o ponto pode estar a mais de 1 km. Ao tocar, aparece um círculo maior."],
                ["Sem pino", "Sem local fixo: a ficha explica onde procurar."],
              ].map(([t, d]) => <li key={t} className="flex gap-3"><Icon name="target" size={20} className="text-cyan shrink-0 mt-0.5" /><span><B>{t}.</B> <span className="text-fg-muted">{d}</span></span></li>)}
            </ul>

            <h3 className="font-display text-xl font-bold mt-10">Uma sessão típica, do sofá</h3>
            <div className="mt-4">
              <Passos itens={[
                <>No <B>Início</B>, informe em que <B>capítulo</B> você está. O aplicativo destaca o que já dá para fazer e avisa o que some quando o capítulo acaba.</>,
                <>Toque em <B>Estou aqui</B> e marque no mapa onde você está no jogo. Não usa GPS: é o seu ponto em Leonida, não no mundo real.</>,
                <>Abra a <B>Lista</B> em “mais perto de mim”. Os segredos ficam em ordem de distância.</>,
                <>Escolha um, abra o <B>passo a passo</B> e vá marcando cada passo. Com a ficha aberta, o aplicativo pede ao aparelho para não apagar a tela.</>,
                <>Assista ao <B>vídeo de quem já fez</B> dentro da própria ficha, se travar em alguma parte.</>,
                <>Terminou? Toque em <B>Feito</B>. A ficha mostra “Já que você está aqui” com os segredos vizinhos para fazer na mesma viagem.</>,
              ]} />
            </div>

            <h3 className="font-display text-xl font-bold mt-10">Sem spoiler</h3>
            <p className="mt-2 text-fg-muted">Ligue em <B>Mais</B>. O que é de capítulos à frente aparece como “Segredo do Cap. 3”, sem nome, prêmio nem pino, até você chegar lá ou tocar em “mostrar assim mesmo”. Vale para o mapa, as listas e a busca.</p>

            <h3 className="font-display text-xl font-bold mt-10">O pino está fora?</h3>
            <p className="mt-2 text-fg-muted">Achou o lugar em outro ponto? Na ficha, toque em <B>O pino está fora?</B> e marque no mapa onde ele fica de verdade. A correção vai para a revisão da Nina antes de mudar para todo mundo.</p>
          </section>

          <section id="dicas" aria-labelledby="h-dicas" className="mt-14 scroll-mt-24">
            <h2 id="h-dicas" className="text-2xl sm:text-3xl font-extrabold">Dicas de quem joga</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {[
                "Antes de terminar o Capítulo 1, abra o Início e veja o bloco do que some no fim do capítulo. Tem dinheiro que não volta.",
                "Confira o selo antes de atravessar o mapa. Código numa ficha “Não verificado” pode estar errado.",
                "No computador, deixe o mapa aberto numa segunda tela. No celular, apoie do lado do controle com a ficha aberta.",
                "Use a Rota para não voltar duas vezes à mesma ilha.",
              ].map((d) => <li key={d} className="card p-4 flex gap-3"><Icon name="bulb" size={20} className="text-gold shrink-0 mt-0.5" /><span className="text-[0.97rem]">{d}</span></li>)}
            </ul>
          </section>

          <section id="duvidas" aria-labelledby="h-duvidas" className="mt-14 scroll-mt-24">
            <h2 id="h-duvidas" className="text-2xl sm:text-3xl font-extrabold mb-5">Dúvidas</h2>
            <FaqList items={faq} />
          </section>

          <div className="mt-12 card border-violet/40 p-6 sm:p-8">
            <p className="font-display text-2xl font-extrabold">Pronto para o primeiro pino?</p>
            <p className="mt-2 text-fg-muted">{sale.enabled ? `Acesso completo por ${sale.priceLabel}, pagamento único.` : "Deixe seu e-mail e a gente avisa no dia do lançamento."}</p>
            <Link href="/app/#avise-me" className="btn btn-app mt-5">{sale.enabled ? "Comprar o aplicativo" : "Quero ser avisado"}<Icon name="arrow" size={18} /></Link>
          </div>
          <p className="mt-8 text-sm text-fg-subtle">{site.independence}</p>
        </div>

        <aside className="hidden lg:block no-print">
          <nav aria-label="Neste manual" className="sticky top-24 card p-5">
            <p className="label text-fg-subtle mb-3">Neste manual</p>
            <ol className="flex flex-col gap-1 text-[0.95rem]">{toc.map(([id, l]) => <li key={id}><a href={`#${id}`} className="block py-1.5 text-fg-muted hover:text-pink">{l}</a></li>)}</ol>
          </nav>
        </aside>
      </div>
    </div>
  );
}
