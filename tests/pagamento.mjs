// Teste da venda com um Mercado Pago SIMULADO (não fala com o Mercado Pago de verdade).
// Sobe um servidor falso da API, o site apontado para ele, e percorre: compra, aviso de pagamento,
// código de acesso, validação pelo aplicativo, cortesia e revogação.
// Uso: o build precisa das mesmas variáveis, porque /app/ é gerada no build:
//   DATABASE_URL=... MP_ACCESS_TOKEN=x MP_WEBHOOK_SECRET=x npm run build && DATABASE_URL=... node tests/pagamento.mjs
import http from "node:http";
import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const PORT = 3300, FAKE = 3399, BASE = `http://localhost:${PORT}`, SECRET = "segredo-de-teste", ADMIN = "senha-de-teste-123";
const results = []; const ok = (n, p, d = "") => { results.push(p); console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`); };

const pagamentos = new Map(); let preferencia = null;
const fake = http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "POST" && req.url === "/checkout/preferences") {
      preferencia = { ...JSON.parse(body), auth: req.headers.authorization };
      return res.end(JSON.stringify({ id: "pref-1", init_point: `${BASE}/app/acesso/?pedido=${preferencia.external_reference}` }));
    }
    const m = /^\/v1\/payments\/(\d+)$/.exec(req.url);
    if (m && pagamentos.has(m[1])) return res.end(JSON.stringify(pagamentos.get(m[1])));
    res.statusCode = 404; res.end("{}");
  });
}).listen(FAKE);

const env = { ...process.env, PORT: String(PORT), MP_API_BASE: `http://localhost:${FAKE}`, MP_ACCESS_TOKEN: "TEST-token", MP_WEBHOOK_SECRET: SECRET, ADMIN_PASSWORD: ADMIN, SESSION_SECRET: "0123456789abcdef0123456789abcdef", NEXT_PUBLIC_SITE_URL: BASE };
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: "ignore" });
const fim = (code) => { server.kill(); fake.close(); process.exit(code); };
for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + "/robots.txt")).ok) break; } catch {} await new Promise((r) => setTimeout(r, 500)); }

const aviso = (id, { assinatura = true } = {}) => {
  const ts = String(Date.now()), rid = "req-" + id;
  const v1 = createHmac("sha256", assinatura ? SECRET : "errado").update(`id:${id};request-id:${rid};ts:${ts};`).digest("hex");
  return fetch(`${BASE}/api/mercadopago/webhook/?data.id=${id}&type=payment`, { method: "POST", headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": rid, "content-type": "application/json" }, body: JSON.stringify({ type: "payment", data: { id } }) });
};
const valida = async (codigo) => (await (await fetch(`${BASE}/api/acesso/validar/`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ codigo }) })).json()).valido;

try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // O preço é definido pelo dono no painel, sem variável de ambiente e sem novo deploy.
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" });
  ok("sem preço, a venda fica desligada e a página mostra a lista de aviso", (await page.getByRole("button", { name: "Quero ser avisado" }).count()) === 1);
  await page.goto(BASE + "/admin/login/");
  await page.getByLabel("Senha").fill(ADMIN);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/admin\/$/);
  await page.goto(BASE + "/admin/acessos/");
  await page.getByLabel(/Preço do aplicativo/).fill("19,90");
  await page.getByRole("button", { name: "Salvar preço" }).click();
  await page.waitForSelector("text=Venda ligada");
  ok("dono define o preço no painel e a venda liga", true);
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" });
  ok("página do app mostra o preço configurado", /R\$\s19,90/.test(await page.locator("main").innerText()));
  ok("botão de compra no lugar da lista de aviso", (await page.getByRole("button", { name: /Comprar por/ }).count()) === 1);
  await page.getByLabel("Seu e-mail").fill("comprador@example.com");
  await page.locator("#avise-me").getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: /Comprar por/ }).click();
  await page.waitForURL(/\/app\/acesso\/\?pedido=/);
  const pedido = new URL(page.url()).searchParams.get("pedido");
  ok("preferência criada com valor, referência e retorno corretos", preferencia?.items?.[0]?.unit_price === 19.9 && preferencia.external_reference === pedido && preferencia.notification_url.endsWith("/api/mercadopago/webhook/") && preferencia.auth === "Bearer TEST-token");
  ok("antes do pagamento a página não mostra código", /Aguardando a confirmação/.test(await page.locator("main").innerText()) && !/MS6-/.test(await page.locator("main").innerText()));

  pagamentos.set("111", { id: 111, status: "approved", external_reference: pedido, transaction_amount: 19.9, currency_id: "BRL" });
  ok("aviso com assinatura errada é recusado (401)", (await aviso("111", { assinatura: false })).status === 401);
  await page.reload({ waitUntil: "load" });
  ok("assinatura errada não libera nada", !/MS6-/.test(await page.locator("main").innerText()));

  pagamentos.set("222", { id: 222, status: "approved", external_reference: pedido, transaction_amount: 1, currency_id: "BRL" });
  await aviso("222");
  await page.reload({ waitUntil: "load" });
  ok("pagamento com valor menor que o pedido não libera", !/MS6-/.test(await page.locator("main").innerText()));

  ok("aviso verdadeiro é aceito", (await aviso("111")).status === 200);
  await aviso("111"); // o Mercado Pago repete avisos
  await page.reload({ waitUntil: "load" });
  const codigo = /MS6-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.exec(await page.locator("main").innerText())?.[0];
  ok("pagamento aprovado mostra o código de acesso", Boolean(codigo), codigo ?? "");
  ok("o aplicativo valida o código (com ou sem hífen, em minúsculas)", (await valida(codigo)) === true && (await valida(codigo.replace(/-/g, "").toLowerCase())) === true);
  ok("código inventado não vale", (await valida("MS6-AAAA-BBBB-CCCC")) === false && (await valida("")) === false);
  ok("pedido inexistente não revela nada", /Pedido não encontrado/.test(await (await fetch(`${BASE}/app/acesso/?pedido=${"0".repeat(32)}`)).text()));

  // painel: cortesia e revogação
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + "/admin/acessos/");
  const painel = await page.locator("body").innerText();
  ok("painel mostra a venda paga e a receita", /Venda ligada/.test(painel) && /R\$\s19,90/.test(painel) && painel.includes(codigo));
  await page.getByLabel(/E-mail de quem recebe/).fill("amigo@example.com");
  await page.getByLabel(/Anotação/).fill("Cortesia de teste");
  await page.getByRole("button", { name: "Gerar código" }).click();
  await page.waitForURL(/novo=MS6-/);
  const cortesia = new URL(page.url()).searchParams.get("novo");
  ok("cortesia gera código que vale sem pagamento", (await valida(cortesia)) === true, cortesia);
  await page.locator("tr", { hasText: cortesia }).getByRole("button", { name: "Revogar" }).click();
  await page.waitForTimeout(700);
  ok("código revogado deixa de valer", (await valida(cortesia)) === false);

  // estorno
  pagamentos.set("111", { ...pagamentos.get("111"), status: "refunded" });
  await aviso("111");
  ok("estorno desativa o código da compra", (await valida(codigo)) === false);
  await browser.close();
} catch (e) { console.error(e); ok("execução sem exceção", false, String(e).slice(0, 200)); }
console.log(`\n${results.filter(Boolean).length}/${results.length} verificações de pagamento passaram`);
fim(results.every(Boolean) ? 0 : 1);
