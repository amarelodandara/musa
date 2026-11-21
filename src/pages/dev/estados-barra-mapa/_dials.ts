// Painel DialKit da barra do topo do mapa, só na bancada /dev/estados-barra-mapa (desenvolvimento).
// A barra vive num quadro (a própria página /mapa). O painel fica na bancada e mexe dentro do quadro, sem mudar o código:
// acha as peças por seletores (rótulos acessíveis e a estrutura da ilha) e reaplica a escolha a cada troca de estado
// (o quadro recarrega) e sempre que o React redesenha.
// Cada opção é uma classe do Tailwind, escrita por extenso para o Tailwind gerar todas.
//   - controle sem "props": troca a classe no elemento (peças da ilha React, que só têm classes do Tailwind)
//   - controle com "props": a barra e a marca têm CSS próprio da página do mapa, que ganharia da classe; então o painel
//     mede a classe num elemento de prova e copia o valor medido para o estilo do elemento
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
interface Alvo { sel: string; props?: string[] }
interface Controle { alvos: Alvo[]; opcoes: Opcao[] }

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// peças (dentro do quadro)
const TOPO = ".mapa-topo";
const INTRODUCAO = '.mapa-topo button[aria-label="Introdução"], .mapa-topo button[aria-label="Fechar a introdução"]';
const FILTRO = '.mapa-topo button[aria-label^="Filtrar visualização"]';
// o botão do filtro com filtro ligado tem as cores próprias (grupo filtroLigado); os outros controles não mexem nele
const FILTRO_SEM = '.mapa-topo button[aria-label="Filtrar visualização"]';
const FILTRO_LIGADO = '.mapa-topo button[aria-label="Filtrar visualização (há filtros ligados)"]';
const BOTOES = `${INTRODUCAO}, ${FILTRO}`;
const BOTOES_NEUTROS = `${INTRODUCAO}, ${FILTRO_SEM}`;
const ICONES = ".mapa-topo button > svg";
const ROTULO_GRADE = ".mapa-topo button > span.grid";
const ROTULO_TEXTO = ".mapa-topo button > span.grid > span > span";
const DIREITA = ".mapa-topo .ml-auto";
const TRILHA = '.mapa-topo [role="group"][aria-label="Como ver o mapa"]';
const SEGMENTOS = `${TRILHA} > button`;

const PESOS = ["font-normal", "font-medium", "font-semibold", "font-bold"];
// Todas as cores do tema (src/styles/tailwind.css), em toda escolha de cor. Escritas por extenso para o Tailwind gerar.
const TEXTO_COR: Opcao[] = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const FUNDO: Opcao[] = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const BORDA: Opcao[] = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];
const FUNDO_AO_PASSAR: Opcao[] = ["hover:bg-transparente", "hover:bg-coral-50", "hover:bg-coral-100", "hover:bg-coral-200", "hover:bg-coral-300", "hover:bg-coral-400", "hover:bg-coral-500", "hover:bg-coral-600", "hover:bg-coral-700", "hover:bg-coral-800", "hover:bg-coral-900", "hover:bg-carmim-100", "hover:bg-carmim-200", "hover:bg-carmim-300", "hover:bg-carmim-400", "hover:bg-carmim-500", "hover:bg-carmim-600", "hover:bg-carmim-700", "hover:bg-carmim-800", "hover:bg-carmim-900", "hover:bg-carmim-950", "hover:bg-neutro-50", "hover:bg-neutro-100", "hover:bg-neutro-200", "hover:bg-neutro-300", "hover:bg-neutro-400", "hover:bg-neutro-500", "hover:bg-neutro-600", "hover:bg-neutro-700", "hover:bg-neutro-800", "hover:bg-neutro-900", "hover:bg-neutro-950", "hover:bg-texto-950", "hover:bg-texto-900", "hover:bg-texto-700", "hover:bg-texto-600", "hover:bg-texto-400", "hover:bg-texto-50"];
const FUNDO_ABERTO: Opcao[] = ["data-popup-open:bg-transparente", "data-popup-open:bg-coral-50", "data-popup-open:bg-coral-100", "data-popup-open:bg-coral-200", "data-popup-open:bg-coral-300", "data-popup-open:bg-coral-400", "data-popup-open:bg-coral-500", "data-popup-open:bg-coral-600", "data-popup-open:bg-coral-700", "data-popup-open:bg-coral-800", "data-popup-open:bg-coral-900", "data-popup-open:bg-carmim-100", "data-popup-open:bg-carmim-200", "data-popup-open:bg-carmim-300", "data-popup-open:bg-carmim-400", "data-popup-open:bg-carmim-500", "data-popup-open:bg-carmim-600", "data-popup-open:bg-carmim-700", "data-popup-open:bg-carmim-800", "data-popup-open:bg-carmim-900", "data-popup-open:bg-carmim-950", "data-popup-open:bg-neutro-50", "data-popup-open:bg-neutro-100", "data-popup-open:bg-neutro-200", "data-popup-open:bg-neutro-300", "data-popup-open:bg-neutro-400", "data-popup-open:bg-neutro-500", "data-popup-open:bg-neutro-600", "data-popup-open:bg-neutro-700", "data-popup-open:bg-neutro-800", "data-popup-open:bg-neutro-900", "data-popup-open:bg-neutro-950", "data-popup-open:bg-texto-950", "data-popup-open:bg-texto-900", "data-popup-open:bg-texto-700", "data-popup-open:bg-texto-600", "data-popup-open:bg-texto-400", "data-popup-open:bg-texto-50"];
const TEXTO_ESCOLHIDA: Opcao[] = ["data-pressed:text-transparente", "data-pressed:text-coral-50", "data-pressed:text-coral-100", "data-pressed:text-coral-200", "data-pressed:text-coral-300", "data-pressed:text-coral-400", "data-pressed:text-coral-500", "data-pressed:text-coral-600", "data-pressed:text-coral-700", "data-pressed:text-coral-800", "data-pressed:text-coral-900", "data-pressed:text-carmim-100", "data-pressed:text-carmim-200", "data-pressed:text-carmim-300", "data-pressed:text-carmim-400", "data-pressed:text-carmim-500", "data-pressed:text-carmim-600", "data-pressed:text-carmim-700", "data-pressed:text-carmim-800", "data-pressed:text-carmim-900", "data-pressed:text-carmim-950", "data-pressed:text-neutro-50", "data-pressed:text-neutro-100", "data-pressed:text-neutro-200", "data-pressed:text-neutro-300", "data-pressed:text-neutro-400", "data-pressed:text-neutro-500", "data-pressed:text-neutro-600", "data-pressed:text-neutro-700", "data-pressed:text-neutro-800", "data-pressed:text-neutro-900", "data-pressed:text-neutro-950", "data-pressed:text-texto-950", "data-pressed:text-texto-900", "data-pressed:text-texto-700", "data-pressed:text-texto-600", "data-pressed:text-texto-400", "data-pressed:text-texto-50"];
const FUNDO_ESCOLHIDA: Opcao[] = ["data-pressed:bg-transparente", "data-pressed:bg-coral-50", "data-pressed:bg-coral-100", "data-pressed:bg-coral-200", "data-pressed:bg-coral-300", "data-pressed:bg-coral-400", "data-pressed:bg-coral-500", "data-pressed:bg-coral-600", "data-pressed:bg-coral-700", "data-pressed:bg-coral-800", "data-pressed:bg-coral-900", "data-pressed:bg-carmim-100", "data-pressed:bg-carmim-200", "data-pressed:bg-carmim-300", "data-pressed:bg-carmim-400", "data-pressed:bg-carmim-500", "data-pressed:bg-carmim-600", "data-pressed:bg-carmim-700", "data-pressed:bg-carmim-800", "data-pressed:bg-carmim-900", "data-pressed:bg-carmim-950", "data-pressed:bg-neutro-50", "data-pressed:bg-neutro-100", "data-pressed:bg-neutro-200", "data-pressed:bg-neutro-300", "data-pressed:bg-neutro-400", "data-pressed:bg-neutro-500", "data-pressed:bg-neutro-600", "data-pressed:bg-neutro-700", "data-pressed:bg-neutro-800", "data-pressed:bg-neutro-900", "data-pressed:bg-neutro-950", "data-pressed:bg-texto-950", "data-pressed:bg-texto-900", "data-pressed:bg-texto-700", "data-pressed:bg-texto-600", "data-pressed:bg-texto-400", "data-pressed:bg-texto-50"];
const CANTOS = ["rounded-none", "rounded-sm", "rounded", "rounded-md", "rounded-lg", "rounded-full"];

const c = (sel: string, opcoes: Opcao[]): Controle => ({ alvos: [{ sel }], opcoes });
const s = (sel: string, props: string[], opcoes: Opcao[]): Controle => ({ alvos: [{ sel, props }], opcoes });

const CONTROLES: Record<string, Record<string, Controle>> = {
  barra: {
    altura: s(TOPO, ["height"], [["36 px", "h-9"], ["40 px", "h-10"], ["44 px", "h-11"], ["48 px", "h-12"], ["56 px", "h-14"]]),
    respiroLateral: s(TOPO, ["padding-left", "padding-right"], ["px-2", "px-3", "px-4", "px-5", "px-6"]),
    espacoAteAMarca: s(TOPO, ["column-gap"], ["gap-2", "gap-3", "gap-4", "gap-5", "gap-6"]),
    fundo: s(TOPO, ["background-color"], FUNDO),
    linhaDeBaixo: s(TOPO, ["border-bottom-color"], BORDA)
  },
  botoes: {
    tamanho: c(BOTOES, [["24 px", "h-6 px-0.75"], ["28 px", "h-7 px-1.25"], ["32 px", "h-8 px-1.75"], ["36 px", "h-9 px-2.25"]]),
    cantos: c(BOTOES, CANTOS),
    borda: c(BOTOES_NEUTROS, BORDA),
    fundo: c(BOTOES_NEUTROS, FUNDO),
    fundoAoPassar: c(BOTOES_NEUTROS, FUNDO_AO_PASSAR),
    fundoAberto: c(BOTOES_NEUTROS, FUNDO_ABERTO),
    cor: c(BOTOES_NEUTROS, TEXTO_COR),
    espacoEntreFiltroEVisao: c(DIREITA, ["gap-1", "gap-1.5", "gap-2", "gap-3", "gap-4"])
  },
  rotulos: {
    tamanho: c(BOTOES, ["text-2xs", "text-xs", "text-sm"]),
    peso: c(BOTOES, PESOS),
    espacoAteOIcone: c(ROTULO_TEXTO, ["pl-1", "pl-1.5", "pl-2", "pl-2.5"]),
    sobraADireita: c(ROTULO_TEXTO, ["pr-0", "pr-0.5", "pr-1", "pr-1.5"]),
    duracaoDaAbertura: c(ROTULO_GRADE, ["duration-100", "duration-150", "duration-200", "duration-300", "duration-500"])
  },
  filtroLigado: {
    borda: c(FILTRO_LIGADO, BORDA),
    fundo: c(FILTRO_LIGADO, FUNDO),
    cor: c(FILTRO_LIGADO, TEXTO_COR),
    fundoAoPassar: c(FILTRO_LIGADO, FUNDO_AO_PASSAR),
    fundoAberto: c(FILTRO_LIGADO, FUNDO_ABERTO)
  },
  visao: {
    fundoDaTrilha: c(TRILHA, FUNDO),
    cantosDaTrilha: c(TRILHA, CANTOS),
    respiroDaTrilha: c(TRILHA, ["p-0", "p-0.5", "p-1"]),
    espacoEntreOpcoes: c(TRILHA, ["gap-0", "gap-0.5", "gap-1"]),
    alturaDaOpcao: c(SEGMENTOS, ["h-5", "h-6", "h-7"]),
    respiroDaOpcao: c(SEGMENTOS, ["px-2", "px-2.5", "px-3", "px-4"]),
    cantosDaOpcao: c(SEGMENTOS, CANTOS),
    tamanhoDoTexto: c(SEGMENTOS, ["text-2xs", "text-xs", "text-sm"]),
    peso: c(SEGMENTOS, PESOS),
    pesoDaEscolhida: c(SEGMENTOS, ["data-pressed:font-normal", "data-pressed:font-medium", "data-pressed:font-semibold"]),
    cor: c(SEGMENTOS, TEXTO_COR),
    corDaEscolhida: c(SEGMENTOS, TEXTO_ESCOLHIDA),
    fundoDaEscolhida: c(SEGMENTOS, FUNDO_ESCOLHIDA),
    sombraDaEscolhida: c(SEGMENTOS, [["Sem sombra", "data-pressed:shadow-none"], "data-pressed:shadow-xs", "data-pressed:shadow-sm", "data-pressed:shadow-md"])
  },
  marca: {
    tamanho: {
      alvos: [
        { sel: ".mapa-topo .nav-olho, .mapa-topo .mapa-marca img", props: ["width", "height"] },
        { sel: ".mapa-topo .mapa-marca", props: ["height"] }
      ],
      opcoes: [["20 px", "size-5"], ["24 px", "size-6"], ["28 px", "size-7"], ["32 px", "size-8"], ["36 px", "size-9"]]
    }
  }
};

const valor = (o: Opcao) => (Array.isArray(o) ? o[1] : o);
const tokens = (t: string) => t.split(/\s+/).filter(Boolean);

// mede uma classe num elemento de prova invisível dentro do quadro
const medidas = new WeakMap<Document, Map<string, CSSStyleDeclaration>>();
function medir(doc: Document, classe: string, props: string[]) {
  let cache = medidas.get(doc);
  if (!cache) { cache = new Map(); medidas.set(doc, cache); }
  let cs = cache.get(classe);
  if (!cs) {
    const p = doc.createElement("div");
    p.className = classe + " border-solid border-0 border-b";
    p.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
    doc.body.appendChild(p);
    const lido = getComputedStyle(p);
    const copia = {} as Record<string, string>;
    for (const k of ["height", "width", "padding-left", "padding-right", "column-gap", "background-color", "border-bottom-color"]) copia[k] = lido.getPropertyValue(k);
    p.remove();
    cs = { getPropertyValue: (k: string) => copia[k] ?? "" } as CSSStyleDeclaration;
    cache.set(classe, cs);
  }
  return Object.fromEntries(props.map((k) => [k, cs!.getPropertyValue(k)]));
}

const doc = () => quadro.contentDocument;
// pronto = o React já hidratou os botões da barra (cada um ganha a chave __reactProps); antes disso, mexer nas classes
// quebra a hidratação
const hidratado = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactProps"));
const pronto = (d: Document | null) => !!d?.querySelector(FILTRO) && !!d.querySelector(TOPO) && [...d.querySelectorAll(".mapa-topo button")].every(hidratado);

// padrão: o que o código usa hoje (lido no quadro), para o painel começar igual à página
function padrao(d: Document, ctrl: Controle) {
  const { sel, props } = ctrl.alvos[0];
  const el = d.querySelector<HTMLElement>(sel);
  if (!el) return valor(ctrl.opcoes[0]);
  if (props) {
    const atual = getComputedStyle(el);
    const achou = ctrl.opcoes.find((o) => props.every((k) => medir(d, valor(o), props)[k] === atual.getPropertyValue(k)));
    return valor(achou ?? ctrl.opcoes[0]);
  }
  const achou = ctrl.opcoes.find((o) => tokens(valor(o)).every((t) => el.classList.contains(t)));
  return valor(achou ?? ctrl.opcoes[0]);
}

// espera a ilha hidratar no quadro
const esperar = () => new Promise<Document>((ok) => {
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});
const primeiro = await esperar();

const config: Record<string, any> = {};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: grupo !== "barra" };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    config[grupo][nome] = {
      type: "select",
      options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)),
      default: padrao(primeiro, ctrl)
    };
  }
}
// números: os ícones são svg do Iconoir, tamanho e traço vão em atributos
config.botoes.tamanhoDoIconePx = [16, 12, 22, 1];
config.botoes.espessuraDoIcone = [1.5, 1, 2.5, 0.25];

// colunas da grade: variáveis do CSS da página do mapa (px), postas numa folha de estilo dentro do quadro
config.colunas = {
  _collapsed: false,
  fechadaNaDetalhada: [136, 64, 320, 4],
  abertaNaDetalhadaMinimo: [420, 240, 900, 10],
  naVisaoGeral: [232, 120, 480, 4],
  rotulosNaVisaoGeral: [148, 80, 280, 4]
};

// embaixo à direita: a barra fica no alto da bancada e o painel não cobre
createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Barra do mapa", config, { id: "musa-barra-mapa-v5", persist: true });

let v = kit.getValues() as Record<string, any>;
let aplicando = false;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  aplicando = true;
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      for (const { sel, props } of ctrl.alvos) {
        const els = d!.querySelectorAll<HTMLElement>(sel);
        if (props) {
          const medido = medir(d!, escolha, props);
          els.forEach((el) => props.forEach((k) => el.style.setProperty(k, medido[k])));
        } else {
          const todas = new Set(ctrl.opcoes.flatMap((o) => tokens(valor(o))));
          els.forEach((el) => {
            todas.forEach((t) => el.classList.remove(t));
            tokens(escolha).forEach((t) => el.classList.add(t));
          });
        }
      }
    }
  }
  const col = v.colunas;
  let folha = d!.getElementById("dial-colunas");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-colunas"; d!.head.appendChild(folha); }
  folha.textContent = `.mapa { --col-compacta: ${col.fechadaNaDetalhada}px !important; --col-aberta: minmax(${col.abertaNaDetalhadaMinimo}px, 1fr) !important; --col-inteira: ${col.naVisaoGeral}px !important; }
    .mapa[data-modo="inteiro"] { --rotulos: ${col.rotulosNaVisaoGeral}px !important; }`;
  d!.querySelectorAll<SVGElement>(ICONES).forEach((svg) => {
    svg.setAttribute("width", String(v.botoes.tamanhoDoIconePx));
    svg.setAttribute("height", String(v.botoes.tamanhoDoIconePx));
    svg.setAttribute("stroke-width", String(v.botoes.espessuraDoIcone));
  });
  queueMicrotask(() => { aplicando = false; });
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// a cada estado o quadro recarrega: espera a ilha e reaplica; o React recria peças (ícone da ajuda, ponto do filtro): reaplica
let observador: MutationObserver | null = null;
function vigiar() {
  const d = doc();
  if (!pronto(d)) { setTimeout(vigiar, 100); return; }
  aplicar();
  observador?.disconnect();
  let pedido = 0;
  observador = new MutationObserver(() => {
    if (aplicando || pedido) return;
    pedido = requestAnimationFrame(() => { pedido = 0; aplicar(); });
  });
  observador.observe(d!.querySelector(TOPO)!, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label", "data-popup-open"] });
}
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
