// Painel DialKit do playground /dev/inicio-textura (desenvolvimento): textura de fundo da página inicial.
// Referência: paper.design usa uma foto de papel (405 px, repetida) quase apagada (~12%) sobre um fundo creme,
// mais uma grade de desenho (120 px, linhas de 0,5 px) a 30%. Aqui o papel é gerado (filtro SVG), sem imagem.
//   fundo: a cor da página (body).
//   textura: "papel" = fibra com relevo (feTurbulence + luz difusa); "grão" = ruído liso; "nenhuma".
//     opacidade, tamanho do ladrilho, escala da fibra, camadas de detalhe, relevo, semente;
//     camada: acima do conteúdo (o grão passa por cima de tudo, como em paper.design) ou abaixo (só no fundo);
//     mistura: multiply só escurece (o fundo continua limpo), normal também clareia.
//   grade: linhas finas como papel milimetrado de desenho; vertical tracejada, horizontal contínua.
// Tudo é injetado dentro do quadro (um <style> e variáveis no <body>). Para levar ao código: Copy parameters,
// colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => PASSOS.map((p) => `${prefixo}-${p}`);
const select = (options: any[], def: string) => ({ type: "select", options, default: def });

const config: Record<string, any> = {
  fundo: select(cores("bg"), "bg-neutro-50"),
  textura: {
    _collapsed: false,
    tipo: select(["papel", "grão", "nenhuma"], "papel"),
    opacidade: [36, 0, 60, 1],
    camada: select(["acima do conteúdo", "abaixo do conteúdo"], "abaixo do conteúdo"),
    mistura: select(["multiply", "normal", "soft-light"], "soft-light"),
    ladrilho: [100, 100, 800, 10],
    fibra: [2.7, 0.1, 3, 0.05],
    detalhe: [4, 1, 6, 1],
    relevo: [4.3, 0.2, 6, 0.1],
    semente: [12, 1, 50, 1]
  },
  grade: {
    _collapsed: false,
    mostrar: false,
    cor: select(cores("text"), "text-neutro-950"),
    opacidade: [12, 0, 60, 1],
    tamanho: [120, 40, 240, 8],
    espessura: [0.5, 0.25, 2, 0.25],
    tracejado: true
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Início: textura de fundo", config, { id: "musa-inicio-textura-3", persist: true });
let v = kit.getValues() as Record<string, any>;

const token = (classe: string) => classe.replace(/^(bg|text|border)-/, "");
const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// papel: a fibra vira relevo com luz difusa vinda de cima à esquerda (cinza claro com sombras finas, como a foto
// de paper.design); grão: o próprio ruído em cinza. stitchTiles="stitch" faz o ladrilho emendar sem costura.
function textura(T: Record<string, any>) {
  const n = T.ladrilho, f = (T.fibra / 10).toFixed(4);
  const ruido = `<feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="${T.detalhe}" seed="${T.semente}" stitchTiles="stitch" result="r"/>`;
  const filtro = T.tipo === "papel"
    ? `${ruido}<feDiffuseLighting in="r" surfaceScale="${T.relevo}" lighting-color="#fff" diffuseConstant="1"><feDistantLight azimuth="225" elevation="55"/></feDiffuseLighting>`
    : `${ruido}<feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="${T.relevo / 2 + 0.5}" intercept="${0.5 - (T.relevo / 2 + 0.5) / 2}"/><feFuncG type="linear" slope="${T.relevo / 2 + 0.5}" intercept="${0.5 - (T.relevo / 2 + 0.5) / 2}"/><feFuncB type="linear" slope="${T.relevo / 2 + 0.5}" intercept="${0.5 - (T.relevo / 2 + 0.5) / 2}"/><feFuncA type="discrete" tableValues="1"/></feComponentTransfer>`;
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}"><filter id="t" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${filtro}</filter><rect width="100%" height="100%" filter="url(#t)"/></svg>`);
}

function grade(G: Record<string, any>, cor: string) {
  const n = G.tamanho, m = n / 2, e = G.espessura, tr = G.tracejado ? ` stroke-dasharray="${(n / 16).toFixed(2)} ${(n / 16).toFixed(2)}"` : "";
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}"><g stroke="${cor}" stroke-width="${e}" fill="none"><line x1="${m}" y1="0" x2="${m}" y2="${n}"${tr}/><line x1="0" y1="${m}" x2="${n}" y2="${m}"/></g></svg>`);
}

// :is(.com-textura, *) iguala a especificidade da textura de verdade (estilo.css) e vem depois: o painel manda
const CSS = `
  body { position: relative; }
  body:is(.com-textura, *)::before, body:is(.com-textura, *)::after { content: ""; position: absolute; inset: 0; pointer-events: none; background-repeat: repeat; }
  /* grade: sempre no fundo, centrada na página */
  body:is(.com-textura, *)::before { z-index: -1; mix-blend-mode: normal; background-image: var(--pg-grade, none); background-size: var(--pg-grade-tam) var(--pg-grade-tam);
    background-position: calc(50% + var(--pg-grade-tam) / 2) 0; opacity: var(--pg-grade-op, 0); }
  body:is(.com-textura, *)::after { z-index: var(--pg-tex-z, 2147483000); background-image: var(--pg-tex, none); background-size: var(--pg-tex-tam) var(--pg-tex-tam);
    opacity: var(--pg-tex-op, 0); mix-blend-mode: var(--pg-tex-mistura, multiply); }
`;

function aplicar() {
  const doc = quadro.contentDocument;
  if (!doc?.body) return;
  if (!doc.getElementById("pg-textura")) {
    const s = doc.createElement("style"); s.id = "pg-textura"; s.textContent = CSS; doc.head.append(s);
  }
  const b = doc.body, T = v.textura, G = v.grade;
  const raiz = getComputedStyle(doc.documentElement);
  b.style.background = `var(--${token(v.fundo)})`;
  b.style.setProperty("--pg-tex", T.tipo === "nenhuma" ? "none" : textura(T));
  b.style.setProperty("--pg-tex-tam", `${T.ladrilho}px`);
  b.style.setProperty("--pg-tex-op", String(T.opacidade / 100));
  b.style.setProperty("--pg-tex-z", T.camada === "acima do conteúdo" ? "2147483000" : "-1");
  b.style.setProperty("--pg-tex-mistura", T.mistura);
  b.style.setProperty("--pg-grade", G.mostrar ? grade(G, raiz.getPropertyValue(`--${token(G.cor)}`).trim() || "#000") : "none");
  b.style.setProperty("--pg-grade-tam", `${G.tamanho}px`);
  b.style.setProperty("--pg-grade-op", String(G.opacidade / 100));
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera o body e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector("main")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
