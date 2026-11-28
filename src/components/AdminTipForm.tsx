"use client";
import { useActionState } from "react";
import { addTipVideo } from "@/server/admin-actions";
import { TIP_THEMES } from "@/lib/video-url";

export function AddTipVideoForm({ dicas }: { dicas: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState(addTipVideo, null);
  return (
    <form action={action} className="card p-5 grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2"><label className="field-label" htmlFor="tv-url">Link do vídeo (YouTube, TikTok ou Instagram)</label>
        <input id="tv-url" name="url" required className="field" placeholder="https://youtube.com/shorts/..." /></div>
      <div><label className="field-label" htmlFor="tv-theme">Tema</label>
        <select id="tv-theme" name="theme" className="field" defaultValue=""><option value="">Escolher depois</option>{TIP_THEMES.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</select></div>
      <div><label className="field-label" htmlFor="tv-entry">Dica (página do site)</label>
        <select id="tv-entry" name="entry_id" className="field" defaultValue=""><option value="">Escolher depois</option>{dicas.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
      <div><label className="field-label" htmlFor="tv-creator">Criador (só se o site não achar sozinho)</label><input id="tv-creator" name="creator_name" className="field" /></div>
      <div><label className="field-label" htmlFor="tv-title">Título (opcional)</label><input id="tv-title" name="title" className="field" /></div>
      <div className="md:col-span-2"><label className="field-label" htmlFor="tv-note">Nota interna: o que o vídeo ensina, em que minuto</label><input id="tv-note" name="note" className="field" /></div>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Buscando o vídeo…" : "Guardar como rascunho"}</button>
        {state && <p role="status" className={state.ok ? "text-ok" : "text-red"}>{state.message}</p>}
      </div>
    </form>
  );
}
