"use client";
import { useState } from "react";
import { Icon } from "./Icon";
import { track } from "@/lib/analytics";
import { whatsappText, withUtm, type ShareContext } from "@/lib/share-copy";

/**
 * Três jeitos de espalhar, cada um no formato certo:
 * - WhatsApp: abre a conversa com a mensagem pronta (para um amigo ou um grupo);
 * - Stories e Status: gera a imagem vertical e abre o compartilhamento do celular (Instagram, WhatsApp Status);
 *   o link vai junto para a área de transferência, para colar no adesivo de link do Instagram;
 * - Copiar link.
 */
export function ShareSheet({ ctx, storyPath, compact }: { ctx: ShareContext; storyPath?: string; compact?: boolean }) {
  const [msg, setMsg] = useState("");
  const campaign = ctx.kind === "ficha" ? `ficha_${ctx.category ?? "geral"}` : ctx.kind;
  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 6000); };
  const btn = `inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-full border text-sm font-semibold ${compact ? "" : "grow sm:grow-0"}`;

  const stories = async () => {
    const link = withUtm(ctx.url, "instagram", campaign);
    try { await navigator.clipboard.writeText(link); } catch {}
    track("share", { method: "stories", context: campaign });
    if (!storyPath) return;
    try {
      const blob = await (await fetch(storyPath)).blob();
      const file = new File([blob], "missoes-secretas-gta6.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: link });
        say("Link copiado. No Instagram, use o adesivo Link e cole.");
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
      say("Imagem salva e link copiado. No Stories, escolha a imagem e cole o link no adesivo Link.");
    } catch { say("Não deu para gerar a imagem agora. O link já está copiado."); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        <a href={`https://wa.me/?text=${encodeURIComponent(whatsappText(ctx))}`} target="_blank" rel="noopener noreferrer"
          onClick={() => track("share", { method: "whatsapp", context: campaign })}
          className={`${btn} border-[#25d366]/60 text-[#5fe39a] hover:bg-[#25d366]/10`}>
          <Icon name="phone" size={18} />WhatsApp
        </a>
        {storyPath && (
          <button type="button" onClick={stories} className={`${btn} border-pink/60 text-pink hover:bg-pink/10`}>
            <Icon name="star" size={18} />{compact ? "Stories" : "Stories e Status"}
          </button>
        )}
        <button type="button" className={`${btn} border-ink-500 text-fg-muted hover:border-cyan hover:text-cyan`}
          onClick={async () => { try { await navigator.clipboard.writeText(withUtm(ctx.url, "copia", campaign)); say("Link copiado."); track("share", { method: "copy", context: campaign }); } catch {} }}>
          <Icon name="share" size={18} />Copiar link
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-fg-subtle">{msg}</p>
    </div>
  );
}
