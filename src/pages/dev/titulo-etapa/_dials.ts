// Painel DialKit da célula de título de cada Etapa, no playground /dev/titulo-etapa (desenvolvimento).
// O topo tem CSS próprio da página do mapa (que ganharia de uma classe), então cada opção é uma classe do Tailwind
// medida num elemento de prova dentro do quadro; o valor medido vai para uma folha de estilo da bancada no quadro.
// Classes escritas por extenso para o Tailwind gerar todas. Cores: todas as do tema, sempre.
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

const CONTROLES: Record<string, Record<string, Controle>> = {
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
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});

// larguras das colunas (variáveis do CSS do mapa, em px), para decidir com o conteúdo dentro
const config: Record<string, any> = {
  colunas: { _collapsed: false, fechadaNaDetalhada: [296, 64, 480, 4], abertaNaDetalhadaMinimo: [420, 240, 900, 10], naVisaoGeral: [320, 120, 480, 4], rotulos: [192, 80, 280, 4] }
};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: !["colunas", "numeroDasFechadas", "numeroDaAberta", "topoDaAberta"].includes(grupo) };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    // o padrão lê o código antes de acrescentar "Como no código" (senão a opção vazia faz pular a leitura)
    const def = padrao(primeiro, ctrl);
    // cópia: as listas de opções são compartilhadas entre controles (mexer nelas mudaria os outros)
    if (!ctrl.opcoes.some((o) => valor(o) === "")) ctrl.opcoes = [["Como no código", ""], ...ctrl.opcoes];
    config[grupo][nome] = {
      type: "select",
      options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)),
      default: def
    };
  }
}


createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Título da etapa", config, { id: "musa-titulo-etapa-v1", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
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
  const col = v.colunas;
  regras.push(`.mapa { --col-compacta: ${col.fechadaNaDetalhada}px !important; --col-aberta: minmax(${col.abertaNaDetalhadaMinimo}px, 1fr) !important; --col-inteira: ${col.naVisaoGeral}px !important; --rotulos: ${col.rotulos}px !important; }`);
  let folha = d!.getElementById("dial-titulo-etapa");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-titulo-etapa"; d!.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// cada estado recarrega o quadro: espera e reaplica
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
