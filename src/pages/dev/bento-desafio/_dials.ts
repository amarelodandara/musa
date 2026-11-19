// Painel DialKit do segundo bloco do bento (Nível de desafio), no playground /dev/bento-desafio (desenvolvimento).
// O sistema dos blocos (cantos, borda em degradê, cores de ativo/inativo, tipografia do título e da descrição)
// vem do primeiro bloco e não está aqui. Aqui: textos, tamanho no grid, a linha de giz e o ritmo da animação.
//   Cores: todas as do tema, sempre (classes do Tailwind, escritas como a cor do token).
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
const COLUNAS = [{ value: "2", label: "2 de 6" }, { value: "3", label: "3 de 6" }, { value: "4", label: "4 de 6" }, { value: "6", label: "Inteira" }];
const LINHAS = [{ value: "1", label: "1 linha" }, { value: "2", label: "2 linhas" }];
const select = (options: any[], def: string) => ({ type: "select", options, default: def });

// valores de partida: os que estão em Funcionalidades.astro hoje
const config: Record<string, any> = {
  textos: {
    _collapsed: false,
    titulo: { type: "text", default: "Entenda onde a visita pesa para o professor" },
    descricao: { type: "text", default: "Seja proativo se informando das preocupações que acompanham seu visitante em cada etapa da jornada.", placeholder: "Sem descrição" }
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
    linha: select(cores("stroke"), "stroke-carmim-600"),
    espessuraDaLinha: [3, 1, 6, 0.5]
  },
  // a linha corre à mão livre da primeira etapa à última: ondas = quantas vezes a mão acelera e hesita;
  // hesitação = quanto ela diminui nessas horas (0 = ritmo constante, só suave no começo e no fim)
  animacao: {
    _collapsed: false,
    duracaoDoTraco: [3600, 1200, 8000, 100],
    ondas: [3, 1, 6, 1],
    hesitacao: [0.6, 0, 0.9, 0.05]
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
  const { bloco: K, grafico: G, animacao: M } = v;
  const regras = [
    `${B} { grid-column: span ${K.largura} !important; grid-row: span ${K.altura} !important; min-height: ${K.alturaMinima}px; padding: ${K.respiro}px !important; gap: ${K.espacoEntrePartes}px !important; }`,
    `${B} .trecho { stroke: ${cor(G.linha)} !important; stroke-width: ${G.espessuraDaLinha} !important; }`
  ];
  let folha = d.getElementById("dial-bento-desafio");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-bento-desafio"; d.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
  const g = bloco.querySelector<HTMLElement>(".desafio-grafico");
  if (g) {
    g.dataset.duracao = String(M.duracaoDoTraco);
    g.dataset.ondas = String(M.ondas);
    g.dataset.hesitacao = String(M.hesitacao);
  }
  const h3 = bloco.querySelector(".b-texto h3"), p = bloco.querySelector<HTMLElement>(".b-texto p");
  if (h3) h3.textContent = v.textos.titulo;
  if (p) { p.textContent = v.textos.descricao; p.hidden = !v.textos.descricao.trim(); }
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(B)) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
