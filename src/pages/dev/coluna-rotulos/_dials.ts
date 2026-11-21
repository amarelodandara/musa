// Linhas: dois grupos de conteúdo (do professor e da escola), uma linha forte entre eles e finas dentro de cada um.
// Painel DialKit da coluna dos rótulos (a primeira coluna do mapa, presa na lateral ao rolar), no playground
// /dev/coluna-rotulos (desenvolvimento). Três partes:
//   aparência: cada opção é uma classe do Tailwind medida num elemento de prova dentro do quadro (o CSS do mapa ganharia
//   de uma classe); o valor medido vai para uma folha de estilo da bancada no quadro. Cores: todas as do tema, sempre.
//   sombra ao rolar: uma sombra na borda direita da coluna só quando a grade está rolada para o lado.
//   textos: o nome de cada rótulo e uma descrição opcional embaixo dele (vazia = sem descrição).
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
interface Controle { sel: string; props: string[]; opcoes: Opcao[] }

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema (src/styles/tailwind.css)
const PASSOS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const TEXTO_COR: Opcao[] = ["text-transparente", ...PASSOS.map((p) => `text-${p}`)];
const FUNDO: Opcao[] = ["bg-transparente", ...PASSOS.map((p) => `bg-${p}`)];
const BORDA: Opcao[] = ["border-transparente", ...PASSOS.map((p) => `border-${p}`)];
// escritas por extenso (o Tailwind só gera as classes que encontra no código)
void ["text-transparente", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50",
  "bg-transparente", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50",
  "border-transparente", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];

const c = (sel: string, props: string[], opcoes: Opcao[]): Controle => ({ sel, props, opcoes });
const PESOS: Opcao[] = ["font-light", "font-normal", "font-medium", "font-semibold", "font-bold"];
const FONTES: Opcao[] = ["font-dm-sans", "font-inter", "font-inter-tight", "font-mono"];
const TAMANHOS: Opcao[] = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg"];
const LETRAS: Opcao[] = ["tracking-tighter", "tracking-tight", "tracking-normal", "tracking-wide", "tracking-wider", "tracking-widest"];
const CAIXA: Opcao[] = [["Normal", "normal-case"], ["MAIÚSCULAS", "uppercase"], ["minúsculas", "lowercase"]];
const ALINHA: Opcao[] = [["Esquerda", "text-left"], ["Direita", "text-right"]];
const ESPESSURA_DIR: Opcao[] = [["0 px", "border-r-0"], ["1 px", "border-r"], ["2 px", "border-r-2"], ["4 px", "border-r-4"]];
const ESPESSURA_TOPO: Opcao[] = [["0 px", "border-t-0"], ["1 px", "border-t"], ["2 px", "border-t-2"]];
const RESPIRO_X: Opcao[] = ["px-2", "px-2.5", "px-3", "px-4", "px-5", "px-6"];

const COL = ".mapa .rotulos";
const ROT = ".mapa .rotulos .rotulo";
const CAMADA = ".mapa .rotulos .rotulo:not(.rotulo-etapas)";

const CONTROLES: Record<string, Record<string, Controle>> = {
  coluna: {
    fundo: c(COL, ["background-color"], FUNDO),
    bordaDireitaCor: c(COL, ["border-right-color"], BORDA),
    bordaDireitaEspessura: c(COL, ["border-right-width"], ESPESSURA_DIR)
  },
  rotulos: {
    fonte: c(ROT, ["font-family"], FONTES),
    tamanho: c(ROT, ["font-size"], TAMANHOS),
    peso: c(ROT, ["font-weight"], PESOS),
    cor: c(ROT, ["color"], TEXTO_COR),
    espacamentoDeLetras: c(ROT, ["letter-spacing"], LETRAS),
    caixa: c(ROT, ["text-transform"], CAIXA),
    alinhamento: c(ROT, ["text-align"], ALINHA),
    respiroLados: c(ROT, ["padding-left", "padding-right"], RESPIRO_X),
    fundo: c(CAMADA, ["background-color"], FUNDO)
  },
  // "Etapas", em cima, ao lado das Fases e dos nomes das Etapas
  rotuloEtapas: {
    tamanho: c(".mapa .rotulos .rotulo-etapas", ["font-size"], TAMANHOS),
    peso: c(".mapa .rotulos .rotulo-etapas", ["font-weight"], PESOS),
    cor: c(".mapa .rotulos .rotulo-etapas", ["color"], TEXTO_COR),
    fundo: c(".mapa .rotulos .rotulo-etapas", ["background-color"], FUNDO)
  },
  descricoes: {
    tamanho: c(".mapa .rotulos .rotulo-descricao", ["font-size"], TAMANHOS),
    peso: c(".mapa .rotulos .rotulo-descricao", ["font-weight"], PESOS),
    cor: c(".mapa .rotulos .rotulo-descricao", ["color"], TEXTO_COR)
  },
  // Alto / Médio / Baixo, na linha do Nível de desafio
  niveisDoDesafio: {
    tamanho: c(".mapa .rotulos .desafio-niveis span", ["font-size"], TAMANHOS),
    peso: c(".mapa .rotulos .desafio-niveis span", ["font-weight"], PESOS),
    cor: c(".mapa .rotulos .desafio-niveis span", ["color"], TEXTO_COR)
  }
};

// textos: nome e descrição de cada rótulo (chave = a classe rotulo-<id> do mapa)
const ROTULOS = [
  { id: "etapas", nome: "Etapas" },
  { id: "acoes", nome: "Ações do professor" },
  { id: "sentimentos", nome: "Nível de desafio" },
  { id: "pontos", nome: "Pontos de contato" },
  { id: "boas", nome: "Boas práticas" },
  { id: "evitar", nome: "O que evitar" }
];

const valor = (o: Opcao) => (Array.isArray(o) ? o[1] : o);

// mede uma classe num elemento de prova invisível dentro do quadro (cache por documento)
const cache = new WeakMap<Document, Map<string, CSSStyleDeclaration>>();
function medir(d: Document, classe: string) {
  let m = cache.get(d);
  if (!m) { m = new Map(); cache.set(d, m); }
  if (!m.has(classe)) {
    const p = d.createElement("div");
    // espessura de borda só é medida com estilo de borda ligado
    p.className = `${classe} border-solid`;
    p.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
    d.body.appendChild(p);
    const cs = getComputedStyle(p), copia: Record<string, string> = {};
    for (let i = 0; i < cs.length; i++) copia[cs[i]] = cs.getPropertyValue(cs[i]);
    p.remove();
    m.set(classe, { getPropertyValue: (k: string) => copia[k] ?? "" } as CSSStyleDeclaration);
  }
  return m.get(classe)!;
}

const doc = () => quadro.contentDocument;
const pronto = (d: Document | null) => !!d?.querySelector(".mapa .rotulos .rotulo") && d.readyState === "complete";

function padrao(d: Document, ctrl: Controle) {
  const el = d.querySelector<HTMLElement>(ctrl.sel);
  if (!el) return "";
  const atual = getComputedStyle(el);
  const achou = ctrl.opcoes.find((o) => valor(o) !== "" && ctrl.props.every((k) => medir(d, valor(o)).getPropertyValue(k) === atual.getPropertyValue(k)));
  // nenhuma opção bate com o código: começa em "Como no código" (não mexe)
  return achou ? valor(achou) : "";
}

const primeiro = await new Promise<Document>((ok) => {
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});

// rótulos alinhados à direita (escolha de 18/11/2026)
const PADROES: Record<string, string> = { "rotulos.alinhamento": "text-right" };

const config: Record<string, any> = {};
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: !["coluna", "rotulos"].includes(grupo) };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    const def = padrao(primeiro, ctrl);
    ctrl.opcoes = [["Como no código", ""], ...ctrl.opcoes];
    config[grupo][nome] = { type: "select", options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)), default: PADROES[`${grupo}.${nome}`] ?? def };
  }
}
// Linhas entre as Camadas (a de cima de cada linha da grade), em dois grupos de conteúdo:
//   do professor: Ações do professor e Nível de desafio; da escola: Pontos de contato, Boas práticas e O que evitar.
//   topo: entre os nomes das Etapas e Ações do professor (na coluna dos rótulos, embaixo de "Etapas")
//   entre grupos: a linha forte, em cima de Pontos de contato
//   dentro do grupo: as finas (em cima de Nível de desafio, de Boas práticas e de O que evitar)
const COR_LINHA = (def: string) => ({ type: "select", options: PASSOS, default: def });
config.linhas = {
  _collapsed: false,
  topoNaColunaDosRotulos: [0, 0, 4, 0.5],
  topoNasEtapas: [1, 0, 4, 0.5],
  topoCor: COR_LINHA("neutro-300"),
  entreGruposEspessura: [2, 0, 6, 0.5],
  entreGruposCor: COR_LINHA("neutro-500"),
  entreGruposNasEtapas: true,
  dentroDoGrupoEspessura: [0.5, 0, 3, 0.5],
  dentroDoGrupoCor: COR_LINHA("neutro-200"),
  // hoje, entre Ações do professor e Nível de desafio, as Etapas não têm linha (só a coluna dos rótulos)
  dentroDoProfessorNasEtapas: false,
  dentroDaEscolaNasEtapas: true
};
config.sombraAoRolar = { _collapsed: false, mostrar: false, desfoque: [12, 0, 32, 1], opacidade: [8, 0, 30, 1] };
config.textos = { _collapsed: true, ...Object.fromEntries(ROTULOS.flatMap((r) => [
  // "Etapas" começa sem texto (escolha de 18/11/2026); nome vazio = rótulo sem texto
  [`${r.id}Nome`, { type: "text", default: r.id === "etapas" ? "" : r.nome, placeholder: "Sem texto" }],
  [`${r.id}Descricao`, { type: "text", default: "", placeholder: "Sem descrição" }]
])) };

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Coluna dos rótulos", config, { id: "musa-coluna-rotulos-v2", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  const regras: string[] = [
    // base das descrições (o painel muda tamanho, peso e cor)
    `.mapa .rotulos .rotulo-descricao { display: block; margin-top: 2px; font-size: 11px; font-weight: 400; line-height: 1.35; color: var(--texto-600); text-transform: none; letter-spacing: normal; }`
  ];
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      if (!escolha) continue;
      const m = medir(d!, escolha);
      const estilo = ctrl.props.some((k) => /^border-\w+-width$/.test(k)) ? ctrl.props.filter((k) => /width$/.test(k)).map((k) => `${k.replace("width", "style")}: solid !important;`).join(" ") : "";
      regras.push(`${ctrl.sel} { ${ctrl.props.map((k) => `${k}: ${m.getPropertyValue(k)} !important;`).join(" ")} ${estilo} }`);
    }
  }
  // linhas entre as Camadas
  const L = v.linhas, linha = (esp: number, cor: string) => `${esp}px solid var(--${cor}) !important`;
  const rotulo = (id: string) => `.mapa .rotulos .rotulo.rotulo-${id}`, celula = (id: string) => `.mapa .etapa .camada.camada-${id}`;
  regras.push(`${rotulo("acoes")} { border-top: ${linha(L.topoNaColunaDosRotulos, L.topoCor)}; }`);
  regras.push(`${celula("acoes")} { border-top: ${linha(L.topoNasEtapas, L.topoCor)}; }`);
  regras.push(`${rotulo("pontos")} { border-top: ${linha(L.entreGruposEspessura, L.entreGruposCor)}; }`);
  regras.push(`${celula("pontos")} { border-top: ${L.entreGruposNasEtapas ? linha(L.entreGruposEspessura, L.entreGruposCor) : "1px solid transparent !important"}; }`);
  for (const id of ["sentimentos", "boas", "evitar"]) {
    const nasEtapas = id === "sentimentos" ? L.dentroDoProfessorNasEtapas : L.dentroDaEscolaNasEtapas;
    regras.push(`${rotulo(id)} { border-top: ${linha(L.dentroDoGrupoEspessura, L.dentroDoGrupoCor)}; }`);
    // sem linha nas Etapas: transparente com a mesma espessura, para o texto não sair da linha de base do rótulo
    regras.push(`${celula(id)} { border-top: ${nasEtapas ? linha(L.dentroDoGrupoEspessura, L.dentroDoGrupoCor) : `${L.dentroDoGrupoEspessura}px solid transparent !important`}; }`);
  }
  // sombra só com a grade rolada para o lado (data-rolada, posto abaixo)
  const s = v.sombraAoRolar;
  if (s.mostrar) regras.push(`.mapa[data-rolada] .rotulos { box-shadow: ${s.desfoque / 2}px 0 ${s.desfoque}px rgb(0 0 0 / ${s.opacidade / 100}) !important; clip-path: inset(0 -40px 0 0); }`);
  let folha = d!.getElementById("dial-coluna-rotulos");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-coluna-rotulos"; d!.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
  // textos: troca o nome (primeiro nó de texto) e põe ou tira a descrição
  for (const r of ROTULOS) {
    const el = d!.querySelector<HTMLElement>(`.mapa .rotulos .rotulo-${r.id}`);
    if (!el) continue;
    // o primeiro nó de texto do rótulo (guardado: vazio, ele não seria mais achado pelo conteúdo)
    const e = el as HTMLElement & { _texto?: ChildNode };
    e._texto ??= [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent!.trim());
    const texto = e._texto;
    if (texto) texto.textContent = v.textos[`${r.id}Nome`] ?? r.nome;
    let desc = el.querySelector<HTMLElement>(".rotulo-descricao");
    const t = (v.textos[`${r.id}Descricao`] ?? "").trim();
    if (t && !desc) { desc = d!.createElement("span"); desc.className = "rotulo-descricao"; texto ? texto.after(desc) : el.prepend(desc); }
    if (desc) { if (t) desc.textContent = t; else desc.remove(); }
  }
  // a rolagem lateral liga a sombra
  const rolagem = d!.querySelector<HTMLElement>(".mapa .mapa-rolagem");
  if (rolagem && !rolagem.dataset.vigiada) {
    rolagem.dataset.vigiada = "";
    const marcar = () => d!.querySelector(".mapa")!.toggleAttribute("data-rolada", rolagem.scrollLeft > 0);
    rolagem.addEventListener("scroll", marcar, { passive: true }); marcar();
  }
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// cada estado recarrega o quadro: espera e reaplica
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
