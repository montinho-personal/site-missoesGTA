import Link from "next/link";
import { Shell } from "@/components/Shell";
import { SubmissionForm } from "@/components/Forms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Contato", description: "Fale com a equipe do portal: dúvidas, parcerias, imprensa e pedidos relacionados a dados pessoais.", path: "/contato/" });

export default function Contato() {
  return (
    <Shell title="Contato" path="/contato/" lead="Dúvidas, parcerias, imprensa ou pedidos sobre seus dados pessoais. Para avisar de uma descoberta ou de um erro, use o formulário próprio.">
      <p className="mb-8"><Link href="/enviar-descoberta/" className="btn btn-ghost btn-sm">Enviar descoberta ou correção</Link></p>
      <SubmissionForm kind="contato" />
    </Shell>
  );
}
