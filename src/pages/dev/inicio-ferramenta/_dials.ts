// Painel DialKit do playground /dev/inicio-ferramenta (desenvolvimento): a seção logo abaixo da abertura da página inicial.
//   secao: espaço em cima e embaixo (--secao-espaco), proporção e espaço entre as colunas, alinhamento vertical.
//   titulo / abertura: a ideia, na coluna da esquerda.
//   razoes: com a estrutura de uma Etapa do mapa (número em cima, título embaixo, linha, texto): empilhadas ou lado a
//     lado, espaço, linhas (cor, espessura, quanto esfumam nas pontas), recuo dos lados, espaço entre número e título e a hierarquia de
//     texto; e a nota da última.
// Tudo vira variável CSS --fe-* no .ferramenta (o espaço da seção vai em --secao-espaco no .palco-corpo, que o bento também lê).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const TAMANHOS = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl"];
const tamanho = (classe: string) => `var(--tamanho-${classe.replace(/^text-/, "")})`;
const PESOS: Record<string, string> = { "font-light": "300", "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };

// valores de partida: os que estão em Ferramenta.astro e index.astro hoje (levados ao código em 21/11/2026)
const config: Record<string, any> = {
  secao: {
    _collapsed: false,
    espacoEmCimaEEmbaixo: [96, 0, 240, 4],
    colunaEsquerda: [5, 1, 12, 0.5],
    colunaDireita: [6, 1, 12, 0.5],
    entreColunas: [128, 0, 240, 4],
    alinhar: select([{ value: "start", label: "Em cima" }, { value: "center", label: "No meio" }, { value: "end", label: "Embaixo" }], "center")
  },
  titulo: {
    _collapsed: false,
    tamanho: select(TAMANHOS, "text-2xl"),
    peso: select(Object.keys(PESOS), "font-semibold"),
    cor: select(cores("text"), "text-carmim-800"),
    largura: [30, 6, 40, 1],
    ateAbertura: [16, 0, 64, 2]
  },
  abertura: {
    _collapsed: false,
    tamanho: select(TAMANHOS, "text-lg"),
    peso: select(Object.keys(PESOS), "font-normal"),
    cor: select(cores("text"), "text-texto-700"),
    largura: [35, 16, 70, 1]
  },
  razoes: {
    _collapsed: false,
    disposicao: select([{ value: "empilhado", label: "Empilhadas" }, { value: "lado", label: "Lado a lado (como o mapa)" }], "empilhado"),
    entreRazoes: [0, 0, 120, 2],
    borda: select(cores("border"), "border-carmim-300"),
    bordaAbaixoDoTopo: select(cores("border"), "border-carmim-200"),
    espessura: [0.5, 0.25, 2, 0.25],
    esfumado: [24, 0, 50, 1],
    larguraDaLista: [480, 280, 800, 8],
    recuoDosLados: [24, 0, 120, 2],
    numeroAteTitulo: [4, 0, 48, 1],
    numeroTamanho: select(TAMANHOS, "text-xs"),
    numeroCor: select(cores("text"), "text-carmim-300"),
    tituloTamanho: select(TAMANHOS, "text-md"),
    tituloPeso: select(Object.keys(PESOS), "font-medium"),
    tituloCor: select(cores("text"), "text-neutro-800"),
    textoTamanho: select(TAMANHOS, "text-sm"),
    textoCor: select(cores("text"), "text-texto-900")
  },
  nota: {
    _collapsed: true,
    tamanho: select(TAMANHOS, "text-xs"),
    cor: select(cores("text"), "text-texto-600"),
    espaco: [8, 0, 48, 2]
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Início: a ferramenta", config, { id: "musa-inicio-ferramenta-lista", persist: true });

let v = kit.getValues() as Record<string, any>;

function aplicar() {
  const doc = quadro.contentDocument;
  const el = doc?.querySelector<HTMLElement>(".ferramenta"), corpo = doc?.querySelector<HTMLElement>(".palco-corpo");
  if (!el || !corpo) return;
  const { secao: S, titulo: T, abertura: A, razoes: R, nota: N } = v;
  corpo.style.setProperty("--secao-espaco", `${S.espacoEmCimaEEmbaixo}px`);
  const vars: Record<string, string> = {
    "--fe-colunas": `minmax(0, ${S.colunaEsquerda}fr) minmax(0, ${S.colunaDireita}fr)`, "--fe-entre-colunas": `${S.entreColunas}px`, "--fe-alinhar": S.alinhar,
    "--fe-titulo-tamanho": tamanho(T.tamanho), "--fe-titulo-peso": PESOS[T.peso], "--fe-titulo-cor": cor(T.cor), "--fe-titulo-largura": `${T.largura}ch`, "--fe-titulo-abertura": `${T.ateAbertura}px`,
    "--fe-abertura-tamanho": tamanho(A.tamanho), "--fe-abertura-peso": PESOS[A.peso], "--fe-abertura-cor": cor(A.cor), "--fe-abertura-largura": `${A.largura}ch`,
    "--fe-entre-razoes": `${R.entreRazoes}px`, "--fe-razao-borda": cor(R.borda), "--fe-razao-borda-interna": cor(R.bordaAbaixoDoTopo), "--fe-linha": `${R.espessura}px`, "--fe-esfumado": `${R.esfumado}%`, "--fe-razoes-largura": `${R.larguraDaLista}px`, "--fe-recuo": `${R.recuoDosLados}px`, "--fe-numero-ate-titulo": `${R.numeroAteTitulo}px`,
    "--fe-numero-tamanho": tamanho(R.numeroTamanho), "--fe-numero-cor": cor(R.numeroCor),
    "--fe-razao-titulo-tamanho": tamanho(R.tituloTamanho), "--fe-razao-titulo-peso": PESOS[R.tituloPeso], "--fe-razao-titulo-cor": cor(R.tituloCor),
    "--fe-razao-texto-tamanho": tamanho(R.textoTamanho), "--fe-razao-texto-cor": cor(R.textoCor),
    "--fe-nota-tamanho": tamanho(N.tamanho), "--fe-nota-cor": cor(N.cor), "--fe-nota-espaco": `${N.espaco}px`
  };
  Object.entries(vars).forEach(([k, x]) => el.style.setProperty(k, x));
  el.querySelector<HTMLElement>(".razoes")!.dataset.disposicao = R.disposicao;
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".ferramenta")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
