// Painel DialKit do playground /dev/guia-leia-mais-lista (desenvolvimento): o "Leia mais" em lista
// (src/pages/guia/index.astro, data-leia-layout="lista" no .guia-entrada).
// arrumacao: autoria embaixo do título ou na mesma linha; o tipo como ícone e nome, só o nome ou só o ícone.
// linhas: respiro em cima e embaixo, espaço entre as colunas, divisor (cor e espessura), fundo com o mouse.
// titulo / autoria: tamanho, peso, cor (e a do título com o mouse). tipo: tamanho, cor, largura da coluna do nome,
//   ícone (tamanho, traço, cor). seta: cor.
// Tudo vira variável CSS (--lista-*) e atributo (data-lista-*) no .guia-entrada.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const TAMANHOS: Record<string, string> = Object.fromEntries(["2xs", "xs", "sm", "md", "lg", "xl"].map((t) => [`text-${t}`, `var(--tamanho-${t})`]));
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };

// valores de partida: os de src/pages/guia/index.astro hoje
const config: Record<string, any> = {
  arrumacao: {
    _collapsed: false,
    autoria: select(["embaixo do título", "na mesma linha"], "na mesma linha"),
    tipo: select(["ícone e nome", "só o nome", "só o ícone"], "só o nome")
  },
  linhas: {
    _collapsed: false,
    respiro: [12, 4, 40, 1],
    espacoEntreColunas: [8, 0, 64, 1],
    divisor: select(cores("border"), "border-coral-100"),
    espessuraDoDivisor: [1, 0, 4, 0.5],
    fundoComMouse: select(cores("bg"), "bg-transparente")
  },
  titulo: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-md"),
    peso: select(Object.keys(PESOS), "font-medium"),
    cor: select(cores("text"), "text-texto-900"),
    corComMouse: select(cores("text"), "text-carmim-700")
  },
  autoria: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cor: select(cores("text"), "text-texto-600"),
    corComMouse: select(cores("text"), "text-texto-400")
  },
  tipo: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cor: select(cores("text"), "text-texto-600"),
    larguraDoNome: [6.5, 3, 10, 0.25],
    iconeTamanho: [1.25, 0.75, 2.5, 0.05],
    iconeTraco: [1.6, 0.4, 2, 0.05],
    iconeCor: select(cores("text"), "text-neutro-600")
  },
  seta: {
    _collapsed: false,
    cor: select(cores("text"), "text-neutro-800")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Guia: leia mais em lista", config, { id: "musa-guia-leia-mais-lista", persist: true } as any);

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const p = quadro.contentDocument?.querySelector<HTMLElement>(".guia-entrada");
  if (!p) return;
  const { arrumacao: A, linhas: L, titulo: T, autoria: U, tipo: X, seta: S } = v;
  const vars: Record<string, string> = {
    "--lista-py": `${L.respiro}px`, "--lista-gap": `${L.espacoEntreColunas}px`, "--lista-divisor": cor(L.divisor), "--lista-divisor-espessura": `${L.espessuraDoDivisor}px`,
    "--lista-hover-fundo": cor(L.fundoComMouse),
    "--lista-titulo": TAMANHOS[T.tamanho], "--lista-titulo-peso": PESOS[T.peso], "--lista-titulo-cor": cor(T.cor), "--lista-hover-cor": cor(T.corComMouse),
    "--lista-autoria": TAMANHOS[U.tamanho], "--lista-autoria-cor": cor(U.cor), "--lista-autoria-hover-cor": cor(U.corComMouse),
    "--lista-tipo": TAMANHOS[X.tamanho], "--lista-tipo-cor": cor(X.cor), "--lista-tipo-largura": `${X.larguraDoNome}em`,
    "--lista-icone": `${X.iconeTamanho}em`, "--lista-icone-traco": String(X.iconeTraco), "--lista-icone-cor": cor(X.iconeCor),
    "--lista-seta-cor": cor(S.cor)
  };
  Object.entries(vars).forEach(([k, x]) => p.style.setProperty(k, x));
  // esta direção: a lista no lugar da grade de cartões
  p.dataset.leiaLayout = "lista";
  if (A.autoria === "na mesma linha") p.dataset.listaAutoria = "linha"; else delete p.dataset.listaAutoria;
  const tipo = A.tipo === "só o nome" ? "nome" : A.tipo === "só o ícone" ? "icone" : "";
  if (tipo) p.dataset.listaTipo = tipo; else delete p.dataset.listaTipo;
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".guia-entrada")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
