// Painel DialKit do experimento /dev/bento-desafio-cartoes (desenvolvimento): o rolo de cartões de pensamento no bloco 2.
// O cartão é o do mapa (.desafio-cartao em mapa.astro) e não muda aqui; aqui ficam o ritmo e a profundidade do rolo.
//   ritmo: de quanto em quanto tempo entra um cartão, quanto dura o movimento e com que curva.
//   profundidade: a cada posição para o fundo, quanto o cartão sobe, encolhe, desfoca e apaga.
// Tudo vira variável CSS (--rolo-*) no .rolo, e o intervalo vira data-intervalo (lido pelo script do bloco).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

const CURVAS = [
  { value: "cubic-bezier(0.22, 1, 0.36, 1)", label: "Sai rápido, assenta devagar" },
  { value: "cubic-bezier(0.23, 1, 0.32, 1)", label: "Ease-out forte (o do mapa)" },
  { value: "cubic-bezier(0.77, 0, 0.175, 1)", label: "Ease-in-out forte" },
  { value: "cubic-bezier(0.65, 0, 0.35, 1)", label: "Ease-in-out suave" },
  { value: "ease-out", label: "Ease-out simples" }
];

// valores de partida: os que estão em Funcionalidades.astro hoje
const config: Record<string, any> = {
  ritmo: {
    _collapsed: false,
    intervalo: [1400, 500, 4000, 50],
    duracaoDoMovimento: [700, 200, 1600, 20],
    curva: { type: "select", options: CURVAS, default: CURVAS[0].value }
  },
  profundidade: {
    _collapsed: false,
    sobePorPosicao: [16, 0, 40, 1],
    encolhePorPosicao: [0.07, 0, 0.2, 0.005],
    desfoquePorPosicao: [0.9, 0, 4, 0.1],
    apagaPorPosicao: [0.2, 0.05, 0.5, 0.01]
  },
  cartao: {
    _collapsed: false,
    largura: [240, 160, 340, 10]
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: desafio em cartões", config, { id: "musa-bento-desafio-cartoes", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const rolo = quadro.contentDocument?.querySelector<HTMLElement>(".func .b-desafio .rolo");
  if (!rolo) return;
  const { ritmo: R, profundidade: P, cartao: C } = v;
  const vars: Record<string, string> = {
    "--rolo-ms": `${R.duracaoDoMovimento}ms`, "--rolo-curva": R.curva,
    "--rolo-passo": `${P.sobePorPosicao}px`, "--rolo-escala": String(P.encolhePorPosicao),
    "--rolo-desfoque": `${P.desfoquePorPosicao}px`, "--rolo-apagar": String(P.apagaPorPosicao)
  };
  Object.entries(vars).forEach(([k, x]) => rolo.style.setProperty(k, x));
  rolo.dataset.intervalo = String(R.intervalo);
  rolo.style.setProperty("--rolo-largura", `${C.largura}px`);
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".func .b-desafio .rolo")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
