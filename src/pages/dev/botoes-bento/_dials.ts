// Painel DialKit da alternativa "bento" dos botões, só na bancada /dev/botoes-bento (desenvolvimento).
// Duas famílias de controles:
//   - cores (fundo, borda e anel interno, cada um em degradê de cima para baixo; texto): opções são classes de cor do Tailwind,
//     e o painel escreve a cor do token nas variáveis --b-* de cada variante (degradê não cabe numa classe só),
//     do mesmo jeito que /dev/bento-estados faz com o bloco do bento; a opacidade do anel entra por color-mix;
//   - espessuras da borda e do anel: sliders em px (ajuste fino, entre os passos das classes);
//   - forma, tamanho, seta, movimento e foco: classes do Tailwind postas direto nos botões.
// As cópias da grade de estados ([data-forcar]) ganham as classes com prefixo sem o prefixo, para o estado ficar à vista.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

// Todas as cores do tema (src/styles/tailwind.css), em toda escolha de cor.
const FUNDO: string[] = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const BORDA: string[] = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];
const TEXTO: string[] = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const ANEL: string[] = ["inset-ring-transparente", "inset-ring-coral-50", "inset-ring-coral-100", "inset-ring-coral-200", "inset-ring-coral-300", "inset-ring-coral-400", "inset-ring-coral-500", "inset-ring-coral-600", "inset-ring-coral-700", "inset-ring-coral-800", "inset-ring-coral-900", "inset-ring-carmim-100", "inset-ring-carmim-200", "inset-ring-carmim-300", "inset-ring-carmim-400", "inset-ring-carmim-500", "inset-ring-carmim-600", "inset-ring-carmim-700", "inset-ring-carmim-800", "inset-ring-carmim-900", "inset-ring-carmim-950", "inset-ring-neutro-50", "inset-ring-neutro-100", "inset-ring-neutro-200", "inset-ring-neutro-300", "inset-ring-neutro-400", "inset-ring-neutro-500", "inset-ring-neutro-600", "inset-ring-neutro-700", "inset-ring-neutro-800", "inset-ring-neutro-900", "inset-ring-neutro-950", "inset-ring-texto-950", "inset-ring-texto-900", "inset-ring-texto-700", "inset-ring-texto-600", "inset-ring-texto-400", "inset-ring-texto-50"];
const CONTORNO_FOCO: string[] = ["focus-visible:outline-transparente", "focus-visible:outline-coral-50", "focus-visible:outline-coral-100", "focus-visible:outline-coral-200", "focus-visible:outline-coral-300", "focus-visible:outline-coral-400", "focus-visible:outline-coral-500", "focus-visible:outline-coral-600", "focus-visible:outline-coral-700", "focus-visible:outline-coral-800", "focus-visible:outline-coral-900", "focus-visible:outline-carmim-100", "focus-visible:outline-carmim-200", "focus-visible:outline-carmim-300", "focus-visible:outline-carmim-400", "focus-visible:outline-carmim-500", "focus-visible:outline-carmim-600", "focus-visible:outline-carmim-700", "focus-visible:outline-carmim-800", "focus-visible:outline-carmim-900", "focus-visible:outline-carmim-950", "focus-visible:outline-neutro-50", "focus-visible:outline-neutro-100", "focus-visible:outline-neutro-200", "focus-visible:outline-neutro-300", "focus-visible:outline-neutro-400", "focus-visible:outline-neutro-500", "focus-visible:outline-neutro-600", "focus-visible:outline-neutro-700", "focus-visible:outline-neutro-800", "focus-visible:outline-neutro-900", "focus-visible:outline-neutro-950", "focus-visible:outline-texto-950", "focus-visible:outline-texto-900", "focus-visible:outline-texto-700", "focus-visible:outline-texto-600", "focus-visible:outline-texto-400", "focus-visible:outline-texto-50"];
// Sem prefixo, para as cópias com foco forçado: outline-transparente outline-coral-100 outline-coral-200 outline-coral-300 outline-coral-400 outline-coral-500 outline-coral-600 outline-coral-700 outline-coral-800 outline-coral-900 outline-carmim-100 outline-carmim-200 outline-carmim-300 outline-carmim-400 outline-carmim-500 outline-carmim-600 outline-carmim-700 outline-carmim-800 outline-carmim-900 outline-carmim-950 outline-neutro-50 outline-neutro-100 outline-neutro-200 outline-neutro-300 outline-neutro-400 outline-neutro-500 outline-neutro-600 outline-neutro-700 outline-neutro-800 outline-neutro-900 outline-neutro-950 outline-texto-950 outline-texto-900 outline-texto-700 outline-texto-600 outline-texto-400 outline-texto-50 scale-100 scale-98 scale-97 scale-96 scale-95 outline-1 outline-2 outline-3 outline-4 outline-offset-0 outline-offset-1 outline-offset-2 outline-offset-3 outline-offset-4

const PRINCIPAL = ".botao:not(.secundario)";
const SECUNDARIO = ".botao.secundario";
const GRANDE = ".botao:not(.botao-pequeno)";
const PEQUENO = ".botao.botao-pequeno";
const TODOS = ".botao";
const FORA = ".nav-invertida .botao"; // camada invertida do cabeçalho: cores próprias, fica de fora

// cores → variáveis
const cor = (classe: string) => {
  const token = classe.replace(/^(bg|border|text|inset-ring)-/, "");
  return token === "transparente" ? "transparent" : `var(--${token})`;
};
const CORES_CAMPOS = {
  fundoEmCima: { variavel: "fundo", opcoes: FUNDO }, fundoEmBaixo: { variavel: "fundo-baixo", opcoes: FUNDO },
  bordaEmCima: { variavel: "topo", opcoes: BORDA }, bordaEmBaixo: { variavel: "pe", opcoes: BORDA }, texto: { variavel: "texto", opcoes: TEXTO },
  fundoEmCimaAoPassar: { variavel: "fundo-passar", opcoes: FUNDO }, fundoEmBaixoAoPassar: { variavel: "fundo-baixo-passar", opcoes: FUNDO },
  bordaEmCimaAoPassar: { variavel: "topo-passar", opcoes: BORDA }, bordaEmBaixoAoPassar: { variavel: "pe-passar", opcoes: BORDA }, textoAoPassar: { variavel: "texto-passar", opcoes: TEXTO },
  anelEmCima: { variavel: "anel-topo", opcoes: ANEL }, anelEmBaixo: { variavel: "anel-pe", opcoes: ANEL }
} as const;
type CampoCor = keyof typeof CORES_CAMPOS;

// opacidade do anel (0–100), por variante: em cima e embaixo
const ANEL_OPACIDADE_PADRAO = { principal: { opacidadeDoAnelEmCima: 60, opacidadeDoAnelEmBaixo: 0 }, secundario: { opacidadeDoAnelEmCima: 100, opacidadeDoAnelEmBaixo: 25 } };
const comOpacidade = (c: string, op: number) => (op >= 100 ? c : `color-mix(in oklch, ${c} ${op}%, transparent)`);

// partida: valores escolhidos no painel (21/11/2026). Principal: coral chapado (400 em cima e embaixo), borda e anel
// em degradê de claro para escuro; secundário: fundo transparente, borda e anel neutros, coral só com o mouse em cima
const CORES_PADRAO: Record<"principal" | "secundario", Record<CampoCor, string>> = {
  principal: { fundoEmCima: "bg-coral-400", fundoEmBaixo: "bg-coral-400", bordaEmCima: "border-coral-300", bordaEmBaixo: "border-coral-600", texto: "text-texto-950",
    fundoEmCimaAoPassar: "bg-coral-400", fundoEmBaixoAoPassar: "bg-coral-500", bordaEmCimaAoPassar: "border-coral-400", bordaEmBaixoAoPassar: "border-coral-700", textoAoPassar: "text-neutro-950",
    anelEmCima: "inset-ring-coral-200", anelEmBaixo: "inset-ring-coral-400" },
  secundario: { fundoEmCima: "bg-transparente", fundoEmBaixo: "bg-transparente", bordaEmCima: "border-neutro-50", bordaEmBaixo: "border-neutro-100", texto: "text-neutro-950",
    fundoEmCimaAoPassar: "bg-coral-100", fundoEmBaixoAoPassar: "bg-coral-100", bordaEmCimaAoPassar: "border-neutro-200", bordaEmBaixoAoPassar: "border-neutro-300", textoAoPassar: "text-texto-900",
    anelEmCima: "inset-ring-neutro-100", anelEmBaixo: "inset-ring-neutro-200" }
};

// classes
interface Controle { sel: string; opcoes: string[] }
const c = (sel: string, opcoes: string[]): Controle => ({ sel, opcoes });
const CLASSES: Record<string, Record<string, Controle>> = {
  forma: {
    cantos: c(TODOS, ["rounded-none", "rounded-xs", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-full"]),
    fonte: c(TODOS, ["font-inter", "font-inter-tight", "font-dm-sans"]),
    peso: c(TODOS, ["font-normal", "font-medium", "font-semibold", "font-bold"]),
    espacoEntreLetras: c(TODOS, ["tracking-tight", "tracking-normal", "tracking-wide"]),
    sombra: c(TODOS, ["shadow-none", "shadow-xs", "shadow-sm", "shadow-md"])
  },
  grande: {
    tamanhoDoTexto: c(GRANDE, ["text-sm", "text-md", "text-lg"]),
    altura: c(GRANDE, ["h-9", "h-10", "h-11", "h-12", "h-13", "h-14"]),
    respiroLateral: c(GRANDE, ["px-3", "px-3.5", "px-4", "px-4.5", "px-5", "px-6", "px-7", "px-8"])
  },
  pequeno: {
    tamanhoDoTexto: c(PEQUENO, ["text-xs", "text-sm", "text-md"]),
    altura: c(PEQUENO, ["h-7", "h-8", "h-9", "h-10"]),
    respiroLateral: c(PEQUENO, ["px-2", "px-2.5", "px-3", "px-3.5", "px-4"])
  },
  seta: {
    noPrincipal: c(`${PRINCIPAL} .seta`, ["hidden", "inline-block"]),
    noSecundario: c(`${SECUNDARIO} .seta`, ["hidden", "inline-block"])
  },
  movimento: {
    aoPressionar: c(TODOS, ["active:scale-100", "active:scale-98", "active:scale-97", "active:scale-96", "active:scale-95"]),
    duracao: c(TODOS, ["duration-100", "duration-150", "duration-200", "duration-300"])
  },
  foco: {
    cor: c(TODOS, CONTORNO_FOCO),
    espessura: c(TODOS, ["focus-visible:outline-1", "focus-visible:outline-2", "focus-visible:outline-3", "focus-visible:outline-4"]),
    distancia: c(TODOS, ["focus-visible:outline-offset-0", "focus-visible:outline-offset-1", "focus-visible:outline-offset-2", "focus-visible:outline-offset-3", "focus-visible:outline-offset-4"])
  }
};
// partida: valores escolhidos no painel (21/11/2026); sem seta (tirada do site no mesmo dia)
const CLASSES_PADRAO: Record<string, Record<string, string>> = {
  forma: { cantos: "rounded-sm", fonte: "font-inter", peso: "font-medium", espacoEntreLetras: "tracking-normal", sombra: "shadow-xs" },
  grande: { tamanhoDoTexto: "text-md", altura: "h-11", respiroLateral: "px-5" },
  pequeno: { tamanhoDoTexto: "text-sm", altura: "h-9", respiroLateral: "px-3.5" },
  seta: { noPrincipal: "hidden", noSecundario: "hidden" },
  movimento: { aoPressionar: "active:scale-97", duracao: "duration-150" },
  foco: { cor: "focus-visible:outline-carmim-700", espessura: "focus-visible:outline-3", distancia: "focus-visible:outline-offset-2" }
};

// os botões do cabeçalho vêm do componente, sem seta: ganham a mesma do resto da página
document.querySelectorAll<HTMLElement>(".botao").forEach((b) => {
  if (b.matches(FORA) || b.querySelector(".seta")) return;
  const s = document.createElement("span"); s.className = "seta"; s.setAttribute("aria-hidden", "true"); s.textContent = "→"; b.appendChild(s);
});

const config: Record<string, any> = {};
for (const v of ["principal", "secundario"] as const) {
  config[v] = { _collapsed: v !== "principal" };
  for (const [nome, campo] of Object.entries(CORES_CAMPOS)) config[v][nome] = { type: "select", options: [...campo.opcoes], default: CORES_PADRAO[v][nome as CampoCor] };
  config[v].opacidadeDoAnelEmCima = [ANEL_OPACIDADE_PADRAO[v].opacidadeDoAnelEmCima, 0, 100, 5];
  config[v].opacidadeDoAnelEmBaixo = [ANEL_OPACIDADE_PADRAO[v].opacidadeDoAnelEmBaixo, 0, 100, 5];
}
for (const [grupo, ctrls] of Object.entries(CLASSES)) {
  config[grupo] = { _collapsed: grupo !== "forma" };
  for (const [nome, ctrl] of Object.entries(ctrls)) config[grupo][nome] = { type: "select", options: ctrl.opcoes, default: CLASSES_PADRAO[grupo][nome] };
}

// espessuras em px, com passo de 0,25 (as classes só dão 0, 1, 2…)
config.espessuras = { _collapsed: false, bordaPx: [0.75, 0, 4, 0.25], anelInternoPx: [1, 0, 4, 0.25] };

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Botões (bento)", config, { id: "musa-botoes-bento-v1", persist: true });

const PREFIXOS: Record<string, string[]> = { passar: ["hover:"], pressionado: ["hover:", "active:"], foco: ["focus-visible:"] };
const semPrefixo = (t: string, forcar?: string) => { for (const p of PREFIXOS[forcar ?? ""] ?? []) if (t.startsWith(p)) return t.slice(p.length); return t; };
const FIXAS = ["group", "inline-flex", "items-center", "justify-center", "leading-none", "ease-forte", "active:transform-none", "focus-visible:outline-solid"];

const folha = document.createElement("style");
document.head.appendChild(folha);

function aplicar(v: Record<string, any>) {
  // cores: uma regra por variante com as variáveis --b-*
  folha.textContent = (["principal", "secundario"] as const).map((variante) => {
    const sel = variante === "principal" ? PRINCIPAL : SECUNDARIO;
    const decl = Object.entries(CORES_CAMPOS).map(([nome, campo]) => {
      let valor = cor(v[variante][nome]);
      if (nome === "anelEmCima") valor = comOpacidade(valor, v[variante].opacidadeDoAnelEmCima);
      if (nome === "anelEmBaixo") valor = comOpacidade(valor, v[variante].opacidadeDoAnelEmBaixo);
      return `--b-${campo.variavel}: ${valor};`;
    }).join(" ");
    return `${sel} { ${decl} }`;
  }).join("\n") + `\n.botao { --b-borda-w: ${v.espessuras.bordaPx}px; --b-anel-w: ${v.espessuras.anelInternoPx}px; }`;
  // classes
  const possiveis = new Set<string>();
  for (const ctrls of Object.values(CLASSES)) for (const ctrl of Object.values(ctrls)) for (const t of ctrl.opcoes) {
    possiveis.add(t); for (const ps of Object.values(PREFIXOS)) for (const p of ps) if (t.startsWith(p)) possiveis.add(t.slice(p.length));
  }
  const alvos = [...document.querySelectorAll<HTMLElement>(".botao, .botao .seta")].filter((el) => !el.closest(FORA.split(" ")[0]));
  alvos.forEach((el) => {
    possiveis.forEach((t) => el.classList.remove(t));
    if (el.classList.contains("botao")) { el.classList.add(...FIXAS); if (el.dataset.forcar === "foco") el.classList.add("outline-solid"); }
  });
  for (const [grupo, ctrls] of Object.entries(CLASSES)) for (const [nome, ctrl] of Object.entries(ctrls)) {
    const escolha: string = v[grupo][nome];
    alvos.filter((el) => el.matches(ctrl.sel)).forEach((el) => {
      const forcar = (el.closest(".botao") as HTMLElement | null)?.dataset.forcar;
      el.classList.add(semPrefixo(escolha, forcar));
    });
  }
}
// o anel fica por dentro da borda: o canto dele é o canto do botão menos a borda (ver ::before em index.astro)
function guardarRaio() {
  document.querySelectorAll<HTMLElement>(".botao").forEach((el) => el.style.setProperty("--b-raio-medido", getComputedStyle(el).borderTopLeftRadius));
}
const aplicarTudo = (v: Record<string, any>) => { aplicar(v); guardarRaio(); };
aplicarTudo(kit.getValues() as Record<string, any>);
kit.subscribe((novo: Record<string, any>) => aplicarTudo(novo));
