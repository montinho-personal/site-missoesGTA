import { Shell } from "@/components/Shell";
import { ForgotPasswordForm } from "@/components/Forms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Esqueci a senha", description: "Receba por e-mail o link para criar ou trocar a senha do aplicativo.", path: "/conta/esqueci-senha/", noindex: true });

export default function EsqueciSenha() {
  return (
    <Shell title="Esqueci a senha" path="/conta/esqueci-senha/" lead="Digite o e-mail da compra. Mandamos um link para você criar uma senha nova. Serve também para quem comprou ou ganhou cortesia e ainda não tem senha.">
      <div className="max-w-md"><ForgotPasswordForm /></div>
    </Shell>
  );
}
