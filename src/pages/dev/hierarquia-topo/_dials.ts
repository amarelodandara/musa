// Painel DialKit "Hierarquia do topo" (/dev/hierarquia-topo): Fases, topo da Etapa, número, nome e botões.
// Cada escolha vira uma regra numa folha de estilo dentro do quadro (com !important, para ganhar do CSS do mapa).
// Cores: todas as do tema, sempre. Tamanhos e pesos com os nomes do Tailwind (text-sm, font-medium), que viram as
// variáveis da marca (--tamanho-sm, 500). Para levar ao mapa: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const CORES = ["transparente", "coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const FONTES = ["font-inter", "font-inter-tight", "font-dm-sans"];
const TAMANHOS = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl", "text-2xl"];
const PESOS = ["font-light", "font-normal", "font-medium", "font-semibold", "font-bold"];
const LETRAS = ["tracking-tight", "tracking-normal", "tracking-wide", "tracking-wider", "tracking-widest"];
const CAIXA = ["normal-case", "uppercase"];
const CANTOS = ["rounded-none", "rounded-xs", "rounded-sm", "rounded", "rounded-md", "rounded-full"];

const cor = (t: string) => (t === "transparente" ? "transparent" : `var(--${t})`);
const fonte = (f: string) => `var(--fonte-${f.replace("font-", "")})`;
const tamanho = (t: string) => `var(--tamanho-${t.replace("text-", "")})`;
const peso = (p: string) => ({ "font-light": 300, "font-normal": 400, "font-medium": 500, "font-semibold": 600, "font-bold": 700 } as Record<string, number>)[p];
const letras = (l: string) => ({ "tracking-tight": "-0.025em", "tracking-normal": "0em", "tracking-wide": "0.025em", "tracking-wider": "0.05em", "tracking-widest": "0.1em" } as Record<string, string>)[l];
const cantos = (c: string) => ({ "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded": "6px", "rounded-md": "8px", "rounded-full": "999px" } as Record<string, string>)[c];

const sel = (opcoes: string[], padrao: string) => ({ type: "select", options: opcoes, default: padrao });
const corSel = (padrao: string) => sel(CORES, padrao);

// padrões: o que o mapa usa hoje (valores colados e levados ao mapa em 24/11/2026)
const config = {
  fases: {
    fonte: sel(FONTES, "font-inter-tight"),
    tamanho: sel(TAMANHOS, "text-xs"),
    peso: sel(PESOS, "font-normal"),
    caixa: sel(CAIXA, "normal-case"),
    letras: sel(LETRAS, "tracking-wider"),
    respiroVerticalPx: [6, 2, 16, 1],
    texto: corSel("neutro-600"),
    fundo: corSel("transparente"),
    linhaDeBaixo: corSel("neutro-200"),
    textoDaAtiva: corSel("neutro-700"),
    fundoDaAtiva: corSel("coral-100")
  },
  topo: {
    alturaPx: [90, 64, 140, 2],
    fundoDaAberta: corSel("coral-100"),
    fundoDaColunaAberta: corSel("coral-50"),
    fundoDasFechadas: corSel("transparente"),
    linhaDeBaixoDaAberta: corSel("coral-200"),
    linhaDeBaixoDasFechadas: corSel("neutro-200")
  },
  numero: {
    fonte: sel(FONTES, "font-inter"),
    tamanho: sel(TAMANHOS, "text-md"),
    peso: sel(PESOS, "font-normal"),
    corNasFechadas: corSel("texto-600"),
    corNaAberta: corSel("coral-500")
  },
  nomeDaAberta: {
    fonte: sel(FONTES, "font-inter-tight"),
    tamanho: sel(TAMANHOS, "text-lg"),
    peso: sel(PESOS, "font-normal"),
    letras: sel(LETRAS, "tracking-wide"),
    cor: corSel("coral-500")
  },
  nomeDasFechadas: {
    fonte: sel(FONTES, "font-inter"),
    tamanho: sel(TAMANHOS, "text-sm"),
    peso: sel(PESOS, "font-normal"),
    cor: corSel("texto-950")
  },
  botoes: {
    alturaPx: [30, 24, 36, 1],
    tamanhoDoTexto: sel(TAMANHOS, "text-xs"),
    pesoDoTexto: sel(PESOS, "font-normal"),
    cantos: sel(CANTOS, "rounded-sm"),
    fundo: corSel("neutro-50"),
    borda: corSel("coral-200"),
    texto: corSel("coral-900"),
    fundoAoPassar: corSel("transparente")
  }
};
for (const g of Object.keys(config)) (config as any)[g]._collapsed = g !== "fases";

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Hierarquia do topo", config as any, { id: "musa-hierarquia-topo", persist: true });

function css(v: any) {
  const f = v.fases, t = v.topo, n = v.numero, a = v.nomeDaAberta, c = v.nomeDasFechadas, b = v.botoes;
  const E = '.mapa[data-modo="etapa"]';
  return `
  .mapa .fase { font-family: ${fonte(f.fonte)} !important; font-size: ${tamanho(f.tamanho)} !important; font-weight: ${peso(f.peso)} !important;
    text-transform: ${f.caixa === "uppercase" ? "uppercase" : "none"} !important; letter-spacing: ${letras(f.letras)} !important;
    padding-top: ${f.respiroVerticalPx}px !important; padding-bottom: ${f.respiroVerticalPx}px !important;
    color: ${cor(f.texto)} !important; background: ${cor(f.fundo)} !important; border-bottom-color: ${cor(f.linhaDeBaixo)} !important; }
  ${E} .fase[data-ativa] { color: ${cor(f.textoDaAtiva)} !important; background: ${cor(f.fundoDaAtiva)} !important; border-bottom-color: transparent !important; }
  .mapa .etapa-topo { height: ${t.alturaPx}px !important; background: ${cor(t.fundoDasFechadas)} !important; border-bottom-color: ${cor(t.linhaDeBaixoDasFechadas)} !important; }
  .mapa .rotulos .rotulo-etapas { border-bottom-color: ${cor(t.linhaDeBaixoDasFechadas)} !important; }
  ${E} .etapa[data-aberta] .etapa-topo { background: ${cor(t.fundoDaAberta)} !important; border-bottom-color: ${cor(t.linhaDeBaixoDaAberta)} !important; }
  ${E} .etapa[data-aberta] { background: ${cor(t.fundoDaColunaAberta)} !important; }
  .mapa .etapa-n { font-family: ${fonte(n.fonte)} !important; font-size: ${tamanho(n.tamanho)} !important; font-weight: ${peso(n.peso)} !important; color: ${cor(n.corNasFechadas)} !important; }
  ${E} .etapa[data-aberta] .etapa-n { color: ${cor(n.corNaAberta)} !important; }
  ${E} .etapa[data-aberta] .etapa-nome { font-family: ${fonte(a.fonte)} !important; font-size: ${tamanho(a.tamanho)} !important; font-weight: ${peso(a.peso)} !important;
    letter-spacing: ${letras(a.letras)} !important; color: ${cor(a.cor)} !important; }
  .mapa[data-modo="inteiro"] .etapa-nome, ${E} .etapa:not([data-aberta]) .etapa-nome { font-family: ${fonte(c.fonte)} !important; font-size: ${tamanho(c.tamanho)} !important;
    font-weight: ${peso(c.peso)} !important; color: ${cor(c.cor)} !important; }
  .mapa .etapa-acao { height: ${b.alturaPx}px !important; font-size: ${tamanho(b.tamanhoDoTexto)} !important; font-weight: ${peso(b.pesoDoTexto)} !important;
    border-radius: ${cantos(b.cantos)} !important; background: ${cor(b.fundo)} !important; border-color: ${cor(b.borda)} !important; color: ${cor(b.texto)} !important; }
  .mapa .etapa-seta { width: ${b.alturaPx}px !important; }
  .mapa .etapa-acao:hover { background: ${cor(b.fundoAoPassar)} !important; }`;
}

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;
let v = kit.getValues();
function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.head || !d.querySelector(".mapa")) return;
  let folha = d.getElementById("dial-hierarquia");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-hierarquia"; d.head.appendChild(folha); }
  folha.textContent = css(v);
}
kit.subscribe((novo: any) => { v = novo; aplicar(); });
quadro.addEventListener("load", aplicar);
aplicar();
