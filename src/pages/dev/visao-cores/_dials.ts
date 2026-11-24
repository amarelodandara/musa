// Painel DialKit das cores do seletor de visão (Visão detalhada / Visão geral) no topo do mapa. Só em desenvolvimento.
// O quadro mostra a própria página /mapa, recortada na barra; o painel troca classes do Tailwind nos elementos dentro dele.
// Cada lista tem todas as cores do tema, por extenso, para o Tailwind gerar. Para levar ao código: Copy parameters,
// colar na conversa com o Claude (o título do painel é "Cores da visão").
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const FUNDO = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const BORDA = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];
const TEXTO = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const TEXTO_AO_PASSAR = ["hover:text-transparente", "hover:text-coral-50", "hover:text-coral-100", "hover:text-coral-200", "hover:text-coral-300", "hover:text-coral-400", "hover:text-coral-500", "hover:text-coral-600", "hover:text-coral-700", "hover:text-coral-800", "hover:text-coral-900", "hover:text-carmim-100", "hover:text-carmim-200", "hover:text-carmim-300", "hover:text-carmim-400", "hover:text-carmim-500", "hover:text-carmim-600", "hover:text-carmim-700", "hover:text-carmim-800", "hover:text-carmim-900", "hover:text-carmim-950", "hover:text-neutro-50", "hover:text-neutro-100", "hover:text-neutro-200", "hover:text-neutro-300", "hover:text-neutro-400", "hover:text-neutro-500", "hover:text-neutro-600", "hover:text-neutro-700", "hover:text-neutro-800", "hover:text-neutro-900", "hover:text-neutro-950", "hover:text-texto-950", "hover:text-texto-900", "hover:text-texto-700", "hover:text-texto-600", "hover:text-texto-400", "hover:text-texto-50"];
const FUNDO_AO_PASSAR = ["hover:bg-transparente", "hover:bg-coral-50", "hover:bg-coral-100", "hover:bg-coral-200", "hover:bg-coral-300", "hover:bg-coral-400", "hover:bg-coral-500", "hover:bg-coral-600", "hover:bg-coral-700", "hover:bg-coral-800", "hover:bg-coral-900", "hover:bg-carmim-100", "hover:bg-carmim-200", "hover:bg-carmim-300", "hover:bg-carmim-400", "hover:bg-carmim-500", "hover:bg-carmim-600", "hover:bg-carmim-700", "hover:bg-carmim-800", "hover:bg-carmim-900", "hover:bg-carmim-950", "hover:bg-neutro-50", "hover:bg-neutro-100", "hover:bg-neutro-200", "hover:bg-neutro-300", "hover:bg-neutro-400", "hover:bg-neutro-500", "hover:bg-neutro-600", "hover:bg-neutro-700", "hover:bg-neutro-800", "hover:bg-neutro-900", "hover:bg-neutro-950", "hover:bg-texto-950", "hover:bg-texto-900", "hover:bg-texto-700", "hover:bg-texto-600", "hover:bg-texto-400", "hover:bg-texto-50"];
const TEXTO_ESCOLHIDA = ["data-pressed:text-transparente", "data-pressed:text-coral-50", "data-pressed:text-coral-100", "data-pressed:text-coral-200", "data-pressed:text-coral-300", "data-pressed:text-coral-400", "data-pressed:text-coral-500", "data-pressed:text-coral-600", "data-pressed:text-coral-700", "data-pressed:text-coral-800", "data-pressed:text-coral-900", "data-pressed:text-carmim-100", "data-pressed:text-carmim-200", "data-pressed:text-carmim-300", "data-pressed:text-carmim-400", "data-pressed:text-carmim-500", "data-pressed:text-carmim-600", "data-pressed:text-carmim-700", "data-pressed:text-carmim-800", "data-pressed:text-carmim-900", "data-pressed:text-carmim-950", "data-pressed:text-neutro-50", "data-pressed:text-neutro-100", "data-pressed:text-neutro-200", "data-pressed:text-neutro-300", "data-pressed:text-neutro-400", "data-pressed:text-neutro-500", "data-pressed:text-neutro-600", "data-pressed:text-neutro-700", "data-pressed:text-neutro-800", "data-pressed:text-neutro-900", "data-pressed:text-neutro-950", "data-pressed:text-texto-950", "data-pressed:text-texto-900", "data-pressed:text-texto-700", "data-pressed:text-texto-600", "data-pressed:text-texto-400", "data-pressed:text-texto-50"];
const FUNDO_ESCOLHIDA = ["data-pressed:bg-transparente", "data-pressed:bg-coral-50", "data-pressed:bg-coral-100", "data-pressed:bg-coral-200", "data-pressed:bg-coral-300", "data-pressed:bg-coral-400", "data-pressed:bg-coral-500", "data-pressed:bg-coral-600", "data-pressed:bg-coral-700", "data-pressed:bg-coral-800", "data-pressed:bg-coral-900", "data-pressed:bg-carmim-100", "data-pressed:bg-carmim-200", "data-pressed:bg-carmim-300", "data-pressed:bg-carmim-400", "data-pressed:bg-carmim-500", "data-pressed:bg-carmim-600", "data-pressed:bg-carmim-700", "data-pressed:bg-carmim-800", "data-pressed:bg-carmim-900", "data-pressed:bg-carmim-950", "data-pressed:bg-neutro-50", "data-pressed:bg-neutro-100", "data-pressed:bg-neutro-200", "data-pressed:bg-neutro-300", "data-pressed:bg-neutro-400", "data-pressed:bg-neutro-500", "data-pressed:bg-neutro-600", "data-pressed:bg-neutro-700", "data-pressed:bg-neutro-800", "data-pressed:bg-neutro-900", "data-pressed:bg-neutro-950", "data-pressed:bg-texto-950", "data-pressed:bg-texto-900", "data-pressed:bg-texto-700", "data-pressed:bg-texto-600", "data-pressed:bg-texto-400", "data-pressed:bg-texto-50"];
const SOMBRA = ["data-pressed:shadow-none", "data-pressed:shadow-xs", "data-pressed:shadow-sm"];

const quadro = document.querySelector(".palco iframe") as HTMLIFrameElement;
const TRILHA = '.mapa-topo [role="group"][aria-label="Como ver o mapa"]';
const OPCOES = `${TRILHA} > button`;
const CONTROLES: Record<string, { sel: string; opcoes: string[]; borda?: boolean }> = {
  fundoDaTrilha: { sel: TRILHA, opcoes: FUNDO },
  bordaDaTrilha: { sel: TRILHA, opcoes: ["border-transparente", ...BORDA.slice(1)], borda: true },
  textoDaOpcao: { sel: OPCOES, opcoes: TEXTO },
  textoAoPassar: { sel: OPCOES, opcoes: TEXTO_AO_PASSAR },
  fundoAoPassar: { sel: OPCOES, opcoes: FUNDO_AO_PASSAR },
  textoDaEscolhida: { sel: OPCOES, opcoes: TEXTO_ESCOLHIDA },
  fundoDaEscolhida: { sel: OPCOES, opcoes: FUNDO_ESCOLHIDA },
  sombraDaEscolhida: { sel: OPCOES, opcoes: SOMBRA }
};

const doc = () => quadro.contentDocument;
const hidratado = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactProps"));
const pronto = (d: Document | null) => { const b = d?.querySelectorAll(OPCOES); return !!b && b.length > 0 && [...b].every(hidratado); };
const esperar = () => new Promise<Document>((ok) => { const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100); });
const primeiro = await esperar();

// padrão: a classe que o código usa hoje
const padrao = (d: Document, c: { sel: string; opcoes: string[] }) => {
  const el = d.querySelector(c.sel);
  return c.opcoes.find((o) => el?.classList.contains(o)) ?? (c.opcoes.includes("border-transparente") ? "border-transparente" : c.opcoes[0]);
};
const config: Record<string, any> = {};
// rótulo curto: só o token (coral-100), sem o prefixo da classe
const curto = (o: string) => o.replace(/^(hover:|data-pressed:)?(bg|text|border|shadow)-/, "");
for (const [nome, c] of Object.entries(CONTROLES)) config[nome] = { type: "select", options: c.opcoes.map((o) => ({ value: o, label: curto(o) })), default: padrao(primeiro, c) };

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Cores da visão", config, { id: "musa-visao-cores", persist: true });
let v = kit.getValues() as Record<string, string>;
let aplicando = false;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  aplicando = true;
  for (const [nome, c] of Object.entries(CONTROLES)) {
    d!.querySelectorAll(c.sel).forEach((el) => {
      c.opcoes.forEach((o) => el.classList.remove(o));
      el.classList.add(v[nome]);
      if (c.borda) el.classList.add("border", "border-solid");
    });
  }
  queueMicrotask(() => { aplicando = false; });
}
kit.subscribe((novo: Record<string, string>) => { v = novo; aplicar(); });
// o React redesenha as opções ao trocar de visão: reaplica
function vigiar() {
  const d = doc();
  if (!pronto(d)) { setTimeout(vigiar, 100); return; }
  aplicar();
  new MutationObserver(() => { if (!aplicando) requestAnimationFrame(aplicar); })
    .observe(d!.querySelector(TRILHA)!, { subtree: true, attributes: true, attributeFilter: ["class", "data-pressed", "aria-pressed"] });
}
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
