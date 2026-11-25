import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/server/auth";
import { LoginForm } from "../ui";

export const dynamic = "force-dynamic";

export default async function Login() {
  if (await isAdmin()) redirect("/admin/");
  return (
    <div className="wrap wrap-narrow pt-20">
      <h1 className="text-3xl font-black">Painel editorial</h1>
      {adminConfigured() ? <LoginForm /> : (
        <p className="card p-5 mt-6 text-fg-muted">O painel está desativado. Defina <code>ADMIN_PASSWORD</code> e <code>SESSION_SECRET</code> (16+ caracteres) nas variáveis de ambiente para ativá-lo.</p>
      )}
    </div>
  );
}
