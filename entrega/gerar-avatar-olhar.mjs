import fs from "node:fs";
const src = fs.readFileSync(new URL("../public/brand/musa-eye.js", import.meta.url), "utf8");
let cb = null;
globalThis.requestAnimationFrame = f => { cb = f; };
globalThis.innerHeight = 1000; globalThis.innerWidth = 1000;
new Function(src)();
const { MusaEye } = globalThis;
MusaEye.CONFIG.breathe = 0;
const D = Math.SQRT1_2; // magnitude 1, 45°
const dirs = { "direita-baixo": [D, D], "direita-cima": [D, -D], "esquerda-baixo": [-D, D], "esquerda-cima": [-D, -D] };
const out = {};
for (const [nome, g] of Object.entries(dirs)) {
  const els = {};
  const el = () => { const a = {}; return { a, setAttribute: (k, v) => a[k] = v, style: {} }; };
  const svg = { ...el(), set innerHTML(v) {}, querySelector: s => els[s] ??= el(), getBoundingClientRect: () => ({ top: 0, bottom: 10, width: 10 }) };
  MusaEye.CONFIG.restGaze = g;
  MusaEye.create(svg, { state: 1, still: true, quality: 3, logo: { count: 8, pupilR: 3.7, pupilGap: 1.42, weight: 0.624 } });
  cb(16); cb(32); // one step: still = snap to target
  const d = els[".eye"].a.d;
  const svgTxt = `<svg width="1024" height="1024" viewBox="-38 -38 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="${d}" fill-rule="nonzero" fill="#930031"/>\n</svg>\n`;
  fs.writeFileSync(new URL(`avatar-olhar/musa-avatar-olhar-${nome}.svg`, import.meta.url), svgTxt);
  out[nome] = d.length;
  MusaEye.CONFIG.restGaze = [0.6, 1];
}
console.log(out);
