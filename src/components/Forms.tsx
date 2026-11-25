"use client";
import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { joinWaitlist, submitToTeam, type FormState } from "@/server/public-actions";
import { track } from "@/lib/analytics";
import { Icon } from "./Icon";

function Trap({ attempt }: { attempt?: unknown }) {
  // carimbo de tempo escrito direto no campo, depois da hidratação e a cada tentativa
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.value = String(Date.now()); }, [attempt]);
  return (
    <>
      <input ref={ref} type="hidden" name="t" defaultValue="" />
      <div aria-hidden="true" className="absolute -left-[9999px]"><label>Não preencha este campo<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
    </>
  );
}

function Status({ state }: { state: FormState }) {
  if (!state) return <p aria-live="polite" className="sr-only" />;
  return <p role={state.ok ? "status" : "alert"} className={`card p-4 flex gap-3 ${state.ok ? "border-ok/60" : "border-red/60"}`}><Icon name={state.ok ? "check" : "info"} size={20} className={state.ok ? "text-ok shrink-0 mt-0.5" : "text-red shrink-0 mt-0.5"} /><span>{state.message}</span></p>;
}

const Err = ({ id, msg }: { id: string; msg?: string }) => (msg ? <span id={id} className="field-hint !text-red">{msg}</span> : null);

export function SubmissionForm({ kind, refId }: { kind: "descoberta" | "correcao" | "contato"; refId?: string }) {
  const [state, action, pending] = useActionState(submitToTeam, null);
  useEffect(() => { if (state?.ok) track("submission_sent", { kind }); }, [state, kind]);
  if (state?.ok) return <Status state={state} />;
  const e = state?.errors ?? {};
  const v = state?.values ?? {};
  const isContact = kind === "contato";
  return (
    <form action={action} className="relative flex flex-col gap-5" noValidate>
      <Trap attempt={state} />
      <input type="hidden" name="kind" value={kind} />
      {refId && <input type="hidden" name="ref" value={refId} />}
      {!isContact && (
        <div>
          <label className="field-label" htmlFor="f-title">{kind === "correcao" ? "O que precisa ser corrigido?" : "O que você encontrou?"}</label>
          <input className="field" id="f-title" name="title" defaultValue={v.title} maxLength={140} placeholder={kind === "correcao" ? "Ex.: a localização está errada" : "Ex.: carro raro perto do píer"} />
        </div>
      )}
      <div>
        <label className="field-label" htmlFor="f-msg">{isContact ? "Mensagem" : "Conte os detalhes"}</label>
        <textarea className="field" id="f-msg" name="message" defaultValue={v.message} required maxLength={4000} aria-invalid={!!e.message} aria-describedby="e-msg h-msg" />
        <Err id="e-msg" msg={e.message} />
        {!isContact && <span id="h-msg" className="field-hint">Como chegar, com qual personagem, em que horário, o que aconteceu. Quanto mais específico, mais rápido conseguimos conferir.</span>}
      </div>
      {!isContact && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="field-label" htmlFor="f-where">Onde fica?</label><input className="field" id="f-where" name="where" defaultValue={v.where} maxLength={300} placeholder="Região e ponto de referência" /></div>
            <div><label className="field-label" htmlFor="f-plat">Plataforma</label>
              <select className="field" id="f-plat" name="platform" defaultValue={v.platform ?? ""}><option value="">Prefiro não dizer</option><option>PlayStation 5</option><option>Xbox Series X|S</option></select></div>
          </div>
          <div>
            <label className="field-label" htmlFor="f-ev">Link de print ou vídeo</label>
            <input className="field" id="f-ev" name="evidence" defaultValue={v.evidence} type="url" inputMode="url" maxLength={500} placeholder="https://" aria-invalid={!!e.evidence} aria-describedby="e-ev h-ev" />
            <Err id="e-ev" msg={e.evidence} />
            <span id="h-ev" className="field-hint">Opcional, mas é o que mais ajuda. Sem evidência, o registro entra no máximo como “Em investigação”.</span>
          </div>
        </>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="f-name">Seu nome ou apelido</label><input className="field" id="f-name" name="name" defaultValue={v.name} maxLength={80} autoComplete="nickname" /><span className="field-hint">Opcional. Usado para dar o crédito, se você quiser.</span></div>
        <div><label className="field-label" htmlFor="f-email">E-mail</label><input className="field" id="f-email" name="email" defaultValue={v.email} type="email" maxLength={160} autoComplete="email" aria-invalid={!!e.email} aria-describedby="e-email" /><Err id="e-email" msg={e.email && "Digite um e-mail válido ou deixe em branco."} /><span className="field-hint">Opcional. Só para tirarmos dúvidas sobre o envio.</span></div>
      </div>
      <div>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="consent" required defaultChecked={v.consent === "on"} className="mt-1 size-5 accent-[#ff4d9d]" aria-describedby="e-consent" />
          <span className="text-[0.95rem] text-fg-muted">Concordo que a equipe use este envio para apurar e publicar a informação, conforme a <Link href="/privacidade/" className="link">política de privacidade</Link>.</span></label>
        <Err id="e-consent" msg={e.consent} />
      </div>
      {state && !state.ok && <Status state={state} />}
      <button className="btn btn-primary self-start" disabled={pending}>{pending ? "Enviando…" : "Enviar"}</button>
    </form>
  );
}

export function WaitlistForm({ source }: { source: string }) {
  const [state, action, pending] = useActionState(joinWaitlist, null);
  useEffect(() => { if (state?.ok) track("waitlist_signup", { source }); }, [state, source]);
  if (state?.ok) return <Status state={state} />;
  return (
    <form action={action} className="relative flex flex-col gap-3.5" noValidate>
      <Trap attempt={state} />
      <input type="hidden" name="source" value={source} />
      <div>
        <label className="field-label" htmlFor={`w-${source}`}>Seu e-mail</label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input className="field grow" id={`w-${source}`} name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" defaultValue={state?.values?.email} />
          <button className="btn btn-app shrink-0" disabled={pending}>{pending ? "Enviando…" : "Quero ser avisado"}</button>
        </div>
      </div>
      <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="consent" required defaultChecked={state?.values?.consent === "on"} className="mt-1 size-5 accent-[#a98bff]" />
        <span className="text-sm text-fg-muted">Aceito receber um aviso por e-mail sobre o lançamento do aplicativo. Sem spam; dá para sair quando quiser. <Link href="/privacidade/" className="link">Privacidade</Link>.</span></label>
      {state && !state.ok && <Status state={state} />}
    </form>
  );
}
