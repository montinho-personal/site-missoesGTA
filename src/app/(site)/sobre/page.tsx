import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Callout, JsonLd } from "@/components/ui";
import { pageMeta, orgLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { narrators } from "@/lib/voice";

export const metadata = pageMeta({ title: "Sobre o projeto", description: `Quem faz o ${site.name}, por que ele existe e como trabalhamos: um portal independente de fãs sobre os segredos de GTA 6.`, path: "/sobre/" });

export default function Sobre() {
  return (
    <Shell title="Sobre o projeto" eyebrow="Feito por jogadores, para jogadores" path="/sobre/" lead="A paixão de descobrir aquilo que o jogo não te conta.">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", mainEntity: orgLd() }} />
      <div className="prose text-fg-muted">
        <p>GTA nunca foi só um jogo para a gente. Foi tarde inteira no San Andreas, código anotado em folha de caderno, discussão no recreio sobre um carro que só aparecia de madrugada e um lugar no mapa que alguém jurava ter visto.</p>
        <p>Metade daquilo era lenda. A outra metade era verdade, e era justamente essa mistura que fazia a gente ligar o videogame de novo no dia seguinte.</p>
        <p>O mapa de GTA 6 é maior do que qualquer um daqueles. A curiosidade é a mesma. O que mudou é o barulho: vídeo com seta vermelha na miniatura, lista copiada de lista, boato com cara de fato. Você perde uma hora procurando uma coisa que nem existe.</p>
        <p><strong>Por isso abrimos este arquivo.</strong> Para quem não quer só terminar GTA 6, e sim descobrir o que ele esconde, sem precisar adivinhar em quem confiar.</p>
        <h2>Quem toca o arquivo</h2>
        <p>Dois personagens nossos, criados para este projeto. Eles não existem no jogo. Existem aqui, para brigar um com o outro na sua frente.</p>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {narrators.map((n) => (
          <li key={n.name} className="card p-5">
            <p className="label text-cyan">{n.role}</p>
            <h3 className="font-display text-2xl font-extrabold mt-1">{n.name}</h3>
            <p className="mt-1 text-pink font-semibold">{n.line}</p>
            <p className="mt-3 text-fg-muted text-[0.97rem]">{n.bio}</p>
          </li>
        ))}
      </ul>
      <div className="prose text-fg-muted mt-8">
        <p>A divisão de trabalho é simples: o Bira traz a história, a Nina pede a prova. É por isso que cada página tem um selo. Quando você lê “Relato da comunidade”, é o Bira falando. Quando lê “Confirmado”, a Nina foi lá e testou.</p>
        <h2>O que a gente promete</h2>
        <ul>
          <li><strong>Resposta primeiro.</strong> Você está com o controle numa mão e o celular na outra. A resposta vem na primeira linha.</li>
          <li><strong>Selo em tudo.</strong> Cada descoberta diz se foi testada por nós, se é relato ou se ainda está em investigação. Veja <Link href="/metodologia/">como verificamos</Link>.</li>
          <li><strong>Fontes à mostra.</strong> De onde veio a informação fica na página, com link.</li>
          <li><strong>Spoiler só se você quiser.</strong> A proteção vem ligada por padrão.</li>
          <li><strong>Quando não sabemos, dizemos.</strong> Campo sem confirmação aparece como “ainda não confirmado”, nunca preenchido no chute.</li>
          <li><strong>Piada é piada, fato é fato.</strong> O humor fica nos textos do site. A ficha de cada descoberta é seca de propósito.</li>
        </ul>
        <h2>Quem faz de verdade</h2>
        <p>Uma equipe pequena de jogadores que acompanha a série desde os primeiros jogos. Quando uma descoberta for testada por alguém da equipe dentro do jogo, a página registra a plataforma, a versão e a data.</p>
        <h2>Como o projeto se sustenta</h2>
        <p>O portal é gratuito e as respostas ficam completas aqui. O projeto se mantém com o <Link href="/app/">aplicativo</Link>, que vende organização e praticidade para quem quer explorar a fundo. Não escondemos resposta para forçar ninguém a comprar. Isso é coisa de vilão de missão secundária.</p>
      </div>
      <div className="mt-8"><Callout icon="info" title="Projeto independente"><p>{site.independence}</p></Callout></div>
    </Shell>
  );
}
