// Painel DialKit do playground de cores das Fases (/dev/cores-fases). Três combinações (A, B, C).
// Inativo: tudo neutro (um tom para a célula da Fase, outro para o topo das Etapas). Ativo: a Fase da Etapa aberta e o
// topo dela ganham uma família da marca, no degrau escolhido; a coluna aberta ganha um tom bem claro da mesma família.
// Todas as opções são tokens do tema. Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const FAMILIAS = ["coral", "carmim", "neutro"];
const DEGRAUS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
const NEUTROS = ["50", "100", "200", "300", "400"];
const TEXTOS = ["texto-950", "texto-900", "texto-700", "texto-600", "texto-50", "neutro-50"];
const sel = (options: string[], d: string) => ({ type: "select", options, default: d });

const combo = (familia: string, fase: string, topo: string, textoFase: string, textoTopo: string, faseNeutro = "200") => ({
  inativo: { _collapsed: true, faseNeutro: sel(NEUTROS, faseNeutro), topoNeutro: sel(NEUTROS, "100"), texto: sel(TEXTOS, "texto-700") },
  ativo: {
    familia: sel(FAMILIAS, familia),
    degrauDaFase: sel(DEGRAUS, fase),
    degrauDoTopo: sel(DEGRAUS, topo),
    degrauDaColuna: sel(["50", "100", "200"], "100"),
    textoDaFase: sel(TEXTOS, textoFase),
    textoDoTopo: sel(TEXTOS, textoTopo)
  }
});

createDialRoot({ position: "top-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Cores das fases", {
  // A: a escolhida (no mapa)
  a: combo("coral", "300", "300", "texto-950", "texto-950", "100"),
  b: combo("carmim", "700", "600", "texto-50", "texto-50"),
  c: combo("coral", "300", "200", "texto-950", "texto-950")
}, { id: "musa-cores-fases-v2", persist: true });

const v = (n: string) => `var(--${n})`;
function aplicar(val: Record<string, any>) {
  for (const c of ["a", "b", "c"]) {
    const { inativo: i, ativo: a } = val[c];
    const el = document.querySelector<HTMLElement>(`[data-combo="${c}"]`)!;
    // coral não tem 50: a coluna cai no 100
    const col = a.familia === "coral" && a.degrauDaColuna === "50" ? "100" : a.degrauDaColuna;
    const props: Record<string, string> = {
      "--i-fase": v(`neutro-${i.faseNeutro}`), "--i-topo": v(`neutro-${i.topoNeutro}`), "--i-texto": v(i.texto),
      "--a-fase": v(`${a.familia}-${a.degrauDaFase}`), "--a-topo": v(`${a.familia}-${a.degrauDoTopo}`),
      "--a-coluna": v(`${a.familia}-${col}`), "--a-texto-fase": v(a.textoDaFase), "--a-texto-topo": v(a.textoDoTopo)
    };
    for (const [k, x] of Object.entries(props)) el.style.setProperty(k, x);
  }
}
aplicar(kit.getValues());
kit.subscribe(aplicar);
