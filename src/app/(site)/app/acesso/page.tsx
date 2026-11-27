import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Callout } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { pageMeta } from "@/lib/seo";
import { q } from "@/server/db";
import { ShareSheet } from "@/components/ShareSheet";
import { abs } from "@/lib/site";
import { refreshPayment } from "@/server/payments";
import { accessLink, appUrl } from "@/server/access";
import { AutoRefresh, CopyPix, PurchaseTracker } from "@/components/client";

export const dynamic = "force-dynamic";

/** mo•••@gmail.com: mostra só o começo do e-mail. */
const mask = (e: string) => { const [u, d] = e.split("@"); return `${u.slice(0, 2)}•••@${d}`; };
export const metadata = pageMeta({ title: "Seu acesso ao aplicativo", description: "Situação do seu pedido e acesso ao aplicativo.", path: "/app/acesso/", noindex: true });

export default async function Acesso({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const pedido = typeof sp.pedido === "string" && /^[a-f0-9]{32}$/.test(sp.pedido) ? sp.pedido : null;
  // O número do pedido é longo e aleatório: funciona como a chave desta página.
  type Row = { email: string; amount_cents: number; access_email_at: string | null; status: string; code: string | null; lic: string | null; payment_id: string | null; pix_qr: string | null; pix_qr_b64: string | null; pix_expires_at: string | null; pix_valid: boolean | null };
  const read = async () => pedido ? (await q<Row>(
    `select o.email, o.amount_cents, o.access_email_at::text, o.status, l.code, l.status as lic, o.payment_id, o.pix_qr, o.pix_qr_b64, o.pix_expires_at, (o.pix_expires_at > now()) as pix_valid from orders o left join licenses l on l.order_id = o.id where o.id = $1`, [pedido]))[0] : undefined;
  let row = await read();
  // Pix pendente: confere direto na API, para liberar o código mesmo se o aviso do Mercado Pago atrasar.
  if (row?.status === "pendente" && row.payment_id) { await refreshPayment(row.payment_id); row = await read(); }
  const pixAberto = row?.status === "pendente" && row.pix_qr && row.pix_qr_b64 && row.pix_expires_at && row.pix_valid;
  const link = row?.code ? accessLink(await appUrl(), row.code) : null;
  const pixVencido = row?.status === "pendente" && row.pix_qr && !pixAberto;
  return (
    <Shell title="Seu acesso ao aplicativo" path="/app/acesso/">
      {!row && <Callout icon="info" title="Pedido não encontrado"><p>Confira o endereço que você recebeu depois do pagamento. Se precisar, <Link className="link" href="/contato/">fale com a gente</Link>.</p></Callout>}
      {row?.status === "pago" && <PurchaseTracker orderId={pedido!} cents={row.amount_cents} />}
      {row?.status === "pago" && row.code && row.lic === "ativa" && (
        <div className="card border-ok/60 p-6">
          <p className="label text-ok">Pagamento confirmado</p>
          <h2 className="mt-2 text-3xl font-black">Seu acesso está liberado.</h2>
          <p className="mt-3 text-fg-muted">Toque no botão no celular onde você vai jogar: o app abre já liberado. Em qualquer outro celular, entre no app com <strong className="text-fg">o seu e-mail e a senha que você criou</strong>.</p>
          <a href={link!} className="btn btn-app mt-5 w-full sm:w-auto text-lg">Abrir o app<Icon name="arrow" size={18} /></a>
          <p className="mt-4 text-fg-muted">{row.access_email_at ? <>Mandamos a confirmação para <strong className="text-fg">{mask(row.email)}</strong>, com o mesmo botão.</> : <>A confirmação está a caminho do seu e-mail, <strong className="text-fg">{mask(row.email)}</strong>, com o mesmo botão.</>} Vale para até 3 celulares. Esqueceu a senha? <Link href="/conta/esqueci-senha/" className="link">Crie uma nova</Link>.</p>
          <ol className="mt-5 list-decimal pl-5 text-fg-muted flex flex-col gap-1.5">
            <li>Toque em <strong className="text-fg">Abrir o app</strong>.</li>
            <li>Para ter o ícone na tela: no Android (Chrome), três pontinhos ⋮ e <strong className="text-fg">Instalar app</strong>. No iPhone (Safari), <strong className="text-fg">Compartilhar</strong> e <strong className="text-fg">Adicionar à Tela de Início</strong>.</li>
          </ol>
          <p className="mt-3"><Link href="/app/como-baixar-e-usar/#instalar" className="link">Passo a passo com mais detalhes</Link></p>
          <div className="mt-6 border-t border-ink-600 pt-5">
            <p className="font-display text-lg font-bold">Caçar sozinho é mais lento. Chama o parceiro.</p>
            <div className="mt-3"><ShareSheet ctx={{ kind: "acesso", url: abs("/app/") }} storyPath="/app/story/" /></div>
          </div>
          <p className="mt-5 text-sm text-fg-subtle">Precisa de ajuda? Fale com a gente pelo <Link className="link" href="/contato/">contato</Link> com o e-mail da compra. Número para o atendimento: <span className="font-mono">{row.code}</span>.</p>
        </div>
      )}
      {row?.status === "pago" && row.lic === "revogada" && <Callout icon="info" title="Acesso encerrado"><p>Este código foi desativado. Se foi um engano, <Link className="link" href="/contato/">fale com a gente</Link>.</p></Callout>}
      {pixAberto && (
        <div className="card border-violet/60 p-6">
          <AutoRefresh until={row!.pix_expires_at!} />
          <p className="label text-violet">Falta só o Pix</p>
          <h2 className="mt-2 text-2xl font-extrabold">Pague pelo app do seu banco</h2>
          <ol className="mt-3 list-decimal pl-5 text-fg-muted flex flex-col gap-1">
            <li>Abra o app do banco e escolha <strong className="text-fg">Pix</strong>.</li>
            <li>No celular, use <strong className="text-fg">Pix copia e cola</strong>. No computador, aponte a câmera do celular para o QR Code.</li>
            <li>Confirme o pagamento. Esta página mostra o seu código sozinha em poucos segundos.</li>
          </ol>
          <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${row!.pix_qr_b64}`} alt="QR Code do Pix" width={220} height={220} className="rounded-lg bg-white p-2 mx-auto sm:mx-0" />
            <CopyPix code={row!.pix_qr!} />
          </div>
          <p className="mt-4 text-sm text-fg-subtle">O Pix vale até {new Date(row!.pix_expires_at!).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })} (horário de Brasília). Deixe esta página aberta: ela se atualiza sozinha.</p>
        </div>
      )}
      {pixVencido && <Callout icon="clock" title="Este Pix venceu"><p>Nada foi cobrado. <Link className="link" href="/app/#avise-me">Gere um Pix novo</Link> em um clique. Se você pagou e o código não apareceu, <Link className="link" href="/contato/">fale com a gente</Link> com o e-mail da compra.</p></Callout>}
      {row?.status === "pendente" && !row.pix_qr && <Callout icon="clock" title="Aguardando a confirmação do pagamento"><p>Pix costuma confirmar em instantes; boleto e alguns cartões podem demorar mais. Atualize esta página em alguns minutos. Nada é liberado antes da confirmação.</p></Callout>}
      {row?.status === "recusado" && <Callout icon="info" title="Pagamento não aprovado"><p>O Mercado Pago não aprovou este pagamento e nada foi cobrado. Você pode <Link className="link" href="/app/#avise-me">tentar de novo</Link> com outra forma de pagamento.</p></Callout>}
      {row?.status === "estornado" && <Callout icon="info" title="Compra cancelada"><p>Este pedido foi cancelado ou devolvido, e o código deixou de valer.</p></Callout>}
    </Shell>
  );
}
