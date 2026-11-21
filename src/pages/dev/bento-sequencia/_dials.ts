// Painel DialKit da sequência do bento (um bloco ativo por vez), no playground /dev/bento-sequencia (desenvolvimento).
//   ativo / inativo: números que viram as variáveis CSS do .bento (--ativo-*, --inativo-*), lidas pelo CSS do bloco.
//   borda do ativo: uma cor do tema (todas), ou "Como no código" (cada bloco com a sua).
//   sequência: tempo de cada bloco (data-tempo), lido pelo regente no script do bento.
//   progresso: a barra que mostra quanto falta para o próximo bloco.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (vazio: string) => [{ value: "", label: vazio }, ...PASSOS];

const doc = () => quadro.contentDocument;
const pronto = (d: Document | null) => !!d?.querySelector(".func .bento .bloco-b") && d.readyState === "complete";

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: sequência", {
  sequencia: {
    _collapsed: false,
    ligada: true,
    // segundos que cada bloco fica ativo antes de passar a vez
    tempoPadrao: [4, 1, 15, 0.5],
    tempoDoMapa: [8, 1, 20, 0.5],
    tempoDoDesafio: [11, 1, 20, 0.5],
    transicao: [500, 0, 1200, 20]
  },
  ativo: {
    _collapsed: false,
    escala: [1, 1, 1.05, 0.005],
    sombraDesfoque: [36, 0, 80, 1],
    sombraDistancia: [14, 0, 40, 1],
    sombraOpacidade: [20, 0, 50, 1],
    borda: { type: "select", options: cores("Como no código"), default: "" }
  },
  inativo: {
    _collapsed: false,
    opacidade: [72, 20, 100, 1],
    saturacao: [55, 0, 100, 1],
    escala: [0.99, 0.94, 1, 0.005],
    desfoque: [0, 0, 4, 0.25]
  },
  progresso: {
    _collapsed: false,
    mostrar: true,
    cor: { type: "select", options: PASSOS, default: "coral-500" },
    altura: [3, 1, 8, 1]
  }
}, { id: "musa-bento-sequencia", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  const bento = d!.querySelector<HTMLElement>(".func .bento")!;
  const S = v.sequencia, A = v.ativo, I = v.inativo, P = v.progresso;
  const vars: Record<string, string> = {
    "--estado-ms": `${S.transicao}ms`,
    "--ativo-escala": String(A.escala),
    "--ativo-sombra": A.sombraOpacidade > 0 ? `0 ${A.sombraDistancia}px ${A.sombraDesfoque}px -${Math.round(A.sombraDesfoque / 2.6)}px rgb(0 0 0 / ${A.sombraOpacidade / 100})` : "none",
    "--inativo-opacidade": String(I.opacidade / 100),
    "--inativo-saturacao": String(I.saturacao / 100),
    "--inativo-escala": String(I.escala),
    "--inativo-desfoque": `${I.desfoque}px`,
    "--progresso-cor": `var(--${P.cor})`,
    "--progresso-altura": `${P.altura}px`
  };
  Object.entries(vars).forEach(([k, x]) => bento.style.setProperty(k, x));
  let folha = d!.getElementById("dial-bento-sequencia");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-bento-sequencia"; d!.head.appendChild(folha); }
  folha.textContent = A.borda ? `.func .bento[data-regendo] > .bloco-b[data-ativo] { border-color: var(--${A.borda}) !important; }` : "";
  // tempos (ms) e liga/desliga, lidos pelo regente
  bento.dataset.tempo = String(S.tempoPadrao * 1000);
  d!.querySelector<HTMLElement>(".func .b-visoes")!.dataset.tempo = String(S.tempoDoMapa * 1000);
  d!.querySelector<HTMLElement>(".func .b-desafio")!.dataset.tempo = String(S.tempoDoDesafio * 1000);
  bento.dataset.sequencia = S.ligada ? "sim" : "nao";
  bento.dataset.progresso = P.mostrar ? "sim" : "nao";
}
// tempos e liga/desliga recomeçam a contagem do bloco ativo; o resto é só CSS
let chave = "";
kit.subscribe((novo: Record<string, any>) => {
  v = novo; aplicar();
  const c = JSON.stringify(v.sequencia);
  if (c !== chave) { chave = c; doc()?.querySelector(".func .bento")?.dispatchEvent(new Event("musa-bento:reger")); }
});

// o quadro recarrega: espera e reaplica
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
