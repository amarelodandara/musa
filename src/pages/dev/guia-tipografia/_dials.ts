// Painel DialKit da tipografia do Guia, só na bancada /dev/guia-tipografia (desenvolvimento).
// Escreve as variáveis --gt-* (src/styles/guia-texto.css) no .guia-texto. Opções em classes do Tailwind (fonte, tamanho,
// peso, cor, espaços em cima e embaixo), traduzidas para o valor do token; espaço entre letras (em), entrelinha e
// largura da coluna em slider, para ajuste fino. Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const texto = document.querySelector<HTMLElement>(".guia-texto")!;

// Todas as cores do tema, por extenso
const TEXTO = ["text-transparente", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const FONTES: Record<string, string> = { "font-dm-sans": "var(--fonte-dm-sans)", "font-inter": "var(--fonte-inter)", "font-inter-tight": "var(--fonte-inter-tight)" };
const TAMANHOS = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl"];
const PESOS: Record<string, string> = { "font-light": "300", "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };
const ANTES = ["mt-0", "mt-1", "mt-2", "mt-3", "mt-4", "mt-6", "mt-8", "mt-10", "mt-12", "mt-14", "mt-16", "mt-20", "mt-24"];
const DEPOIS = ["mb-0", "mb-1", "mb-1.5", "mb-2", "mb-3", "mb-4", "mb-5", "mb-6", "mb-8", "mb-10", "mb-12", "mb-16"];

const cor = (c: string) => { const t = c.replace(/^text-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const tamanho = (c: string) => `var(--tamanho-${c.replace(/^text-/, "")})`;
const espaco = (c: string) => `${parseFloat(c.replace(/^m[tb]-/, "")) * 4}px`;
const sel = (options: string[], def: string) => ({ type: "select" as const, options, default: def });

// um nível de texto: fonte, tamanho, peso, cor, espaço entre letras, entrelinha e os espaços que se aplicam a ele
function nivel(d: { fonte: string; tamanho: string; peso: string; cor: string; tracking: number; entrelinha: number; antes?: string; depois?: string }) {
  const n: Record<string, any> = {
    fonte: sel(Object.keys(FONTES), d.fonte), tamanho: sel(TAMANHOS, d.tamanho), peso: sel(Object.keys(PESOS), d.peso),
    cor: sel(TEXTO, d.cor), espacoEntreLetrasEm: [d.tracking, -0.05, 0.1, 0.005], entrelinha: [d.entrelinha, 0.9, 2, 0.05]
  };
  if (d.antes) n.espacoAntes = sel(ANTES, d.antes);
  if (d.depois) n.espacoDepois = sel(DEPOIS, d.depois);
  return n;
}

// partida: os valores de hoje em src/styles/guia-texto.css
const config = {
  coluna: { larguraRem: [44, 28, 64, 1] as [number, number, number, number] },
  titulo: nivel({ fonte: "font-dm-sans", tamanho: "text-3xl", peso: "font-bold", cor: "text-texto-950", tracking: -0.01, entrelinha: 1.15, depois: "mb-4" }),
  abertura: nivel({ fonte: "font-inter", tamanho: "text-lg", peso: "font-normal", cor: "text-texto-900", tracking: 0, entrelinha: 1.4, depois: "mb-6" }),
  secao: nivel({ fonte: "font-dm-sans", tamanho: "text-2xl", peso: "font-bold", cor: "text-texto-950", tracking: 0, entrelinha: 1.15, antes: "mt-14", depois: "mb-2" }),
  subsecao: nivel({ fonte: "font-dm-sans", tamanho: "text-lg", peso: "font-bold", cor: "text-texto-950", tracking: 0, entrelinha: 1.15, antes: "mt-8", depois: "mb-1.5" }),
  corpo: { ...nivel({ fonte: "font-inter", tamanho: "text-md", peso: "font-normal", cor: "text-texto-900", tracking: 0, entrelinha: 1.5 }),
    entreParagrafos: sel(DEPOIS, "mb-4"), quebraDeLinha: sel(["text-pretty", "text-balance", "text-wrap"], "text-pretty") },
  listas: { recuo: sel(["pl-0", "pl-3", "pl-4", "pl-5", "pl-6", "pl-8"], "pl-5"), entreItens: sel(DEPOIS, "mb-2"), marcador: sel(TEXTO, "text-texto-900") },
  links: { cor: sel(TEXTO, "text-carmim-800"), sublinhadoAfastado: sel(["underline-offset-1", "underline-offset-2", "underline-offset-3", "underline-offset-4"], "underline-offset-3") }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Guia: tipografia", config, { id: "musa-guia-tipografia-v1", persist: true });

const NIVEIS: [string, string][] = [["titulo", "h1"], ["abertura", "lead"], ["secao", "h2"], ["subsecao", "h3"], ["corpo", "p"]];
function aplicar(v: any) {
  const vars: Record<string, string> = { "--gt-largura": `${v.coluna.larguraRem}rem` };
  for (const [grupo, k] of NIVEIS) {
    const n = v[grupo];
    vars[`--gt-${k}-fonte`] = FONTES[n.fonte];
    vars[`--gt-${k}-tamanho`] = tamanho(n.tamanho);
    vars[`--gt-${k}-peso`] = PESOS[n.peso];
    vars[`--gt-${k}-cor`] = cor(n.cor);
    vars[`--gt-${k}-tracking`] = `${n.espacoEntreLetrasEm}em`;
    vars[`--gt-${k}-entrelinha`] = String(n.entrelinha);
    if (n.espacoAntes) vars[`--gt-${k}-antes`] = espaco(n.espacoAntes);
    if (n.espacoDepois) vars[`--gt-${k}-depois`] = espaco(n.espacoDepois);
  }
  vars["--gt-p-entre"] = espaco(v.corpo.entreParagrafos);
  vars["--gt-p-quebra"] = v.corpo.quebraDeLinha.replace("text-", "");
  vars["--gt-li-recuo"] = `${parseFloat(v.listas.recuo.replace("pl-", "")) * 4}px`;
  vars["--gt-li-entre"] = espaco(v.listas.entreItens);
  vars["--gt-li-marcador"] = cor(v.listas.marcador);
  vars["--gt-link-cor"] = cor(v.links.cor);
  vars["--gt-link-sublinhado"] = `${v.links.sublinhadoAfastado.replace("underline-offset-", "")}px`;
  for (const [k, val] of Object.entries(vars)) texto.style.setProperty(k, val);
}
aplicar(kit.getValues());
kit.subscribe((novo: any) => aplicar(novo));
