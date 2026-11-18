// Painel DialKit do segundo bloco do bento (Nível de desafio), no playground /dev/bento-desafio (desenvolvimento).
// O sistema dos blocos (cantos, borda em degradê, cores de ativo/inativo, tipografia do título e da descrição)
// vem do primeiro bloco e não está aqui. Aqui: textos, tamanho no grid, o gráfico de giz e a caixa da fala.
//   Cores: todas as do tema, sempre (classes do Tailwind, escritas como a cor do token).
//   Cantos e tamanhos de texto: classes do Tailwind, escritas como o valor do tema.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => {
  const token = classe.replace(/^(border|text|bg|stroke|fill)-/, "");
  return token === "transparente" ? "transparent" : `var(--${token})`;
};
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-sm": "0.25rem", "rounded-md": "0.375rem", "rounded-lg": "0.5rem", "rounded-xl": "0.75rem", "rounded-2xl": "1rem" };
const TAMANHOS = ["text-xs", "text-sm", "text-md", "text-lg", "text-xl"];
const tamanho = (classe: string) => `var(--tamanho-${classe.replace("text-", "")})`;
const COLUNAS = [{ value: "2", label: "2 de 6" }, { value: "3", label: "3 de 6" }, { value: "4", label: "4 de 6" }, { value: "6", label: "Inteira" }];
const LINHAS = [{ value: "1", label: "1 linha" }, { value: "2", label: "2 linhas" }];
const select = (options: any[], def: string) => ({ type: "select", options, default: def });

// valores de partida: os que estão em Funcionalidades.astro hoje
const config: Record<string, any> = {
  textos: {
    _collapsed: false,
    titulo: { type: "text", default: "Onde a visita pesa para o professor" },
    descricao: { type: "text", default: "O nível de desafio de cada etapa mostra onde a escola precisa mais do museu.", placeholder: "Sem descrição" }
  },
  bloco: {
    _collapsed: false,
    largura: select(COLUNAS, "2"),
    altura: select(LINHAS, "2"),
    alturaMinima: [0, 0, 900, 10],
    respiro: [28, 12, 56, 2],
    espacoEntrePartes: [20, 0, 56, 2]
  },
  grafico: {
    _collapsed: false,
    linha: select(cores("stroke"), "stroke-carmim-800"),
    espessuraDaLinha: [2.5, 1, 6, 0.5],
    trilhas: select(cores("stroke"), "stroke-neutro-300"),
    nomesDosNiveis: select(cores("fill"), "fill-texto-600"),
    numeros: select(cores("fill"), "fill-texto-400"),
    numeroDaEtapaAtiva: select(cores("fill"), "fill-carmim-800")
  },
  fala: {
    _collapsed: false,
    mostrar: true,
    fundo: select(cores("bg"), "bg-neutro-100"),
    borda: select(cores("border"), "border-neutro-200"),
    cantos: select(Object.keys(CANTOS), "rounded-md"),
    respiro: [16, 8, 32, 2],
    tamanhoDaCitacao: select(TAMANHOS, "text-md"),
    corDaCitacao: select(cores("text"), "text-texto-950"),
    corDaLegenda: select(cores("text"), "text-texto-600")
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: desafio", config, { id: "musa-bento-desafio", persist: true });

const B = ".func .b-desafio";
let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = quadro.contentDocument;
  const bloco = d?.querySelector<HTMLElement>(B);
  if (!d || !bloco) return;
  const { bloco: K, grafico: G, fala: F } = v;
  const regras = [
    `${B} { grid-column: span ${K.largura} !important; grid-row: span ${K.altura} !important; min-height: ${K.alturaMinima}px; padding: ${K.respiro}px !important; gap: ${K.espacoEntrePartes}px !important; }`,
    `${B} .trecho { stroke: ${cor(G.linha)} !important; stroke-width: ${G.espessuraDaLinha} !important; }`,
    `${B} .trilha line { stroke: ${cor(G.trilhas)} !important; }`,
    `${B} .trilha text { fill: ${cor(G.nomesDosNiveis)} !important; }`,
    `${B} .ponto-n { fill: ${cor(G.numeros)} !important; }`,
    `${B} .ponto[data-ativo] .ponto-n { fill: ${cor(G.numeroDaEtapaAtiva)} !important; }`,
    `${B} .fala { display: ${F.mostrar ? "block" : "none"} !important; background: ${cor(F.fundo)} !important; border-color: ${cor(F.borda)} !important; border-radius: ${CANTOS[F.cantos]} !important; padding: ${F.respiro}px !important; }`,
    `${B} .fala blockquote { font-size: ${tamanho(F.tamanhoDaCitacao)} !important; color: ${cor(F.corDaCitacao)} !important; }`,
    `${B} .fala figcaption { color: ${cor(F.corDaLegenda)} !important; }`
  ];
  let folha = d.getElementById("dial-bento-desafio");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-bento-desafio"; d.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
  const h3 = bloco.querySelector(".b-texto h3"), p = bloco.querySelector<HTMLElement>(".b-texto p");
  if (h3) h3.textContent = v.textos.titulo;
  if (p) { p.textContent = v.textos.descricao; p.hidden = !v.textos.descricao.trim(); }
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(B)) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
