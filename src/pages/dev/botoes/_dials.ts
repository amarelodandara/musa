// Painel DialKit dos botões (.botao e .botao.secundario), só na bancada /dev/botoes (desenvolvimento).
// Cada opção é uma classe do Tailwind, escrita por extenso para o Tailwind gerar todas. As classes vencem o .botao
// de estilo.css porque ele fica na camada "base".
// Os botões de verdade (cabeçalho, abertura, chamada final, Baixar) ganham as classes com hover:, active:, focus-visible:.
// As cópias da grade de estados ([data-forcar]) ganham as mesmas classes sem o prefixo, para o estado ficar parado à vista.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
// Todas as cores do tema (src/styles/tailwind.css), em toda escolha de cor.
const FUNDO: Opcao[] = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const TEXTO: Opcao[] = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const BORDA: Opcao[] = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];
const FUNDO_PASSAR: Opcao[] = ["hover:bg-transparente", "hover:bg-coral-50", "hover:bg-coral-100", "hover:bg-coral-200", "hover:bg-coral-300", "hover:bg-coral-400", "hover:bg-coral-500", "hover:bg-coral-600", "hover:bg-coral-700", "hover:bg-coral-800", "hover:bg-coral-900", "hover:bg-carmim-100", "hover:bg-carmim-200", "hover:bg-carmim-300", "hover:bg-carmim-400", "hover:bg-carmim-500", "hover:bg-carmim-600", "hover:bg-carmim-700", "hover:bg-carmim-800", "hover:bg-carmim-900", "hover:bg-carmim-950", "hover:bg-neutro-50", "hover:bg-neutro-100", "hover:bg-neutro-200", "hover:bg-neutro-300", "hover:bg-neutro-400", "hover:bg-neutro-500", "hover:bg-neutro-600", "hover:bg-neutro-700", "hover:bg-neutro-800", "hover:bg-neutro-900", "hover:bg-neutro-950", "hover:bg-texto-950", "hover:bg-texto-900", "hover:bg-texto-700", "hover:bg-texto-600", "hover:bg-texto-400", "hover:bg-texto-50"];
const TEXTO_PASSAR: Opcao[] = ["hover:text-transparente", "hover:text-coral-50", "hover:text-coral-100", "hover:text-coral-200", "hover:text-coral-300", "hover:text-coral-400", "hover:text-coral-500", "hover:text-coral-600", "hover:text-coral-700", "hover:text-coral-800", "hover:text-coral-900", "hover:text-carmim-100", "hover:text-carmim-200", "hover:text-carmim-300", "hover:text-carmim-400", "hover:text-carmim-500", "hover:text-carmim-600", "hover:text-carmim-700", "hover:text-carmim-800", "hover:text-carmim-900", "hover:text-carmim-950", "hover:text-neutro-50", "hover:text-neutro-100", "hover:text-neutro-200", "hover:text-neutro-300", "hover:text-neutro-400", "hover:text-neutro-500", "hover:text-neutro-600", "hover:text-neutro-700", "hover:text-neutro-800", "hover:text-neutro-900", "hover:text-neutro-950", "hover:text-texto-950", "hover:text-texto-900", "hover:text-texto-700", "hover:text-texto-600", "hover:text-texto-400", "hover:text-texto-50"];
const BORDA_PASSAR: Opcao[] = ["hover:border-transparente", "hover:border-coral-50", "hover:border-coral-100", "hover:border-coral-200", "hover:border-coral-300", "hover:border-coral-400", "hover:border-coral-500", "hover:border-coral-600", "hover:border-coral-700", "hover:border-coral-800", "hover:border-coral-900", "hover:border-carmim-100", "hover:border-carmim-200", "hover:border-carmim-300", "hover:border-carmim-400", "hover:border-carmim-500", "hover:border-carmim-600", "hover:border-carmim-700", "hover:border-carmim-800", "hover:border-carmim-900", "hover:border-carmim-950", "hover:border-neutro-50", "hover:border-neutro-100", "hover:border-neutro-200", "hover:border-neutro-300", "hover:border-neutro-400", "hover:border-neutro-500", "hover:border-neutro-600", "hover:border-neutro-700", "hover:border-neutro-800", "hover:border-neutro-900", "hover:border-neutro-950", "hover:border-texto-950", "hover:border-texto-900", "hover:border-texto-700", "hover:border-texto-600", "hover:border-texto-400", "hover:border-texto-50"];
const CONTORNO_FOCO: Opcao[] = ["focus-visible:outline-transparente", "focus-visible:outline-coral-50", "focus-visible:outline-coral-100", "focus-visible:outline-coral-200", "focus-visible:outline-coral-300", "focus-visible:outline-coral-400", "focus-visible:outline-coral-500", "focus-visible:outline-coral-600", "focus-visible:outline-coral-700", "focus-visible:outline-coral-800", "focus-visible:outline-coral-900", "focus-visible:outline-carmim-100", "focus-visible:outline-carmim-200", "focus-visible:outline-carmim-300", "focus-visible:outline-carmim-400", "focus-visible:outline-carmim-500", "focus-visible:outline-carmim-600", "focus-visible:outline-carmim-700", "focus-visible:outline-carmim-800", "focus-visible:outline-carmim-900", "focus-visible:outline-carmim-950", "focus-visible:outline-neutro-50", "focus-visible:outline-neutro-100", "focus-visible:outline-neutro-200", "focus-visible:outline-neutro-300", "focus-visible:outline-neutro-400", "focus-visible:outline-neutro-500", "focus-visible:outline-neutro-600", "focus-visible:outline-neutro-700", "focus-visible:outline-neutro-800", "focus-visible:outline-neutro-900", "focus-visible:outline-neutro-950", "focus-visible:outline-texto-950", "focus-visible:outline-texto-900", "focus-visible:outline-texto-700", "focus-visible:outline-texto-600", "focus-visible:outline-texto-400", "focus-visible:outline-texto-50"];
// Sem prefixo, para as cópias com foco forçado: outline-transparente outline-coral-100 outline-coral-200 outline-coral-300 outline-coral-400 outline-coral-500 outline-coral-600 outline-coral-700 outline-coral-800 outline-coral-900 outline-carmim-100 outline-carmim-200 outline-carmim-300 outline-carmim-400 outline-carmim-500 outline-carmim-600 outline-carmim-700 outline-carmim-800 outline-carmim-900 outline-carmim-950 outline-neutro-50 outline-neutro-100 outline-neutro-200 outline-neutro-300 outline-neutro-400 outline-neutro-500 outline-neutro-600 outline-neutro-700 outline-neutro-800 outline-neutro-900 outline-neutro-950 outline-texto-950 outline-texto-900 outline-texto-700 outline-texto-600 outline-texto-400 outline-texto-50 scale-100 scale-98 scale-97 scale-96 scale-95 outline-0 outline-1 outline-2 outline-3 outline-4 outline-offset-0 outline-offset-1 outline-offset-2 outline-offset-3 outline-offset-4

const PRINCIPAL = ".botao:not(.secundario)";
const SECUNDARIO = ".botao.secundario";
const GRANDE = ".botao:not(.botao-pequeno)";
const PEQUENO = ".botao.botao-pequeno";
const TODOS = ".botao";
// a camada invertida do cabeçalho (sobre o rodapé carmim) tem cores próprias e fica de fora
const FORA = ".nav-invertida .botao";

interface Controle { sel: string; opcoes: Opcao[] }
const c = (sel: string, opcoes: Opcao[]): Controle => ({ sel, opcoes });

const CONTROLES: Record<string, Record<string, Controle>> = {
  forma: {
    cantos: c(TODOS, ["rounded-none", "rounded-xs", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-full"]),
    borda: c(TODOS, ["border-0", "border", "border-2"]),
    fonte: c(TODOS, ["font-inter", "font-inter-tight", "font-dm-sans"]),
    peso: c(TODOS, ["font-normal", "font-medium", "font-semibold", "font-bold"]),
    espacoEntreLetras: c(TODOS, ["tracking-tight", "tracking-normal", "tracking-wide"]),
    sombra: c(TODOS, ["shadow-none", "shadow-xs", "shadow-sm", "shadow-md"])
  },
  grande: {
    tamanhoDoTexto: c(GRANDE, ["text-sm", "text-md", "text-lg"]),
    altura: c(GRANDE, ["h-9", "h-10", "h-11", "h-12", "h-13", "h-14"]),
    respiroLateral: c(GRANDE, ["px-3", "px-3.5", "px-4", "px-4.5", "px-5", "px-6", "px-7", "px-8"])
  },
  pequeno: {
    tamanhoDoTexto: c(PEQUENO, ["text-xs", "text-sm", "text-md"]),
    altura: c(PEQUENO, ["h-7", "h-8", "h-9", "h-10"]),
    respiroLateral: c(PEQUENO, ["px-2", "px-2.5", "px-3", "px-3.5", "px-4"])
  },
  principal: {
    fundo: c(PRINCIPAL, FUNDO),
    texto: c(PRINCIPAL, TEXTO),
    borda: c(PRINCIPAL, BORDA),
    fundoAoPassar: c(PRINCIPAL, FUNDO_PASSAR),
    textoAoPassar: c(PRINCIPAL, TEXTO_PASSAR),
    bordaAoPassar: c(PRINCIPAL, BORDA_PASSAR)
  },
  secundario: {
    fundo: c(SECUNDARIO, FUNDO),
    texto: c(SECUNDARIO, TEXTO),
    borda: c(SECUNDARIO, BORDA),
    fundoAoPassar: c(SECUNDARIO, FUNDO_PASSAR),
    textoAoPassar: c(SECUNDARIO, TEXTO_PASSAR),
    bordaAoPassar: c(SECUNDARIO, BORDA_PASSAR)
  },
  movimento: {
    aoPressionar: c(TODOS, ["active:scale-100", "active:scale-98", "active:scale-97", "active:scale-96", "active:scale-95"]),
    duracao: c(TODOS, ["duration-100", "duration-150", "duration-200", "duration-300"])
  },
  foco: {
    cor: c(TODOS, CONTORNO_FOCO),
    espessura: c(TODOS, ["focus-visible:outline-1", "focus-visible:outline-2", "focus-visible:outline-3", "focus-visible:outline-4"]),
    distancia: c(TODOS, ["focus-visible:outline-offset-0", "focus-visible:outline-offset-1", "focus-visible:outline-offset-2", "focus-visible:outline-offset-3", "focus-visible:outline-offset-4"])
  }
};

// o que o código usa hoje (estilo.css e :focus-visible global), para o painel começar igual ao site
const PADRAO: Record<string, Record<string, string>> = {
  forma: { cantos: "rounded-sm", borda: "border-2", fonte: "font-inter", peso: "font-semibold", espacoEntreLetras: "tracking-normal", sombra: "shadow-none" },
  grande: { tamanhoDoTexto: "text-md", altura: "h-12", respiroLateral: "px-4.5" },
  pequeno: { tamanhoDoTexto: "text-sm", altura: "h-9", respiroLateral: "px-3" },
  principal: { fundo: "bg-coral-400", texto: "text-texto-950", borda: "border-coral-400", fundoAoPassar: "hover:bg-coral-500", textoAoPassar: "hover:text-texto-950", bordaAoPassar: "hover:border-coral-500" },
  secundario: { fundo: "bg-neutro-50", texto: "text-texto-900", borda: "border-neutro-600", fundoAoPassar: "hover:bg-neutro-100", textoAoPassar: "hover:text-texto-900", bordaAoPassar: "hover:border-neutro-800" },
  movimento: { aoPressionar: "active:scale-97", duracao: "duration-150" },
  foco: { cor: "focus-visible:outline-carmim-700", espessura: "focus-visible:outline-3", distancia: "focus-visible:outline-offset-2" }
};

const valor = (o: Opcao) => (Array.isArray(o) ? o[1] : o);
const tokens = (t: string) => t.split(/\s+/).filter(Boolean);

const config: Record<string, any> = {};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: !"principal".includes(grupo) };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    config[grupo][nome] = {
      type: "select",
      options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)),
      default: PADRAO[grupo][nome]
    };
  }
}

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Botões (antiga, ver /dev/botoes-bento)", config, { id: "musa-botoes-v3", persist: true });

// a cópia forçada fica no estado sem precisar do mouse ou do teclado:
//   passar: hover: vira classe comum; pressionado: hover: e active: viram comuns; foco: focus-visible: vira comum
const PREFIXOS: Record<string, string[]> = { passar: ["hover:"], pressionado: "active:", foco: ["focus-visible:"] };
function paraCopia(t: string, forcar: string | undefined) {
  if (!forcar) return t;
  for (const p of PREFIXOS[forcar] ?? []) if (t.startsWith(p)) return t.slice(p.length);
  return t;
}
// classes fixas: sem elas o .botao de estilo.css não deixaria a forma mudar direito
// (transform do :active somaria com o scale; inline-block não centraliza na altura)
// bg-none e before:hidden: o .botao do site ganhou degradês e anel (21/11/2026); aqui eles saem para as classes do painel valerem
const FIXAS = ["bg-none", "before:hidden", "inline-flex", "items-center", "justify-center", "leading-none", "transition", "ease-forte", "active:transform-none", "focus-visible:outline-solid"];
const FIXAS_FOCO = ["outline-solid"];

function aplicar(v: Record<string, any>) {
  const todos = [...document.querySelectorAll<HTMLElement>(TODOS)].filter((el) => !el.matches(FORA));
  // limpa: tira toda classe que algum controle pode pôr (com e sem prefixo) e põe as fixas
  const possiveis = new Set<string>();
  for (const ctrls of Object.values(CONTROLES)) for (const ctrl of Object.values(ctrls)) for (const o of ctrl.opcoes) for (const t of tokens(valor(o))) {
    possiveis.add(t); for (const ps of Object.values(PREFIXOS)) for (const p of ps) if (t.startsWith(p)) possiveis.add(t.slice(p.length));
  }
  todos.forEach((el) => {
    possiveis.forEach((t) => el.classList.remove(t));
    el.classList.add(...FIXAS);
    if (el.dataset.forcar === "foco") el.classList.add(...FIXAS_FOCO);
  });
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      todos.filter((el) => el.matches(ctrl.sel)).forEach((el) => {
        // na cópia com o mouse em cima, a cor "ao passar" toma o lugar da cor parada (as duas juntas: vence a ordem do CSS)
        const comMouse = el.dataset.forcar === "passar" || el.dataset.forcar === "pressionado";
        if (comMouse && ctrls[nome + "AoPassar"]) return;
        tokens(escolha).forEach((t) => el.classList.add(paraCopia(t, el.dataset.forcar)));
      });
    }
  }
}
aplicar(kit.getValues() as Record<string, any>);
kit.subscribe((novo: Record<string, any>) => aplicar(novo));
