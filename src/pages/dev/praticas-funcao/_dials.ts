// Painel DialKit do playground /dev/praticas-funcao (desenvolvimento): as Práticas do mapa, na Etapa aberta e nas fechadas.
// Etapa aberta:
//   lista: espaço entre as Práticas e entre o rosto e o texto
//   rostos: tamanho, quanto descem e as cores (as cores valem nas fechadas também)
//   titulo: tamanho, peso, cor e entrelinha
//   funcao: o jeito de mostrar (embaixo · emCima · etiqueta · grupos), tamanho, peso, cor, caixa, letras, o espaço até o título
//     e a caixa dela: fundo, borda, cantos e respiros
//   etiqueta (jeito etiqueta): fundo, borda e respiro · grupos (jeito grupos): o título de cada ator
//   descricao: tamanho, cor, entrelinha e o espaço acima · exemplo: fundo, borda, cor, tamanho, entrelinha, respiros e cantos
// Etapas fechadas (inativas): lista, rostos e título (a Função e o detalhe não aparecem nelas).
// Opções de texto e cor são classes do Tailwind (todas as cores do tema); espaços em px.
// Tudo vira um <style> (e, nos grupos, itens <li>) dentro do quadro. Para levar ao código: Copy parameters, colar na conversa.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const TAMANHOS: Record<string, string> = { "text-2xs": "var(--tamanho-2xs)", "text-xs": "var(--tamanho-xs)", "text-sm": "var(--tamanho-sm)", "text-md": "var(--tamanho-md)", "text-lg": "var(--tamanho-lg)" };
const PESOS: Record<string, string> = { "font-light": "300", "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };
const ENTRELINHA: Record<string, string> = { "leading-none": "1", "leading-tight": "1.25", "leading-snug": "1.375", "leading-normal": "1.5", "leading-relaxed": "1.625" };
const LETRAS: Record<string, string> = { "tracking-tight": "-0.025em", "tracking-normal": "normal", "tracking-wide": "0.025em", "tracking-wider": "0.05em", "tracking-widest": "0.1em" };
const CAIXA: Record<string, string> = { "normal-case": "none", "uppercase": "uppercase" };
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-sm": "2px", "rounded": "4px", "rounded-md": "6px", "rounded-lg": "8px", "rounded-full": "999px" };
const select = (options: string[], def: string) => ({ type: "select", options, default: def });
const tam = (def: string) => select(Object.keys(TAMANHOS), def);
const peso = (def: string) => select(Object.keys(PESOS), def);
const linha = (def: string) => select(Object.keys(ENTRELINHA), def);

// partida: os valores colados em 23/11/2026 (segunda vez) e, no resto, como está no mapa hoje
const config: Record<string, any> = {
  lista: { _collapsed: false, entrePraticas: [20, 0, 32, 1], rostoAteTexto: [10, 0, 16, 1] },
  rostos: { _collapsed: false, tamanho: [16, 10, 24, 1], descer: [3, -4, 8, 0.5], boa: select(cores("bg"), "bg-coral-300"), evitar: select(cores("bg"), "bg-neutro-300") },
  titulo: { _collapsed: false, tamanho: tam("text-sm"), peso: peso("font-medium"), cor: select(cores("text"), "text-texto-950"), entrelinha: linha("leading-normal") },
  funcao: {
    _collapsed: false,
    jeito: select(["embaixo", "emCima", "etiqueta", "grupos"], "emCima"),
    tamanho: tam("text-xs"), peso: peso("font-normal"), cor: select(cores("text"), "text-texto-600"),
    caixa: select(Object.keys(CAIXA), "normal-case"), letras: select(Object.keys(LETRAS), "tracking-wide"),
    ateOTitulo: [2, 0, 12, 1],
    // a caixa da Função (vale nos jeitos embaixo e emCima; a etiqueta tem a dela)
    fundo: select(cores("bg"), "bg-transparente"), borda: select(cores("border"), "border-transparente"),
    cantos: select(Object.keys(CANTOS), "rounded-none"), respiroX: [0, 0, 14, 1], respiroY: [0, 0, 6, 1]
  },
  etiqueta: { _collapsed: true, fundo: select(cores("bg"), "bg-neutro-50"), borda: select(cores("border"), "border-coral-200"), respiroX: [7, 2, 14, 1], respiroY: [1, 0, 6, 1] },
  grupos: {
    _collapsed: true, tamanho: tam("text-xs"), peso: peso("font-semibold"), cor: select(cores("text"), "text-texto-700"),
    caixa: select(Object.keys(CAIXA), "normal-case"), letras: select(Object.keys(LETRAS), "tracking-normal"), espacoAcima: [10, 0, 32, 1], ateAPrimeira: [2, 0, 16, 1]
  },
  descricao: { _collapsed: true, tamanho: tam("text-xs"), cor: select(cores("text"), "text-texto-600"), entrelinha: linha("leading-normal"), espacoAcima: [4, 0, 16, 1] },
  exemplo: {
    _collapsed: true, fundo: select(cores("bg"), "bg-coral-100"), borda: select(cores("border"), "border-transparente"), cor: select(cores("text"), "text-coral-800"),
    tamanho: tam("text-xs"), entrelinha: linha("leading-normal"), espacoAcima: [6, 0, 20, 1], respiroX: [8, 0, 20, 1], respiroY: [6, 0, 16, 1],
    cantos: select(Object.keys(CANTOS), "rounded-sm")
  },
  inativas: {
    _collapsed: false, entrePraticas: [8, 0, 32, 1], rostoAteTexto: [6, 0, 16, 1], rostoTamanho: [14, 10, 24, 1], rostoDescer: [2, -4, 8, 0.5],
    tamanho: tam("text-xs"), peso: peso("font-medium"), cor: select(cores("text"), "text-texto-950"), entrelinha: linha("leading-normal")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Mapa: Função nas Práticas", config, { id: "musa-praticas-funcao-v3", persist: true });
let v = kit.getValues() as Record<string, any>;

const A = `.mapa[data-modo="etapa"] .etapa[data-aberta]`;
const I = `.mapa[data-modo="etapa"] .etapa:not([data-aberta])`;
const texto = (o: any) => [
  o.tamanho && `font-size: ${TAMANHOS[o.tamanho]}`, o.peso && `font-weight: ${PESOS[o.peso]}`, o.cor && `color: ${cor(o.cor)}`,
  o.entrelinha && `line-height: ${ENTRELINHA[o.entrelinha]}`, o.caixa && `text-transform: ${CAIXA[o.caixa]}`, o.letras && `letter-spacing: ${LETRAS[o.letras]}`
].filter(Boolean).map((x) => `${x} !important;`).join(" ");

function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.querySelector(`${A} .camada-praticas .praticas`)) return;
  const { lista: L, rostos: R, titulo: T, funcao: F, etiqueta: E, grupos: G, descricao: D, exemplo: X, inativas: N } = v;
  const regras = [
    // cores dos rostos: nas duas
    `.pratica .marcador { background: ${cor(R.boa)} !important; }`,
    `.pratica[data-tipo="evitar"] .marcador { background: ${cor(R.evitar)} !important; }`,
    // aberta
    `${A} .praticas { gap: ${L.entrePraticas}px !important; }`,
    `${A} .pratica { grid-template-columns: ${R.tamanho}px 1fr !important; column-gap: ${L.rostoAteTexto}px !important; }`,
    `${A} .marcador { width: ${R.tamanho}px !important; height: ${R.tamanho}px !important; margin-top: ${R.descer}px !important; }`,
    `${A} .pratica-titulo { ${texto(T)} }`,
    `${A} .pratica-funcao { ${texto(F)} justify-self: start; padding: ${F.respiroY}px ${F.respiroX}px; background: ${cor(F.fundo)};
      border: ${F.borda === "border-transparente" ? "0" : `1px solid ${cor(F.borda)}`}; border-radius: ${CANTOS[F.cantos]}; }`,
    `${A} .pratica-grupo { list-style: none; margin: ${G.espacoAcima}px 0 ${G.ateAPrimeira}px; ${texto(G)} }`,
    `${A} .pratica-grupo:first-child { margin-top: 0 !important; }`,
    `${A} .pratica-detalhe { margin-top: ${D.espacoAcima}px !important; }`,
    `${A} .pratica-descricao { ${texto(D)} }`,
    `${A} .pratica-exemplo { margin-top: ${X.espacoAcima}px !important; padding: ${X.respiroY}px ${X.respiroX}px !important; background: ${cor(X.fundo)} !important;
      border: 1px solid ${cor(X.borda)} !important; border-radius: ${CANTOS[X.cantos]} !important; ${texto(X)} }`,
    // fechadas
    `${I} .praticas { gap: ${N.entrePraticas}px !important; }`,
    `${I} .pratica { grid-template-columns: ${N.rostoTamanho}px 1fr !important; column-gap: ${N.rostoAteTexto}px !important; }`,
    `${I} .marcador { width: ${N.rostoTamanho}px !important; height: ${N.rostoTamanho}px !important; margin-top: ${N.rostoDescer}px !important; }`,
    `${I} .pratica-titulo { ${texto(N)} }`
  ];
  // o espaço entre a Função e o título: embaixo dele (embaixo, etiqueta) ou em cima (emCima)
  if (F.jeito === "emCima") regras.push(
    `${A} .pratica { grid-template-rows: auto auto; }`,
    `${A} .pratica .pratica-funcao { grid-row: 1; grid-column: 2; margin: 0 0 ${F.ateOTitulo}px !important; }`,
    `${A} .pratica .marcador, ${A} .pratica .pratica-titulo { grid-row: 2; }`);
  else regras.push(`${A} .pratica .pratica-funcao { margin-top: ${F.ateOTitulo}px !important; }`);
  if (F.jeito === "etiqueta") regras.push(
    `${A} .pratica .pratica-funcao { justify-self: start; padding: ${E.respiroY}px ${E.respiroX}px; border-radius: 999px; border: 1px solid ${cor(E.borda)}; background: ${cor(E.fundo)}; }`);
  if (F.jeito === "grupos") regras.push(`${A} .pratica .pratica-funcao:not([data-outras]) { display: none; }`);
  let folha = d.getElementById("dial-praticas-funcao");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-praticas-funcao"; d.head.append(folha); }
  folha.textContent = regras.join("\n");
  agrupar(d, F.jeito === "grupos");
}

// grupos: um <li> com o nome do ator antes da primeira Prática dele; nos itens, só as outras Funções (se houver)
function agrupar(d: Document, ligado: boolean) {
  d.querySelectorAll(".pratica-grupo").forEach((g) => g.remove());
  d.querySelectorAll<HTMLElement>(".pratica-funcao[data-original]").forEach((f) => { f.textContent = f.dataset.original!; delete f.dataset.original; delete f.dataset.outras; });
  if (!ligado) return;
  d.querySelectorAll<HTMLElement>(`${A} .camada-praticas .praticas`).forEach((ul) => {
    let atual = "";
    ul.querySelectorAll<HTMLElement>(".pratica").forEach((li) => {
      const f = li.querySelector<HTMLElement>(".pratica-funcao")!;
      const nomes = f.textContent!.split(" · ");
      if (nomes[0] !== atual) {
        atual = nomes[0];
        const g = d.createElement("li"); g.className = "pratica-grupo"; g.textContent = atual; li.before(g);
      }
      f.dataset.original = f.textContent!;
      if (nomes.length > 1) { f.textContent = "Também: " + nomes.slice(1).join(" · "); f.dataset.outras = ""; }
    });
  });
}

kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });
// para conferir os jeitos sem o painel (teste automático)
(window as any).__jeito = (j: string) => { v = { ...v, funcao: { ...v.funcao, jeito: j } }; aplicar(); };
// o quadro recarrega a cada estado: espera o mapa e reaplica (e fecha a Introdução, se ela abrir sozinha)
function vigiar() {
  const d = quadro.contentDocument;
  if (d?.querySelector(`${A} .camada-praticas`)) { d.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); aplicar(); }
  else setTimeout(vigiar, 100);
}
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
