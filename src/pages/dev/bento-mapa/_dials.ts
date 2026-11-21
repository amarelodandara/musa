// Painel DialKit do primeiro bloco do bento (o mapa num quadro), no playground /dev/bento-mapa (desenvolvimento).
//   aparência: cada opção é uma classe do Tailwind medida num elemento de prova dentro do quadro; o valor medido vai
//   para uma folha de estilo da bancada. Cores: todas as do tema, sempre.
//   quadro e demonstração: números que viram variáveis CSS (--quadro-*) e data-* do .quadro, lidos pelo script do bloco.
//   textos: título, descrição e link.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
interface Controle { sel: string; props: string[]; opcoes: Opcao[]; variavel?: string }

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema (as classes por extenso estão em ../coluna-rotulos/_dials.ts, para o Tailwind gerar)
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const TEXTO_COR: Opcao[] = ["text-transparente", ...PASSOS.map((p) => `text-${p}`)];
const FUNDO: Opcao[] = ["bg-transparente", ...PASSOS.map((p) => `bg-${p}`)];
const BORDA: Opcao[] = ["border-transparente", ...PASSOS.map((p) => `border-${p}`)];

const c = (sel: string, props: string[], opcoes: Opcao[]): Controle => ({ sel, props, opcoes });
const PESOS: Opcao[] = ["font-light", "font-normal", "font-medium", "font-semibold", "font-bold"];
const FONTES: Opcao[] = ["font-dm-sans", "font-inter", "font-inter-tight", "font-mono"];
const TAMANHOS_TITULO: Opcao[] = ["text-md", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];
const TAMANHOS: Opcao[] = ["text-xs", "text-sm", "text-md", "text-lg", "text-xl"];
const LETRAS: Opcao[] = ["tracking-tighter", "tracking-tight", "tracking-normal", "tracking-wide"];
const CANTOS: Opcao[] = ["rounded-none", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-4xl"];
const COLUNAS: Opcao[] = [["3 de 6", "col-span-3"], ["4 de 6", "col-span-4"], ["5 de 6", "col-span-5"], ["Inteira", "col-span-6"]];
const LARGURA_TEXTO: Opcao[] = ["max-w-xs", "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-none"];

const B = ".func .b-visoes";
const CONTROLES: Record<string, Record<string, Controle>> = {
  bloco: {
    // fundo e borda vão para as variáveis do bloco: a borda é um degradê (cor escolhida em cima → quase branco embaixo)
    fundo: { ...c(B, ["background-color"], FUNDO), variavel: "--ativo-fundo" },
    borda: { ...c(B, ["border-top-color"], BORDA), variavel: "--ativo-borda-topo" },
    cantos: c(B, ["border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"], CANTOS),
    largura: c(B, ["grid-column-start", "grid-column-end"], COLUNAS)
  },
  titulo: {
    fonte: c(`${B} .b-texto h3`, ["font-family"], FONTES),
    tamanho: c(`${B} .b-texto h3`, ["font-size", "line-height"], TAMANHOS_TITULO),
    peso: c(`${B} .b-texto h3`, ["font-weight"], PESOS),
    cor: c(`${B} .b-texto h3`, ["color"], TEXTO_COR),
    espacamentoDeLetras: c(`${B} .b-texto h3`, ["letter-spacing"], LETRAS)
  },
  descricao: {
    tamanho: c(`${B} .b-texto p`, ["font-size", "line-height"], TAMANHOS),
    peso: c(`${B} .b-texto p`, ["font-weight"], PESOS),
    cor: c(`${B} .b-texto p`, ["color"], TEXTO_COR),
    largura: c(`${B} .b-texto p`, ["max-width"], LARGURA_TEXTO)
  },
  link: {
    tamanho: c(`${B} .b-link`, ["font-size"], TAMANHOS),
    peso: c(`${B} .b-link`, ["font-weight"], PESOS),
    cor: c(`${B} .b-link`, ["color"], TEXTO_COR)
  }
};

const valor = (o: Opcao) => (Array.isArray(o) ? o[1] : o);

// mede uma classe num elemento de prova invisível dentro do quadro (cache por documento)
const cache = new WeakMap<Document, Map<string, Record<string, string>>>();
function medir(d: Document, classe: string) {
  let m = cache.get(d);
  if (!m) { m = new Map(); cache.set(d, m); }
  if (!m.has(classe)) {
    // dentro do bento, para col-span valer como no bloco
    const p = d.createElement("div");
    p.className = `${classe} border-solid`;
    p.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
    (d.querySelector(".func .bento") ?? d.body).appendChild(p);
    const cs = getComputedStyle(p), copia: Record<string, string> = {};
    for (let i = 0; i < cs.length; i++) copia[cs[i]] = cs.getPropertyValue(cs[i]);
    p.remove();
    m.set(classe, copia);
  }
  return m.get(classe)!;
}

const doc = () => quadro.contentDocument;
const pronto = (d: Document | null) => !!d?.querySelector(".func .b-visoes .quadro") && d.readyState === "complete";

function padrao(d: Document, ctrl: Controle) {
  const el = d.querySelector<HTMLElement>(ctrl.sel);
  if (!el) return "";
  const atual = getComputedStyle(el);
  const achou = ctrl.opcoes.find((o) => valor(o) !== "" && ctrl.props.every((k) => (medir(d, valor(o))[k] ?? "") === atual.getPropertyValue(k)));
  return achou ? valor(achou) : "";
}

const primeiro = await new Promise<Document>((ok) => {
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});
const bloco0 = primeiro.querySelector<HTMLElement>(".func .b-visoes")!;
const textoDe = (sel: string) => bloco0.querySelector(sel)?.firstChild?.textContent?.trim() ?? "";
void textoDe;
// valores escolhidos no painel (18/11/2026); passam na frente do que o código tem hoje
const TEXTOS0 = {
  titulo: "O nível de detalhes que seu planejamento precisa",
  descricao: "Analise cada etapa visão detalhada ou tenha um entendimento da jornada completa na visão geral. ",
  link: "Abrir o mapa"
};
const PADROES: Record<string, string> = {
  "bloco.fundo": "bg-coral-100", "bloco.borda": "border-coral-200", "bloco.cantos": "rounded-md", "bloco.largura": "",
  "titulo.fonte": "font-dm-sans", "titulo.tamanho": "text-xl", "titulo.peso": "font-bold", "titulo.cor": "text-texto-950", "titulo.espacamentoDeLetras": "",
  "descricao.tamanho": "text-md", "descricao.peso": "font-normal", "descricao.cor": "text-texto-700", "descricao.largura": "max-w-xs",
  "link.tamanho": "text-sm", "link.peso": "font-semibold", "link.cor": "text-carmim-800"
};

const config: Record<string, any> = {
  disposicao: { type: "select", options: [{ value: "cima", label: "Texto em cima, mapa embaixo" }, { value: "lado", label: "Texto à esquerda, mapa à direita" }], default: "lado" },
  textos: {
    _collapsed: false,
    titulo: { type: "text", default: TEXTOS0.titulo },
    descricao: { type: "text", default: TEXTOS0.descricao, placeholder: "Sem descrição" },
    link: { type: "text", default: TEXTOS0.link, placeholder: "Sem link" }
  }
};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: grupo !== "bloco" };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    const def = PADROES[`${grupo}.${nome}`] ?? padrao(primeiro, ctrl);
    ctrl.opcoes = [["Como no código", ""], ...ctrl.opcoes];
    config[grupo][nome] = { type: "select", options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)), default: def };
  }
}
config.bloco.alturaMinima = [360, 360, 1000, 10];
config.bloco.respiro = [28, 12, 56, 2];
// o quadro com o mapa
config.quadro = {
  _collapsed: false,
  // quantos px do mapa cabem na largura do quadro: menos = mapa maior e menos etapas à vista
  // tamanho do quadro dentro do bloco (0 = automático: ocupa o que sobra do texto e a altura toda)
  largura: [54, 0, 100, 1],
  altura: [280, 0, 1000, 10],
  mapaVisivel: [800, 700, 1800, 10],
  escalaMaxima: [0.64, 0.4, 1, 0.01],
  alturaMinima: [460, 240, 800, 10],
  distanciaDoTexto: [26, 0, 64, 2],
  canto: [4, 0, 32, 1],
  borda: { type: "select", options: ["transparente", ...PASSOS], default: "neutro-50" },
  degradeDireitaComeca: [64, 40, 100, 1],
  degradeEmbaixoComeca: [48, 40, 100, 1],
  barraDoTopoSemDegrade: true,
  modoInicial: { type: "select", options: [{ value: "etapa", label: "Visão detalhada" }, { value: "inteiro", label: "Visão geral" }], default: "etapa" }
};
// o cursor que clica sozinho
config.demonstracao = {
  _collapsed: false,
  ligada: true,
  roteiro: { type: "select", options: [{ value: "tudo", label: "Setas e as duas visões" }, { value: "setas", label: "Só as setas" }, { value: "visoes", label: "Só as duas visões" }], default: "tudo" },
  movimentoDoCursor: [750, 300, 1500, 10],
  pausaEntreCliques: [1900, 600, 4000, 100]
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: mapa", config, { id: "musa-bento-mapa", persist: true });

let v = kit.getValues() as Record<string, any>;
let anterior = "";
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  const bloco = d!.querySelector<HTMLElement>(".func .b-visoes")!;
  const q = bloco.querySelector<HTMLElement>(".quadro")!;
  const regras: string[] = [];
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      if (!escolha) continue;
      const m = medir(d!, escolha);
      regras.push(ctrl.variavel
        ? `${ctrl.sel} { ${ctrl.variavel}: ${m[ctrl.props[0]]} !important; }`
        : `${ctrl.sel} { ${ctrl.props.map((k) => `${k}: ${m[k]} !important;`).join(" ")} }`);
    }
  }
  const r = v.bloco.respiro, Q = v.quadro;
  regras.push(`${B} { min-height: ${v.bloco.alturaMinima}px !important; }`);
  regras.push(v.disposicao === "lado"
    ? `${B} { padding: 0 0 0 ${r}px !important; gap: ${r}px !important; } ${B} .b-texto { padding: ${r}px 0 !important; }`
    : `${B} { padding: ${r}px 0 0 ${r}px !important; } ${B} .b-texto { padding-right: ${r}px !important; }`);
  regras.push(`${B} .quadro { --quadro-min: ${Q.alturaMinima}px; --quadro-espaco: ${Q.distanciaDoTexto}px; --quadro-raio: ${Q.canto}px; --quadro-borda: var(--${Q.borda}, transparent);
    --quadro-fade-x: ${Q.degradeDireitaComeca}%; --quadro-fade-y: ${Q.degradeEmbaixoComeca}%; ${Q.barraDoTopoSemDegrade ? "" : "--topo: 0px !important;"} }`);
  const lado = v.disposicao === "lado";
  if (Q.largura > 0) regras.push(lado
    ? `${B} .quadro { flex: 0 0 ${Q.largura}% !important; } ${B} .b-texto { flex: 1 1 0 !important; min-width: 0; }`
    : `${B} .quadro { width: ${Q.largura}%; align-self: flex-end; }`);
  if (Q.altura > 0) regras.push(lado
    ? `${B} .quadro { height: ${Q.altura}px; min-height: 0 !important; align-self: flex-end; }`
    : `${B} .quadro { flex: 0 0 ${Q.altura}px !important; min-height: 0 !important; }`);
  let folha = d!.getElementById("dial-bento-mapa");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-bento-mapa"; d!.head.appendChild(folha); }
  folha.textContent = regras.join("\n");

  bloco.dataset.disposicao = v.disposicao;
  // textos (o link guarda a seta)
  const h3 = bloco.querySelector(".b-texto h3")!, p = bloco.querySelector<HTMLElement>(".b-texto p")!, a = bloco.querySelector<HTMLElement>(".b-link");
  h3.textContent = v.textos.titulo;
  p.textContent = v.textos.descricao; p.hidden = !v.textos.descricao.trim();
  if (a) { a.firstChild!.textContent = v.textos.link.trim() + " "; a.hidden = !v.textos.link.trim(); }

  // quadro e demonstração: data-* lidos pelo script do bloco
  const D = v.demonstracao;
  const dados = { vista: Q.mapaVisivel, escalaMax: Q.escalaMaxima, modoInicial: Q.modoInicial, demo: D.ligada ? "sim" : "nao", roteiro: D.roteiro, cursorMs: D.movimentoDoCursor, pausaMs: D.pausaEntreCliques };
  Object.entries(dados).forEach(([k, x]) => { q.dataset[k] = String(x); });
  // só reinicia o mapa e o roteiro quando algo do mapa mudou (não a cada letra digitada)
  const chave = JSON.stringify([Q.mapaVisivel, Q.escalaMaxima, Q.modoInicial, D.roteiro, v.disposicao, v.bloco.largura]);
  if (chave !== anterior) { anterior = chave; q.dispatchEvent(new Event("musa-bento:ajustar")); }
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (pronto(doc())) { anterior = ""; aplicar(); } else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();

// classes por extenso, para o Tailwind gerar
void ["col-span-3", "col-span-4", "col-span-5", "col-span-6", "rounded-none", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-4xl",
  "max-w-xs", "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-none", "text-xl", "text-2xl", "text-3xl", "text-4xl", "tracking-tighter", "tracking-tight", "tracking-normal", "tracking-wide"];
