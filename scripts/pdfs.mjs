// Gera os PDFs do Mapa da Visita a partir de /imprimir/<formato> (ADR 0004), e uma prévia PNG de cada um.
// Uso: npm run pdfs   (faz o build, sobe o preview e salva em public/arquivos/)
// Com um servidor já no ar: BASE=http://127.0.0.1:4399 npm run pdfs   (pula o build e o preview)
import { spawn, execSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { chromium } from "playwright";

const PORTA = 4398;
const BASE_PRONTA = process.env.BASE;
const FORMATOS = { a1: [841, 594], a2: [594, 420], a4: [297, 210] };
const DESTINO = new URL("../public/arquivos/", import.meta.url);
mkdirSync(DESTINO, { recursive: true });

let preview = null;
let base = BASE_PRONTA;
if (!base) {
  console.log("Build…");
  execSync("npx astro build", { stdio: "ignore" });
  preview = spawn("npx", ["astro", "preview", "--port", String(PORTA)], { stdio: "ignore" });
  base = `http://127.0.0.1:${PORTA}`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(base + "/imprimir/a1")).ok) break; } catch {}
    if (i > 60) throw new Error("O preview não subiu.");
    await new Promise((r) => setTimeout(r, 500));
  }
}

const navegador = await chromium.launch();
// espera o mapa de cada folha (quadros) desenhar: fontes carregadas e a linha do Nível de desafio feita
const pronto = (pagina) => pagina.waitForFunction(() => [...document.querySelectorAll("iframe")].every((q) => {
  const d = q.contentDocument;
  return d && d.documentElement.hasAttribute("data-impressao-pronta") && d.fonts.status === "loaded" && d.querySelector(".desafio-caminho")?.getAttribute("d");
}), null, { timeout: 30000 });
try {
  for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
    const pagina = await navegador.newPage();
    await pagina.goto(`${base}/imprimir/${formato}`, { waitUntil: "networkidle" });
    await pronto(pagina);
    await pagina.waitForTimeout(300);
    const arquivo = new URL(`musa-mapa-da-visita-${formato}.pdf`, DESTINO);
    await pagina.pdf({ path: arquivo.pathname, width: `${w}mm`, height: `${h}mm`, printBackground: true, preferCSSPageSize: true });
    const kb = Math.round(statSync(arquivo).size / 1024);
    console.log(`${formato.toUpperCase()}: ${arquivo.pathname.split("/").pop()} (${kb} KB)`);
    // prévia (PNG) da primeira folha, para a página inicial e a página Baixar: a mesma folha, em tela
    const { larg, alt } = await pagina.evaluate(() => { const s = getComputedStyle(document.documentElement); return { larg: parseFloat(s.getPropertyValue("--larg")), alt: parseFloat(s.getPropertyValue("--alt")) }; });
    const tela = await navegador.newPage({ viewport: { width: Math.round(larg), height: Math.round(alt) }, deviceScaleFactor: 1 });
    await tela.goto(`${base}/mapa?impressao=${formato}${formato === "a4" ? "&fase=1" : ""}`, { waitUntil: "networkidle" });
    await tela.waitForFunction(() => document.documentElement.hasAttribute("data-impressao-pronta") && document.querySelector(".desafio-caminho")?.getAttribute("d"));
    await tela.evaluate(() => document.fonts.ready);
    await tela.waitForTimeout(300);
    const previa = new URL(`previa-${formato}.png`, DESTINO);
    await tela.screenshot({ path: previa.pathname });
    console.log(`   prévia: ${previa.pathname.split("/").pop()}`);
    await tela.close();
    await pagina.close();
  }
} finally {
  await navegador.close();
  preview?.kill();
}

