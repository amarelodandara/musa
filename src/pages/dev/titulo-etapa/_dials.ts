// Painel DialKit da célula de título de cada Etapa, no playground /dev/titulo-etapa (desenvolvimento).
// O topo tem CSS próprio da página do mapa (que ganharia de uma classe), então cada opção é uma classe do Tailwind
// medida num elemento de prova dentro do quadro; o valor medido vai para uma folha de estilo da bancada no quadro.
// Classes escritas por extenso para o Tailwind gerar todas. Cores: todas as do tema, sempre.
// Disposição "Empilhada": monta dentro do quadro uma linha com o número (início) e os controles "Ver tudo" + setas (fim),
// e o nome embaixo, numa linha própria; as duas linhas vão para as pontas do topo (o nome encosta embaixo). Ver montar().
// O painel só tem os botões de ação do topo (Ler mais e setas), ver botoes(); o resto fica fixo (PADROES, FIXO).
// "Ver tudo": estilo "Como os da barra" troca o conteúdo do botão por ícone (Iconoir) + texto, com a cara dos botões
// de filtro e de introdução. Ver verTudo().
// Altura do topo: 0 = automática. A altura de verdade aparece no canto da bancada (#altura-topo).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
interface Controle { sel: string; props: string[]; opcoes: Opcao[] }

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema (src/styles/tailwind.css)
const TEXTO_COR: Opcao[] = ["text-transparente", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const FUNDO: Opcao[] = ["bg-transparente", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const BORDA: Opcao[] = ["border-transparente", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];

const c = (sel: string, props: string[], opcoes: Opcao[]): Controle => ({ sel, props, opcoes });
const PESOS: Opcao[] = ["font-light", "font-normal", "font-medium", "font-semibold", "font-bold"];
const FONTES: Opcao[] = ["font-dm-sans", "font-inter", "font-inter-tight", "font-mono"];
const TAMANHOS: Opcao[] = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl", "text-2xl", "text-3xl"];
const ALTURAS: Opcao[] = ["leading-none", "leading-tight", "leading-snug", "leading-normal"];
const LETRAS: Opcao[] = ["tracking-tighter", "tracking-tight", "tracking-normal", "tracking-wide"];
const CANTOS: Opcao[] = ["rounded-none", "rounded-sm", "rounded", "rounded-md", "rounded-lg", "rounded-full"];
const ESPESSURA = (lado: string): Opcao[] => [["0 px", `border-${lado}-0`], ["1 px", `border-${lado}`], ["2 px", `border-${lado}-2`]];
const ESPESSURA_TUDO: Opcao[] = [["0 px", "border-0"], ["1 px", "border"], ["2 px", "border-2"]];

const TOPO = ".mapa .etapa-topo";
const NOME = ".mapa .etapa-nome";
const COMPACTA = '.mapa[data-modo="inteiro"] .etapa-nome, .mapa[data-modo="etapa"] .etapa:not([data-aberta]) .etapa-nome';
const ABERTA = '.mapa[data-modo="etapa"] .etapa[data-aberta] .etapa-nome';
const N = ".mapa .etapa-n";
// fechada = toda Etapa na visão geral e as não abertas na detalhada; aberta = a da Etapa aberta na detalhada
const FECH = (s: string) => `.mapa[data-modo="inteiro"] ${s}, .mapa[data-modo="etapa"] .etapa:not([data-aberta]) ${s}`;
const ABR = (s: string) => `.mapa[data-modo="etapa"] .etapa[data-aberta] ${s}`;
const VER = ".mapa .etapa-detalhe";
const SETA = ".mapa .etapa-seta";

// controles da disposição empilhada: só valem com ela ligada (data-bancada no .mapa)
const EMP = ".mapa[data-bancada]";
const CONTROLES: Record<string, Record<string, Controle>> = {
  disposicao: {
    alinhamentoDoNome: c(`${EMP} .etapa-titulo`, ["text-align"], [["Esquerda", "text-left"], ["Centro", "text-center"], ["Direita", "text-right"]]),
    espacoLinhaAteONome: c(`${EMP} .etapa-titulo`, ["margin-top"], ["mt-0", "mt-0.5", "mt-1", "mt-1.5", "mt-2", "mt-3", "mt-4", "mt-5", "mt-6"]),
    alinhamentoDaLinha: c(`${EMP} .bancada-linha`, ["align-items"], [["Em cima", "items-start"], ["No centro", "items-center"], ["Embaixo", "items-end"]]),
    alturaMinimaDaLinha: c(`${EMP} .bancada-linha`, ["min-height"], [["Nenhuma", "min-h-0"], ["24 px", "min-h-6"], ["28 px", "min-h-7"], ["32 px", "min-h-8"]]),
    espacoVerTudoSetas: c(`${EMP} .bancada-controles`, ["column-gap"], ["gap-1", "gap-2", "gap-3", "gap-4"]),
    ordemDosControles: c(`${EMP} .bancada-controles`, ["flex-direction"], [["Ver tudo, setas", "flex-row"], ["Setas, Ver tudo", "flex-row-reverse"]])
  },
  topo: {
    // fechadas (e todas na visão geral) x a aberta
    fundo: c('.mapa[data-modo="inteiro"] .etapa-topo, .mapa[data-modo="etapa"] .etapa:not([data-aberta]) .etapa-topo', ["background-color"], FUNDO),
    fundoDaAberta: c('.mapa[data-modo="etapa"] .etapa[data-aberta] .etapa-topo', ["background-color"], FUNDO),
    respiroEmCima: c(FECH(".etapa-topo"), ["padding-top"], ["pt-1", "pt-1.5", "pt-2", "pt-2.5", "pt-3", "pt-4", "pt-5"]),
    respiroEmbaixo: c(FECH(".etapa-topo"), ["padding-bottom"], ["pb-1", "pb-1.5", "pb-2", "pb-2.5", "pb-3", "pb-4", "pb-5"]),
    respiroEsquerda: c(FECH(".etapa-topo"), ["padding-left"], ["pl-2", "pl-2.5", "pl-3", "pl-4", "pl-5"]),
    respiroDireita: c(FECH(".etapa-topo"), ["padding-right"], ["pr-2", "pr-2.5", "pr-3", "pr-4", "pr-5"])
  },
  topoDaAberta: {
    respiroEmCima: c(ABR(".etapa-topo"), ["padding-top"], ["pt-1", "pt-1.5", "pt-2", "pt-2.5", "pt-3", "pt-4", "pt-5", "pt-6"]),
    respiroEmbaixo: c(ABR(".etapa-topo"), ["padding-bottom"], ["pb-1", "pb-1.5", "pb-2", "pb-2.5", "pb-3", "pb-4", "pb-5", "pb-6"]),
    respiroEsquerda: c(ABR(".etapa-topo"), ["padding-left"], ["pl-2", "pl-2.5", "pl-3", "pl-4", "pl-5"]),
    respiroDireita: c(ABR(".etapa-topo"), ["padding-right"], ["pr-2", "pr-2.5", "pr-3", "pr-4", "pr-5"]),
    espacoNomeSetas: c(ABR(".etapa-titulo"), ["column-gap"], ["gap-1", "gap-2", "gap-3", "gap-4"])
  },
  nome: {
    fonte: c(NOME, ["font-family"], FONTES),
    peso: c(NOME, ["font-weight"], PESOS),
    alturaDaLinha: c(NOME, ["line-height"], ALTURAS),
    espacamentoDeLetras: c(NOME, ["letter-spacing"], LETRAS)
  },
  // tamanho e cor: separados entre a Etapa aberta e as fechadas (na visão geral, todas seguem as "fechadas")
  nomeDasFechadas: {
    tamanho: c(COMPACTA, ["font-size"], TAMANHOS),
    peso: c(COMPACTA, ["font-weight"], PESOS),
    cor: c(COMPACTA, ["color"], TEXTO_COR)
  },
  nomeDaAberta: {
    tamanho: c(ABERTA, ["font-size"], TAMANHOS),
    peso: c(ABERTA, ["font-weight"], PESOS),
    alturaDaLinha: c(ABERTA, ["line-height"], ALTURAS),
    cor: c(ABERTA, ["color"], TEXTO_COR)
  },
  numeroDasFechadas: {
    fonte: c(FECH('.etapa-n'), ["font-family"], FONTES),
    tamanho: c(FECH('.etapa-n'), ["font-size"], TAMANHOS),
    peso: c(FECH('.etapa-n'), ["font-weight"], PESOS),
    cor: c(FECH('.etapa-n'), ["color"], TEXTO_COR),
    espacoAteONome: c(FECH('.etapa-n'), ["margin-right"], ["me-0", "me-0.5", "me-1", "me-1.5", "me-2"]),
    numerosTabulares: c(FECH('.etapa-n'), ["font-variant-numeric"], [["Proporcionais", "normal-nums"], ["Tabulares", "tabular-nums"]])
  },
  numeroDaAberta: {
    fonte: c(ABR('.etapa-n'), ["font-family"], FONTES),
    tamanho: c(ABR('.etapa-n'), ["font-size"], TAMANHOS),
    peso: c(ABR('.etapa-n'), ["font-weight"], PESOS),
    cor: c(ABR('.etapa-n'), ["color"], TEXTO_COR),
    espacoAteONome: c(ABR('.etapa-n'), ["margin-right"], ["me-0", "me-0.5", "me-1", "me-1.5", "me-2"]),
    numerosTabulares: c(ABR('.etapa-n'), ["font-variant-numeric"], [["Proporcionais", "normal-nums"], ["Tabulares", "tabular-nums"]])
  },
  verTudo: {
    tamanho: c(VER, ["font-size"], ["text-2xs", "text-xs", "text-sm"]),
    peso: c(VER, ["font-weight"], PESOS),
    cor: c(VER, ["color"], TEXTO_COR),
    fundo: c(VER, ["background-color"], FUNDO),
    fundoAoPassar: c(`${VER}:hover`, ["background-color"], FUNDO),
    bordaEspessura: c(VER, ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"], ESPESSURA_TUDO),
    bordaCor: c(VER, ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"], BORDA),
    cantos: c(VER, ["border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"], CANTOS),
    respiroHorizontal: c(VER, ["padding-left", "padding-right"], ["px-1.5", "px-2", "px-2.5", "px-3", "px-4"]),
    respiroVertical: c(VER, ["padding-top", "padding-bottom"], ["py-0", "py-0.5", "py-0.75", "py-1", "py-1.5"]),
    espacoAteONome: c(VER, ["margin-top"], ["mt-1", "mt-1.5", "mt-2", "mt-2.5", "mt-3", "mt-4"])
  },
  setas: {
    tamanho: c(SETA, ["width", "height"], ["size-6", "size-7", "size-8", "size-9"]),
    cantos: c(SETA, ["border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"], CANTOS),
    fundo: c(SETA, ["background-color"], FUNDO),
    fundoAoPassar: c(`${SETA}:hover`, ["background-color"], FUNDO),
    bordaCor: c(SETA, ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"], BORDA),
    cor: c(SETA, ["color"], TEXTO_COR),
    espacoEntreElas: c(".mapa .etapa-setas", ["column-gap"], ["gap-0", "gap-0.5", "gap-1", "gap-1.5", "gap-2"])
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
    p.className = `${classe} border-solid border-0`;
    p.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
    // a espessura da borda mede-se com a borda ligada (sem estilo, a largura computada é 0)
    d.body.appendChild(p);
    const cs = getComputedStyle(p), copia: Record<string, string> = {};
    for (let i = 0; i < cs.length; i++) copia[cs[i]] = cs.getPropertyValue(cs[i]);
    p.remove();
    m.set(classe, { getPropertyValue: (k: string) => copia[k] ?? "" } as CSSStyleDeclaration);
  }
  return m.get(classe)!;
}

const doc = () => quadro.contentDocument;

// valores escolhidos (colados do Copy parameters em 18/11/2026): padrão do painel no lugar do que o código tem
const PADROES: Record<string, string> = {"disposicao.alinhamentoDoNome": "text-left", "disposicao.espacoLinhaAteONome": "", "disposicao.alinhamentoDaLinha": "items-center", "disposicao.alturaMinimaDaLinha": "min-h-0", "disposicao.espacoVerTudoSetas": "gap-2", "disposicao.ordemDosControles": "flex-row", "topo.fundo": "", "topo.fundoDaAberta": "", "topo.respiroEmCima": "pt-3", "topo.respiroEmbaixo": "pb-2.5", "topo.respiroEsquerda": "pl-3", "topo.respiroDireita": "pr-3", "topoDaAberta.respiroEmCima": "pt-3", "topoDaAberta.respiroEmbaixo": "pb-2", "topoDaAberta.respiroEsquerda": "pl-3", "topoDaAberta.respiroDireita": "pr-3", "topoDaAberta.espacoNomeSetas": "", "nome.fonte": "font-dm-sans", "nome.peso": "font-medium", "nome.alturaDaLinha": "", "nome.espacamentoDeLetras": "tracking-normal", "nomeDasFechadas.tamanho": "text-sm", "nomeDasFechadas.peso": "font-normal", "nomeDasFechadas.cor": "text-texto-950", "nomeDaAberta.tamanho": "text-lg", "nomeDaAberta.peso": "font-normal", "nomeDaAberta.alturaDaLinha": "", "nomeDaAberta.cor": "", "numeroDasFechadas.fonte": "", "numeroDasFechadas.tamanho": "", "numeroDasFechadas.peso": "", "numeroDasFechadas.cor": "", "numeroDasFechadas.espacoAteONome": "me-1", "numeroDasFechadas.numerosTabulares": "tabular-nums", "numeroDaAberta.fonte": "", "numeroDaAberta.tamanho": "", "numeroDaAberta.peso": "", "numeroDaAberta.cor": "text-coral-100", "numeroDaAberta.espacoAteONome": "me-1", "numeroDaAberta.numerosTabulares": "normal-nums", "verTudo.tamanho": "text-xs", "verTudo.peso": "", "verTudo.cor": "", "verTudo.fundo": "", "verTudo.fundoAoPassar": "", "verTudo.bordaEspessura": "", "verTudo.bordaCor": "border-neutro-400", "verTudo.cantos": "", "verTudo.respiroHorizontal": "px-2.5", "verTudo.respiroVertical": "py-0.75", "verTudo.espacoAteONome": "mt-2", "setas.tamanho": "size-7", "setas.cantos": "", "setas.fundo": "", "setas.fundoAoPassar": "", "setas.bordaCor": "", "setas.cor": "", "setas.espacoEntreElas": "gap-1"};

// ícones Iconoir (16 px, traço 1,5), como na barra
const ICONES: Record<string, string> = {"Book": "<svg width=\"16\" stroke-width=\"1.5\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 19V5C4 3.89543 4.89543 3 6 3H19.4C19.7314 3 20 3.26863 20 3.6V16.7143\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6 17L20 17\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6 21L20 21\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6 21C4.89543 21 4 20.1046 4 19C4 17.8954 4.89543 17 6 17\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M9 7L15 7\" stroke=\"currentColor\" stroke-linecap=\"round\"></path></svg>", "OpenBook": "<svg width=\"16\" height=\"16\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 21V7C12 5.89543 12.8954 5 14 5H21.4C21.7314 5 22 5.26863 22 5.6V18.7143\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M12 21V7C12 5.89543 11.1046 5 10 5H2.6C2.26863 5 2 5.26863 2 5.6V18.7143\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M14 19L22 19\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M10 19L2 19\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M12 21C12 19.8954 12.8954 19 14 19\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M12 21C12 19.8954 11.1046 19 10 19\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "BookStack": "<svg width=\"16\" stroke-width=\"1.5\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M5 19.5V5C5 3.89543 5.89543 3 7 3H18.4C18.7314 3 19 3.26863 19 3.6V21\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M9 7L15 7\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6.5 15L19 15\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6.5 18L19 18\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6.5 21L19 21\" stroke=\"currentColor\" stroke-linecap=\"round\"></path><path d=\"M6.5 18C5.5 18 5 17.3284 5 16.5C5 15.6716 5.5 15 6.5 15\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M6.5 21C5.5 21 5 20.3284 5 19.5C5 18.6716 5.5 18 6.5 18\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "Page": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 21.4V2.6C4 2.26863 4.26863 2 4.6 2H16.2515C16.4106 2 16.5632 2.06321 16.6757 2.17574L19.8243 5.32426C19.9368 5.43679 20 5.5894 20 5.74853V21.4C20 21.7314 19.7314 22 19.4 22H4.6C4.26863 22 4 21.7314 4 21.4Z\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M8 10L16 10\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M8 18L16 18\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M8 14L12 14\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "Expand": "<svg width=\"16\" height=\"16\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M9 9L4 4M4 4V8M4 4H8\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M15 9L20 4M20 4V8M20 4H16\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M9 15L4 20M4 20V16M4 20H8\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M15 15L20 20M20 20V16M20 20H16\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "Enlarge": "<svg width=\"16\" height=\"16\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M15 9L20 4M20 4V8M20 4H16\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M9 15L4 20M4 20V16M4 20H8\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "Maximize": "<svg width=\"16\" height=\"16\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M7 4H4V7\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M17 4H20V7\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M7 20H4V17\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M17 20H20V17\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "OpenInWindow": "<svg width=\"16\" height=\"16\" stroke-width=\"1.5\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M8 21H20.4C20.7314 21 21 20.7314 21 20.4V3.6C21 3.26863 20.7314 3 20.4 3H3.6C3.26863 3 3 3.26863 3 3.6V16\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M3.5 20.5L12 12M12 12V16M12 12H8\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>", "ArrowUpRight": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" fill=\"none\" aria-hidden=\"true\"><path d=\"M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg>"};
const BARRA = `
  .mapa[data-ver-barra] .etapa-detalhe { display: inline-flex; }
  .mapa[data-ver-barra] .etapa-topo .etapa-detalhe { align-items: center; gap: 6px; height: 28px; box-sizing: border-box; margin: 0 !important;
    padding: 0 10px 0 8px !important; border: 1px solid var(--neutro-300) !important; border-radius: 4px !important; background: var(--neutro-50) !important;
    color: var(--texto-900) !important; font-family: var(--fonte-inter) !important; font-size: var(--tamanho-xs) !important; font-weight: 400 !important;
    line-height: 1 !important; white-space: nowrap; cursor: pointer; user-select: none; transition: background-color 150ms ease; }
  .mapa[data-ver-barra] .etapa-topo .etapa-detalhe:hover { background: var(--neutro-100) !important; }
  .mapa[data-ver-barra] .etapa-topo .etapa-detalhe:active { background: var(--neutro-200) !important; }
  .mapa[data-ver-barra] .etapa-topo .etapa-detalhe:focus-visible { outline: 2px solid var(--texto-950); outline-offset: 2px; }
  .mapa[data-ver-barra] .etapa-detalhe svg { flex-shrink: 0; }
  .mapa[data-ver-barra]:not([data-ver-icone]) .etapa-topo .etapa-detalhe:has(svg) { padding-left: 6px !important; }
  /* visão geral, só ícone: quadrado como os outros botões da barra */
  .mapa[data-modo="inteiro"][data-ver-barra][data-ver-icone] .bancada-ver-texto { display: none; }
  .mapa[data-modo="inteiro"][data-ver-barra][data-ver-icone] .etapa-topo .etapa-detalhe { width: 28px; padding: 0 !important; justify-content: center; }
`;
function verTudo(d: Document, vals: Record<string, any>) {
  const m = d.querySelector<HTMLElement>(".mapa");
  if (!m) return;
  const barra = vals.botaoLerMais.estilo === "barra";
  m.toggleAttribute("data-ver-barra", barra);
  m.toggleAttribute("data-ver-icone", barra && vals.botaoLerMais.naVisaoGeral === "icone");
  if (!d.getElementById("bancada-barra")) {
    const f = d.createElement("style"); f.id = "bancada-barra"; f.textContent = BARRA; d.head.appendChild(f);
  }
  d.querySelectorAll<HTMLElement>(".mapa .etapa-detalhe").forEach((b) => {
    if (b.dataset.original === undefined) b.dataset.original = b.innerHTML;
    if (!barra) { b.innerHTML = b.dataset.original; b.removeAttribute("aria-label"); return; }
    const { iconeDoBotao: icone, texto } = vals.botaoLerMais;
    b.innerHTML = (ICONES[icone] ?? "") + `<span class="bancada-ver-texto">${texto}</span>`;
    b.setAttribute("aria-label", texto);
  });
}

// botões de ação do topo (Ler mais e setas): tudo vem do painel (o único grupo de controles da bancada)
const TOKENS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const COR = (def: string) => ({ type: "select", options: [{ value: "transparente", label: "transparente" }, ...TOKENS], default: def });
// cor de token com opacidade (0–100)
const cor = (t: string, op = 100) => t === "transparente" || op <= 0 ? "transparent" : op >= 100 ? `var(--${t})` : `color-mix(in srgb, var(--${t}) ${op}%, transparent)`;
function botoes(b: Record<string, any>) {
  const { texto: t, fundo: fu, borda: bo, anelInterno: an, sombraInterna: si, sombraExterna: se, luzes: lu, aoPassar: ap, aoPressionar: pr } = b;
  const sombra = (extra: { si?: number; se?: number } = {}) => {
    const partes: string[] = [];
    if (se.opacidade > 0) partes.push(`${se.x}px ${se.y + (extra.se ?? 0)}px ${se.desfoque}px ${se.expansao}px ${cor(se.cor, se.opacidade)}`);
    if (lu.embaixoFora > 0) partes.push(`0 1px 0 ${cor(lu.cor, lu.embaixoFora)}`);
    if (an.largura > 0 && an.opacidade > 0) partes.push(`inset 0 0 0 ${an.largura}px ${cor(an.cor, an.opacidade)}`);
    if (si.opacidade > 0) partes.push(`inset 0 ${si.y + (extra.si ?? 0)}px ${si.desfoque}px ${si.expansao}px ${cor(si.cor, si.opacidade)}`);
    if (lu.emCimaDentro > 0) partes.push(`inset 0 1px 0 ${cor(lu.cor, lu.emCimaDentro)}`);
    return partes.length ? partes.join(", ") : "none";
  };
  const L = "html body .mapa[data-ver-barra] .etapa .etapa-topo .etapa-detalhe";
  const S = "html body .mapa .etapa .etapa-topo .etapa-seta";
  const ambos = (suf = "") => `${L}${suf}, ${S}${suf}`;
  // tamanho e espaçamento iguais aos botões da barra (ControlesMapa: botao / botaoQueAbre / Rotulo), medidos na página:
  // 28 px de altura; 1 px de borda + 5 px de respiro até o ícone de 16 px; rótulo 6 px depois do ícone e 2 px a mais
  // no fim; texto Inter 13 px (text-xs do tema); 8 px entre botões; cantos de 4 px (rounded-sm). A borda vem do painel e
  // entra na conta do respiro: o conteúdo não sai do lugar.
  const ALTURA = 28, ATE_O_ICONE = 6, DEPOIS_DO_TEXTO = 8, ICONE = 16, ICONE_TEXTO = 6, TEXTO = 13, ENTRE = 8;
  const CANTOS = 4;
  const pad = (n: number) => Math.max(0, n - bo.largura);
  return `
  ${ambos()} { height: ${ALTURA}px !important; box-sizing: border-box !important; border-radius: ${CANTOS}px !important;
    background: ${cor(fu.cor, fu.opacidade)} !important; color: ${cor(t.cor)} !important;
    border: ${bo.largura}px solid ${cor(bo.cor, bo.opacidade)} !important; box-shadow: ${sombra()} !important;
    transition: background-color ${pr.duracao}ms ease, box-shadow ${pr.duracao}ms ease, transform ${pr.duracao}ms cubic-bezier(0.23, 1, 0.32, 1) !important; }
  ${S} { width: ${ALTURA}px !important; padding: 0 !important; }
  ${L} { padding: 0 ${pad(DEPOIS_DO_TEXTO)}px 0 ${pad(ATE_O_ICONE)}px !important; gap: ${ICONE_TEXTO}px !important;
    font-family: var(--fonte-inter) !important; font-size: ${TEXTO}px !important; font-weight: ${t.peso} !important; letter-spacing: normal !important; }
  ${ambos(" svg")} { width: ${ICONE}px !important; height: ${ICONE}px !important; }
  html body .mapa .etapa .bancada-controles { column-gap: ${ENTRE}px !important; }
  html body .mapa .etapa .etapa-setas { column-gap: ${ENTRE}px !important; }
  ${ambos(":hover")} { background: ${cor(ap.fundo, ap.opacidade)} !important; border-color: ${cor(bo.cor, ap.opacidadeDaBorda)} !important; }
  ${ambos(":active")} { background: ${cor(pr.fundo, pr.opacidade)} !important; transform: scale(${pr.escala}) !important;
    box-shadow: ${sombra({ si: pr.sombraInternaMais, se: -se.y })} !important; }`;
}

// altura de verdade do topo (a linha da grade), mostrada fora do quadro
const medidor = document.createElement("div");
medidor.id = "altura-topo";
medidor.style.cssText = "position:fixed;left:24px;bottom:24px;z-index:10;padding:8px 12px;border-radius:999px;background:rgb(20 20 20 / 0.92);color:#fff;font:500 13px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums";
document.body.appendChild(medidor);
function medirTopo() {
  const t = doc()?.querySelector<HTMLElement>('.mapa .etapa:not([hidden]) .etapa-topo');
  const a = doc()?.querySelector<HTMLElement>(".mapa .etapa[data-aberta] .etapa-topo");
  if (!t) return;
  const h = Math.round(t.getBoundingClientRect().height);
  medidor.textContent = `Topo das Etapas: ${h} px` + (a && Math.round(a.getBoundingClientRect().height) !== h ? ` (aberta: ${Math.round(a.getBoundingClientRect().height)} px)` : "");
}

// disposição empilhada, dentro do quadro (o quadro recarrega a cada estado: monta de novo)
const BASE = `
  /* as duas linhas nas pontas do topo: número e controles em cima, o nome embaixo (a altura é a da linha da grade) */
  ${EMP} .etapa-topo { display: flex; flex-direction: column; justify-content: space-between; }
  ${EMP} .bancada-linha { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 28px; }
  ${EMP} .bancada-controles { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  ${EMP} .bancada-linha .etapa-n { margin-right: 0 !important; }
  ${EMP} .bancada-controles .etapa-detalhe { margin-top: 0 !important; }
  ${EMP} .etapa-setas { margin-top: 0; }
  ${EMP} .etapa-titulo { display: block; margin-top: 8px; text-align: right; }
  ${EMP} .etapa-titulo .etapa-nome { text-wrap: balance; }
`;
function montar(d: Document) {
  if (!d.getElementById("bancada-base")) {
    const f = d.createElement("style"); f.id = "bancada-base"; f.textContent = BASE;
    // antes da folha do painel, para o painel ganhar
    d.head.insertBefore(f, d.getElementById("dial-titulo-etapa"));
  }
  d.querySelector(".mapa")?.setAttribute("data-bancada", "");
  d.querySelectorAll<HTMLElement>(".mapa .etapa-topo").forEach((topo) => {
    if (topo.querySelector(".bancada-linha")) return;
    const titulo = topo.querySelector(".etapa-titulo")!, n = topo.querySelector(".etapa-n")!;
    const linha = d.createElement("div"); linha.className = "bancada-linha";
    const ctrls = d.createElement("div"); ctrls.className = "bancada-controles";
    const ver = topo.querySelector(".etapa-detalhe"), setas = topo.querySelector(".etapa-setas");
    if (ver) ctrls.append(ver);
    if (setas) ctrls.append(setas);
    // o número sai do botão do nome; o espaço que vinha antes do nome some junto
    const depois = n.nextSibling;
    if (depois?.nodeType === 3) depois.textContent = depois.textContent!.replace(/^\s+/, "");
    linha.append(n, ctrls);
    topo.insertBefore(linha, titulo);
  });
}
function desmontar(d: Document) {
  d.querySelector(".mapa")?.removeAttribute("data-bancada");
  d.querySelectorAll<HTMLElement>(".mapa .bancada-linha").forEach((linha) => {
    const topo = linha.parentElement!, titulo = topo.querySelector(".etapa-titulo")!;
    const n = linha.querySelector(".etapa-n")!, abrir = titulo.querySelector(".etapa-abrir")!;
    const ver = linha.querySelector(".etapa-detalhe"), setas = linha.querySelector(".etapa-setas");
    const texto = abrir.firstChild;
    if (texto?.nodeType === 3) texto.textContent = " " + texto.textContent;
    abrir.prepend(n);
    if (setas) titulo.append(setas);
    if (ver) topo.append(ver);
    linha.remove();
  });
}
const pronto = (d: Document | null) => !!d?.querySelector(".mapa .etapa-topo") && d.readyState === "complete";

function padrao(d: Document, ctrl: Controle) {
  const el = d.querySelector<HTMLElement>(ctrl.sel);
  if (!el || ctrl.opcoes.some((o) => valor(o) === "")) return "";
  const atual = getComputedStyle(el);
  const achou = ctrl.opcoes.find((o) => valor(o) !== "" && ctrl.props.every((k) => medir(d, valor(o)).getPropertyValue(k) === atual.getPropertyValue(k)));
  // nenhuma opção bate com o código: começa em "Como no código" (não mexe)
  return achou ? valor(achou) : "";
}

const primeiro = await new Promise<Document>((ok) => {
  // monta antes de ler o padrão dos controles (os da disposição só existem com ela montada)
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); montar(d!); ok(d!); } }, 100);
});

// larguras das colunas (variáveis do CSS do mapa, em px), para decidir com o conteúdo dentro
// o painel só tem os botões de ação do topo; todo o resto fica fixo nos valores escolhidos (PADROES e FIXO)
const FIXO: Record<string, any> = {
  layout: "empilhada",
  colunas: { fechadaNaDetalhada: 296, abertaNaDetalhadaMinimo: 420, naVisaoGeral: 320, rotulos: 192 },
  alturaDoTopo: { altura: 90 },
  botaoLerMais: { estilo: "barra", naVisaoGeral: "texto", iconeDoBotao: "OpenBook", texto: "Ler mais" }
};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  for (const nome of Object.keys(ctrls)) (FIXO[grupo] ??= {})[nome] = PADROES[`${grupo}.${nome}`] ?? "";
}
const mesclar = (painel: Record<string, any>) => ({ ...FIXO, ...painel });

// padrões: valores colados do Copy parameters em 18/11/2026 (fundo neutro-50, borda coral-100, anel coral-500 a 30%)
const config: Record<string, any> = {
  // tamanho, espaçamento e cantos ficam no código, iguais aos da barra (ver botoes())
  texto: {
    cor: COR("coral-900"),
    peso: { type: "select", options: [{ value: "300", label: "Light" }, { value: "400", label: "Normal" }, { value: "500", label: "Medium" }, { value: "600", label: "Semibold" }], default: "400" }
  },
  fundo: { cor: COR("neutro-50"), opacidade: [100, 0, 100, 1] },
  borda: { largura: [0.5, 0, 3, 0.5], cor: COR("coral-100"), opacidade: [100, 0, 100, 1] },
  anelInterno: { largura: [0.5, 0, 3, 0.5], cor: COR("coral-500"), opacidade: [30, 0, 100, 1] },
  sombraInterna: { y: [-4, -4, 6, 0.5], desfoque: [0, 0, 12, 0.5], expansao: [-4, -4, 4, 0.5], cor: COR("coral-100"), opacidade: [0, 0, 100, 1] },
  sombraExterna: { x: [-6, -6, 6, 0.5], y: [-6, -6, 8, 0.5], desfoque: [0, 0, 24, 0.5], expansao: [-4, -4, 4, 0.5], cor: COR("texto-950"), opacidade: [0, 0, 100, 1] },
  luzes: { cor: COR("texto-50"), embaixoFora: [0, 0, 100, 1], emCimaDentro: [0, 0, 100, 1] },
  aoPassar: { fundo: COR("coral-400"), opacidade: [0, 0, 100, 1], opacidadeDaBorda: [100, 0, 100, 1] },
  aoPressionar: { fundo: COR("texto-950"), opacidade: [14, 0, 100, 1], escala: [0.97, 0.9, 1, 0.005], sombraInternaMais: [0.5, 0, 4, 0.5], duracao: [150, 0, 400, 10] }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Botões do topo", config, { id: "musa-titulo-etapa-botoes-v1", persist: true });

let v = mesclar(kit.getValues() as Record<string, any>);
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  if (v.layout === "atual") desmontar(d!); else montar(d!);
  verTudo(d!, v);
  const regras: string[] = [];
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      if (!escolha) continue;
      const m = medir(d!, escolha);
      // borda com espessura precisa de estilo (as células só têm a da esquerda ligada)
      const estilo = ctrl.props.filter((k) => /^border-\w+-width$/.test(k)).map((k) => `${k.replace("width", "style")}: solid !important;`).join(" ");
      regras.push(`${ctrl.sel} { ${ctrl.props.map((k) => `${k}: ${m.getPropertyValue(k)} !important;`).join(" ")} ${estilo} }`);
    }
  }
  regras.push(botoes(v));
  const alt = v.alturaDoTopo.altura;
  if (alt > 0) regras.push(`.mapa .etapa-topo { height: ${alt}px !important; min-height: 0 !important; box-sizing: border-box; overflow: hidden; }`);
  const col = v.colunas;
  regras.push(`.mapa { --col-compacta: ${col.fechadaNaDetalhada}px !important; --col-aberta: minmax(${col.abertaNaDetalhadaMinimo}px, 1fr) !important; --col-inteira: ${col.naVisaoGeral}px !important; --rotulos: ${col.rotulos}px !important; }`);
  let folha = d!.getElementById("dial-titulo-etapa");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-titulo-etapa"; d!.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
  requestAnimationFrame(medirTopo);
}
setInterval(medirTopo, 500);
kit.subscribe((novo: Record<string, any>) => { v = mesclar(novo); aplicar(); });

// cada estado recarrega o quadro: espera e reaplica
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
