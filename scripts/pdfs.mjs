// Gera os PDFs do Mapa da Visita a partir de /imprimir/<formato> (ADR 0004).
// Uso: npm run pdfs   (faz o build, sobe o preview, salva em public/arquivos/ e confere se nada transbordou)
import { spawn, execSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { chromium } from "playwright";

const PORTA = 4398;
const FORMATOS = { a1: [841, 594], a2: [594, 420], a4: [297, 210] };
const DESTINO = new URL("../public/arquivos/", import.meta.url);
mkdirSync(DESTINO, { recursive: true });

console.log("Build…");
execSync("npx astro build", { stdio: "ignore" });
const preview = spawn("npx", ["astro", "preview", "--port", String(PORTA)], { stdio: "ignore" });
const base = `http://127.0.0.1:${PORTA}`;
for (let i = 0; ; i++) {
  try { if ((await fetch(base + "/imprimir/a1")).ok) break; } catch {}
  if (i > 60) throw new Error("O preview não subiu.");
  await new Promise((r) => setTimeout(r, 500));
}

const navegador = await chromium.launch();
let problemas = 0;
try {
  for (const [formato, [w, h]] of Object.entries(FORMATOS)) {
    const pagina = await navegador.newPage();
    await pagina.goto(`${base}/imprimir/${formato}`, { waitUntil: "networkidle" });
    await pagina.emulateMedia({ media: "print" });
    await pagina.evaluate(() => document.fonts.ready);
    const transbordos = await pagina.evaluate(() =>
      [...document.querySelectorAll(".folha")].flatMap((f, i) => {
        const g = f.querySelector(".grade");
        const cel = [...f.querySelectorAll(".celula")].filter((c) => c.scrollHeight > c.clientHeight + 1).length;
        return g.scrollHeight > g.clientHeight + 1 || cel ? [`folha ${i + 1}: o conteúdo não cabe (${cel} células cortadas)`] : [];
      })
    );
    const arquivo = new URL(`musa-mapa-da-visita-${formato}.pdf`, DESTINO);
    await pagina.pdf({ path: arquivo.pathname, width: `${w}mm`, height: `${h}mm`, printBackground: true, preferCSSPageSize: true });
    const kb = Math.round(statSync(arquivo).size / 1024);
    console.log(`${formato.toUpperCase()}: ${arquivo.pathname.split("/").pop()} (${kb} KB)`);
    transbordos.forEach((t) => { problemas++; console.warn("  aviso: " + t); });
    await pagina.close();
  }
} finally {
  await navegador.close();
  preview.kill();
}
if (problemas) console.warn(`\n${problemas} aviso(s): ajuste a densidade em src/pages/imprimir/[formato].astro.`);
