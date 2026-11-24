// Painel DialKit do playground /dev/praticas-funcao (desenvolvimento): a Função (ator) de cada Prática e o resto dela.
//   funcao.jeito: embaixo (como hoje, texto pequeno embaixo do título) · emCima (sobrancelha acima do título) ·
//     etiqueta (uma pill embaixo do título) · grupos (um título por ator antes das Práticas dele; nos itens só aparece
//     a Função quando há mais de uma, as outras além da do grupo)
//   funcao: tamanho, peso, cor, caixa, espaçamento de letras; etiqueta: fundo e borda; grupos: tamanho, peso, cor e espaço acima
//   rostos: tamanho e cor da boa e da que evitar · descricao: cor · exemplo: fundo, cor do texto e cantos
// Só na Etapa aberta (nas fechadas a Função não aparece). Tudo vira um <style> e, nos grupos, itens <li> dentro do quadro.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const TAMANHOS: Record<string, string> = { "text-2xs": "var(--tamanho-2xs)", "text-xs": "var(--tamanho-xs)", "text-sm": "var(--tamanho-sm)", "text-md": "var(--tamanho-md)" };
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };
const LETRAS: Record<string, string> = { "tracking-normal": "normal", "tracking-wide": "0.025em", "tracking-wider": "0.05em", "tracking-widest": "0.1em" };
const CAIXA: Record<string, string> = { "normal-case": "none", "uppercase": "uppercase" };
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-sm": "2px", "rounded": "4px", "rounded-md": "6px", "rounded-full": "999px" };
const select = (options: string[], def: string) => ({ type: "select", options, default: def });

// partida: como está no mapa hoje
const config: Record<string, any> = {
  funcao: {
    _collapsed: false,
    jeito: select(["embaixo", "emCima", "etiqueta", "grupos"], "embaixo"),
    tamanho: select(Object.keys(TAMANHOS), "text-2xs"),
    peso: select(Object.keys(PESOS), "font-normal"),
    cor: select(cores("text"), "text-texto-600"),
    caixa: select(Object.keys(CAIXA), "normal-case"),
    letras: select(Object.keys(LETRAS), "tracking-normal")
  },
  etiqueta: { _collapsed: true, fundo: select(cores("bg"), "bg-neutro-50"), borda: select(cores("border"), "border-coral-200") },
  grupos: {
    _collapsed: true,
    tamanho: select(Object.keys(TAMANHOS), "text-xs"),
    peso: select(Object.keys(PESOS), "font-semibold"),
    cor: select(cores("text"), "text-texto-700"),
    caixa: select(Object.keys(CAIXA), "normal-case"),
    letras: select(Object.keys(LETRAS), "tracking-normal"),
    espacoAcima: [12, 0, 32, 2]
  },
  rostos: { _collapsed: true, tamanho: [14, 10, 22, 1], boa: select(cores("bg"), "bg-coral-600"), evitar: select(cores("bg"), "bg-carmim-800") },
  descricao: { _collapsed: true, cor: select(cores("text"), "text-texto-600") },
  exemplo: { _collapsed: true, fundo: select(cores("bg"), "bg-coral-100"), cor: select(cores("text"), "text-texto-700"), cantos: select(Object.keys(CANTOS), "rounded") }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Mapa: Função nas Práticas", config, { id: "musa-praticas-funcao", persist: true });
let v = kit.getValues() as Record<string, any>;

const A = `.mapa[data-modo="etapa"] .etapa[data-aberta]`;
function aplicar() {
  const d = quadro.contentDocument;
  const lista = d?.querySelectorAll<HTMLElement>(`${A} .camada-praticas .praticas`);
  if (!d || !lista?.length) return;
  const { funcao: F, etiqueta: E, grupos: G, rostos: R, descricao: D, exemplo: X } = v;
  const texto = (o: any) => `font-size: ${TAMANHOS[o.tamanho]}; font-weight: ${PESOS[o.peso]}; color: ${cor(o.cor)}; text-transform: ${CAIXA[o.caixa]}; letter-spacing: ${LETRAS[o.letras]};`;
  const regras = [
    `.marcador { width: ${R.tamanho}px !important; height: ${R.tamanho}px !important; }`,
    `.pratica { grid-template-columns: ${R.tamanho}px 1fr !important; }`,
    `.pratica .marcador { background: ${cor(R.boa)} !important; }`,
    `.pratica[data-tipo="evitar"] .marcador { background: ${cor(R.evitar)} !important; }`,
    `${A} .pratica-descricao { color: ${cor(D.cor)} !important; }`,
    `${A} .pratica-exemplo { background: ${cor(X.fundo)} !important; color: ${cor(X.cor)} !important; border-radius: ${CANTOS[X.cantos]} !important; }`,
    `${A} .pratica-funcao { ${texto(F)} }`,
    `${A} .pratica-grupo { list-style: none; margin: ${G.espacoAcima}px 0 0; ${texto(G)} }`,
    `${A} .pratica-grupo:first-child { margin-top: 0; }`
  ];
  if (F.jeito === "emCima") regras.push(
    `${A} .pratica { grid-template-rows: auto auto; }`,
    `${A} .pratica .pratica-funcao { grid-row: 1; grid-column: 2; margin-bottom: 1px; }`,
    `${A} .pratica .marcador, ${A} .pratica .pratica-titulo { grid-row: 2; }`);
  if (F.jeito === "etiqueta") regras.push(
    `${A} .pratica .pratica-funcao { justify-self: start; margin-top: 3px; padding: 1px 7px; border-radius: 999px; border: 1px solid ${cor(E.borda)}; background: ${cor(E.fundo)}; }`);
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
