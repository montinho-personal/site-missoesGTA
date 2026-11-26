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
const keep = (fd: FormData) => Object.fromEntries([...fd].filter(([k, v]) => typeof v === "string" && !["t", "website"].includes(k)).map(([k, v]) => [k, String(v).slice(0, 4000)]));

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

const buySchema = z.object({ email: z.email("Digite um e-mail válido.").max(160), consent: z.literal("on", { error: "É preciso aceitar os termos para comprar." }) });

/** Abre um pedido e manda o comprador para o pagamento no Mercado Pago. */
export async function startCheckout(_prev: FormState, fd: FormData): Promise<FormState> {
  const { saleConfig, createPreference } = await import("./mercadopago");
  const { newOrderId } = await import("./licenses");
  const values = keep(fd);
  if (looksAutomated(fd)) return { ok: false, message: BOT, values };
  const sale = saleConfig();
  if (!sale.enabled) return { ok: false, message: "A venda ainda não está aberta.", values };
  const parsed = buySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, values };
  if (!(await rateLimit("checkout", await clientKey(), 8, 3600))) return { ok: false, message: "Muitas tentativas. Tente de novo mais tarde.", values };
  const id = newOrderId();
  const email = parsed.data.email.toLowerCase();
  await q(`insert into orders (id, email, amount_cents) values ($1, $2, $3)`, [id, email, sale.cents]);
  let url: string;
  try { url = await createPreference({ id, email, cents: sale.cents }); }
  catch { return { ok: false, message: "Não foi possível abrir o pagamento agora. Nada foi cobrado. Tente de novo em instantes.", values }; }
  redirect(url);
}
