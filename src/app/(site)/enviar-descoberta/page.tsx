import Link from "next/link";
import { Shell } from "@/components/Shell";
import { SubmissionForm } from "@/components/Forms";
import { Callout } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Envie sua descoberta de GTA 6", description: "Encontrou uma missão secreta, um lugar escondido ou um erro em uma página? Envie para a equipe apurar e publicar com o status correto.", path: "/enviar-descoberta/" });

export default async function Enviar({ searchParams }: PageProps<"/enviar-descoberta">) {
  const sp = await searchParams;
  const isFix = sp.tipo === "correcao";
  const ref = typeof sp.ref === "string" ? sp.ref.slice(0, 40) : undefined;
  return (
    <Shell title={isFix ? "Sugerir uma correção" : "Envie sua descoberta"} eyebrow="Comunidade" path="/enviar-descoberta/"
      lead={isFix ? "Viu algo errado ou desatualizado? Conte o que é e, se puder, mande a prova." : "Achou algo no jogo que não está aqui? Conte para a gente. Tudo passa por apuração antes de ser publicado."}>
      <div className="flex gap-2.5 mb-8">
        <Link href="/enviar-descoberta/" className="chip" aria-current={!isFix ? "page" : undefined}>Nova descoberta</Link>
        <Link href="/enviar-descoberta/?tipo=correcao" className="chip" aria-current={isFix ? "page" : undefined}>Correção</Link>
      </div>
      {ref && <p className="mb-5 text-fg-muted">Sobre o registro <strong className="text-fg">{ref.toUpperCase()}</strong>.</p>}
      <SubmissionForm key={isFix ? "c" : "d"} kind={isFix ? "correcao" : "descoberta"} refId={ref} />
      <div className="mt-10"><Callout icon="shield" title="O que acontece depois">
        <p>Um editor lê cada envio. Se for possível reproduzir ou houver evidência suficiente, publicamos com o status adequado e damos o crédito a quem enviou, se a pessoa quiser. Não publicamos mods como se fossem conteúdo do jogo, nem material de vazamentos.</p>
      </Callout></div>
    </Shell>
  );
}
