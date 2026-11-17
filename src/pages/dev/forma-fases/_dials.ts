// Painel DialKit do playground /dev/forma-fases: a ponta direita da célula de Fase ("Antes da visita" etc.).
// Reta (como hoje), seta ou redonda. A ponta é um ::after com o mesmo fundo da célula, que avança sobre a vizinha.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Forma das fases", {
  forma: { type: "select", options: [{ value: "reta", label: "Reta (hoje)" }, { value: "seta", label: "Seta" }, { value: "seta-suave", label: "Seta arredondada" }, { value: "redonda", label: "Redonda" }], default: "seta-suave" },
  tamanhoDaPontaPx: [24, 4, 32, 1],
  emQuais: { type: "select", options: [{ value: "ativa", label: "Só na ativa" }, { value: "todas", label: "Em todas" }], default: "ativa" },
  naUltima: { type: "select", options: [{ value: "nao", label: "Sem ponta (fim do mapa)" }, { value: "sim", label: "Com ponta" }], default: "nao" }
}, { id: "musa-forma-fases-v1", persist: true });

const RECORTE: Record<string, string> = {
  seta: "polygon(0 0, 100% 50%, 0 100%)",
  "seta-suave": "polygon(0 0, 40% 0, 100% 45%, 100% 55%, 40% 100%, 0 100%)",
  redonda: "ellipse(100% 50% at 0 50%)"
};

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.querySelector(".mapa .fase")) return;
  let folha = d.getElementById("dial-forma") as HTMLStyleElement | null;
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-forma"; d.head.appendChild(folha); }
  if (v.forma === "reta") { folha.textContent = ""; return; }
  const alvo = (v.emQuais === "ativa" ? '.mapa[data-modo="etapa"] .fase[data-ativa]' : ".mapa .fase") + (v.naUltima === "sim" ? "" : ":not(:last-child)");
  folha.textContent = `
    .mapa .fase { position: relative; }
    ${alvo}::after { content: ""; position: absolute; z-index: 1; top: 0; bottom: 0; right: -${v.tamanhoDaPontaPx}px; width: ${v.tamanhoDaPontaPx}px;
      background: inherit; clip-path: ${RECORTE[v.forma]}; transition: background-color 200ms ease; }
    /* a linha da direita some onde a ponta começa, para a forma sair da célula sem corte */
    ${alvo} { border-right-color: transparent; }
    /* a Fase seguinte abre espaço para a ponta não encostar no texto */
    ${v.emQuais === "ativa" ? '.mapa[data-modo="etapa"] .fase[data-ativa] + .fase' : ".mapa .fase + .fase"} { padding-left: ${12 + v.tamanhoDaPontaPx}px; }`;
}
kit.subscribe((n: Record<string, any>) => { v = n; aplicar(); });
function vigiar() { if (quadro.contentDocument?.querySelector(".mapa .fase") && quadro.contentDocument.readyState === "complete") aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
