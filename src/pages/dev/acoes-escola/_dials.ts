// Painel DialKit da linha "Ações do professor" (antes "Ações da escola"), no playground /dev/acoes-escola (desenvolvimento).
// A célula tem CSS próprio da página do mapa (que ganharia de uma classe), então cada opção é uma classe do Tailwind
// medida num elemento de prova dentro do quadro; o valor medido vai para uma folha de estilo da bancada no quadro.
// Classes escritas por extenso para o Tailwind gerar todas. Cores: todas as do tema, sempre.
// Três situações da célula: a da Etapa aberta (visão detalhada), as fechadas (visão detalhada) e todas na visão geral.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
interface Controle { sel: string; props: string[]; opcoes: Opcao[] }

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema (src/styles/tailwind.css)
const TEXTO_COR: Opcao[] = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const FUNDO: Opcao[] = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];

const BORDA: Opcao[] = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];

const c = (sel: string, props: string[], opcoes: Opcao[]): Controle => ({ sel, props, opcoes });
const PESOS: Opcao[] = ["font-light", "font-normal", "font-medium", "font-semibold", "font-bold"];
const FONTES: Opcao[] = ["font-dm-sans", "font-inter", "font-inter-tight", "font-mono"];
const TAMANHOS: Opcao[] = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl"];
const ALTURAS: Opcao[] = ["leading-none", "leading-tight", "leading-snug", "leading-normal", "leading-relaxed", "leading-loose"];
const LETRAS: Opcao[] = ["tracking-tighter", "tracking-tight", "tracking-normal", "tracking-wide"];
const RESPIRO_Y = (lado: "t" | "b"): Opcao[] => ["0", "1", "1.5", "2", "2.5", "3", "4", "5", "6"].map((n) => `p${lado}-${n}`);
const RESPIRO_X: Opcao[] = ["px-1.5", "px-2", "px-2.5", "px-3", "px-4", "px-5"];
const LINHAS: Opcao[] = [["Sem limite", "line-clamp-none"], ["1 linha", "line-clamp-1"], ["2 linhas", "line-clamp-2"], ["3 linhas", "line-clamp-3"], ["4 linhas", "line-clamp-4"], ["5 linhas", "line-clamp-5"]];

// as três situações da célula
const ABR = (s = "") => `.mapa[data-modo="etapa"] .etapa[data-aberta] .camada-acoes${s}`;
const FECH = (s = "") => `.mapa[data-modo="etapa"] .etapa:not([data-aberta]) .camada-acoes${s}`;
const GERAL = (s = "") => `.mapa[data-modo="inteiro"] .camada-acoes${s}`;
const LINHA_CLAMP = ["overflow", "display", "-webkit-box-orient", "-webkit-line-clamp"];

const CONTROLES: Record<string, Record<string, Controle>> = {
  // fonte, peso e espaçamento de letras: os mesmos nas três situações
  texto: {
    fonte: c(".mapa .camada-acoes p", ["font-family"], FONTES),
    peso: c(".mapa .camada-acoes p", ["font-weight"], PESOS),
    espacamentoDeLetras: c(".mapa .camada-acoes p", ["letter-spacing"], LETRAS)
  },
  naAberta: {
    tamanho: c(ABR(" p"), ["font-size"], TAMANHOS),
    alturaDaLinha: c(ABR(" p"), ["line-height"], ALTURAS),
    cor: c(ABR(" p"), ["color"], TEXTO_COR),
    fundo: c(ABR(), ["background-color"], FUNDO),
    respiroEmCima: c(ABR(), ["padding-top"], RESPIRO_Y("t")),
    respiroEmbaixo: c(ABR(), ["padding-bottom"], RESPIRO_Y("b")),
    respiroLados: c(ABR(), ["padding-left", "padding-right"], RESPIRO_X)
  },
  // hoje as fechadas escondem o texto (só a aberta mostra)
  nasFechadas: {
    texto: c(FECH(" p"), ["display"], [["Escondido", "hidden"], ["Visível", "block"]]),
    tamanho: c(FECH(" p"), ["font-size"], TAMANHOS),
    alturaDaLinha: c(FECH(" p"), ["line-height"], ALTURAS),
    cor: c(FECH(" p"), ["color"], TEXTO_COR),
    limiteDeLinhas: c(FECH(" p"), LINHA_CLAMP, LINHAS),
    fundo: c(FECH(), ["background-color"], FUNDO),
    respiroEmCima: c(FECH(), ["padding-top"], RESPIRO_Y("t")),
    respiroEmbaixo: c(FECH(), ["padding-bottom"], RESPIRO_Y("b")),
    respiroLados: c(FECH(), ["padding-left", "padding-right"], RESPIRO_X)
  },
  naVisaoGeral: {
    tamanho: c(GERAL(" p"), ["font-size"], TAMANHOS),
    alturaDaLinha: c(GERAL(" p"), ["line-height"], ALTURAS),
    cor: c(GERAL(" p"), ["color"], TEXTO_COR),
    limiteDeLinhas: c(GERAL(" p"), LINHA_CLAMP, LINHAS),
    fundo: c(GERAL(), ["background-color"], FUNDO),
    respiroEmCima: c(GERAL(), ["padding-top"], RESPIRO_Y("t")),
    respiroEmbaixo: c(GERAL(), ["padding-bottom"], RESPIRO_Y("b")),
    respiroLados: c(GERAL(), ["padding-left", "padding-right"], RESPIRO_X)
  },
  // a linha inteira (todas as células ficam com a altura da maior)
  linha: {
    // a divisão entre Ações do professor e Sentimentos (mais clara: as duas formam um grupo); só na coluna dos rótulos
    divisaoComSentimentos: c(".mapa .rotulo-sentimentos", ["border-top-color"], BORDA),
    alturaMinima: c(".mapa .camada-acoes", ["min-height"], [["Nenhuma", "min-h-0"], ["48 px", "min-h-12"], ["64 px", "min-h-16"], ["80 px", "min-h-20"], ["96 px", "min-h-24"], ["112 px", "min-h-28"], ["128 px", "min-h-32"]])
  }
};

const valor = (o: Opcao) => (Array.isArray(o) ? o[1] : o);

// mede uma classe num elemento de prova invisível dentro do quadro (cache por documento)
const cache = new WeakMap<Document, Map<string, CSSStyleDeclaration>>();
function medir(d: Document, classe: string) {
  let m = cache.get(d);
  if (!m) { m = new Map(); cache.set(d, m); }
  if (!m.has(classe)) {
    const p = d.createElement("div");
    p.className = classe;
    p.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
    d.body.appendChild(p);
    const cs = getComputedStyle(p), copia: Record<string, string> = {};
    for (let i = 0; i < cs.length; i++) copia[cs[i]] = cs.getPropertyValue(cs[i]);
    p.remove();
    m.set(classe, { getPropertyValue: (k: string) => copia[k] ?? "" } as CSSStyleDeclaration);
  }
  return m.get(classe)!;
}

const doc = () => quadro.contentDocument;
const pronto = (d: Document | null) => !!d?.querySelector(".mapa .camada-acoes") && d.readyState === "complete";

function padrao(d: Document, ctrl: Controle) {
  const el = d.querySelector<HTMLElement>(ctrl.sel);
  if (!el) return "";
  const atual = getComputedStyle(el);
  const achou = ctrl.opcoes.find((o) => valor(o) !== "" && ctrl.props.every((k) => medir(d, valor(o)).getPropertyValue(k) === atual.getPropertyValue(k)));
  // nenhuma opção bate com o código (ou a situação não está no quadro agora): começa em "Como no código" (não mexe)
  return achou ? valor(achou) : "";
}

const primeiro = await new Promise<Document>((ok) => {
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});

// valores escolhidos (colados do Copy parameters em 18/11/2026): padrão do painel no lugar do que o código tem
const PADROES: Record<string, string> = {"texto.fonte": "font-inter", "texto.peso": "font-normal", "texto.espacamentoDeLetras": "tracking-normal", "naAberta.tamanho": "text-sm", "naAberta.alturaDaLinha": "", "naAberta.cor": "text-texto-900", "naAberta.fundo": "bg-transparente", "naAberta.respiroEmCima": "pt-3", "naAberta.respiroEmbaixo": "pb-3", "naAberta.respiroLados": "px-3", "nasFechadas.texto": "", "nasFechadas.tamanho": "text-xs", "nasFechadas.alturaDaLinha": "", "nasFechadas.cor": "text-texto-700", "nasFechadas.limiteDeLinhas": "", "nasFechadas.fundo": "bg-transparente", "nasFechadas.respiroEmCima": "pt-2", "nasFechadas.respiroEmbaixo": "pb-2", "nasFechadas.respiroLados": "px-2.5", "naVisaoGeral.tamanho": "", "naVisaoGeral.alturaDaLinha": "", "naVisaoGeral.cor": "", "naVisaoGeral.limiteDeLinhas": "", "naVisaoGeral.fundo": "", "naVisaoGeral.respiroEmCima": "", "naVisaoGeral.respiroEmbaixo": "", "naVisaoGeral.respiroLados": "", "linha.alturaMinima": ""};

const config: Record<string, any> = {};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: grupo !== "naAberta" };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    // o padrão lê o código antes de acrescentar "Como no código" (senão a opção vazia faz pular a leitura)
    const def = padrao(primeiro, ctrl);
    ctrl.opcoes = [["Como no código", ""], ...ctrl.opcoes];
    config[grupo][nome] = {
      type: "select",
      options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)),
      default: `${grupo}.${nome}` in PADROES ? PADROES[`${grupo}.${nome}`] : def
    };
  }
}

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Ações do professor", config, { id: "musa-acoes-escola-v1", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  const regras: string[] = [];
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      if (!escolha) continue;
      // texto escondido nas fechadas: o limite de linhas (display: -webkit-box) o faria voltar
      if (grupo === "nasFechadas" && nome === "limiteDeLinhas" && v.nasFechadas.texto === "hidden") continue;
      const m = medir(d!, escolha);
      regras.push(`${ctrl.sel} { ${ctrl.props.map((k) => `${k}: ${m.getPropertyValue(k)} !important;`).join(" ")} }`);
    }
  }
  let folha = d!.getElementById("dial-acoes-escola");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-acoes-escola"; d!.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// cada estado recarrega o quadro: espera e reaplica
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
