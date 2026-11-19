// Painel DialKit do playground /dev/guia-cartoes (desenvolvimento): os cartões das grades da entrada do Guia.
// grade: largura de cada cartão, espaço entre eles e a proporção (1 = quadrado; o cartão cresce se o texto não couber).
// cartao: respiro e cantos. parado / comMouse: fundo e borda em degradê (cor em cima e embaixo); o estado "Mouse em cima" mostra todos assim.
// icone / titulo / texto: tamanho e cor de cada parte; termos = os links dos termos nos cartões do glossário.
// Tudo vira variável CSS (--cartao-*) no .guia-entrada (src/pages/guia/index.astro).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "0.375rem", "rounded-lg": "0.5rem", "rounded-xl": "0.75rem", "rounded-2xl": "1rem" };
const TAMANHOS: Record<string, string> = { "text-2xs": "var(--tamanho-2xs)", "text-xs": "var(--tamanho-xs)", "text-sm": "var(--tamanho-sm)", "text-md": "var(--tamanho-md)", "text-lg": "var(--tamanho-lg)", "text-xl": "var(--tamanho-xl)", "text-2xl": "var(--tamanho-2xl)" };
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };

// valores de partida: os de src/pages/guia/index.astro hoje
const config: Record<string, any> = {
  grade: {
    _collapsed: false,
    largura: [300, 160, 360, 2],
    espacoEntreCartoes: [24, 0, 40, 1],
    proporcao: [1, 0.6, 1.4, 0.02]
  },
  cartao: {
    _collapsed: false,
    respiro: [20, 8, 40, 1],
    espacoEntreTextos: [6, 0, 20, 1],
    cantos: select(Object.keys(CANTOS), "rounded-sm"),
  },
  // fundo e borda em degradê de cima para baixo
  parado: {
    _collapsed: false,
    fundoEmCima: select(cores("bg"), "bg-neutro-100"),
    fundoEmbaixo: select(cores("bg"), "bg-neutro-100"),
    bordaEmCima: select(cores("border"), "border-coral-100"),
    bordaEmbaixo: select(cores("border"), "border-neutro-50")
  },
  comMouse: {
    _collapsed: false,
    fundoEmCima: select(cores("bg"), "bg-coral-100"),
    fundoEmbaixo: select(cores("bg"), "bg-coral-100"),
    bordaEmCima: select(cores("border"), "border-coral-200"),
    bordaEmbaixo: select(cores("border"), "border-neutro-50")
  },
  icone: {
    _collapsed: false,
    tamanho: [2.5, 1, 3, 0.05],
    cor: select(cores("text"), "text-carmim-700")
  },
  titulo: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-lg"),
    peso: select(Object.keys(PESOS), "font-semibold"),
    cor: select(cores("text"), "text-texto-900")
  },
  texto: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-md"),
    cor: select(cores("text"), "text-texto-700")
  },
  termos: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cor: select(cores("text"), "text-texto-700")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Guia: cartões", config, { id: "musa-guia-cartoes", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const pagina = quadro.contentDocument?.querySelector<HTMLElement>(".guia-entrada");
  if (!pagina) return;
  const { grade: G, cartao: C, parado: P, comMouse: M, icone: I, titulo: T, texto: X, termos: R } = v;
  const vars: Record<string, string> = {
    "--cartao-largura": `${G.largura}px`, "--cartao-gap": `${G.espacoEntreCartoes}px`, "--cartao-proporcao": String(G.proporcao),
    "--cartao-respiro": `${C.respiro}px`, "--cartao-espaco": `${C.espacoEntreTextos}px`, "--cartao-raio": CANTOS[C.cantos],
    "--cartao-fundo-topo": cor(P.fundoEmCima), "--cartao-fundo-pe": cor(P.fundoEmbaixo), "--cartao-borda-topo": cor(P.bordaEmCima), "--cartao-borda-pe": cor(P.bordaEmbaixo),
    "--cartao-hover-fundo-topo": cor(M.fundoEmCima), "--cartao-hover-fundo-pe": cor(M.fundoEmbaixo), "--cartao-hover-borda-topo": cor(M.bordaEmCima), "--cartao-hover-borda-pe": cor(M.bordaEmbaixo),
    "--cartao-icone": `${I.tamanho}em`, "--cartao-icone-cor": cor(I.cor),
    "--cartao-titulo": TAMANHOS[T.tamanho], "--cartao-titulo-peso": PESOS[T.peso], "--cartao-titulo-cor": cor(T.cor),
    "--cartao-texto": TAMANHOS[X.tamanho], "--cartao-texto-cor": cor(X.cor),
    "--cartao-termos": TAMANHOS[R.tamanho], "--cartao-termos-cor": cor(R.cor)
  };
  Object.entries(vars).forEach(([k, x]) => pagina.style.setProperty(k, x));
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".guia-entrada")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
