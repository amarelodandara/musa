// Painel DialKit do playground /dev/bento-estados (desenvolvimento): só as cores do primeiro bloco do bento (fundo, borda, textos),
// uma vez para o estado ativo e outra para o inativo. Nada mais muda entre os dois estados.
//   Cada opção é uma classe de cor do Tailwind (border-*, text-*, bg-*); o painel escreve a cor do token
//   nas variáveis do bloco (--ativo-* e --inativo-*, em Funcionalidades.astro).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const opcoes = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
// classe → cor do token (border-coral-200 → var(--coral-200))
const cor = (classe: string) => {
  const token = classe.replace(/^(border|text|bg)-/, "");
  return token === "transparente" ? "transparent" : `var(--${token})`;
};

// nome no painel → variável do bloco e prefixo da classe
const CAMPOS = {
  fundo: { variavel: "fundo", prefixo: "bg" },
  bordaTopo: { variavel: "borda-topo", prefixo: "border" },
  bordaPe: { variavel: "borda-pe", prefixo: "border" },
  titulo: { variavel: "titulo", prefixo: "text" },
  descricao: { variavel: "descricao", prefixo: "text" },
  lista: { variavel: "lista", prefixo: "text" },
  pontosDaLista: { variavel: "pontos", prefixo: "bg" }
} as const;
type Campo = keyof typeof CAMPOS;

// valores de partida: os que estão em Funcionalidades.astro hoje
const PADROES: Record<"ativo" | "inativo", Record<Campo, string>> = {
  ativo: { fundo: "bg-coral-100", bordaTopo: "border-coral-200", bordaPe: "border-neutro-50", titulo: "text-texto-900", descricao: "text-texto-700", lista: "text-texto-700", pontosDaLista: "bg-coral-600" },
  inativo: { fundo: "bg-neutro-100", bordaTopo: "border-neutro-200", bordaPe: "border-neutro-50", titulo: "text-texto-600", descricao: "text-texto-600", lista: "text-texto-700", pontosDaLista: "bg-neutro-400" }
};

const config: Record<string, any> = {};
for (const estado of ["ativo", "inativo"] as const) {
  config[estado] = { _collapsed: false };
  for (const [nome, { prefixo }] of Object.entries(CAMPOS)) {
    config[estado][nome] = { type: "select", options: opcoes(prefixo), default: PADROES[estado][nome as Campo] };
  }
}

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: estados", config, { id: "musa-bento-estados", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = quadro.contentDocument;
  if (!d?.querySelector(".func .b-visoes")) return;
  const regras = (["ativo", "inativo"] as const).flatMap((estado) =>
    Object.entries(CAMPOS).map(([nome, { variavel }]) => `--${estado}-${variavel}: ${cor(v[estado][nome])} !important;`));
  let folha = d.getElementById("dial-bento-estados");
  if (!folha) { folha = d.createElement("style"); folha.id = "dial-bento-estados"; d.head.appendChild(folha); }
  folha.textContent = `.func .b-visoes { ${regras.join(" ")} }`;
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de estado ou largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".func .b-visoes")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
