import Link from "next/link";
import { Shell } from "@/components/Shell";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Política de privacidade", description: `Quais dados o ${site.name} trata, para quê, por quanto tempo e como você exerce seus direitos previstos na LGPD.`, path: "/privacidade/" });

export default function Privacidade() {
  return (
    <Shell title="Política de privacidade" path="/privacidade/" lead="Resumo honesto: dá para usar o portal inteiro sem cadastro, e a medição de audiência só liga se você aceitar.">
      <div className="prose text-fg-muted">
        <p className="text-sm">Última atualização: 25 de novembro de 2026.</p>
        <h2>O que fica só no seu aparelho</h2>
        <p>Favoritos, preferência de spoilers, histórico de buscas (se você ativar) e a sua escolha de consentimento são guardados no armazenamento local do navegador. Esses dados não são enviados aos nossos servidores e somem se você limpar os dados do navegador.</p>
        <h2>O que recebemos quando você envia algo</h2>
        <ul>
          <li><strong>Envio de descoberta, correção ou contato:</strong> o texto que você escreveu, o link de evidência e, se você informar, nome e e-mail. Usamos para apurar, responder e dar crédito. Base legal: seu consentimento e nosso legítimo interesse em manter a informação correta.</li>
          <li><strong>Lista de aviso do aplicativo:</strong> seu e-mail e a data do consentimento, usados apenas para avisar sobre o lançamento. Você pode pedir a remoção a qualquer momento.</li>
          <li><strong>Compra do aplicativo:</strong> seu e-mail, o valor e a situação do pedido, mais o acesso gerado e os aparelhos em que ele foi aberto (um identificador aleatório, sem dado pessoal). Usamos o e-mail para mandar a confirmação da compra e o link de entrada quando você pedir. O pagamento acontece na página do Mercado Pago; não recebemos nem guardamos dados de cartão. Guardamos o pedido pelo prazo exigido pela legislação fiscal e de consumo.</li>
          <li><strong>Proteção contra abuso:</strong> para limitar envios em massa, guardamos por até 24 horas um identificador derivado do endereço IP de forma irreversível (hash). Não guardamos o IP em si.</li>
        </ul>
        <h2>Medição de audiência</h2>
        <p>Se você aceitar no aviso de consentimento, carregamos o Google Tag Manager e o Google Analytics 4 para entender quais páginas ajudam mais: buscas feitas no site, páginas vistas e cliques em botões. Se você recusar, nada disso é carregado. Você pode mudar de ideia em “Preferências de privacidade”, no rodapé.</p>
        <h2>Com quem compartilhamos</h2>
        <p>Com os fornecedores que operam o site (hospedagem, banco de dados e, com seu consentimento, medição de audiência). Não vendemos dados pessoais.</p>
        <h2>Por quanto tempo</h2>
        <p>Envios da comunidade ficam guardados enquanto forem úteis para a apuração e o histórico editorial. E-mails da lista de aviso são apagados depois do lançamento ou quando você pedir, o que vier primeiro.</p>
        <h2>Seus direitos</h2>
        <p>Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir confirmação, acesso, correção, anonimização, portabilidade e eliminação dos seus dados, além de revogar o consentimento. Faça o pedido pela página de <Link href="/contato/">contato</Link>.</p>
        <h2>Menores de idade</h2>
        <p>GTA 6 é um jogo com classificação indicativa para adultos, e este portal é voltado a esse público. Não coletamos intencionalmente dados de crianças.</p>
        <h2>Mudanças</h2>
        <p>Quando esta política mudar, a data no topo muda junto.</p>
      </div>
    </Shell>
  );
}
