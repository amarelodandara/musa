// Painel DialKit da chamada final, só na bancada /dev/chamada-final (desenvolvimento).
// O componente lê variáveis --cf-* e --grifo-* (padrão de hoje no fallback); o painel escreve as escolhidas na seção.
// Opções em classes do Tailwind (tamanhos, pesos, cores, espaços), traduzidas para o valor do token;
// o que não tem passo em classe (altura em svh, largura da frase em ch, entrelinha, altura do grifo) vai em slider.
// "Desenhar o grifo de novo" repete a animação de entrada. Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const secao = document.querySelector<HTMLElement>("[data-chamada-final]")!;

// Todas as cores do tema, por extenso (o Tailwind gera as classes que aparecem escritas)
const TEXTO = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const FUNDO = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const BORDA = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];
const TRACO = ["stroke-transparente", "stroke-coral-50", "stroke-coral-100", "stroke-coral-200", "stroke-coral-300", "stroke-coral-400", "stroke-coral-500", "stroke-coral-600", "stroke-coral-700", "stroke-coral-800", "stroke-coral-900", "stroke-carmim-100", "stroke-carmim-200", "stroke-carmim-300", "stroke-carmim-400", "stroke-carmim-500", "stroke-carmim-600", "stroke-carmim-700", "stroke-carmim-800", "stroke-carmim-900", "stroke-carmim-950", "stroke-neutro-50", "stroke-neutro-100", "stroke-neutro-200", "stroke-neutro-300", "stroke-neutro-400", "stroke-neutro-500", "stroke-neutro-600", "stroke-neutro-700", "stroke-neutro-800", "stroke-neutro-900", "stroke-neutro-950", "stroke-texto-950", "stroke-texto-900", "stroke-texto-700", "stroke-texto-600", "stroke-texto-400", "stroke-texto-50"];

// classe → valor
const cor = (c: string) => { const t = c.replace(/^(text|bg|border|stroke)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const tamanho = (c: string) => `var(--tamanho-${c.replace(/^text-/, "")})`;
const espaco = (c: string) => `${parseFloat(c.replace(/^[a-z]+-/, "")) * 0.25}rem`;
const PESO: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };
const FONTE: Record<string, string> = { "font-dm-sans": "var(--fonte-dm-sans)", "font-inter": "var(--fonte-inter)", "font-inter-tight": "var(--fonte-inter-tight)" };
const TRACKING: Record<string, string> = { "tracking-tighter": "-0.05em", "tracking-tight": "-0.025em", "tracking-normal": "0em", "tracking-wide": "0.025em" };
const ALINHAR: Record<string, [string, string]> = { "items-center text-center": ["center", "center"], "items-start text-left": ["flex-start", "left"] };

const config = {
  secao: {
    alturaSvh: [80, 40, 100, 1] as [number, number, number, number],
    respiroVertical: { type: "select" as const, options: ["py-8", "py-12", "py-16", "py-18", "py-20", "py-24", "py-32"], default: "py-8" },
    alinhamento: { type: "select" as const, options: Object.keys(ALINHAR), default: "items-center text-center" },
    fundo: { type: "select" as const, options: FUNDO, default: "bg-transparente" },
    linhaDeCima: { type: "select" as const, options: BORDA, default: "border-neutro-300" }
  },
  frase: {
    fonte: { type: "select" as const, options: Object.keys(FONTE), default: "font-dm-sans" },
    tamanho: { type: "select" as const, options: ["text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl"], default: "text-3xl" },
    tamanhoNoCelular: { type: "select" as const, options: ["text-lg", "text-xl", "text-2xl", "text-3xl"], default: "text-2xl" },
    peso: { type: "select" as const, options: Object.keys(PESO), default: "font-semibold" },
    cor: { type: "select" as const, options: TEXTO, default: "text-texto-900" },
    corDoTrechoGrifado: { type: "select" as const, options: TEXTO, default: "text-carmim-800" },
    espacoEntreLetras: { type: "select" as const, options: Object.keys(TRACKING), default: "tracking-normal" },
    entrelinha: [1.25, 1, 1.6, 0.05] as [number, number, number, number],
    larguraCh: [25, 12, 48, 1] as [number, number, number, number]
  },
  grifo: {
    cor: { type: "select" as const, options: TRACO, default: "stroke-carmim-600" },
    espessura: { type: "select" as const, options: ["traco-2", "traco-2.5", "traco-3", "traco-4", "traco-5", "traco-6", "traco-7", "traco-8"], default: "traco-4" },
    espessuraNoCelular: { type: "select" as const, options: ["traco-2", "traco-2.5", "traco-3", "traco-4", "traco-5"], default: "traco-3" },
    alturaEm: [-0.05, -0.3, 0.2, 0.005] as [number, number, number, number],
    // ritmo: cada linha leva "duracao" (curva de entrada e saída suave), com "pausa" antes da próxima
    movimento: { type: "easing" as const, duration: 1.1, ease: [0.37, 0, 0.63, 1] as [number, number, number, number] },
    pausaEntreLinhasMs: [120, 0, 600, 10] as [number, number, number, number],
    desenharDeNovo: { type: "action" as const, label: "Desenhar o grifo de novo" }
  },
  botoes: {
    espacoAteAFrase: { type: "select" as const, options: ["gap-4", "gap-6", "gap-8", "gap-10", "gap-12", "gap-16", "gap-20"], default: "gap-12" },
    espacoEntreBotoes: { type: "select" as const, options: ["gap-2", "gap-3", "gap-4", "gap-5", "gap-6"], default: "gap-4" }
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Chamada final", config, {
  id: "musa-chamada-final-v2", persist: true,
  onAction: (acao) => { if (acao.endsWith("desenharDeNovo")) secao.dispatchEvent(new Event("chamada:redesenhar")); }
});

function aplicar(v: any) {
  const [itens, texto] = ALINHAR[v.secao.alinhamento];
  const vars: Record<string, string> = {
    "--cf-altura": `${v.secao.alturaSvh}svh`,
    "--cf-respiro": espaco(v.secao.respiroVertical),
    "--cf-alinhar": itens, "--cf-alinhar-texto": texto,
    "--cf-fundo": cor(v.secao.fundo),
    "--cf-linha": cor(v.secao.linhaDeCima),
    "--cf-titulo-fonte": FONTE[v.frase.fonte],
    "--cf-titulo-tamanho": tamanho(v.frase.tamanho),
    "--cf-titulo-tamanho-celular": tamanho(v.frase.tamanhoNoCelular),
    "--cf-titulo-peso": PESO[v.frase.peso],
    "--cf-titulo-cor": cor(v.frase.cor),
    "--cf-titulo-tracking": TRACKING[v.frase.espacoEntreLetras],
    "--cf-titulo-entrelinha": String(v.frase.entrelinha),
    "--cf-titulo-largura": `${v.frase.larguraCh}ch`,
    "--grifo-cor": cor(v.grifo.cor),
    "--grifo-espessura": v.grifo.espessura.replace("traco-", ""),
    "--grifo-espessura-celular": v.grifo.espessuraNoCelular.replace("traco-", ""),
    "--grifo-base": `${v.grifo.alturaEm}em`,
    "--cf-grifo-texto": cor(v.frase.corDoTrechoGrifado),
    "--grifo-ms": String(Math.round((v.grifo.movimento?.duration ?? 1.1) * 1000)),
    "--grifo-curva": v.grifo.movimento?.ease ? `cubic-bezier(${v.grifo.movimento.ease.join(", ")})` : "cubic-bezier(0.37, 0, 0.63, 1)",
    "--grifo-pausa-ms": String(v.grifo.pausaEntreLinhasMs),
    "--cf-espaco": espaco(v.botoes.espacoAteAFrase),
    "--cf-botoes-espaco": espaco(v.botoes.espacoEntreBotoes)
  };
  for (const [k, val] of Object.entries(vars)) secao.style.setProperty(k, val);
  // o texto mudou de tamanho ou de lugar: o grifo remede no próximo quadro
  requestAnimationFrame(() => secao.dispatchEvent(new Event("chamada:medir")));
}
aplicar(kit.getValues());
kit.subscribe((novo: any) => aplicar(novo));
