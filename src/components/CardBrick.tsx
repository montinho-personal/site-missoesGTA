"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Brick = { unmount: () => void };
type MpCtor = new (key: string, opts: { locale: string }) => { bricks: () => { create: (kind: string, el: string, settings: unknown) => Promise<Brick> } };
declare global { interface Window { MercadoPago?: MpCtor } }

const SDK = "https://sdk.mercadopago.com/js/v2";
const loadSdk = () => new Promise<void>((ok, fail) => {
  if (window.MercadoPago) return ok();
  const old = document.querySelector<HTMLScriptElement>(`script[src="${SDK}"]`);
  const s = old ?? Object.assign(document.createElement("script"), { src: SDK, async: true });
  s.addEventListener("load", () => ok());
  s.addEventListener("error", () => fail(new Error("sdk")));
  if (!old) document.head.appendChild(s);
});

/**
 * Formulário de cartão do próprio Mercado Pago (Card Payment Brick), dentro do site.
 * Os dados do cartão ficam nos campos do Mercado Pago; o site só recebe um token de uso único.
 */
export function CardBrick({ publicKey, pedido, amount, email }: { publicKey: string; pedido: string; amount: number; email: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const brick = useRef<Brick | null>(null);

  useEffect(() => {
    let alive = true;
    loadSdk().then(async () => {
      if (!alive || !window.MercadoPago) return;
      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      brick.current = await mp.bricks().create("cardPayment", "card-brick", {
        initialization: { amount, payer: { email } },
        customization: { visual: { style: { theme: "dark" } }, paymentMethods: { maxInstallments: 1 } },
        callbacks: {
          onReady: () => setLoading(false),
          onError: () => setLoading(false),
          onSubmit: async (data: Record<string, unknown>) => {
            setMsg(null);
            const res = await fetch("/api/mercadopago/cartao/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, pedido }) });
            const out = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
            if (out.ok) { router.push(`/app/acesso/?pedido=${pedido}`); return; }
            setMsg(out.message ?? "Não foi possível concluir. Nada foi cobrado. Tente de novo.");
            throw new Error("recusado");
          },
        },
      });
    }).catch(() => { if (alive) { setLoading(false); setMsg("O formulário do Mercado Pago não carregou. Confira a internet e recarregue a página, ou volte e pague com Pix."); } });
    return () => { alive = false; brick.current?.unmount(); brick.current = null; };
  }, [publicKey, pedido, amount, email, router]);

  return (
    <div>
      {loading && <p className="text-fg-muted" role="status">Carregando o formulário seguro do Mercado Pago…</p>}
      <div id="card-brick" data-pedido={pedido} />
      {msg && <p role="alert" className="mt-4 rounded-lg border border-red/50 bg-red/10 p-3 text-red">{msg}</p>}
    </div>
  );
}
