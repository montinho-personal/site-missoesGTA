import Link from "next/link";
import { Shell } from "@/components/Shell";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Termos de uso", description: `As regras de uso do ${site.name}, um portal independente de fãs sobre GTA 6.`, path: "/termos/" });

export default function Termos() {
  return (
    <Shell title="Termos de uso" path="/termos/">
      <div className="prose text-fg-muted">
        <p className="text-sm">Última atualização: 25 de novembro de 2026.</p>
        <h2>O que é este site</h2>
        <p>{site.independence}</p>
        <h2>Sobre as informações</h2>
        <p>Fazemos o possível para publicar informação correta e deixamos claro, em cada página, o nível de verificação. Mesmo assim, jogos mudam com atualizações e relatos podem estar errados. Use as informações por sua conta e avise quando encontrar um erro.</p>
        <h2>O que você envia</h2>
        <p>Ao enviar uma descoberta, correção, imagem ou link, você declara que tem o direito de compartilhar aquele material e nos autoriza a usá-lo para apurar e publicar a informação, com crédito quando você quiser. Não envie material de vazamentos, conteúdo ilegal ou dados pessoais de terceiros.</p>
        <h2>Uso do conteúdo</h2>
        <p>Os textos, a organização e a identidade visual do portal são nossos. Você pode citar trechos com link para a página original. Cópia integral ou automatizada para republicação não é permitida.</p>
        <h2>Marcas e materiais de terceiros</h2>
        <p>Nomes de jogos, personagens e lugares pertencem aos seus titulares e aparecem aqui para identificar e comentar o jogo. Se você é titular de algum direito e entende que um material foi usado de forma indevida, fale com a gente pelo <Link href="/contato/">contato</Link> e nós analisamos com prioridade.</p>
        <h2>Aplicativo</h2>
        <p>As condições de compra, cancelamento e reembolso do aplicativo serão publicadas na <Link href="/app/">página do aplicativo</Link> antes do início das vendas.</p>
        <h2>Privacidade</h2>
        <p>O tratamento de dados pessoais está descrito na <Link href="/privacidade/">política de privacidade</Link>.</p>
      </div>
    </Shell>
  );
}
