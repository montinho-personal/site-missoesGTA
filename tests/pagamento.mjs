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

const pagamentos = new Map(); let preferencia = null; let pix = null; let cartao = null; let pixCount = 0;
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const fake = http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "POST" && req.url === "/checkout/preferences") {
      preferencia = { ...JSON.parse(body), auth: req.headers.authorization };
      return res.end(JSON.stringify({ id: "pref-1", init_point: `${BASE}/app/acesso/?pedido=${preferencia.external_reference}` }));
    }
    if (req.method === "POST" && req.url === "/v1/payments" && JSON.parse(body).token) {
      cartao = { ...JSON.parse(body), idem: req.headers["x-idempotency-key"] };
      const id = String(440 + (++pixCount));
      const recusado = cartao.token === "tok-recusado";
      const pay = { id: Number(id), status: recusado ? "rejected" : "approved", status_detail: recusado ? "cc_rejected_insufficient_amount" : "accredited", external_reference: cartao.external_reference, transaction_amount: cartao.transaction_amount, currency_id: "BRL" };
      pagamentos.set(id, pay);
      return res.end(JSON.stringify(pay));
    }
    if (req.method === "POST" && req.url === "/v1/payments") {
      pix = { ...JSON.parse(body), auth: req.headers.authorization, idem: req.headers["x-idempotency-key"] };
      const id = String(330 + (++pixCount));
      pagamentos.set(id, { id: Number(id), status: "pending", external_reference: pix.external_reference, transaction_amount: pix.transaction_amount, currency_id: "BRL" });
      return res.end(JSON.stringify({ id: Number(id), status: "pending", point_of_interaction: { transaction_data: { qr_code: "00020126PIXCOPIAECOLA" + id, qr_code_base64: PNG } } }));
    }
    const m = /^\/v1\/payments\/(\d+)$/.exec(req.url);
    if (m && pagamentos.has(m[1])) return res.end(JSON.stringify(pagamentos.get(m[1])));
    res.statusCode = 404; res.end("{}");
  });
}).listen(FAKE);

const env = { ...process.env, PORT: String(PORT), MP_API_BASE: `http://localhost:${FAKE}`, MP_ACCESS_TOKEN: "TEST-token", MP_WEBHOOK_SECRET: SECRET, MP_PUBLIC_KEY: "TEST-pk", ADMIN_PASSWORD: ADMIN, SESSION_SECRET: "0123456789abcdef0123456789abcdef", NEXT_PUBLIC_SITE_URL: BASE };
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
  ok("sem preço no painel, vale o preço de lançamento de R$ 4,20", /R\$\s4,20/.test(await page.locator("main").innerText()) && (await page.getByRole("button", { name: /Comprar por R\$\s4,20/ }).count()) === 1);
  await page.goto(BASE + "/admin/login/");
  await page.getByLabel("Senha").fill(ADMIN);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/admin\/$/);
  await page.goto(BASE + "/admin/acessos/");
  await page.getByLabel(/Preço do aplicativo/).fill("19,90");
  await page.getByRole("button", { name: "Salvar preço" }).click();
  await page.waitForSelector("text=Venda ligada");
  ok("dono troca o preço no painel e a página acompanha", true);
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" });
  ok("página do app mostra o preço configurado", /R\$\s19,90/.test(await page.locator("main").innerText()));
  ok("botão de compra no lugar da lista de aviso", (await page.getByRole("button", { name: /Comprar por/ }).count()) === 1);

  // Pix direto: QR Code no site, sem login no Mercado Pago, liberação mesmo sem o aviso chegar
  await page.getByLabel("Seu e-mail").fill("pix@example.com");
  await page.locator("#avise-me").getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: /Comprar por R\$\s19,90 no Pix/ }).click();
  await page.waitForURL(/\/app\/acesso\/\?pedido=/);
  const pedidoPix = new URL(page.url()).searchParams.get("pedido");
  ok("Pix criado pela API com valor, referência, aviso e validade", pix?.transaction_amount === 19.9 && pix.payment_method_id === "pix" && pix.external_reference === pedidoPix && pix.notification_url.endsWith("/api/mercadopago/webhook/") && /-03:00$/.test(pix.date_of_expiration) && pix.idem === `pix-${pedidoPix}` && pix.auth === "Bearer TEST-token");
  const telaPix = await page.locator("main").innerText();
  ok("página de acesso mostra QR Code e copia e cola, sem código ainda", /Falta só o Pix/i.test(telaPix) && (await page.getByAltText("QR Code do Pix").count()) === 1 && (await page.locator("#pix-code").inputValue()).startsWith("00020126PIXCOPIAECOLA") && !/MS6-/.test(telaPix));
  const idPix = String(330 + pixCount);
  pagamentos.set(idPix, { ...pagamentos.get(idPix), status: "approved" });
  await page.waitForFunction(() => /MS6-/.test(document.querySelector("main")?.innerText ?? ""), null, { timeout: 15000 }).catch(() => {});
  const codigoPix = /MS6-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.exec(await page.locator("main").innerText())?.[0];
  ok("Pix pago: a página se atualiza sozinha e mostra o código, mesmo sem o aviso", Boolean(codigoPix) && (await valida(codigoPix)) === true, codigoPix ?? "");

  // Cartão: página do Mercado Pago (Checkout Pro) e liberação pelo aviso
  await page.goto(BASE + "/app/", { waitUntil: "load" });
  await page.getByLabel("Seu e-mail").fill("comprador@example.com");
  await page.locator("#avise-me").getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Pagar com cartão" }).click();
  await page.waitForURL(/\/app\/cartao\/\?pedido=/, { waitUntil: "domcontentloaded" });
  const pedido = new URL(page.url()).searchParams.get("pedido");
  ok("cartão abre o formulário do Mercado Pago dentro do site", page.url().includes("/app/cartao/?pedido=") && (await page.locator("#card-brick").count()) === 1 && preferencia === null);
  const cobra = (token, ped = pedido, extra = {}) => fetch(`${BASE}/api/mercadopago/cartao/`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pedido: ped, token, payment_method_id: "visa", issuer_id: "25", installments: 1, payer: { email: "comprador@example.com", identification: { type: "CPF", number: "19119119100" } }, transaction_amount: 0.01, ...extra }) }).then((r) => r.json());
  const recusa = await cobra("tok-recusado");
  ok("cartão recusado explica o motivo e não libera nada", recusa.ok === false && /limite insuficiente/i.test(recusa.message) && (await valida("MS6-0000-0000-0000")) === false);
  ok("o valor cobrado vem do pedido, não do navegador", cartao?.transaction_amount === 19.9 && cartao.external_reference === pedido && cartao.token === "tok-recusado");
  ok("dados de cartão incompletos são recusados", (await cobra("", pedido)).ok === false);
  await page.goto(`${BASE}/app/acesso/?pedido=${pedido}`, { waitUntil: "load" });
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
  await page.getByLabel("Nome de quem recebe").fill("João Silva");
  await page.getByLabel(/WhatsApp da pessoa/).fill("(11) 98765-4321");
  await page.getByLabel(/E-mail/).fill("amigo@example.com");
  await page.getByLabel(/Anotação/).fill("Cortesia de teste");
  await page.getByRole("button", { name: "Gerar código" }).click();
  await page.waitForURL(/novo=MS6-/);
  const cortesia = new URL(page.url()).searchParams.get("novo");
  ok("cortesia gera código que vale sem pagamento", (await valida(cortesia)) === true, cortesia);
  const zap = await page.getByRole("link", { name: /Enviar no WhatsApp para João/ }).getAttribute("href");
  ok("mensagem pronta para o WhatsApp, já com o número e o código", zap.startsWith("https://wa.me/5511987654321?text=") && decodeURIComponent(zap).includes(cortesia) && decodeURIComponent(zap).includes("Fala, João!") && (await page.locator("#c-msg").inputValue()).includes("/app/como-baixar-e-usar/#instalar"));
  await page.getByLabel("Nome de quem recebe").fill("Nina");
  await page.getByLabel(/WhatsApp da pessoa/).fill("");
  await page.getByLabel(/Nome do código/).fill("nina vip");
  await page.getByRole("button", { name: "Gerar código" }).click();
  await page.waitForURL(/novo=NINA-VIP/);
  ok("dono escolhe o nome do código, e ele vale com ou sem hífen", (await valida("NINA-VIP")) === true && (await valida("ninavip")) === true && (await page.getByRole("link", { name: "Enviar no WhatsApp" }).first().getAttribute("href")).startsWith("https://wa.me/?text="));
  await page.getByLabel(/Nome do código/).fill("NINA-VIP");
  await page.getByRole("button", { name: "Gerar código" }).click();
  await page.waitForURL(/erro=/);
  ok("nome de código repetido é recusado com explicação", (await page.getByText(/O código NINA-VIP já existe/).count()) === 1);
  await page.locator("tr", { hasText: cortesia }).getByRole("button", { name: "Revogar" }).click();
  await page.waitForTimeout(700);
  ok("código revogado deixa de valer", (await valida(cortesia)) === false);

  // estorno
  pagamentos.set("111", { ...pagamentos.get("111"), status: "refunded" });
  await aviso("111");
  ok("estorno desativa o código da compra", (await valida(codigo)) === false);
  // cartão aprovado em pedido novo: libera na hora, sem esperar o aviso
  await page.goto(BASE + "/app/", { waitUntil: "load" });
  await page.getByLabel("Seu e-mail").fill("cartao@example.com");
  await page.locator("#avise-me").getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Pagar com cartão" }).click();
  await page.waitForURL(/\/app\/cartao\/\?pedido=/, { waitUntil: "domcontentloaded" });
  const pedidoCartao = new URL(page.url()).searchParams.get("pedido");
  const aprovado = await cobra("tok-aprovado", pedidoCartao);
  await page.goto(`${BASE}/app/acesso/?pedido=${pedidoCartao}`, { waitUntil: "load" });
  const codigoCartao = /MS6-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.exec(await page.locator("main").innerText())?.[0];
  ok("cartão aprovado libera o código na hora", aprovado.ok === true && Boolean(codigoCartao) && (await valida(codigoCartao)) === true, codigoCartao ?? "");
  await browser.close();
} catch (e) { console.error(e); ok("execução sem exceção", false, String(e).slice(0, 200)); }
console.log(`\n${results.filter(Boolean).length}/${results.length} verificações de pagamento passaram`);
fim(results.every(Boolean) ? 0 : 1);
