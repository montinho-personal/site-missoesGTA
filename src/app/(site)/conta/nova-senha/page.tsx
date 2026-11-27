import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Callout } from "@/components/ui";
import { NewPasswordForm } from "@/components/Forms";
import { pageMeta } from "@/lib/seo";
import { resetEmailFor } from "@/server/accounts";
import { appUrl } from "@/server/access";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Criar senha", description: "Crie ou troque a senha do aplicativo.", path: "/conta/nova-senha/", noindex: true });

export default async function NovaSenha({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = (await searchParams).t;
  const token = typeof t === "string" ? t : "";
  const email = token ? await resetEmailFor(token) : null;
  return (
    <Shell title="Criar senha" path="/conta/nova-senha/">
      {email ? (
        <div className="max-w-md">
          <p className="mb-4 text-fg-muted">Conta: <strong className="text-fg">{email}</strong></p>
          <NewPasswordForm token={token} appLink={await appUrl()} />
        </div>
      ) : (
        <Callout icon="info" title="Este link venceu ou já foi usado"><p>O link vale por 1 hora e uma vez só. <Link className="link" href="/conta/esqueci-senha/">Peça um novo</Link>.</p></Callout>
      )}
    </Shell>
  );
}
