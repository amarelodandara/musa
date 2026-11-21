// Painel DialKit do experimento /dev/bento-desafio-cartoes (desenvolvimento): o rolo de cartões de pensamento no bloco 2.
// cartão: a aparência do cartão de pensamento, que é uma só para o mapa e o bento (.cartao-pensamento, em estilo.css).
//   O que mudar aqui vale nos dois lugares quando for para o código; o estado "No mapa" mostra o mapa com os cartões abertos.
//   ritmo: de quanto em quanto tempo entra um cartão, quanto dura o movimento e com que curva.
//   arco: por onde os cartões anteriores descem (raio, ângulo e giro por posição, e para que lado).
//   profundidade: a cada posição para o fundo, quanto o cartão encolhe, desfoca e apaga.
// Tudo vira variável CSS (--rolo-*) no .rolo, e o intervalo vira data-intervalo (lido pelo script do bloco).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "0.375rem", "rounded-lg": "0.5rem", "rounded-xl": "0.75rem", "rounded-2xl": "1rem", "rounded-full": "999px" };
const SOMBRAS: Record<string, string> = { "shadow-none": "none", "shadow-xs": "0 1px 2px rgb(0 0 0 / 0.05)", "shadow-sm": "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "shadow-mapa": "0 4px 24px rgb(0 0 0 / 0.07)", "shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", "shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" };
const FONTES: Record<string, string> = { "font-inter-tight": "var(--fonte-inter-tight)", "font-inter": "var(--fonte-inter)", "font-dm-sans": "var(--fonte-dm-sans)" };
const TAMANHOS: Record<string, string> = { "text-2xs": "var(--tamanho-2xs)", "12px (o de hoje)": "12px", "text-xs": "var(--tamanho-xs)", "text-sm": "var(--tamanho-sm)", "text-md": "var(--tamanho-md)" };
const PESOS: Record<string, string> = { "font-light": "300", "font-normal": "400", "font-medium": "500", "font-semibold": "600" };

const CURVAS = [
  { value: "cubic-bezier(0.22, 1, 0.36, 1)", label: "Sai rápido, assenta devagar" },
  { value: "cubic-bezier(0.23, 1, 0.32, 1)", label: "Ease-out forte (o do mapa)" },
  { value: "cubic-bezier(0.77, 0, 0.175, 1)", label: "Ease-in-out forte" },
  { value: "cubic-bezier(0.65, 0, 0.35, 1)", label: "Ease-in-out suave" },
  { value: "ease-out", label: "Ease-out simples" }
];

// valores de partida: os que estão em Funcionalidades.astro hoje
const config: Record<string, any> = {
  ritmo: {
    _collapsed: false,
    intervalo: [2400, 500, 6000, 50],
    duracaoDoMovimento: [1100, 200, 3000, 20],
    curva: { type: "select", options: CURVAS, default: CURVAS[1].value }
  },
  // o arco: os cartões anteriores descem por um pedaço de círculo, para um lado
  arco: {
    _collapsed: false,
    raio: [150, 40, 500, 5],
    anguloPorPosicao: [14, 2, 40, 1],
    giroPorPosicao: [2, 0, 12, 0.5],
    lado: { type: "select", options: [{ value: "1", label: "Para a direita" }, { value: "-1", label: "Para a esquerda" }], default: "1" }
  },
  profundidade: {
    _collapsed: false,
    encolhePorPosicao: [0.115, 0, 0.2, 0.005],
    desfoquePorPosicao: [0.4, 0, 4, 0.1],
    apagaPorPosicao: [0.2, 0.05, 0.5, 0.01]
  },
  // largura dos cartões no bento (no mapa a largura acompanha o texto, até 240px)
  cartao: {
    _collapsed: false,
    largura: [240, 160, 340, 10],
    // o rolo maior que o cartão do mapa: zoom no cartão inteiro (texto, respiro e arco)
    tamanho: [1.3, 0.8, 2, 0.05]
  },
  // aparência do cartão: vale para o mapa e o bento
  aparencia: {
    _collapsed: false,
    fundo: select(cores("bg"), "bg-neutro-50"),
    borda: select(cores("border"), "border-neutro-100"),
    cantos: select(Object.keys(CANTOS), "rounded-xs"),
    sombra: select(Object.keys(SOMBRAS), "shadow-mapa"),
    respiroVertical: [8, 2, 20, 1],
    respiroHorizontal: [13, 2, 24, 1]
  },
  texto: {
    _collapsed: false,
    fonte: select(Object.keys(FONTES), "font-inter-tight"),
    tamanho: select(Object.keys(TAMANHOS), "12px (o de hoje)"),
    peso: select(Object.keys(PESOS), "font-normal"),
    italico: false,
    alturaDaLinha: [1.4, 1, 2, 0.05],
    cor: select(cores("text"), "text-texto-900")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: desafio em cartões", config, { id: "musa-bento-desafio-cartoes", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.documentElement) return;
  // a aparência do cartão vai para o :root (vale no bento e no mapa)
  const A = v.aparencia, T = v.texto;
  const cartao: Record<string, string> = {
    "--cartao-fundo": cor(A.fundo), "--cartao-borda": cor(A.borda), "--cartao-raio": CANTOS[A.cantos], "--cartao-sombra": SOMBRAS[A.sombra],
    "--cartao-respiro-y": `${A.respiroVertical}px`, "--cartao-respiro-x": `${A.respiroHorizontal}px`,
    "--cartao-fonte": FONTES[T.fonte], "--cartao-tamanho": TAMANHOS[T.tamanho], "--cartao-peso": PESOS[T.peso],
    "--cartao-estilo": T.italico ? "italic" : "normal", "--cartao-altura-linha": String(T.alturaDaLinha), "--cartao-cor": cor(T.cor)
  };
  Object.entries(cartao).forEach(([k, x]) => d.documentElement.style.setProperty(k, x));
  const rolo = d.querySelector<HTMLElement>(".func .b-desafio .rolo");
  if (!rolo) return;
  const { ritmo: R, profundidade: P, cartao: C, arco: X } = v;
  const vars: Record<string, string> = {
    "--rolo-ms": `${R.duracaoDoMovimento}ms`, "--rolo-curva": R.curva,
    "--rolo-raio": `${X.raio}px`, "--rolo-angulo": `${X.anguloPorPosicao}deg`, "--rolo-giro": `${X.giroPorPosicao}deg`, "--rolo-lado": X.lado,
    "--rolo-escala": String(P.encolhePorPosicao),
    "--rolo-desfoque": `${P.desfoquePorPosicao}px`, "--rolo-apagar": String(P.apagaPorPosicao)
  };
  Object.entries(vars).forEach(([k, x]) => rolo.style.setProperty(k, x));
  rolo.dataset.intervalo = String(R.intervalo);
  rolo.style.setProperty("--rolo-largura", `${C.largura}px`);
  rolo.style.setProperty("--rolo-zoom", String(C.tamanho));
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".func .b-desafio .rolo, .desafio-cartao")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
