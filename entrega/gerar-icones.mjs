// Gera os SVG dos ícones (Iconoir) usados no mapa, na pasta entrega/mapa-impressao/icones. Uso: node entrega/gerar-icones.mjs
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as I from "iconoir-react";
import { writeFileSync } from "node:fs";
const pontos = { "site-do-museu": "Www", "redes-sociais": "Instagram", "midias-e-campanhas": "Megaphone", "e-mail": "Mail", "telefone": "Phone",
  "formulario-de-agendamento": "Page", "recepcao": "Desk", "material-de-apoio": "BookStack", "area-de-espera": "Sofa", "vigilancia": "User",
  "mediacao": "UserBadgeCheck", "exposicao": "Frame", "formulario-de-avaliacao": "ClipboardCheck" };
for (const [nome, ic] of Object.entries(pontos)) {
  const svg = renderToStaticMarkup(createElement(I[ic], { width: 24, height: 24, strokeWidth: 1.6 }));
  writeFileSync(new URL(`./mapa-impressao/icones/ponto-${nome}.svg`, import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n${svg.replaceAll("currentColor", "#CC4E17").replace(' color="#CC4E17"', "")}\n`);
}
console.log(Object.keys(pontos).length, "ícones");
