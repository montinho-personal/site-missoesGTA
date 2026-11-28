"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canWrite, q } from "./db";
import { clientKey, rateLimit } from "./security";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; values?: Record<string, string> } | null;

const text = (max: number) => z.string().trim().max(max);
const BOT = "Não foi possível enviar. Tente novamente em instantes.";

/** Armadilhas simples contra robôs: campo isca e tempo mínimo de preenchimento. */
function looksAutomated(fd: FormData): boolean {
  if (String(fd.get("website") ?? "") !== "") return true;
  const started = Number(fd.get("t") ?? 0);
  return !started || Date.now() - started < 2500;
}

const submissionSchema = z.object({
  kind: z.enum(["descoberta", "correcao", "contato"]),
  name: text(80).optional(),
  email: z.union([z.literal(""), z.email().max(160)]).optional(),
  title: text(140).optional(),
  message: z.string().trim().min(20, "Conte um pouco mais (pelo menos 20 caracteres).").max(4000),
  where: text(300).optional(),
  evidence: z.union([z.literal(""), z.url().max(500).refine((u) => /^https?:\/\//.test(u), "Use um link http(s).")]).optional(),
  platform: text(40).optional(),
  ref: text(40).optional(),
  consent: z.literal("on", { error: "É preciso concordar para enviarmos." }),
});

// Em caso de erro devolvemos o que a pessoa digitou: ninguém deve reescrever um relato por causa de um campo.
const keep = (fd: FormData) => Object.fromEntries([...fd].filter(([k, v]) => typeof v === "string" && !["t", "website", "senha"].includes(k)).map(([k, v]) => [k, String(v).slice(0, 4000)]));

export async function submitToTeam(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = keep(fd);
  if (looksAutomated(fd)) return { ok: false, message: BOT, values };
  const parsed = submissionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Confira os campos destacados.", errors, values };
  }
  if (!(await canWrite())) return { ok: false, message: "O envio está indisponível neste ambiente de demonstração (sem banco de dados persistente).", values };
  const key = await clientKey();
  if (!(await rateLimit("submission", key, 5, 3600))) return { ok: false, message: "Você enviou várias mensagens em pouco tempo. Tente de novo mais tarde.", values };
  const d = parsed.data;
  await q(
    `insert into submissions (kind, name, email, payload, entry_id, ip_hash) values ($1, $2, $3, $4::text::jsonb, $5, $6)`,
    [d.kind, d.name || null, d.email || null, JSON.stringify({ title: d.title, message: d.message, where: d.where, evidence: d.evidence, platform: d.platform }), d.ref || null, key],
  );
  return { ok: true, message: d.kind === "contato" ? "Mensagem recebida. Obrigado por escrever." : "Recebido. Vamos apurar antes de publicar qualquer coisa, e o status vai refletir o que conseguirmos comprovar." };
}

const waitSchema = z.object({ email: z.email("Digite um e-mail válido.").max(160), consent: z.literal("on", { error: "É preciso concordar para avisarmos você." }), source: text(60).optional() });

export async function joinWaitlist(_prev: FormState, fd: FormData): Promise<FormState> {
  if (looksAutomated(fd)) return { ok: false, message: BOT };
  const parsed = waitSchema.safeParse(Object.fromEntries(fd));
  const values = keep(fd);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, values };
  if (!(await canWrite())) return { ok: false, values, message: "A lista está indisponível neste ambiente de demonstração (sem banco de dados persistente)." };
  const key = await clientKey();
  if (!(await rateLimit("waitlist", key, 5, 3600))) return { ok: false, message: "Muitas tentativas. Tente de novo mais tarde." };
  await q(`insert into waitlist (email, source) values ($1, $2) on conflict (email) do nothing`, [parsed.data.email.toLowerCase(), parsed.data.source || null]);
  return { ok: true, message: "Pronto. Avisaremos você por e-mail quando o aplicativo estiver disponível, e só sobre isso." };
}

// Origem do comprador (UTM, clique de anúncio, site que mandou), validada campo a campo. Qualquer coisa fora disso é descartada.
const touchSchema = z.object({
  utm_source: z.string().max(120), utm_medium: z.string().max(120), utm_campaign: z.string().max(120), utm_content: z.string().max(120),
  utm_term: z.string().max(120), gclid: z.string().max(120), fbclid: z.string().max(120), ref: z.string().max(120), landing: z.string().max(120), at: z.string().max(10),
}).partial().strip();
const originSchema = z.object({ ultimo: touchSchema.optional(), primeiro: touchSchema.optional() }).strip();
function parseOrigin(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || !raw || raw.length > 3000) return null;
  try { const r = originSchema.safeParse(JSON.parse(raw)); return r.success && (r.data.ultimo || r.data.primeiro) ? JSON.stringify(r.data) : null; } catch { return null; }
}

const buySchema = z.object({ email: z.email("Digite um e-mail válido.").max(160), consent: z.literal("on", { error: "É preciso aceitar os termos para comprar." }), metodo: z.enum(["pix", "cartao"]).default("pix"), senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(100, "A senha pode ter no máximo 100 caracteres.") });

/**
 * Abre um pedido. Pix (padrão): cria a cobrança pela API e leva o comprador para a página de acesso,
 * onde o QR Code aparece, sem login no Mercado Pago. Cartão: manda para a página do Mercado Pago.
 */
export async function startCheckout(_prev: FormState, fd: FormData): Promise<FormState> {
  const { saleConfig, createPreference, createPixPayment, cardPublicKey } = await import("./mercadopago");
  const { newOrderId } = await import("./licenses");
  const values = keep(fd);
  if (looksAutomated(fd)) return { ok: false, message: BOT, values };
  const sale = await saleConfig();
  if (!sale.enabled) return { ok: false, message: "A venda ainda não está aberta.", values };
  const parsed = buySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, values };
  if (!(await rateLimit("checkout", await clientKey(), 8, 3600))) return { ok: false, message: "Muitas tentativas. Tente de novo mais tarde.", values };
  const id = newOrderId();
  const email = parsed.data.email.toLowerCase();
  // Conta: e-mail novo cria a conta com a senha; e-mail que já tem conta precisa da mesma senha.
  const { accountExists, setPassword, verifyLogin } = await import("./accounts");
  if (await accountExists(email)) {
    if (!(await verifyLogin(email, parsed.data.senha))) return { ok: false, message: "Este e-mail já tem conta. Use a mesma senha de antes, ou recupere em “Esqueci a senha”, no app.", values };
  } else await setPassword(email, parsed.data.senha);
  await q(`insert into orders (id, email, amount_cents, attribution) values ($1, $2, $3, $4)`, [id, email, sale.cents, parseOrigin(fd.get("origem"))]);
  const fail = { ok: false as const, message: "Não foi possível abrir o pagamento agora. Nada foi cobrado. Tente de novo em instantes.", values };
  // Pagamento só por Pix (decisão do Montinho em 27/11/2026). O caminho do cartão fica no código, desligado.
  if (parsed.data.metodo === "cartao" && process.env.CARTAO_LIGADO === "1") {
    if (cardPublicKey()) redirect(`/app/cartao/?pedido=${id}`);
    let url: string;
    try { url = await createPreference({ id, email, cents: sale.cents }); } catch { return fail; }
    redirect(url);
  }
  try {
    const pix = await createPixPayment({ id, email, cents: sale.cents });
    await q(`update orders set payment_id = $2, pix_qr = $3, pix_qr_b64 = $4, pix_expires_at = $5 where id = $1`, [id, pix.paymentId, pix.qr, pix.qrB64, pix.expiresAt]);
  } catch { return fail; }
  redirect(`/app/acesso/?pedido=${id}`);
}

const forgotSchema = z.object({ email: z.email("Digite um e-mail válido.").max(160) });

/** "Esqueci a senha" pelo site: manda o link de nova senha. A resposta é a mesma para qualquer e-mail. */
export async function forgotPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = keep(fd);
  if (looksAutomated(fd)) return { ok: false, message: BOT, values };
  const parsed = forgotSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, values };
  const email = parsed.data.email.toLowerCase();
  if (!(await rateLimit("esqueci", await clientKey(), 6, 3600))) return { ok: false, message: "Muitos pedidos. Tente de novo daqui a pouco.", values };
  const { accountExists, activeLicenseFor, newResetToken } = await import("./accounts");
  if ((await accountExists(email)) || (await activeLicenseFor(email))) {
    const { resetEmail } = await import("./access");
    const { sendEmail } = await import("./email");
    const { abs } = await import("@/lib/site");
    await sendEmail({ to: email, ...resetEmail(abs(`/conta/nova-senha/?t=${await newResetToken(email)}`)) });
  }
  return { ok: true, message: "Se este e-mail tiver compra ou conta, o link para criar a senha chega em instantes. Olhe também a caixa de spam." };
}

const newPassSchema = z.object({ t: z.string().regex(/^[a-f0-9]{48}$/), senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(100), senha2: z.string() });

/** Cria ou troca a senha com o link do e-mail (vale 1 hora, uma vez só). */
export async function resetPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = newPassSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].path[0] === "t" ? "Este link não vale mais. Peça um novo em “Esqueci a senha”." : parsed.error.issues[0].message };
  if (parsed.data.senha !== parsed.data.senha2) return { ok: false, message: "As duas senhas não são iguais." };
  const { redeemResetToken } = await import("./accounts");
  const email = await redeemResetToken(parsed.data.t, parsed.data.senha);
  if (!email) return { ok: false, message: "Este link venceu ou já foi usado. Peça um novo em “Esqueci a senha”." };
  return { ok: true, message: email };
}
