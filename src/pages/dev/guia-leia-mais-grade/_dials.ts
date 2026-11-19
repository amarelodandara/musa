// Painel DialKit do playground /dev/guia-leia-mais-grade (desenvolvimento): o "Leia mais" da entrada do Guia
// (src/pages/guia/index.astro), em duas colunas com os cartões da página. As cores dos cartões (fundo e borda, parado e
// com o mouse) são as de /dev/guia-cartoes; aqui fica o que é só do Leia mais.
// grade: espaço entre os cartões e respiro dentro deles. icone: tamanho, espaço até o texto e cor.
// titulo / autoria / link: tamanho, peso e cor.
// Tudo vira variável CSS (--leia-*) no .guia-entrada.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const TAMANHOS: Record<string, string> = Object.fromEntries(["2xs", "xs", "sm", "md", "lg", "xl"].map((t) => [`text-${t}`, `var(--tamanho-${t})`]));
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };

// valores de partida: os de src/pages/guia/index.astro hoje
const config: Record<string, any> = {
  grade: {
    _collapsed: false,
    espacoEntreCartoes: [16, 0, 40, 1],
    respiro: [24, 8, 40, 1]
  },
  icone: {
    _collapsed: false,
    tamanho: [2.6, 1.5, 8, 0.1],
    espacoAteOTexto: [11, 4, 48, 1],
    cor: select(cores("text"), "text-neutro-600")
  },
  titulo: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-md"),
    peso: select(Object.keys(PESOS), "font-medium"),
    cor: select(cores("text"), "text-texto-900")
  },
  autoria: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cor: select(cores("text"), "text-texto-600")
  },
  link: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cor: select(cores("text"), "text-neutro-800")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Guia: leia mais", config, { id: "musa-guia-leia-mais-grade", persist: true } as any);

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const p = quadro.contentDocument?.querySelector<HTMLElement>(".guia-entrada");
  if (!p) return;
  const { grade: G, icone: I, titulo: T, autoria: A, link: L } = v;
  const vars: Record<string, string> = {
    "--leia-gap": `${G.espacoEntreCartoes}px`, "--leia-respiro": `${G.respiro}px`,
    "--leia-icone": `${I.tamanho}em`, "--leia-icone-gap": `${I.espacoAteOTexto}px`, "--leia-icone-cor": cor(I.cor),
    "--leia-titulo": TAMANHOS[T.tamanho], "--leia-titulo-peso": PESOS[T.peso], "--leia-titulo-cor": cor(T.cor),
    "--leia-autoria": TAMANHOS[A.tamanho], "--leia-autoria-cor": cor(A.cor),
    "--leia-link": TAMANHOS[L.tamanho], "--leia-link-cor": cor(L.cor)
  };
  Object.entries(vars).forEach(([k, x]) => p.style.setProperty(k, x));
  // este playground mostra os cartões: tira a lista que a página usa hoje
  delete p.dataset.leiaLayout;
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".guia-entrada")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
