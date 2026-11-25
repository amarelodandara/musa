// Painel DialKit "Número da Etapa" (/dev/numero-etapa): tamanho e cor do número, na Etapa aberta e nas fechadas.
// Cada escolha vira uma regra numa folha de estilo dentro do quadro (com !important, para ganhar do CSS do mapa).
// Cores: todas as do tema, sempre. Tamanhos com os nomes do Tailwind (text-xs), que viram as variáveis da marca
// (--tamanho-xs). Para levar ao mapa: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const CORES = ["transparente", "coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const TAMANHOS = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl", "text-2xl", "text-3xl"];

const cor = (t: string) => (t === "transparente" ? "transparent" : `var(--${t})`);
const tamanho = (t: string) => `var(--tamanho-${t.replace("text-", "")})`;
const sel = (opcoes: string[], padrao: string) => ({ type: "select", options: opcoes, default: padrao });

// padrões: o que o mapa usa hoje (25/11/2026)
const config = {
  naAberta: { tamanho: sel(TAMANHOS, "text-xl"), cor: sel(CORES, "coral-300") },
  nasFechadas: { tamanho: sel(TAMANHOS, "text-xs"), cor: sel(CORES, "texto-400") }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Número da Etapa", config as any, { id: "musa-numero-etapa", persist: true });

const css = (v: any) => `
  .mapa .etapa-n { font-size: ${tamanho(v.nasFechadas.tamanho)} !important; color: ${cor(v.nasFechadas.cor)} !important; }
  .mapa[data-modo="etapa"] .etapa[data-aberta] .etapa-n { font-size: ${tamanho(v.naAberta.tamanho)} !important; color: ${cor(v.naAberta.cor)} !important; }`;

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;
let v = kit.getValues();
function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.head || !d.querySelector(".mapa")) return;
  let folha = d.getElementById("dial-numero");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-numero"; d.head.appendChild(folha); }
  folha.textContent = css(v);
}
kit.subscribe((novo: any) => { v = novo; aplicar(); });
quadro.addEventListener("load", aplicar);
aplicar();
