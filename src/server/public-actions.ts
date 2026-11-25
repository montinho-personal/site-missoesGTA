"use server";
import { z } from "zod";
import { canWrite, q } from "./db";
import { clientKey, rateLimit } from "./security";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

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

export async function submitToTeam(_prev: FormState, fd: FormData): Promise<FormState> {
  if (looksAutomated(fd)) return { ok: false, message: BOT };
  const parsed = submissionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Confira os campos destacados.", errors };
  }
  if (!(await canWrite())) return { ok: false, message: "O envio está indisponível neste ambiente de demonstração (sem banco de dados persistente)." };
  const key = await clientKey();
  if (!(await rateLimit("submission", key, 5, 3600))) return { ok: false, message: "Você enviou várias mensagens em pouco tempo. Tente de novo mais tarde." };
  const d = parsed.data;
  await q(
    `insert into submissions (kind, name, email, payload, entry_id, ip_hash) values ($1, $2, $3, $4::jsonb, $5, $6)`,
    [d.kind, d.name || null, d.email || null, JSON.stringify({ title: d.title, message: d.message, where: d.where, evidence: d.evidence, platform: d.platform }), d.ref || null, key],
  );
  return { ok: true, message: d.kind === "contato" ? "Mensagem recebida. Obrigado por escrever." : "Recebido. Vamos apurar antes de publicar qualquer coisa, e o status vai refletir o que conseguirmos comprovar." };
}

const waitSchema = z.object({ email: z.email("Digite um e-mail válido.").max(160), consent: z.literal("on", { error: "É preciso concordar para avisarmos você." }), source: text(60).optional() });

export async function joinWaitlist(_prev: FormState, fd: FormData): Promise<FormState> {
  if (looksAutomated(fd)) return { ok: false, message: BOT };
  const parsed = waitSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (!(await canWrite())) return { ok: false, message: "A lista está indisponível neste ambiente de demonstração (sem banco de dados persistente)." };
  const key = await clientKey();
  if (!(await rateLimit("waitlist", key, 5, 3600))) return { ok: false, message: "Muitas tentativas. Tente de novo mais tarde." };
  await q(`insert into waitlist (email, source) values ($1, $2) on conflict (email) do nothing`, [parsed.data.email.toLowerCase(), parsed.data.source || null]);
  return { ok: true, message: "Pronto. Avisaremos você por e-mail quando o aplicativo estiver disponível, e só sobre isso." };
}
