"use client";
import { useActionState } from "react";
import { importKeywords, login, saveEntry } from "@/server/admin-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4 max-w-sm">
      <div><label className="field-label" htmlFor="pw">Senha</label><input id="pw" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      {state?.error && <p role="alert" className="text-red">{state.error}</p>}
      <button className="btn btn-primary self-start" disabled={pending}>Entrar</button>
    </form>
  );
}

export function EntryFormShell({ children }: { children: React.ReactNode }) {
  const [state, action, pending] = useActionState(saveEntry, null);
  return (
    <form action={action} className="flex flex-col gap-8">
      {children}
      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-ink-950/95 border-t border-ink-600 flex flex-wrap items-center gap-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</button>
        {state?.error && <p role="alert" className="text-red font-semibold">{state.error}</p>}
      </div>
    </form>
  );
}

export function KeywordImport() {
  const [state, action, pending] = useActionState(importKeywords, null);
  return (
    <form action={action} className="card p-4 flex flex-wrap items-end gap-3">
      <div><label className="field-label" htmlFor="kf">Importar CSV</label><input id="kf" type="file" name="file" accept=".csv,text/csv" required className="field" /></div>
      <div><label className="field-label" htmlFor="ks">Fonte</label><input id="ks" name="source" placeholder="AnswerThePublic, Search Console…" className="field" /></div>
      <button className="btn btn-ghost" disabled={pending}>{pending ? "Importando…" : "Importar"}</button>
      {state?.message && <p role="status" className="basis-full text-fg-muted">{state.message}</p>}
    </form>
  );
}
