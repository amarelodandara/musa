// Painel DialKit do playground /dev/bento-contato (desenvolvimento): o bloco 3 do bento, Pontos de contato.
// conceito: "chips" (o da página), "etapas" (os canais em colunas, uma por etapa) ou "marquee" (duas filas correndo em cima do texto); trocar recarrega o quadro.
// texto: título e descrição editáveis ao vivo, mostrar ou não a descrição, e as larguras dos dois.
// ativo / inativo: as cores do bloco em cada estado (fundo, borda, título, descrição) e das pills (fundo, borda, texto, ícone);
//   o estado "Inativo" na lista da esquerda mostra o bloco inativo.
// chips: tamanho, cantos e as cores da onda (conceitos chips e etapas).
// marquee: só valem no conceito "marquee" (velocidade, espaço entre as filas, esmaecer e encostar nas bordas, sentido da 2ª fila).
// etapas: só valem no conceito "etapas" (espaço entre colunas, o traço de cada etapa e o nome dela).
// ritmo: de quanto em quanto tempo a onda anda, a pausa no fim e quanto tempo cada um fica aceso.
// Tudo vira variável CSS (--contato-*) no .b-contato, e o ritmo vira data-passo / data-pausa / data-aceso.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "0.375rem", "rounded-lg": "0.5rem", "rounded-xl": "0.75rem", "rounded-2xl": "1rem", "rounded-full": "999px" };
const TAMANHOS: Record<string, string> = { "text-2xs": "var(--tamanho-2xs)", "text-xs": "var(--tamanho-xs)", "text-sm": "var(--tamanho-sm)", "text-md": "var(--tamanho-md)" };

// valores de partida: os que estão em Funcionalidades.astro hoje
const config: Record<string, any> = {
  conceito: select([{ value: "chips", label: "Chips (o da página)" }, { value: "etapas", label: "Etapas da jornada" }, { value: "marquee", label: "Marquee (duas filas)" }], "marquee"),
  // larguras máximas em % da largura do bloco (o título quebra em linhas equilibradas dentro dela)
  // título e descrição editáveis ao vivo (valores de partida = os de Funcionalidades.astro)
  texto: { _collapsed: false,
    titulo: { type: "text", default: "Todos os encontros da escola com seu museu" },
    textoDaDescricao: { type: "text", default: "Não basta ter uma boa exposição, é preciso também ter uma boa apresentação, ser encontrável no mundo digital e alinhado no mundo físico." },
    descricao: true, larguraDoTitulo: [76, 30, 100, 1], larguraDaDescricao: [74, 30, 100, 1] },
  // cores do bloco ativo: o sistema dos blocos (fundo, borda em degradê, título, descrição) e as pills
  ativo: {
    _collapsed: false,
    fundo: select(cores("bg"), "bg-coral-50"),
    bordaEmCima: select(cores("border"), "border-coral-200"),
    bordaEmbaixo: select(cores("border"), "border-neutro-50"),
    titulo: select(cores("text"), "text-texto-900"),
    descricao: select(cores("text"), "text-texto-700"),
    fundoDasPills: select(cores("bg"), "bg-neutro-50"),
    bordaDasPills: select(cores("border"), "border-coral-200"),
    textoDasPills: select(cores("text"), "text-texto-700"),
    icone: select(cores("text"), "text-coral-600")
  },
  // cores do bloco inativo: o sistema dos blocos (fundo, borda em degradê, título, descrição) e as pills
  inativo: {
    _collapsed: false,
    fundo: select(cores("bg"), "bg-neutro-50"),
    bordaEmCima: select(cores("border"), "border-neutro-200"),
    bordaEmbaixo: select(cores("border"), "border-neutro-50"),
    titulo: select(cores("text"), "text-texto-600"),
    descricao: select(cores("text"), "text-texto-600"),
    fundoDasPills: select(cores("bg"), "bg-neutro-50"),
    bordaDasPills: select(cores("border"), "border-neutro-300"),
    textoDasPills: select(cores("text"), "text-texto-700"),
    icone: select(cores("text"), "text-neutro-400")
  },
  chips: {
    _collapsed: false,
    espaco: [6, 0, 20, 1],
    respiroVertical: [4, 0, 14, 1],
    respiroHorizontal: [10, 0, 24, 1],
    cantos: select(Object.keys(CANTOS), "rounded-full"),
    tamanho: select(Object.keys(TAMANHOS), "text-xs"),
    // as cores paradas das pills estão em "ativo" e "inativo"; estas são as da onda (conceitos chips e etapas)
    fundoAceso: select(cores("bg"), "bg-coral-200"),
    bordaAcesa: select(cores("border"), "border-coral-400"),
    textoAceso: select(cores("text"), "text-texto-950")
  },
  etapas: {
    _collapsed: false,
    espacoEntreColunas: [8, 0, 24, 1],
    traco: select(cores("border"), "border-neutro-300"),
    tracoAceso: select(cores("border"), "border-coral-500"),
    tamanhoDoNome: select(Object.keys(TAMANHOS), "text-2xs"),
    // "herdar" = a cor da descrição do bloco (muda com ativo/inativo)
    corDoNome: select(["herdar", ...cores("text")], "herdar")
  },
  // só valem no conceito "marquee"
  marquee: {
    _collapsed: false,
    // px por segundo: a mesma velocidade com poucas ou muitas pills
    velocidade: [24, 4, 120, 1],
    espacoEntreFilas: [14, 0, 40, 1],
    // as pills do marquee em relação às do conceito "chips"
    escalaDasPills: [1.12, 0.8, 1.6, 0.02],
    esmaeceNasBordas: [48, 0, 160, 2],
    encostaNasBordas: true,
    segundaFila: select([{ value: "reverse", label: "Corre ao contrário" }, { value: "normal", label: "Mesmo sentido" }], "reverse"),
    paraComOMouse: false
  },
  ritmo: {
    _collapsed: false,
    passo: [260, 60, 2000, 10],
    pausaNoFim: [2400, 0, 6000, 50],
    tempoAceso: [900, 100, 3000, 20],
    acende: [120, 0, 800, 10],
    apaga: [500, 0, 1500, 10]
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Bento: pontos de contato", config, { id: "musa-bento-contato-3", persist: true });

let v = kit.getValues() as Record<string, any>;
const palco = () => (window as any).palcoContato?.(v.conceito);
function aplicar() {
  palco();
  const bloco = quadro.contentDocument?.querySelector<HTMLElement>(".func .b-contato");
  if (!bloco) return;
  const { chips: C, etapas: E, ritmo: R, marquee: M } = v;
  const vars: Record<string, string> = {
    "--contato-gap": `${C.espaco}px`, "--contato-chip-py": `${C.respiroVertical}px`, "--contato-chip-px": `${C.respiroHorizontal}px`,
    "--contato-chip-raio": CANTOS[C.cantos], "--contato-chip-tamanho": TAMANHOS[C.tamanho],
    "--contato-aceso-fundo": cor(C.fundoAceso), "--contato-aceso-borda": cor(C.bordaAcesa), "--contato-aceso-texto": cor(C.textoAceso),
    "--contato-acende-ms": `${R.acende}ms`, "--contato-apaga-ms": `${R.apaga}ms`,
    "--contato-coluna-gap": `${E.espacoEntreColunas}px`, "--contato-trilho": cor(E.traco), "--contato-trilho-aceso": cor(E.tracoAceso),
    "--contato-marquee-escala": String(M.escalaDasPills), "--contato-filas-gap": `${M.espacoEntreFilas}px`, "--contato-marquee-fade": `${M.esmaeceNasBordas}px`,
    "--contato-sangra": M.encostaNasBordas ? "28px" : "0px", "--contato-fila2-direcao": M.segundaFila,
    "--contato-nome-tamanho": TAMANHOS[E.tamanhoDoNome], "--contato-nome-cor": E.corDoNome === "herdar" ? "var(--cor-descricao)" : cor(E.corDoNome)
  };
  Object.entries(vars).forEach(([k, x]) => bloco.style.setProperty(k, x));
  // ativo e inativo: as variáveis do sistema dos blocos (--ativo-*, --inativo-*) só neste bloco, e as das pills
  for (const e of ["ativo", "inativo"]) {
    const X = v[e];
    const est: Record<string, string> = {
      [`--${e}-fundo`]: cor(X.fundo), [`--${e}-borda-topo`]: cor(X.bordaEmCima), [`--${e}-borda-pe`]: cor(X.bordaEmbaixo),
      [`--${e}-titulo`]: cor(X.titulo), [`--${e}-descricao`]: cor(X.descricao), [`--${e}-lista`]: cor(X.textoDasPills), [`--${e}-pontos`]: cor(X.icone),
      [`--contato-${e}-chip-fundo`]: cor(X.fundoDasPills), [`--contato-${e}-chip-borda`]: cor(X.bordaDasPills)
    };
    Object.entries(est).forEach(([k, x]) => bloco.style.setProperty(k, x));
  }
  bloco.dataset.velocidade = String(M.velocidade);
  bloco.toggleAttribute("data-sem-descricao", !v.texto.descricao);
  const h3 = bloco.querySelector(".b-texto h3"), p = bloco.querySelector(".b-texto p");
  if (h3 && h3.textContent !== v.texto.titulo) h3.textContent = v.texto.titulo;
  if (p && p.textContent !== v.texto.textoDaDescricao) p.textContent = v.texto.textoDaDescricao;
  bloco.style.setProperty("--contato-titulo-largura", `${v.texto.larguraDoTitulo}%`);
  bloco.style.setProperty("--contato-descricao-largura", `${v.texto.larguraDaDescricao}%`);
  bloco.toggleAttribute("data-pausa-hover", M.paraComOMouse);
  bloco.dataset.passo = String(R.passo);
  bloco.dataset.pausa = String(R.pausaNoFim);
  bloco.dataset.aceso = String(R.tempoAceso);
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de largura ou de conceito: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".func .b-contato")) aplicar(); else { palco(); setTimeout(vigiar, 100); } }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
