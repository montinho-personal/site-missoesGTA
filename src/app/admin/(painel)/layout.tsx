import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { logout } from "@/server/admin-actions";
import { getDb } from "@/server/db";

export const dynamic = "force-dynamic";

const NAV = [["/admin/", "Visão geral"], ["/admin/entradas/", "Descobertas e guias"], ["/admin/envios/", "Envios da comunidade"], ["/admin/videos/", "Vídeos de dica"], ["/admin/acessos/", "Acessos e vendas"], ["/admin/categorias/", "Categorias"], ["/admin/palavras-chave/", "Palavras-chave"], ["/admin/ctas/", "CTAs"], ["/admin/redirecionamentos/", "Redirecionamentos"]];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const db = await getDb();
  return (
    <div className="wrap max-w-[86rem] py-5 px-4">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink-600 pb-4 mb-6">
        <Link href="/admin/" className="font-display font-black text-lg">Painel <span className="text-pink">editorial</span></Link>
        <nav aria-label="Painel" className="flex flex-wrap gap-x-4 gap-y-1 text-[0.95rem] grow">{NAV.map(([h, l]) => <Link key={h} href={h} className="text-fg-muted hover:text-fg py-1">{l}</Link>)}</nav>
        <Link href="/" className="text-sm text-fg-subtle hover:text-fg">Ver site</Link>
        <form action={logout}><button className="text-sm text-fg-subtle hover:text-fg underline">Sair</button></form>
      </header>
      {!db.persistent && <p className="card border-orange/60 p-4 mb-6 text-orange">Banco efêmero: as alterações feitas aqui se perdem ao reiniciar. Configure <code>DATABASE_URL</code> para persistir.</p>}
      {children}
    </div>
  );
}
