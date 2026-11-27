// Teste de ponta a ponta contra um servidor de produção (npm run build && npm start).
// Uso: BASE=http://localhost:3200 ADMIN_PASSWORD=... node tests/e2e.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3200";
const PW = process.env.ADMIN_PASSWORD;
const axeSrc = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const results = [];
const ok = (name, pass, detail = "") => { results.push({ name, pass, detail }); console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

const status = async (p, opts) => (await fetch(BASE + p, { redirect: "manual", ...opts })).status;
const ENTRY = "/gta-6/easter-eggs/skunk-ape/";

// 1. Rotas e códigos HTTP
for (const p of ["/", "/gta-6/", "/gta-6/segredos/", "/gta-6/dinheiro/", "/gta-6/mapa/", "/gta-6/mapa/vice-city/", ENTRY, "/app/", "/app/como-baixar-e-usar/", "/sobre/", "/metodologia/", "/radar/", "/ajuda/", "/contato/", "/enviar-descoberta/", "/privacidade/", "/termos/", "/busca/", "/favoritos/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/search-index.json"])
  ok(`200 ${p}`, (await status(p)) === 200);
for (const p of ["/gta-6/missoes-secretas/nao-existe/", "/gta-6/misterios/", "/gta-6/categoria-falsa/", "/gta-5/", "/qualquer/coisa/muito/funda/"]) ok(`404 real em ${p}`, (await status(p)) === 404);
ok("admin exige login", [302, 303, 307].includes(await status("/admin/")));
ok("admin/entradas exige login", [302, 303, 307].includes(await status("/admin/entradas/")));

// Compartilhamento: imagens verticais de Stories
for (const p of [ENTRY + "story/", "/app/story/"]) {
  const r = await fetch(BASE + p);
  ok(`imagem de Stories ${p}`, r.status === 200 && (r.headers.get("content-type") ?? "").includes("image/png"));
}

// 2. HTML: SEO técnico
const html = await (await fetch(BASE + ENTRY)).text();
ok("um único H1", (html.match(/<h1[\s>]/g) || []).length === 1);
ok("canonical presente", /<link rel="canonical" href="[^"]+skunk-ape\/"/.test(html));
ok("resposta rápida no HTML do servidor", html.includes("Resposta rápida"));
const lds = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
const types = lds.flatMap((l) => (l["@graph"] ?? [l]).map((n) => n["@type"]));
ok("JSON-LD válido com Article e BreadcrumbList", types.includes("Article") && types.includes("BreadcrumbList"), types.join(","));
ok("sem preço/avaliação fictícios no schema", !/aggregateRating|"review"/i.test(JSON.stringify(lds)));
ok("noindex enquanto SITE_INDEXABLE não está ligado", /<meta name="robots" content="noindex/.test(html));
ok("robots.txt bloqueia tudo antes do lançamento", /Disallow: \/\s*$/m.test(await (await fetch(BASE + "/robots.txt")).text()));
const h = (await fetch(BASE + "/")).headers;
ok("cabeçalhos de segurança", Boolean(h.get("content-security-policy") && h.get("x-content-type-options") && h.get("strict-transport-security") && h.get("x-frame-options")));
const sm = await (await fetch(BASE + "/sitemap.xml")).text();
ok("sitemap lista descobertas e exclui admin/busca", sm.includes("/skunk-ape/") && !sm.includes("/admin") && !sm.includes("/busca"));

const browser = await chromium.launch();
const errors = [];
const newPage = async (w, hh) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: hh } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return page;
};

// 3. Responsividade: sem rolagem horizontal, alvos de toque
for (const [w, hh] of [[360, 740], [390, 844], [768, 1024], [1280, 800]]) {
  const page = await newPage(w, hh);
  for (const p of ["/", ENTRY, "/gta-6/segredos/", "/app/", "/app/como-baixar-e-usar/"]) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`sem rolagem horizontal ${w}px ${p}`, over <= 1, `excesso ${over}px`);
  }
  if (w === 390) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const small = await page.evaluate(() => [...document.querySelectorAll("header button, header a, main .btn, main .chip, main button")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < 40); }).map((el) => `${el.tagName}:${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 20)}:${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`));
    ok("alvos de toque ≥ 40px na home (mobile)", small.length === 0, small.slice(0, 5).join(" | "));
  }
  await page.context().close();
}

// 4. Acessibilidade automática (axe, WCAG 2.2 AA)
{
  const page = await newPage(390, 844);
  for (const p of ["/", ENTRY, "/gta-6/segredos/", "/app/", "/app/como-baixar-e-usar/", "/enviar-descoberta/", "/metodologia/"]) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSrc });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes[0].target}`));
    ok(`axe sem violações ${p}`, v.length === 0, v.join(" | "));
  }
  await page.context().close();
}

// 5. Jornada do jogador no celular
{
  const page = await newPage(390, 844);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /O que você quer descobrir/ }).click();
  const input = page.getByRole("searchbox");
  await input.fill("bigfot");
  await page.waitForSelector("dialog[aria-label=Busca] a.card");
  ok("busca tolera erro de digitação (bigfot)", /Pé-Grande|Skunk/i.test(await page.locator("dialog[aria-label=Busca] a.card").first().innerText()));
  await input.fill("grana");
  await page.waitForTimeout(500);
  ok("busca entende sinônimo (grana → dinheiro)", (await page.locator("dialog[aria-label=Busca] a.card").count()) > 0);
  await input.fill("zzqqxx");
  await page.waitForSelector("text=ouviu falar de");
  ok("busca sem resultado é honesta e oferece saída", (await page.locator("dialog[aria-label=Busca] a", { hasText: "Enviar uma descoberta" }).count()) === 1);
  await input.fill("pé grande");
  await page.waitForSelector("dialog[aria-label=Busca] a.card");
  await page.locator("dialog[aria-label=Busca] a.card").first().click();
  await page.waitForURL(/skunk-ape/);
  ok("da home à resposta em 2 toques + digitação", page.url().includes("skunk-ape"));
  ok("resposta visível sem rolar", await page.locator("#h-resposta").evaluate((el) => el.getBoundingClientRect().top < window.innerHeight));

  // favoritos
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.goto(BASE + "/favoritos/", { waitUntil: "networkidle" });
  ok("favorito aparece em Meus favoritos", (await page.locator("article h2").count()) === 1);

  // spoilers
  ok("proteção contra spoilers ligada por padrão", (await page.evaluate(() => document.documentElement.dataset.spoilers)) === "on");
  await page.goto(BASE + "/ajuda/", { waitUntil: "networkidle" });
  await page.getByRole("switch").first().click();
  await page.reload({ waitUntil: "networkidle" });
  ok("preferência de spoilers persiste", (await page.evaluate(() => document.documentElement.dataset.spoilers)) === "off");

  // filtros
  await page.goto(BASE + "/gta-6/segredos/", { waitUntil: "networkidle" });
  const before = await page.locator("article").count();
  await page.getByRole("button", { name: /^Filtros/ }).click();
  await page.locator("#filtros button", { hasText: "Easter eggs" }).click();
  const after = await page.locator("article").count();
  ok("filtro por tipo reduz a lista", after > 0 && after < before, `${before} → ${after}`);
  ok("filtro não muda a URL (nada de combinações indexáveis)", !page.url().includes("?"));

  // menu mobile por teclado
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  ok("link 'pular para o conteúdo' é o primeiro foco", /Pular para o conteúdo/.test(await page.evaluate(() => document.activeElement?.textContent ?? "")));
  await page.getByRole("button", { name: "Abrir menu" }).click();
  ok("menu mobile abre", await page.locator("dialog[aria-label=Menu]").evaluate((d) => d.open));
  await page.keyboard.press("Escape");
  ok("menu fecha com Esc", !(await page.locator("dialog[aria-label=Menu]").evaluate((d) => d.open)));

  // compartilhamento na ficha
  await page.goto(BASE + ENTRY, { waitUntil: "load" }); await page.locator("#h-compartilhar").waitFor();
  const wa = await page.locator("a[href^='https://wa.me/']").first().getAttribute("href");
  const waText = decodeURIComponent(wa.split("text=")[1]);
  ok("WhatsApp abre com mensagem pronta, título e link rastreável", /Skunk Ape/.test(waText) && /utm_source=whatsapp/.test(waText) && /utm_campaign=ficha_easter-eggs/.test(waText));
  ok("ficha tem o bloco 'Manda pro parceiro'", (await page.locator("#h-compartilhar").count()) === 1);

  // barra fixa do aplicativo
  await page.evaluate(() => localStorage.removeItem("gs:sticky-off-until"));
  await page.goto(BASE + "/gta-6/dinheiro/", { waitUntil: "networkidle" });
  const bar = page.locator("[role=region][aria-label=Aplicativo]");
  ok("barra do app escondida no topo da página", (await bar.getAttribute("aria-hidden")) === "true");
  await page.mouse.wheel(0, 900); await page.waitForTimeout(500);
  ok("barra do app sobe depois de rolar, com o texto da categoria", (await bar.getAttribute("aria-hidden")) === "false" && /meio assalto/.test(await bar.innerText()));
  await bar.getByRole("button", { name: /Fechar a chamada/ }).click();
  await page.waitForTimeout(400);
  await page.goto(BASE + "/gta-6/veiculos/", { waitUntil: "networkidle" }); await page.mouse.wheel(0, 900); await page.waitForTimeout(500);
  ok("depois de fechada, a barra não volta em outra página", (await page.locator("[role=region][aria-label=Aplicativo]").getAttribute("aria-hidden")) === "true");
  await page.evaluate(() => localStorage.removeItem("gs:sticky-off-until"));
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" }); await page.mouse.wheel(0, 900); await page.waitForTimeout(400);
  ok("barra não aparece na própria página do app", (await page.locator("[role=region][aria-label=Aplicativo]").count()) === 0);

  // envio da comunidade
  await page.goto(BASE + "/enviar-descoberta/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.waitForSelector("[role=alert]");
  ok("formulário valida campos obrigatórios", true);
  await page.getByLabel("O que você encontrou?").fill("Teste e2e: carro raro no píer");
  await page.getByLabel("Conte os detalhes").fill("Relato de teste automatizado <script>alert(1)</script> com mais de vinte caracteres.");
  await page.getByLabel("Link de print ou vídeo").fill("javascript:alert(1)");
  await page.getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.waitForSelector("text=Use um link http");
  ok("link de evidência só aceita http(s)", true);
  ok("erro de validação preserva o que foi digitado", (await page.getByLabel("Conte os detalhes").inputValue()).includes("Relato de teste"));
  await page.waitForTimeout(2600);
  await page.getByLabel("Link de print ou vídeo").fill("https://example.com/print.png");
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.waitForSelector("[role=status]");
  ok("envio da comunidade é aceito", true);

  // lista de espera
  await page.goto(BASE + "/app/", { waitUntil: "networkidle" });
  await page.getByLabel("Seu e-mail").fill("teste-e2e@example.com");
  await page.locator("#avise-me").getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Quero ser avisado" }).click();
  await page.waitForSelector("#avise-me [role=status]");
  ok("lista de espera do aplicativo funciona", true);
  const landing = await page.locator("main").innerText();
  ok("landing mostra o preço de lançamento decidido (R$ 4,20) e nenhum outro", /R\$\s4,20/.test(landing) && !/R\$\s?(?!4,20)\d/.test(landing));
  ok("landing não exibe avaliações inventadas", !/estrelas|avaliações de usuários/i.test(landing));
  await page.context().close();
}

// 6. Painel administrativo
if (PW) {
  const page = await newPage(1280, 900);
  await page.goto(BASE + "/admin/login/");
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForSelector("text=Senha incorreta");
  ok("login recusa senha errada", true);
  await page.getByLabel("Senha").fill(PW);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/admin\/$/);
  ok("login com a senha correta", true);
  ok("painel mostra indicadores", (await page.locator("text=Precisam de verificação").count()) === 1);

  await page.goto(BASE + "/admin/envios/");
  const sub = page.locator("li.card", { hasText: "Teste e2e" }).first();
  ok("envio chega à moderação", (await sub.count()) === 1);
  ok("texto enviado é exibido como texto, não executado", (await page.locator("script", { hasText: "alert(1)" }).count()) === 0 && /<script>alert\(1\)<\/script>/.test(await sub.innerText()));
  await sub.getByRole("button", { name: "Rejeitar" }).click();
  await page.waitForTimeout(600);
  ok("moderação muda o estado do envio", (await page.locator("li.card", { hasText: "Teste e2e" }).count()) === 0);

  // trava editorial: "confirmado" sem evidência
  await page.goto(BASE + "/admin/entradas/gta6-0018/");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForSelector("text=informe quem revisou");
  ok("conteúdo-semente exige assinatura de revisor humano ao ser editado", true);
  await page.getByLabel("Revisado por").fill("Teste e2e");
  await page.getByLabel("Status de confirmação").selectOption("confirmado");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForSelector("text=exige três ou mais fontes");
  ok("painel bloqueia 'Confirmado' com menos de três fontes", true);

  // mudança de slug gera 301
  await page.goto(BASE + "/admin/entradas/gta6-0018/");
  const oldSlug = await page.getByLabel(/^Slug/).inputValue();
  const [row] = [oldSlug];
  await page.getByLabel(/^Slug/).fill(oldSlug + "-novo");
  await page.getByLabel("Revisado por").fill("Teste e2e");
  await page.getByLabel("Nota para o histórico público").fill("Endereço ajustado em teste automatizado.");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForURL(/salvo=1/);
  const oldUrl = `/gta-6/dicas/${row}/`;
  const r = await fetch(BASE + oldUrl, { redirect: "manual" });
  ok("mudar slug cria redirecionamento 301", r.status === 308 || r.status === 301, `${r.status} → ${r.headers.get("location")}`);
  ok("novo endereço responde 200 após revalidação", (await status(`/gta-6/dicas/${row}-novo/`)) === 200);
  ok("alteração aparece no Radar", (await (await fetch(BASE + "/radar/")).text()).includes("Endereço ajustado em teste automatizado."));

  // novo rascunho não aparece no site
  await page.goto(BASE + "/admin/entradas/nova/");
  await page.getByLabel("Título", { exact: true }).fill("Rascunho de teste e2e");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForURL(/salvo=1/);
  ok("rascunho não vaza para o site público", !(await (await fetch(BASE + "/search-index.json")).text()).includes("Rascunho de teste e2e"));
  // publicar sem fonte é bloqueado
  await page.getByLabel("Estado no fluxo").selectOption("publicado");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForSelector("text=Para publicar");
  ok("publicar sem resposta, fonte e revisor é bloqueado", true);

  await page.goto(BASE + "/admin/palavras-chave/");
  ok("banco de palavras-chave acessível no painel", (await page.locator("h1").innerText()).includes("palavras-chave"));
  await page.context().close();
} else console.log("SKIP  painel (defina ADMIN_PASSWORD)");

await browser.close();
const relevant = [...new Set(errors)].filter((e) => !/favicon/.test(e));
ok("sem erros de JavaScript no console", relevant.length === 0, relevant.slice(0, 3).join(" | "));
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`);
fs.mkdirSync("docs/relatorios", { recursive: true });
fs.writeFileSync("docs/relatorios/e2e-ultimo.json", JSON.stringify({ quando: new Date().toISOString(), total: results.length, falhas: failed.length, results }, null, 1));
process.exit(failed.length ? 1 : 0);
