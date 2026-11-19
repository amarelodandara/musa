// Painel DialKit do playground /dev/guia-glossario (desenvolvimento): a página do glossário (src/pages/guia/glossario.astro).
// pagina: largura da coluna de texto e tamanho do título.
// indice: os botões das seções embaixo do título (mostrar ou não, tamanho, cantos, cores parado e com o mouse).
// secoes: espaço antes de cada seção, tamanho e cor do título da seção, espaço até o primeiro termo.
// termos: arrumação (empilhado: termo em cima da explicação; lado a lado: termo numa coluna à esquerda), respiro, divisor,
//   o nome do termo (tamanho, peso, cor) e a explicação (tamanho, cor, espaço entre parágrafos); destaque = o termo aberto por link.
// Tudo vira variável CSS (--glo-*) no .glossario.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "6px", "rounded-lg": "0.5rem", "rounded-xl": "0.75rem", "rounded-full": "999px" };
const TAMANHOS: Record<string, string> = Object.fromEntries(["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"].map((t) => [`text-${t}`, `var(--tamanho-${t})`]));
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };

// valores de partida: os de src/pages/guia/glossario.astro hoje
const config: Record<string, any> = {
  pagina: {
    _collapsed: false,
    largura: [704, 480, 960, 8],
    tituloTamanho: select(Object.keys(TAMANHOS), "text-3xl")
  },
  indice: {
    _collapsed: false,
    mostrar: true,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cantos: select(Object.keys(CANTOS), "rounded-full"),
    cor: select(cores("text"), "text-texto-700"),
    fundo: select(cores("bg"), "bg-transparente"),
    borda: select(cores("border"), "border-neutro-300"),
    corComMouse: select(cores("text"), "text-texto-900"),
    bordaComMouse: select(cores("border"), "border-coral-400")
  },
  secoes: {
    _collapsed: false,
    espacoAntes: [0, 0, 120, 2],
    tamanho: select(Object.keys(TAMANHOS), "text-xl"),
    cor: select(cores("text"), "text-texto-950"),
    espacoAteOsTermos: [16, 0, 48, 1]
  },
  termos: {
    _collapsed: false,
    arrumacao: select(["empilhado", "lado a lado"], "empilhado"),
    colunaDoTermo: [200, 120, 320, 4],
    espacoEntreColunas: [24, 8, 64, 2],
    respiroVertical: [16, 0, 40, 1],
    divisor: select(cores("border"), "border-neutro-200"),
    espessuraDoDivisor: [1, 0, 4, 0.5],
    nomeTamanho: select(Object.keys(TAMANHOS), "text-md"),
    nomePeso: select(Object.keys(PESOS), "font-semibold"),
    nomeCor: select(cores("text"), "text-carmim-800"),
    espacoNomeTexto: [6, 0, 24, 1],
    textoTamanho: select(Object.keys(TAMANHOS), "text-md"),
    textoCor: select(cores("text"), "text-texto-700"),
    espacoEntreParagrafos: [8, 0, 24, 1],
    destaque: select(cores("bg"), "bg-coral-100")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Guia: glossário", config, { id: "musa-guia-glossario", persist: true } as any);

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const g = quadro.contentDocument?.querySelector<HTMLElement>(".glossario");
  if (!g) return;
  const { pagina: P, indice: I, secoes: S, termos: T } = v;
  const vars: Record<string, string> = {
    "--glo-largura": `${P.largura}px`, "--glo-titulo-tamanho": TAMANHOS[P.tituloTamanho],
    "--glo-indice-tamanho": TAMANHOS[I.tamanho], "--glo-indice-raio": CANTOS[I.cantos], "--glo-indice-cor": cor(I.cor), "--glo-indice-fundo": cor(I.fundo),
    "--glo-indice-borda": cor(I.borda), "--glo-indice-hover-cor": cor(I.corComMouse), "--glo-indice-hover-borda": cor(I.bordaComMouse),
    "--glo-secao-espaco": `${S.espacoAntes}px`, "--glo-secao-tamanho": TAMANHOS[S.tamanho], "--glo-secao-cor": cor(S.cor), "--glo-secao-ate-termos": `${S.espacoAteOsTermos}px`,
    "--glo-coluna-termo": `${T.colunaDoTermo}px`, "--glo-colunas-gap": `${T.espacoEntreColunas}px`,
    "--glo-termo-py": `${T.respiroVertical}px`, "--glo-divisor": cor(T.divisor), "--glo-divisor-espessura": `${T.espessuraDoDivisor}px`,
    "--glo-termo-tamanho": TAMANHOS[T.nomeTamanho], "--glo-termo-peso": PESOS[T.nomePeso], "--glo-termo-cor": cor(T.nomeCor), "--glo-termo-ate-texto": `${T.espacoNomeTexto}px`,
    "--glo-texto-tamanho": TAMANHOS[T.textoTamanho], "--glo-texto-cor": cor(T.textoCor), "--glo-entre-paragrafos": `${T.espacoEntreParagrafos}px`,
    "--glo-destaque": cor(T.destaque)
  };
  Object.entries(vars).forEach(([k, x]) => g.style.setProperty(k, x));
  g.toggleAttribute("data-sem-indice", !I.mostrar);
  g.toggleAttribute("data-lado-a-lado", T.arrumacao === "lado a lado");
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de página ou largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".glossario")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
