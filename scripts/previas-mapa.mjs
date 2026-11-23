// Fotos do mapa para os links do Guia: cada termo do glossário que é uma peça do mapa (etapa, fase, camada, nível de
// desafio, pensamento do professor, função, origem) ganha uma foto recortada de como ele aparece no /mapa. Quando a
// pessoa passa o mouse (ou o foco) num link para o termo, a foto aparece num cartão (src/layouts/Guia.astro).
// Uso: npm run previas-mapa   (faz o build, sobe o preview e salva em public/guia/mapa/ e src/lib/previas-mapa.json)
// Com um servidor já no ar: BASE=http://127.0.0.1:4399 npm run previas-mapa
// Fotos no modo vitrine do mapa (?vitrine: sem o painel de introdução e sem preferências guardadas), em 2x.
import { spawn, execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const PORTA = 4397;
const DESTINO = new URL("../public/guia/mapa/", import.meta.url);
const INDICE = new URL("../src/lib/previas-mapa.json", import.meta.url);
mkdirSync(DESTINO, { recursive: true });

let preview = null;
let base = process.env.BASE;
if (!base) {
  console.log("Build…");
  execSync("npx astro build", { stdio: "ignore" });
  preview = spawn("npx", ["astro", "preview", "--port", String(PORTA)], { stdio: "ignore" });
  base = `http://127.0.0.1:${PORTA}`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(base + "/mapa")).ok) break; } catch {}
    if (i > 60) throw new Error("O preview não subiu.");
    await new Promise((r) => setTimeout(r, 500));
  }
}

// cada foto: o termo (âncora do glossário), a legenda do cartão e o recorte (medido na página; px da tela).
// prep: o que fazer antes de medir (abrir o detalhe, passar o mouse num rosto).
// folga em volta do recorte: f dos lados e embaixo, fc em cima (o título da camada fica logo acima de uma prática)
const ret = (r, f = 0, fc = f) => ({ x: r.x - f, y: r.y - fc, width: r.width + 2 * f, height: r.height + f + fc });
const uniao = (...rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, width: Math.max(...rs.map((r) => r.x + r.width)) - x, height: Math.max(...rs.map((r) => r.y + r.height)) - y }; };
const caixa = (pagina, sel, i = 0) => pagina.$$eval(sel, (els, i) => { const r = els[i].getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, i);

const FOTOS = [
  { termo: "etapa", legenda: "Uma etapa aberta, com as camadas embaixo do nome",
    recorte: async (p) => { const e = await caixa(p, ".etapa", 0); return { x: e.x, y: e.y, width: e.width, height: 450 }; } },
  { termo: "fase", legenda: "A fase em cima das etapas que fazem parte dela",
    recorte: async (p) => { const f = await caixa(p, ".fase", 0), t = await caixa(p, ".etapa-topo", 1); return { x: f.x, y: f.y, width: t.x + t.width - f.x, height: t.y + t.height - f.y }; } },
  { termo: "camada", legenda: "Uma camada: a linha de pontos de contato, etapa por etapa",
    recorte: async (p) => { const r = await caixa(p, ".rotulo-pontos"), c = await caixa(p, ".camada-pontos", 0); return { x: r.x, y: r.y, width: c.x + c.width - r.x, height: r.height }; } },
  { termo: "nivel-de-desafio", legenda: "O nível de desafio de cada etapa, ligado por uma linha",
    recorte: async (p) => { const r = await caixa(p, ".rotulo-sentimentos"), c = await caixa(p, ".camada-sentimentos", 1); return { x: r.x, y: r.y, width: Math.min(c.x + c.width - r.x, 760), height: r.height }; } },
  { termo: "pensamento-do-professor", legenda: "O pensamento do professor, ao passar o mouse num rosto",
    prep: async (p) => { const a = await caixa(p, ".desafio-avatar", 2); await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.waitForTimeout(700); },
    recorte: async (p) => {
      const a = await caixa(p, ".desafio-avatar", 2);
      // o cartão que está à vista (o do rosto com o mouse em cima)
      const c = await p.$$eval(".desafio-cartao", (els) => { const e = els.find((x) => parseFloat(getComputedStyle(x).opacity) > 0.5); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; });
      return ret(uniao(a, c ?? a), 20);
    } },
  { termo: "funcao", legenda: "A função, embaixo de cada prática",
    recorte: async (p) => ret(await caixa(p, ".pratica", 0), 10, 2) },
  { termo: "origem", legenda: "A origem, no detalhe de uma prática",
    prep: async (p) => { await p.click(".etapa-detalhe"); await p.waitForTimeout(900); },
    recorte: async (p) => {
      // a primeira boa prática do painel: do nome dela até a linha da origem
      const r = await p.evaluate(() => {
        const bloco = [...document.querySelectorAll(".det-bloco")].find((b) => /boas práticas/i.test(b.textContent ?? ""));
        const item = bloco?.querySelector("li, .det-item, p");
        const lista = bloco?.querySelector("ul, ol, .det-lista");
        const alvo = lista?.firstElementChild ?? item;
        if (!alvo) return null;
        const b = alvo.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height };
      });
      return ret(r, 14, 2);
    } }
];

const navegador = await chromium.launch();
const indice = {};
try {
  for (const f of FOTOS) {
    const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
    await pagina.goto(`${base}/mapa?vitrine`, { waitUntil: "networkidle" });
    await pagina.waitForFunction(() => document.querySelector(".desafio-caminho")?.getAttribute("d"));
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(400);
    if (f.prep) await f.prep(pagina);
    const r = await f.recorte(pagina);
    const clip = { x: Math.max(0, Math.round(r.x)), y: Math.max(0, Math.round(r.y)), width: Math.round(r.width), height: Math.round(r.height) };
    const arquivo = new URL(`${f.termo}.png`, DESTINO);
    await pagina.screenshot({ path: arquivo.pathname, clip });
    indice[f.termo] = { src: `/guia/mapa/${f.termo}.png`, largura: clip.width, altura: clip.height, legenda: f.legenda };
    console.log(`${f.termo}: ${clip.width}×${clip.height}`);
    await pagina.close();
  }
  writeFileSync(INDICE, JSON.stringify(indice, null, 2) + "\n");
} finally {
  await navegador.close();
  preview?.kill();
}
