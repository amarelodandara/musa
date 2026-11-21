// Painel DialKit do menu de filtro, só na bancada /dev/estados-menu-filtro (desenvolvimento).
// Cada opção é uma classe do Tailwind, escrita por extenso para o Tailwind gerar todas. O painel acha as partes do menu
// pelas classes filtro-* do ControlesMapa e reaplica a escolha sempre que o React redesenha o menu.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const PESOS = ["font-normal", "font-medium", "font-semibold", "font-bold"];
const TEXTO_COR = ["text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600"];
const INDICADOR_COR = ["text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-texto-950", "text-texto-900", "text-texto-700"];
const CIRCULO_COR = ["bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-neutro-500"];
const FUNDO_DESTAQUE = ["data-highlighted:bg-neutro-100", "data-highlighted:bg-neutro-200", "data-highlighted:bg-neutro-300", "data-highlighted:bg-coral-50", "data-highlighted:bg-coral-100", "data-highlighted:bg-coral-200", "data-highlighted:bg-carmim-100"];
const BORDA = [...["border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500"], ["Sem borda", "border-transparente"]];

// caminho -> [seletor, opções]; opção: "classe(s)" ou [rótulo, "classe(s)"]
const CLASSES = {
  painel: {
    largura: [".filtro-popup", ["w-56", "w-60", "w-64", "w-72", "w-80"]],
    cantos: [".filtro-popup", ["rounded-none", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"]],
    borda: [".filtro-popup", BORDA],
    sombra: [".filtro-popup", ["shadow-none", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"]],
    fundo: [".filtro-popup", ["bg-neutro-50", "bg-neutro-100", "bg-neutro-200"]],
    respiroVertical: [".filtro-popup", ["py-0", "py-0.5", "py-1", "py-1.5", "py-2"]]
  },
  titulos: {
    tamanho: [".filtro-rotulo", ["text-2xs", "text-xs", "text-sm"]],
    peso: [".filtro-rotulo", PESOS],
    cor: [".filtro-rotulo", TEXTO_COR],
    caixa: [".filtro-rotulo", [["Maiúsculas", "uppercase"], ["Normal", "normal-case"]]],
    espacamentoDeLetras: [".filtro-rotulo", ["tracking-normal", "tracking-wide", "tracking-wider", "tracking-widest"]],
    respiroEmCima: [".filtro-rotulo", ["pt-1", "pt-1.5", "pt-2", "pt-2.5", "pt-3"]],
    respiroEmbaixo: [".filtro-rotulo", ["pb-0.5", "pb-1", "pb-1.5", "pb-2"]],
    recuo: [".filtro-rotulo", ["px-2", "px-2.5", "px-3", "px-4"]]
  },
  itens: {
    tamanho: [".filtro-item", ["text-xs", "text-sm", "text-md"]],
    peso: [".filtro-item:not(.filtro-todas)", ["font-normal", "font-medium"]],
    pesoDoTodas: [".filtro-todas", PESOS],
    cor: [".filtro-item", TEXTO_COR],
    altura: [".filtro-item", ["py-1", "py-1.5", "py-2", "py-2.5"]],
    recuoEsquerda: [".filtro-item", ["pl-2", "pl-2.5", "pl-3", "pl-4"]],
    recuoDireita: [".filtro-item", ["pr-2", "pr-3", "pr-4"]],
    espacoMarcaTexto: [".filtro-item", ["gap-1.5", "gap-2", "gap-2.5", "gap-3", "gap-4"]],
    destaque: [".filtro-item", FUNDO_DESTAQUE],
    formaDoDestaque: [".filtro-item", [["Encostado", "mx-0 rounded-none"], ["Com margem", "mx-1 rounded"], ["Com margem, mais redondo", "mx-1.5 rounded-md"]]]
  },
  marcas: {
    corDoCheck: [".filtro-indicador", INDICADOR_COR],
    tamanhoDoCirculo: [".filtro-circulo", ["size-0.5", "size-1", "size-1.5", "size-2"]],
    corDoCirculo: [".filtro-circulo", CIRCULO_COR]
  },
  separadores: {
    cor: [".filtro-separador", ["bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500"]],
    margem: [".filtro-separador", ["my-0", "my-0.5", "my-1", "my-1.5", "my-2"]]
  },
  limpar: {
    alinhamento: [".filtro-limpar", [["Centro", "justify-center"], ["Esquerda", "justify-start pl-2"]]],
    peso: [".filtro-limpar", PESOS],
    cor: [".filtro-limpar", TEXTO_COR],
    corDesligado: [".filtro-limpar", ["data-disabled:text-texto-400", "data-disabled:text-neutro-400", "data-disabled:text-neutro-500"]],
    destaque: [".filtro-limpar", FUNDO_DESTAQUE]
  }
};

const valor = (o) => (Array.isArray(o) ? o[1] : o);
const tokens = (s) => s.split(/\s+/).filter(Boolean);
const padrao = (sel, opts) => {
  const el = document.querySelector(sel);
  const atual = el ? [...el.classList] : [];
  const achou = opts.find((o) => tokens(valor(o)).every((t) => atual.includes(t)));
  return valor(achou || opts[0]);
};

// espera o menu aparecer (a bancada abre o menu sozinha) para ler os valores do código como padrão
const esperar = () => new Promise((ok) => {
  const t = setInterval(() => { if (document.querySelector(".filtro-popup .filtro-check, .filtro-popup .filtro-circulo")) { clearInterval(t); ok(); } }, 100);
});
await esperar();

const config = {};
for (const [grupo, ctrls] of Object.entries(CLASSES)) {
  config[grupo] = { _collapsed: grupo !== "itens" };
  for (const [nome, [sel, opts]] of Object.entries(ctrls)) {
    config[grupo][nome] = { type: "select", options: opts.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)), default: padrao(sel, opts) };
  }
}
// números: o check é um svg do Iconoir, tamanho e traço vão em atributos
config.marcas.tamanhoDoCheckPx = [14, 10, 18, 1];
config.marcas.espessuraDoCheck = [2, 1, 2.75, 0.25];

createDialRoot({ position: "top-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Menu de filtro", config, { id: "musa-menu-filtro-v2", persist: true });

let v = kit.getValues();
const aplicar = () => {
  for (const [grupo, ctrls] of Object.entries(CLASSES)) {
    for (const [nome, [sel, opts]] of Object.entries(ctrls)) {
      const todas = new Set(opts.flatMap((o) => tokens(valor(o))));
      const escolha = tokens(v[grupo][nome]);
      document.querySelectorAll(sel).forEach((el) => {
        todas.forEach((t) => el.classList.remove(t));
        escolha.forEach((t) => el.classList.add(t));
      });
    }
  }
  document.querySelectorAll(".filtro-check").forEach((svg) => {
    svg.setAttribute("width", v.marcas.tamanhoDoCheckPx);
    svg.setAttribute("height", v.marcas.tamanhoDoCheckPx);
    svg.setAttribute("stroke-width", v.marcas.espessuraDoCheck);
  });
};
kit.subscribe((novo) => { v = novo; aplicar(); });
// o React recria partes do menu (troca de estado, check ↔ círculo): reaplicar a cada mudança
let pedido = 0;
new MutationObserver(() => { if (!pedido) pedido = requestAnimationFrame(() => { pedido = 0; aplicar(); }); })
  .observe(document.body, { childList: true, subtree: true });
