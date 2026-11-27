"""Gera docs/seo/mapa-de-palavras-chave.{csv,md}: a palavra-chave de cada página do site.
Uso: python3 scripts/mapa-palavras-chave.py <arquivo com as URLs do sitemap>"""
import csv, json, re, sys, urllib.parse, collections
urls = [u.strip().replace("https://missoessecretasgta.com.br", "") for u in open(sys.argv[1]) if u.strip()]
entries = {f"/gta-6/{e['category_id'].replace('gta6-','')}/{e['slug']}/": e for e in json.load(open("content/seed/entries.json"))}
regions = {r["slug"]: r for r in json.load(open("content/seed/regions.json"))}
bank = [r for r in csv.DictReader(open("data/keywords/banco-mestre.csv")) if r["jogo"] == "gta-6"]
def top(url, n=4):
    rs = sorted([r for r in bank if r["url_planejada"] == url], key=lambda r: -int(r["relevancia_autocomplete"] or 0))
    return [r["keyword"] for r in rs[:n]]

fixas = {
  "/": ("segredos gta 6", ["gta 6 segredos", "gta 6 easter eggs", "gta 6 missões secretas", "guia gta 6"], "Informacional (descoberta)"),
  "/gta-6/": ("guia gta 6", ["gta 6 dicas", "gta 6 segredos", "tudo sobre gta 6"], "Informacional"),
  "/gta-6/segredos/": ("segredos gta 6", top("/gta-6/segredos/") or ["gta 6 secrets", "gta 6 misterios"], "Informacional (lista)"),
  "/gta-6/mapa/": ("mapa gta 6", top("/gta-6/mapa/"), "Informacional (navegação)"),
  "/app/": ("app gta 6", top("/app/"), "Comercial (comprar o app)"),
  "/app/como-baixar-e-usar/": ("como baixar app gta 6", ["como instalar app gta 6", "mapa interativo gta 6 celular", "app gta 6 android", "app gta 6 iphone"], "Transacional / suporte"),
  "/sobre/": ("missões secretas gta 6 quem somos", ["guia não oficial gta 6", "site de segredos gta 6"], "Navegacional (marca)"),
  "/metodologia/": ("como saber se segredo gta 6 é verdade", ["gta 6 boato ou verdade", "gta 6 segredos confirmados"], "Informacional (confiança)"),
  "/radar/": ("novidades gta 6", ["gta 6 novos segredos", "gta 6 descobertas recentes", "gta 6 atualização"], "Informacional (notícia)"),
  "/ajuda/": ("dúvidas gta 6", ["gta 6 perguntas frequentes", "gta 6 como funciona"], "Informacional"),
  "/enviar-descoberta/": ("enviar segredo gta 6", ["descobri um segredo no gta 6"], "Navegacional"),
  "/contato/": ("missões secretas gta 6 contato", [], "Navegacional (marca)"),
  "/privacidade/": ("missões secretas gta 6 privacidade", [], "Navegacional (legal)"),
  "/termos/": ("missões secretas gta 6 termos de uso", [], "Navegacional (legal)"),
}
catkw = {
  "missoes-secretas": ("missões secretas gta 6", ["gta 6 missões secundárias", "gta 6 missões escondidas", "gta 6 encontros aleatórios"]),
  "lugares-secretos": ("lugares secretos gta 6", ["gta 6 bunker", "gta 6 lugares escondidos", "gta 6 locais secretos"]),
  "easter-eggs": ("easter eggs gta 6", ["gta 6 vice city easter egg", "gta 6 easter eggs reddit", "gta 6 misterios"]),
  "dinheiro": ("dinheiro escondido gta 6", ["gta 6 ganhar dinheiro", "gta 6 cofre", "gta 6 dinheiro infinito"]),
  "veiculos": ("carros secretos gta 6", ["gta 6 carros raros", "gta 6 carros lendarios", "gta 6 carros unicos"]),
  "armas-e-itens": ("armas secretas gta 6", ["gta 6 armas lendarias", "gta 6 armas escondidas", "gta 6 itens raros"]),
  "dicas": ("dicas gta 6", ["gta 6 dicas para iniciantes", "gta 6 como salvar o jogo", "gta 6 como trocar de personagem"]),
}
intent = {
  "missoes-secretas": ["missão {n} gta 6", "como ativar {n} gta 6", "onde fica {n} gta 6"],
  "lugares-secretos": ["onde fica {n} gta 6", "como entrar {n} gta 6"],
  "easter-eggs": ["easter egg {n} gta 6", "onde fica {n} gta 6"],
  "dinheiro": ["onde fica {n} gta 6", "dinheiro {n} gta 6"],
  "veiculos": ["onde encontrar {n} gta 6", "como pegar {n} gta 6"],
  "armas-e-itens": ["onde pegar {n} gta 6", "onde fica {n} gta 6"],
}
G = lambda q: "https://www.google.com/search?hl=pt-BR&gl=br&q=" + urllib.parse.quote(q)
rows = []
for u in urls:
    parts = [p for p in u.split("/") if p]
    if u in fixas:
        k, sec, it = fixas[u]; tipo = "Página principal" if u in ("/", "/gta-6/", "/gta-6/segredos/", "/gta-6/mapa/", "/app/", "/app/como-baixar-e-usar/") else "Institucional"
    elif len(parts) == 2 and parts[1] in catkw:
        (k, sec), it, tipo = catkw[parts[1]], "Informacional (lista)", "Categoria"
        sec = list(dict.fromkeys(sec + top(u, 3)))[:5]
    elif len(parts) == 3 and parts[1] == "mapa":
        n = regions.get(parts[2], {}).get("name", parts[2]).lower()
        k, sec, it, tipo = f"{n} gta 6", [f"o que tem em {n} gta 6", f"{n} gta 6 segredos", f"{n} gta 6 mapa"], "Informacional (região)", "Região do mapa"
    elif u in entries:
        e = entries[u]; cat = parts[1]
        n = re.sub(r"\s+(em|no|de)\s+GTA\s*6.*$", "", e["title"], flags=re.I).strip().lower()
        if e["kind"] == "guia":
            k, sec = e["title"].lower().replace(" em gta 6", " gta 6").split(":")[0], []
        else:
            k, sec = f"{n} gta 6", [t.format(n=n) for t in intent.get(cat, [])]
        it, tipo = ("Informacional (como fazer)" if e["kind"] == "guia" else "Informacional (onde fica / como pegar)"), f"Ficha: {cat}"
    else:
        k, sec, it, tipo = "", [], "", "Outra"
    rows.append({"url": "https://missoessecretasgta.com.br" + u, "tipo": tipo, "palavra_chave_principal": k, "secundarias": " | ".join(s for s in sec if s != k), "intencao": it, "pesquisar_no_google": G(k) if k else ""})
order = {"Página principal": 0, "Categoria": 1, "Região do mapa": 2, "Institucional": 3}
rows.sort(key=lambda r: (order.get(r["tipo"], 4), r["tipo"], r["url"]))
with open("docs/seo/mapa-de-palavras-chave.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter=";"); w.writeheader(); w.writerows(rows)
md = ["# Mapa de palavras-chave por página", "", f"{len(rows)} páginas. Planilha completa (abre no Excel ou Google Planilhas): `docs/seo/mapa-de-palavras-chave.csv`.", "",
      "Como usar: clique em **pesquisar** para ver o Google do Brasil com aquela busca. Repare no que aparece no topo: vídeo, lista, fórum, mapa, \"As pessoas também perguntam\". É isso que diz a intenção.", "",
      "Volume de busca não está aqui de propósito: nenhuma ferramenta de volume foi consultada, e não estimamos. A ordem dos termos de categoria vem do autocomplete do Google (coleta de 25/11/2026).", ""]
for t in sorted({r["tipo"] for r in rows}, key=lambda t: (order.get(t, 4), t)):
    grp = [r for r in rows if r["tipo"] == t]
    md += [f"## {t} ({len(grp)})", "", "| Página | Palavra-chave principal | Secundárias | Intenção | |", "|---|---|---|---|---|"]
    for r in grp:
        md.append(f"| {r['url'].replace('https://missoessecretasgta.com.br','')} | **{r['palavra_chave_principal']}** | {r['secundarias'].replace(' | ', ', ')} | {r['intencao']} | [pesquisar]({r['pesquisar_no_google']}) |")
    md.append("")
open("docs/seo/mapa-de-palavras-chave.md", "w").write("\n".join(md))
print(len(rows), collections.Counter(r["tipo"] for r in rows))
