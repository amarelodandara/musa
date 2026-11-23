// Gera o primeiro quadro do olho do rodapé como SVG estático (src/components/rodape-olho.gerado.html).
// O Rodapé põe esse desenho direto no HTML, então o olho aparece junto com o resto do rodapé, sem esperar os
// scripts da página. Quando musa-eye.js carrega, MusaEye.create troca esse conteúdo pelo olho vivo (o mesmo
// desenho no primeiro quadro, então não pula).
// Uso: npm run rodape-olho (rodar de novo se mudar musa-geometry.js, musa-eye.js ou as opções do olho no Rodapé).
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p) => readFileSync(join(raiz, p), "utf8");

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent(`<svg class="rodape-olho"></svg>`);
await pagina.addScriptTag({ content: ler("public/brand/musa-geometry.js") });
await pagina.addScriptTag({ content: ler("public/brand/musa-eye.js") });
const interno = await pagina.evaluate(() => {
  const svg = document.querySelector("svg");
  // mesmas opções do Rodapé.astro; as cores ficam como variáveis CSS (trocadas abaixo)
  const olho = window.MusaEye.create(svg, {
    frame: "symbol", viewBox: "-66 -66 132 132", logo: window.MUSA.RING_PRESETS.lockup,
    ink: "#000001", paper: "transparent", invert: "#000002", state: 1, still: true
  });
  olho.destroy();
  return svg.innerHTML;
});
await navegador.close();

const saida = interno
  .replaceAll("me0", "rodape-olho-estatico-") // ids próprios: não colidem com os olhos criados pelo script
  .replaceAll("#000001", "var(--neutro-50)")
  .replaceAll("#000002", "var(--carmim-800)")
  .replace(/\n/g, "");
writeFileSync(join(raiz, "src/components/rodape-olho.gerado.html"), saida + "\n");
console.log(`rodape-olho.gerado.html (${saida.length} caracteres)`);
