// Painel DialKit do playground /dev/bento-glossario-celula (desenvolvimento): só a animação do bloco do glossário.
// A célula em si não se ajusta aqui: é a célula de Práticas do mapa em repouso, com o CSS do próprio mapa
// (src/styles/mapa-celula.css), então fica sempre igual a ele.
//   ritmo: quanto dura o traço de cada círculo, o intervalo até o próximo e a pausa com os três circulados.
//   traço: cor, espessura, giz (o filtro do mapa), folga em volta da palavra e quanto o traço passa do ponto de partida.
//   desfoque: quanto o resto do texto borra (0 = nítido).
// As palavras circuladas se escolhem no próprio palco: clique numa palavra para circular (fica com as três últimas),
// clique numa circulada para tirar; shift+clique junta a palavra à última escolhida ("antes da visita").
// Tudo vira variável CSS (--circulo-*) e data-* no .celula-g.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
// "herdada" = a cor que o texto tem no mapa
const cores = (prefixo: string) => ["herdada", "transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : t === "herdada" ? "inherit" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });

// valores de partida: os que estão em Funcionalidades.astro hoje
const config: Record<string, any> = {
  ritmo: {
    _collapsed: false,
    tracado: [700, 200, 2000, 25],
    entre: [450, 0, 2000, 25],
    pausa: [2600, 500, 6000, 100]
  },
  traco: {
    _collapsed: false,
    cor: select(cores("text"), "text-carmim-600"),
    espessura: [2.5, 0.5, 5, 0.25],
    giz: true,
    folgaX: [7, 0, 16, 1],
    folgaY: [5, 0, 12, 1],
    passaDoInicio: [28, 0, 90, 1]
  },
  desfoque: [0, 0, 4, 0.25]
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: glossário numa célula", config, { id: "musa-bento-glossario-celula-circulos-2", persist: true });

let v = kit.getValues() as Record<string, any>;

function aplicar() {
  const el = quadro.contentDocument?.querySelector<HTMLElement>(".func .celula-g");
  if (!el) return;
  const { ritmo: R, traco: T } = v;
  el.style.setProperty("--celula-desfoque", `${v.desfoque}px`);
  const vars: Record<string, string> = {
    "--circulo-cor": cor(T.cor), "--circulo-espessura": `${T.espessura}px`, "--circulo-folga-x": `${T.folgaX}px`, "--circulo-folga-y": `${T.folgaY}px`
  };
  Object.entries(vars).forEach(([k, x]) => el.style.setProperty(k, x));
  el.dataset.tracado = String(R.tracado);
  el.dataset.entre = String(R.entre);
  el.dataset.pausa = String(R.pausa);
  el.dataset.giz = T.giz ? "sim" : "nao";
  el.dataset.volta = String(T.passaDoInicio);
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".func .celula-g")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();

// ---------- escolher as palavras no palco ----------
const CHAVE = "musa-bento-glossario-destaques";
const BASE = "/dev/bento-glossario-celula/palco/preparacao-boa";
// null = ainda não escolheu (o palco usa as de Funcionalidades.astro); [] = escolheu tirar todas
const lerDestaques = (): string[] | null => { try { return JSON.parse(localStorage.getItem(CHAVE) ?? "null"); } catch { return null; } };
const palco = () => { const d = lerDestaques(); return d ? `${BASE}?destaques=${encodeURIComponent(d.join("|"))}` : BASE; };
(window as any).musaPalco = palco;
const atual = () => { const u = new URL(quadro.src, location.href); return u.pathname + u.search; };
function irPara() { if (atual() !== palco()) quadro.src = palco(); }
if (quadro.src.includes("/palco/")) irPara();

function escolher(ev: MouseEvent) {
  ev.preventDefault(); ev.stopPropagation();
  const doc = quadro.contentDocument!;
  const marca = (ev.target as Element).closest("mark");
  // a primeira escolha parte das palavras que o palco mostra agora
  let d = lerDestaques() ?? [...doc.querySelectorAll(".celula-g mark")].map((m) => m.firstChild!.textContent!);
  if (marca) d = d.filter((x) => x.toLowerCase() !== marca.firstChild!.textContent!.toLowerCase());
  else {
    const r = (doc as any).caretRangeFromPoint?.(ev.clientX, ev.clientY) as Range | null;
    const no = r?.startContainer;
    if (!no || no.nodeType !== Node.TEXT_NODE) return;
    const t = no.textContent!, i = r!.startOffset;
    const ini = t.slice(0, i).search(/[\p{L}\p{N}-]*$/u), fim = i + (t.slice(i).match(/^[\p{L}\p{N}-]*/u)?.[0].length ?? 0);
    const palavra = t.slice(ini, fim);
    if (!palavra) return;
    if (ev.shiftKey && d.length) d[d.length - 1] += " " + palavra;
    else d = [...d, palavra].slice(-3);
  }
  try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch {}
  quadro.src = palco();
}
function ligarCliques() {
  const doc = quadro.contentDocument;
  const cel = doc?.querySelector<HTMLElement>(".func .celula-g");
  if (!cel) { setTimeout(ligarCliques, 100); return; }
  if (cel.dataset.escolha) return;
  cel.dataset.escolha = "";
  cel.style.cursor = "pointer";
  cel.addEventListener("click", escolher, true);
}
quadro.addEventListener("load", () => setTimeout(ligarCliques, 0));
ligarCliques();
