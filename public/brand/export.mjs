// Gera os SVGs da marca a partir de musa-geometry.js.
// Uso: node brand/export.mjs
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const MUSA = createRequire(import.meta.url)(join(here, "musa-geometry.js"));
const out = join(here, "assets");
mkdirSync(out, { recursive: true });

const tones = { crimson: MUSA.COLORS.crimson, offwhite: MUSA.COLORS.offwhite };
for (const variant of Object.keys(MUSA.VARIANTS)) {
  for (const [tone, color] of Object.entries(tones)) {
    const file = `musa-${variant}-${tone}.svg`;
    writeFileSync(join(out, file), MUSA.svg(variant, { color }) + "\n");
    console.log(file);
  }
}

// Página de marca: inlina a geometria no template (o artifact não carrega scripts locais).
import { readFileSync } from "node:fs";
const tpl = readFileSync(join(here, "marca.src.html"), "utf8");
const geo = readFileSync(join(here, "musa-geometry.js"), "utf8");
const eye = readFileSync(join(here, "musa-eye.js"), "utf8");
// Cores: lê brand/cores.css (primitivas e funções) e brand/cores.md (contrastes medidos).
const css = readFileSync(join(here, "cores.css"), "utf8");
const prims = [...css.matchAll(/--([a-z]+-\d+):\s*(oklch\([^)]*\));\s*\/\*\s*(#[0-9A-F]{6})( · cor da marca)?/g)].map(m => ({ name: m[1], oklch: m[2], hex: m[3], pinned: !!m[4] }));
const roles = [...css.matchAll(/(--cor-[a-z-]+):\s*var\(--([a-z]+-\d+)\)/g)].map(m => ({ name: m[1], ref: m[2] }));
const pairs = readFileSync(join(here, "cores.md"), "utf8").split("\n").filter(l => /^\| [^-P]/.test(l) && !/^\| Par/.test(l)).map(l => {
  const c = l.split("|").slice(1, -1).map(x => x.trim());
  return { label: c[0], fg: c[1].match(/#[0-9A-F]{6}/)[0], bg: c[2].match(/#[0-9A-F]{6}/)[0], wcag: c[3], apca: c[4], req: c[5] };
});
const cores = JSON.stringify({ prims, roles, pairs });
let page = tpl.replace("/* @geometry */", () => geo).replace("/* @eye */", () => eye).replace("/* @cores */", () => cores);
if (!/^<!doctype/i.test(page)) page = '<!doctype html>\n<html lang="pt-BR">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>html,body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n' + page;
writeFileSync(join(here, "marca.html"), page);
console.log("marca.html");
