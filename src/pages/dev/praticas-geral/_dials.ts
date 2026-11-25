// Painel DialKit "Práticas na visão geral" (/dev/praticas-geral): a Prática com a Função (quem executa) na visão geral
// (nenhuma Etapa aberta, todas lado a lado) e um fundo para as Boas práticas, que ajuda a separar o bom do que evitar
// quando o mapa está todo à vista. "Alcance" leva o mesmo desenho às Etapas fechadas, ao lado da aberta.
// Cada escolha vira uma regra numa folha de estilo dentro do quadro (com !important, para ganhar do CSS do mapa).
// Cores: todas as do tema, sempre. Tamanhos, pesos, espaços, entrelinha e tracking com os nomes do Tailwind.
// Para levar ao mapa: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const CORES = ["transparente", "coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const TAMANHOS = ["text-2xs", "text-xs", "text-sm", "text-md"];
const PESOS: Record<string, number> = { "font-light": 300, "font-normal": 400, "font-medium": 500, "font-semibold": 600 };
const ENTRELINHAS: Record<string, number> = { "leading-tight": 1.25, "leading-snug": 1.375, "leading-normal": 1.5, "leading-relaxed": 1.625 };
const TRACKING: Record<string, string> = { "tracking-tight": "-0.025em", "tracking-normal": "0em", "tracking-wide": "0.025em", "tracking-wider": "0.05em" };
// escala de espaço do Tailwind (1 = 4px)
const ESPACOS = ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6"];
const RAIOS: Record<string, string> = { "rounded-none": "0px", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "6px", "rounded-lg": "8px" };
const MARCADORES: Record<string, string> = { "size-3": "12px", "size-3.5": "14px", "size-4": "16px" };

const cor = (t: string) => (t === "transparente" ? "transparent" : `var(--${t})`);
const tamanho = (t: string) => `var(--tamanho-${t.replace("text-", "")})`;
const px = (t: string) => `${parseFloat(t.split("-").pop()!) * 4}px`;
const sel = (opcoes: string[], padrao: string) => ({ type: "select", options: opcoes, default: padrao });
const chaves = (o: Record<string, unknown>) => Object.keys(o);

// padrões: os valores colados e levados ao mapa em 25/11/2026. No mapa, além deles: o fundo vai de borda a borda da coluna,
// o espaço entre as Práticas vira respiro de cada uma, e com fundo a etiqueta da Função clareia (neutro-50) e desce 2px
const config = {
  titulo: { tamanho: sel(TAMANHOS, "text-sm"), peso: sel(chaves(PESOS), "font-medium"), cor: sel(CORES, "texto-950"),
    entrelinha: sel(chaves(ENTRELINHAS), "leading-snug") },
  funcao: { posicao: sel(["embaixo", "em cima", "escondida"], "em cima"), tamanho: sel(TAMANHOS, "text-xs"), peso: sel(chaves(PESOS), "font-normal"),
    cor: sel(CORES, "neutro-600"), fundo: sel(CORES, "neutro-100"), tracking: sel(chaves(TRACKING), "tracking-normal"),
    distancia: sel(ESPACOS.map((e) => `mt-${e}`), "mt-1") },
  lista: { entre: sel(ESPACOS.map((e) => `gap-${e}`), "gap-4"), marcador: sel(chaves(MARCADORES), "size-3.5") },
  boa: { fundo: sel(CORES, "coral-50"), borda: sel(CORES, "transparente"), respiro: sel(ESPACOS.map((e) => `p-${e}`), "p-0"),
    raio: sel(chaves(RAIOS), "rounded-none"), marcador: sel(CORES, "coral-300") },
  evitar: { fundo: sel(CORES, "transparente"), borda: sel(CORES, "transparente"), marcador: sel(CORES, "neutro-300") },
  alcance: { nasFechadas: sel(["só o fundo", "tudo", "nada"], "só o fundo") }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Práticas na visão geral", config as any, { id: "musa-praticas-geral-v2", persist: true });

const GERAL = `.mapa[data-modo="inteiro"]`;
const FECHADAS = `.mapa[data-modo="etapa"] .etapa:not([data-aberta])`;
function css(v: any) {
  const T = v.titulo, F = v.funcao, L = v.lista, B = v.boa, E = v.evitar;
  // desenho da Prática (título, Função, lista, marcador)
  const desenho = (A: string) => `
    ${A} .praticas { gap: ${px(L.entre)} !important; }
    ${A} .pratica { grid-template-columns: ${MARCADORES[L.marcador]} 1fr !important; }
    ${A} .marcador { width: ${MARCADORES[L.marcador]} !important; height: ${MARCADORES[L.marcador]} !important; }
    ${A} .pratica-titulo { font-size: ${tamanho(T.tamanho)} !important; font-weight: ${PESOS[T.peso]} !important; color: ${cor(T.cor)} !important;
      line-height: ${ENTRELINHAS[T.entrelinha]} !important; }
    ${A} .pratica-funcao { display: ${F.posicao === "escondida" ? "none" : "block"} !important; justify-self: start; font-size: ${tamanho(F.tamanho)} !important;
      font-weight: ${PESOS[F.peso]} !important; color: ${cor(F.cor)} !important; letter-spacing: ${TRACKING[F.tracking]} !important; line-height: 1.5 !important;
      background: ${cor(F.fundo)} !important; padding: ${F.fundo === "transparente" ? "0" : "0 6px"} !important; border-radius: 2px;
      margin: ${F.posicao === "em cima" ? `0 0 ${px(F.distancia)}` : `${px(F.distancia)} 0 0`} !important; }
    ${F.posicao === "em cima" ? `${A} .pratica-funcao { grid-row: 1 !important; grid-column: 2 !important; }
    ${A} .pratica-titulo, ${A} .marcador { grid-row: 2 !important; }` : ""}`;
  // o fundo e a borda de cada tipo, e a cor do rosto
  const fundo = (A: string) => `
    ${A} .pratica { padding: ${px(B.respiro)} !important; border-radius: ${RAIOS[B.raio]} !important; }
    ${A} .pratica[data-tipo="boa"] { background: ${cor(B.fundo)} !important; box-shadow: inset 0 0 0 1px ${cor(B.borda)} !important; }
    ${A} .pratica[data-tipo="evitar"] { background: ${cor(E.fundo)} !important; box-shadow: inset 0 0 0 1px ${cor(E.borda)} !important; }
    ${A} .pratica[data-tipo="boa"] .marcador { background: ${cor(B.marcador)} !important; }
    ${A} .pratica[data-tipo="evitar"] .marcador { background: ${cor(E.marcador)} !important; }`;
  const alc = v.alcance.nasFechadas;
  return desenho(GERAL) + fundo(GERAL) + (alc === "tudo" ? desenho(FECHADAS) + fundo(FECHADAS) : alc === "só o fundo" ? fundo(FECHADAS) : "");
}

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;
let v = kit.getValues();
function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.head || !d.querySelector(".mapa")) return;
  let folha = d.getElementById("dial-praticas-geral");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-praticas-geral"; d.head.appendChild(folha); }
  folha.textContent = css(v);
}
// ao carregar: rola o quadro até a linha das Práticas (um pouco acima, para ver o fim dos Pontos de contato)
function rolar() {
  const d = quadro.contentDocument, alvo = d?.querySelector(".rotulo-praticas") as HTMLElement | null;
  if (alvo) d!.scrollingElement!.scrollTop = alvo.getBoundingClientRect().top + d!.scrollingElement!.scrollTop - 140;
}
kit.subscribe((novo: any) => { v = novo; aplicar(); });
quadro.addEventListener("load", () => { aplicar(); setTimeout(rolar, 400); });
aplicar();
