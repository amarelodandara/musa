// Painel DialKit do playground /dev/guia-glossario-lista (desenvolvimento): o visual da lista de termos nos cartões do
// glossário da entrada do Guia (src/pages/guia/index.astro).
// recuoDoIcone: o ícone dos cartões do glossário puxado para a esquerda (px negativos) até o traço começar na linha do texto.
// titulo: o nome do grupo no cartão (tamanho, peso, cor parado e com o mouse), à parte dos cartões de partida.
// arrumacao: linha corrida (os termos seguidos, quebrando a linha), lista (um embaixo do outro) ou chips (cada termo num botão).
// texto: tamanho, peso, cor parado e com o mouse. espacos: entre termos (ao lado e entre linhas) e acima da lista.
// separador: o sinal entre os termos na linha corrida. chips: fundo parado e com o mouse, cantos e respiro.
// Tudo vira variável CSS (--cartao-termos*, --termos-*) no .guia-entrada.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".palco iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "6px", "rounded-lg": "0.5rem", "rounded-full": "999px" };
const TAMANHOS: Record<string, string> = Object.fromEntries(["2xs", "xs", "sm", "md", "lg", "xl", "2xl"].map((t) => [`text-${t}`, `var(--tamanho-${t})`]));
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };
const SEPARADORES: Record<string, string> = { nenhum: "none", "ponto ·": '"·"', "barra /": '"/"', "traço –": '"–"', "vírgula ,": '","' };

// valores de partida: os de src/pages/guia/index.astro hoje
const config: Record<string, any> = {
  // o ícone puxado para a esquerda (negativo) até o traço encostar na linha do texto
  recuoDoIcone: [-4, -12, 4, 0.5],
  titulo: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-lg"),
    peso: select(Object.keys(PESOS), "font-semibold"),
    cor: select(cores("text"), "text-texto-900"),
    corComMouse: select(cores("text"), "text-texto-900")
  },
  // a lista de termos
  arrumacao: select(["linha corrida", "lista", "chips"], "linha corrida"),
  texto: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    peso: select(Object.keys(PESOS), "font-normal"),
    cor: select(cores("text"), "text-carmim-800"),
    corComMouse: select(cores("text"), "text-carmim-800")
  },
  espacos: {
    _collapsed: false,
    entreTermos: [14, 0, 32, 1],
    entreLinhas: [4, 0, 20, 1],
    acimaDaLista: [8, 0, 32, 1]
  },
  separador: select(Object.keys(SEPARADORES), "nenhum"),
  chips: {
    _collapsed: true,
    fundo: select(cores("bg"), "bg-neutro-50"),
    fundoComMouse: select(cores("bg"), "bg-coral-100"),
    cantos: select(Object.keys(CANTOS), "rounded-full"),
    respiroHorizontal: [8, 0, 20, 1],
    respiroVertical: [2, 0, 12, 1]
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Guia: lista do glossário", config, { id: "musa-guia-glossario-lista", persist: true } as any);

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const pagina = quadro.contentDocument?.querySelector<HTMLElement>(".guia-entrada");
  if (!pagina) return;
  const { titulo: N, texto: T, espacos: E, chips: C } = v;
  const vars: Record<string, string> = {
    "--grupo-icone-recuo": `${v.recuoDoIcone}px`,
    "--grupo-titulo": TAMANHOS[N.tamanho], "--grupo-titulo-peso": PESOS[N.peso], "--grupo-titulo-cor": cor(N.cor), "--grupo-titulo-hover-cor": cor(N.corComMouse),
    "--cartao-termos": TAMANHOS[T.tamanho], "--termos-peso": PESOS[T.peso], "--cartao-termos-cor": cor(T.cor), "--termos-hover-cor": cor(T.corComMouse),
    "--termos-gap-x": `${E.entreTermos}px`, "--termos-gap-y": `${E.entreLinhas}px`, "--termos-acima": `${E.acimaDaLista}px`,
    "--termos-separador": SEPARADORES[v.separador],
    "--termos-chip-fundo": cor(C.fundo), "--termos-chip-hover-fundo": cor(C.fundoComMouse), "--termos-chip-raio": CANTOS[C.cantos],
    "--termos-chip-px": `${C.respiroHorizontal}px`, "--termos-chip-py": `${C.respiroVertical}px`
  };
  Object.entries(vars).forEach(([k, x]) => pagina.style.setProperty(k, x));
  if (v.arrumacao === "linha corrida") pagina.removeAttribute("data-termos");
  else pagina.setAttribute("data-termos", v.arrumacao === "lista" ? "lista" : "chips");
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".guia-entrada")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
