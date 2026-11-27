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

const pagamentos = new Map(); let preferencia = null; let pix = null; let cartao = null; let pixCount = 0; const emails = [];
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const fake = http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "POST" && req.url === "/emails") { emails.push({ ...JSON.parse(body), auth: req.headers.authorization }); return res.end(JSON.stringify({ id: "email-" + emails.length })); }
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

const env = { ...process.env, PORT: String(PORT), MP_API_BASE: `http://localhost:${FAKE}`, MP_ACCESS_TOKEN: "TEST-token", MP_WEBHOOK_SECRET: SECRET, MP_PUBLIC_KEY: "TEST-pk", RESEND_API_KEY: "re_teste", RESEND_API_BASE: `http://localhost:${FAKE}`, APP_SITE_KEY: "chave-app-teste", ADMIN_PASSWORD: ADMIN, SESSION_SECRET: "0123456789abcdef0123456789abcdef", NEXT_PUBLIC_SITE_URL: BASE };
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: "ignore" });
const fim = (code) => { server.kill(); fake.close(); process.exit(code); };
for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + "/robots.txt")).ok) break; } catch {} await new Promise((r) => setTimeout(r, 500)); }

const aviso = (id, { assinatura = true } = {}) => {
  const ts = String(Date.now()), rid = "req-" + id;
  const v1 = createHmac("sha256", assinatura ? SECRET : "errado").update(`id:${id};request-id:${rid};ts:${ts};`).digest("hex");
  return fetch(`${BASE}/api/mercadopago/webhook/?data.id=${id}&type=payment`, { method: "POST", headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": rid, "content-type": "application/json" }, body: JSON.stringify({ type: "payment", data: { id } }) });
};
let page;
const gera = async () => { const antes = page.url(); await page.getByRole("button", { name: "Gerar código" }).click(); await page.waitForURL((u) => u.toString() !== antes && /lote=|erro=/.test(u.toString())); };
const valida = async (codigo) => (await (await fetch(`${BASE}/api/acesso/validar/`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ codigo, aparelho: "aparelho-teste-01" }) })).json()).valido;
const confere = (chave, aparelho, key = "chave-app-teste") => fetch(`${BASE}/api/acesso/conferir/`, { method: "POST", headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ chave, aparelho }) });
const compacto = (c) => c.replace(/[^A-Z0-9]/gi, "").toUpperCase();

try {
  const browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // Venda pausada por padrão: ninguém compra antes de o dono abrir.
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" });
  ok("venda começa pausada: sem botão de compra", (await page.getByRole("button", { name: /Comprar por/ }).count()) === 0 && /Quero ser avisado/.test(await page.locator("main").innerText()));
  await page.goto(BASE + "/admin/login/");
  await page.getByLabel("Senha").fill(ADMIN);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/admin\/$/);
  await page.goto(BASE + "/admin/acessos/");
  ok("painel mostra a venda pausada", /Venda pausada/.test(await page.locator("body").innerText()));
  await page.getByRole("button", { name: "Abrir a venda" }).click();
  await page.waitForURL(/erro_venda=1/);
  await page.getByLabel(/Confirmo que o caminho inteiro funciona/).check();
  await page.getByRole("button", { name: "Abrir a venda" }).click();
  await page.waitForSelector("text=Venda aberta");
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" });
  ok("sem preço no painel, vale o preço de lançamento de R$ 4,20", /R\$\s4,20/.test(await page.locator("main").innerText()) && (await page.getByRole("button", { name: /Comprar por R\$\s4,20/ }).count()) === 1);
  await page.goto(BASE + "/admin/acessos/");
  await page.getByLabel(/Preço do aplicativo/).fill("19,90");
  await page.getByRole("button", { name: "Salvar preço" }).click();
  await page.waitForSelector("text=Venda aberta: R$");
  ok("dono troca o preço no painel e a página acompanha", true);
  // A página do app é atualizada em segundo plano depois da troca de preço: espera a versão nova.
  for (let i = 0; i < 10; i++) { await page.goto(BASE + "/app/", { waitUntil: "load" }); if (await page.getByRole("button", { name: /Comprar por R\$\s19,90 no Pix/ }).count()) break; await page.waitForTimeout(700); }
  ok("página do app mostra o preço configurado", /R\$\s19,90/.test(await page.locator("main").innerText()));
  ok("botão de compra no lugar da lista de aviso", (await page.getByRole("button", { name: /Comprar por/ }).count()) === 1);

  // Pix direto: QR Code no site, sem login no Mercado Pago, liberação mesmo sem o aviso chegar
  await page.getByLabel("Seu e-mail").fill("pix@example.com");
  await page.getByLabel("Crie uma senha").fill("senha-forte-1");
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
  const abrir = await page.getByRole("link", { name: "Abrir o app" }).getAttribute("href");
  ok("tela de obrigado tem o botão que abre o app já liberado", abrir === `https://app.missoessecretasgta.com.br/entrar?chave=${compacto(codigoPix)}` && /Seu acesso está liberado/.test(await page.locator("main").innerText()), abrir);
  const conf = emails.find((e) => e.to[0] === "pix@example.com");
  ok("e-mail de confirmação sai uma vez, com valor e o mesmo botão", Boolean(conf) && /Compra confirmada/.test(conf.subject) && conf.html.includes(abrir) && /R\$\s19,90/.test(conf.html) && conf.auth === "Bearer re_teste" && emails.filter((e) => e.to[0] === "pix@example.com").length === 1);
  await page.reload({ waitUntil: "load" });
  ok("recarregar não manda o e-mail de novo", emails.filter((e) => e.to[0] === "pix@example.com").length === 1 && /Mandamos a confirmação para pi•••@example.com/.test(await page.locator("main").innerText()));
  ok("conferência do app exige a chave entre servidores", (await confere(codigoPix, "cel-1-aaaaaaaa", "")).status === 401 && (await confere(codigoPix, "cel-1-aaaaaaaa", "errada")).status === 401);
  const c = async (ap) => (await confere(compacto(codigoPix), ap)).json();
  // o 1º aparelho já entrou acima (aparelho-teste-01); cabem 5 por dentro (o cliente lê "até 3 celulares")
  const [d2, d3, d4, d5, d6, d2b] = [await c("cel-2-bbbbbbbb"), await c("cel-3-cccccccc"), await c("cel-4-dddddddd"), await c("cel-5-eeeeeeee"), await c("cel-6-ffffffff"), await c("cel-2-bbbbbbbb")];
  ok("uma compra vale para 5 aparelhos por dentro (o 6º é recusado, quem entrou continua)", d2.valido && d3.valido && d4.valido && d5.valido && d6.valido === false && d6.motivo === "esgotado" && d2b.valido, JSON.stringify([d2, d3, d4, d5, d6, d2b]));
  ok("e-mail fala em até 3 celulares", conf.html.includes("até 3 celulares"));
  ok("chave que não existe responde 'inexistente', sem nenhum dado", JSON.stringify(await (await confere("MS6ZZZZZZZZZZZZ", "cel-1-aaaaaaaa")).json()) === '{"valido":false,"motivo":"inexistente"}');
  const link = async (email) => (await fetch(`${BASE}/api/acesso/enviar-link/`, { method: "POST", headers: { "content-type": "application/json", origin: "https://app.missoessecretasgta.com.br" }, body: JSON.stringify({ email }) }));
  const antes = emails.length;
  const r1 = await link("PIX@example.com"), r2 = await link("ninguem@example.com");
  ok("'Já comprei' manda o link só para quem comprou, com a mesma resposta para todos", (await r1.json()).ok && (await r2.json()).ok && emails.length === antes + 1 && emails.at(-1).to[0] === "pix@example.com" && emails.at(-1).html.includes(abrir) && r1.headers.get("access-control-allow-origin") === "https://app.missoessecretasgta.com.br");
  const doApp = await Promise.all(Array.from({ length: 8 }, (_, i) => fetch(`${BASE}/api/acesso/enviar-link/`, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer chave-app-teste" }, body: JSON.stringify({ email: `cliente${i}@example.com` }) }).then((r) => r.status)));
  ok("'Já comprei' pelo servidor do app não esbarra no limite por endereço", doApp.every((st) => st === 200), doApp.join(","));
  // Conta: entrar no app com e-mail e senha
  const entra = (email, senha, aparelho = "cel-2-bbbbbbbb", key = "chave-app-teste") => fetch(`${BASE}/api/acesso/entrar/`, { method: "POST", headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ email, senha, aparelho }) }).then((r) => r.status === 401 ? { status: 401 } : r.json());
  const ok1 = await entra("PIX@example.com", "senha-forte-1"), errada = await entra("pix@example.com", "outra-senha"), semConta = await entra("ninguem@example.com", "senha-forte-1"), semK = await entra("pix@example.com", "senha-forte-1", "cel-2-bbbbbbbb", "");
  ok("app entra com e-mail e senha e recebe a chave; senha errada e conta inexistente dão o mesmo 'senha'", ok1.valido === true && ok1.chave === compacto(codigoPix) && errada.motivo === "senha" && semConta.motivo === "senha" && semK.status === 401, JSON.stringify([ok1, errada, semConta]));
  // esqueci a senha: link por e-mail, página de nova senha, entrar com a nova
  const antesReset = emails.length;
  await fetch(`${BASE}/api/acesso/esqueci-senha/`, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer chave-app-teste" }, body: JSON.stringify({ email: "pix@example.com" }) });
  const resetMail = emails[antesReset];
  const resetUrl = /href="([^"]*\/conta\/nova-senha\/\?t=[a-f0-9]{48})"/.exec(resetMail?.html ?? "")?.[1];
  ok("'Esqueci a senha' manda o link de nova senha", Boolean(resetUrl) && /Crie sua senha/.test(resetMail.subject), resetUrl ?? "");
  await page.goto(resetUrl.replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: "load" });
  await page.getByLabel("Nova senha").fill("senha-nova-22");
  await page.getByLabel("Repita a senha").fill("senha-nova-22");
  await page.getByRole("button", { name: "Salvar a senha" }).click();
  await page.getByText("Senha criada.").waitFor();
  ok("nova senha vale e a antiga deixa de valer", (await entra("pix@example.com", "senha-nova-22")).valido === true && (await entra("pix@example.com", "senha-forte-1")).motivo === "senha");
  await page.goto(resetUrl.replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: "load" });
  ok("o link de nova senha vale uma vez só", /venceu ou já foi usado/.test(await page.locator("main").innerText()));
  const cod6 = /(\d{3}) (\d{3})<\/span>/.exec(emails.filter((e) => /Seu link para entrar/.test(e.subject)).at(-1).html);
  const seis = cod6 ? cod6[1] + cod6[2] : "";
  const confirma = (codigo, aparelho = "cel-2-bbbbbbbb", key = "chave-app-teste") => fetch(`${BASE}/api/acesso/confirmar-codigo/`, { method: "POST", headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ email: "pix@example.com", codigo, aparelho }) }).then((r) => r.status === 401 ? { status: 401 } : r.json());
  const errado = await confirma(seis === "000000" ? "111111" : "000000"), semChave = await confirma(seis, "cel-2-bbbbbbbb", ""), certo = await confirma(seis), denovo = await confirma(seis);
  ok("iPhone: código de 6 dígitos do e-mail devolve a chave uma vez só", seis.length === 6 && errado.valido === false && semChave.status === 401 && certo.valido === true && certo.chave === compacto(codigoPix) && denovo.valido === false, JSON.stringify([seis, errado, certo, denovo]));

  // Só Pix: nenhum botão de cartão, e a rota do cartão fica desligada
  await page.goto(BASE + "/app/", { waitUntil: "load" });
  ok("compra só por Pix: não há botão de cartão", (await page.getByRole("button", { name: /cart[aã]o/i }).count()) === 0);
  ok("rota do cartão desligada", (await fetch(`${BASE}/api/mercadopago/cartao/`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status === 404);
  await page.getByLabel("Seu e-mail").fill("comprador@example.com");
  await page.getByLabel("Crie uma senha").fill("senha-forte-1");
  await page.locator("#avise-me").getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: /no Pix/ }).click();
  await page.waitForURL(/\/app\/acesso\/\?pedido=/, { waitUntil: "domcontentloaded" });
  const pedido = new URL(page.url()).searchParams.get("pedido");
  ok("antes do pagamento a página não mostra código", /Falta só o Pix/i.test(await page.locator("main").innerText()) && !/MS6-/.test(await page.locator("main").innerText()));

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
  ok("painel mostra a venda paga e a receita", /Venda aberta/.test(painel) && /R\$\s19,90/.test(painel) && painel.includes(codigo));
  await page.getByLabel(/Endereço do aplicativo/).fill("https://app.exemplo.com.br/");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await page.waitForTimeout(800);
  await page.goto(BASE + "/admin/acessos/");
  await page.getByLabel("Nome de quem recebe").fill("João Silva");
  await page.getByLabel(/WhatsApp da pessoa/).fill("(11) 98765-4321");
  await page.getByLabel(/E-mail/).fill("amigo@example.com");
  await page.getByLabel(/Anotação/).fill("Cortesia de teste");
  await gera();
  const cortesia = (await page.locator("#cortesia [role=status] strong").first().innerText()).trim();
  ok("cortesia gera código que vale sem pagamento", (await valida(cortesia)) === true, cortesia);
  const zap = await page.getByRole("link", { name: /Enviar no WhatsApp para João/ }).getAttribute("href");
  ok("mensagem pronta para o WhatsApp, já com o número e o código", zap.startsWith("https://wa.me/5511987654321?text=") && decodeURIComponent(zap).includes(compacto(cortesia)) && decodeURIComponent(zap).includes("Fala, João!") && (await page.locator("#c-msg").inputValue()).includes("/app/como-baixar-e-usar/#instalar"));
  const msgZap = await page.locator("#c-msg").inputValue();
  ok("mensagem leva o link que abre o app liberado e ensina a instalar", msgZap.includes(`https://app.exemplo.com.br/entrar?chave=${compacto(cortesia)}`) && msgZap.includes("*Instalar app*") && msgZap.includes("*Adicionar à Tela de Início*") && !/digite o código/i.test(msgZap));
  await page.getByLabel("Nome de quem recebe").fill("Nina");
  await page.getByLabel(/WhatsApp da pessoa/).fill("");
  await page.getByLabel(/Nome do código/).fill("nina vip");
  await gera();
  ok("dono escolhe o nome do código, e ele vale com ou sem hífen", (await valida("NINA-VIP")) === true && (await valida("ninavip")) === true && (await page.getByRole("link", { name: "Enviar no WhatsApp" }).first().getAttribute("href")).startsWith("https://wa.me/?text="));
  // um código, várias pessoas: cada aparelho ocupa uma vaga
  await page.getByLabel(/Nome do código/).fill("GRUPO-VIP");
  await page.getByLabel(/Quantas pessoas podem usar/).fill("2");
  await gera();
  const ap = async (codigo, aparelho) => (await fetch(`${BASE}/api/acesso/validar/`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ codigo, aparelho }) })).json();
  const a1 = await ap("GRUPO-VIP", "aparelho-aaaa"), a2 = await ap("grupovip", "aparelho-bbbb"), a3 = await ap("GRUPO-VIP", "aparelho-cccc"), a1b = await ap("GRUPO-VIP", "aparelho-aaaa"), semAp = await ap("GRUPO-VIP", "");
  ok("código com 2 vagas: libera 2 aparelhos, recusa o 3º e continua valendo para quem já entrou", a1.valido && a2.valido && !a3.valido && a3.motivo === "esgotado" && a1b.valido && !semAp.valido && semAp.motivo === "aparelho", JSON.stringify([a1, a2, a3, a1b, semAp]));
  await page.goto(BASE + "/admin/acessos/");
  ok("painel mostra quantas pessoas já usaram e que esgotou", /2 de 2 · esgotado/.test(await page.locator("tr", { hasText: "GRUPO-VIP" }).innerText()));
  // vários códigos de uma vez, numerados
  await page.getByLabel(/Nome do código/).fill("SORTEIO");
  await page.getByLabel(/Quantos códigos gerar/).fill("3");
  await gera();
  const lista = await page.locator("#c-lista").inputValue();
  ok("gera vários códigos numerados, cada um valendo para uma pessoa", lista === "SORTEIO-01\nSORTEIO-02\nSORTEIO-03" && (await valida("SORTEIO-02")) === true && (await page.getByRole("link", { name: "Enviar no WhatsApp" }).count()) >= 3, lista.replace(/\n/g, ","));
  await page.getByLabel(/Nome do código/).fill("NINA-VIP");
  await gera();
  ok("nome de código repetido é recusado com explicação", (await page.getByText(/O código NINA-VIP já existe/).count()) === 1);
  await page.locator("tr", { hasText: cortesia }).getByRole("button", { name: "Revogar" }).click();
  await page.waitForTimeout(700);
  ok("código revogado deixa de valer", (await valida(cortesia)) === false);

  // estorno
  pagamentos.set("111", { ...pagamentos.get("111"), status: "refunded" });
  await aviso("111");
  ok("estorno desativa o código da compra", (await valida(codigo)) === false);
  ok("depois do estorno, o app recebe 'cancelado'", (await (await confere(codigo, "aparelho-teste-01")).json()).motivo === "cancelado");
  await browser.close();
} catch (e) { console.error(e); ok("execução sem exceção", false, String(e).slice(0, 200)); }
console.log(`\n${results.filter(Boolean).length}/${results.length} verificações de pagamento passaram`);
fim(results.every(Boolean) ? 0 : 1);
