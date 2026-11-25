import Link from "next/link";
import { Shell } from "@/components/Shell";
import { FaqList, JsonLd } from "@/components/ui";
import { SpoilerToggle } from "@/components/client";
import { faqLd, pageMeta } from "@/lib/seo";
import { homeFaq } from "@/lib/game-facts";

export const metadata = pageMeta({ title: "Central de ajuda", description: "Como usar o portal: busca, controle de spoilers, favoritos, status de verificação e as dúvidas mais comuns sobre GTA 6.", path: "/ajuda/" });

const siteFaq = [
  { q: "Como funciona a proteção contra spoilers?", a: "Ela vem ligada. Descobertas que revelam a história aparecem cobertas, na lista e na própria página, até você tocar em “Mostrar mesmo assim”. Você liga e desliga no menu, no rodapé ou nesta página, e a escolha fica guardada no seu aparelho." },
  { q: "Onde ficam meus favoritos?", a: "No seu navegador, neste aparelho. Não pedimos cadastro e nada é enviado para servidor. Se você limpar os dados do navegador, a lista some." },
  { q: "O site guarda o que eu pesquiso?", a: "Só se você marcar a opção “Guardar minhas buscas neste aparelho”, na busca. Mesmo assim o histórico fica só no seu navegador e pode ser apagado com um toque." },
  { q: "Por que alguns campos aparecem como “Ainda não confirmado”?", a: "Porque nenhuma fonte confiável informou aquele dado e nós ainda não testamos. Preferimos deixar em aberto a preencher no chute." },
  { q: "Como aviso que uma informação está errada?", a: "No fim de cada descoberta há um link para enviar correção. Se tiver print ou vídeo, mande junto: é o que mais acelera a conferência." },
  { q: "Vocês são um site oficial da Rockstar?", a: "Não. Somos um portal independente, criado por fãs, sem ligação com a Rockstar Games ou a Take-Two Interactive." },
];

export default function Ajuda() {
  return (
    <Shell title="Central de ajuda" path="/ajuda/" lead="Como tirar o máximo do portal e as respostas para as dúvidas que mais aparecem.">
      <JsonLd data={{ "@context": "https://schema.org", ...faqLd([...siteFaq, ...homeFaq]) }} />
      <section aria-labelledby="h1a"><h2 id="h1a" className="text-2xl font-extrabold mb-4">Usando o portal</h2>
        <div className="mb-5"><SpoilerToggle /></div>
        <FaqList items={siteFaq} /></section>
      <section aria-labelledby="h2a" className="mt-12"><h2 id="h2a" className="text-2xl font-extrabold mb-4">Dúvidas sobre GTA 6</h2><FaqList items={homeFaq} /></section>
      <p className="mt-10 text-fg-muted">Não achou o que procurava? Veja as <Link className="link" href="/gta-6/dicas/">dicas e tutoriais</Link> ou <Link className="link" href="/contato/">fale com a gente</Link>.</p>
    </Shell>
  );
}
