// Painel DialKit das células de Fase do mapa, só na bancada /dev/estados-fases (desenvolvimento).
// As células têm CSS próprio da página do mapa (que ganharia de uma classe), então cada opção é uma classe do Tailwind
// medida num elemento de prova dentro do quadro; o valor medido vai para uma folha de estilo da bancada no quadro.
// Classes escritas por extenso para o Tailwind gerar todas. Cores: todas as do tema, sempre.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

type Opcao = string | [string, string];
interface Controle { sel: string; props: string[]; opcoes: Opcao[] }

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema (src/styles/tailwind.css)
const TEXTO_COR: Opcao[] = ["text-transparente", "text-coral-50", "text-coral-100", "text-coral-200", "text-coral-300", "text-coral-400", "text-coral-500", "text-coral-600", "text-coral-700", "text-coral-800", "text-coral-900", "text-carmim-100", "text-carmim-200", "text-carmim-300", "text-carmim-400", "text-carmim-500", "text-carmim-600", "text-carmim-700", "text-carmim-800", "text-carmim-900", "text-carmim-950", "text-neutro-50", "text-neutro-100", "text-neutro-200", "text-neutro-300", "text-neutro-400", "text-neutro-500", "text-neutro-600", "text-neutro-700", "text-neutro-800", "text-neutro-900", "text-neutro-950", "text-texto-950", "text-texto-900", "text-texto-700", "text-texto-600", "text-texto-400", "text-texto-50"];
const FUNDO: Opcao[] = ["bg-transparente", "bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-carmim-100", "bg-carmim-200", "bg-carmim-300", "bg-carmim-400", "bg-carmim-500", "bg-carmim-600", "bg-carmim-700", "bg-carmim-800", "bg-carmim-900", "bg-carmim-950", "bg-neutro-50", "bg-neutro-100", "bg-neutro-200", "bg-neutro-300", "bg-neutro-400", "bg-neutro-500", "bg-neutro-600", "bg-neutro-700", "bg-neutro-800", "bg-neutro-900", "bg-neutro-950", "bg-texto-950", "bg-texto-900", "bg-texto-700", "bg-texto-600", "bg-texto-400", "bg-texto-50"];
const BORDA: Opcao[] = ["border-transparente", "border-coral-50", "border-coral-100", "border-coral-200", "border-coral-300", "border-coral-400", "border-coral-500", "border-coral-600", "border-coral-700", "border-coral-800", "border-coral-900", "border-carmim-100", "border-carmim-200", "border-carmim-300", "border-carmim-400", "border-carmim-500", "border-carmim-600", "border-carmim-700", "border-carmim-800", "border-carmim-900", "border-carmim-950", "border-neutro-50", "border-neutro-100", "border-neutro-200", "border-neutro-300", "border-neutro-400", "border-neutro-500", "border-neutro-600", "border-neutro-700", "border-neutro-800", "border-neutro-900", "border-neutro-950", "border-texto-950", "border-texto-900", "border-texto-700", "border-texto-600", "border-texto-400", "border-texto-50"];
const ESPESSURA = (lado: string): Opcao[] => [[`0 px`, `border-${lado}-0`], [`1 px`, `border-${lado}`], [`2 px`, `border-${lado}-2`], [`4 px`, `border-${lado}-4`]];

const F = ".mapa .fase";
const c = (sel: string, props: string[], opcoes: Opcao[]): Controle => ({ sel, props, opcoes });
const porFase = (nome: string) => `.mapa .fase[data-fase="${nome}"]`;

const CONTROLES: Record<string, Record<string, Controle>> = {
  texto: {
    tamanho: c(F, ["font-size"], ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg"]),
    alturaDaLinha: c(F, ["line-height"], ["leading-none", "leading-tight", "leading-snug", "leading-normal", "leading-relaxed"]),
    peso: c(F, ["font-weight"], ["font-normal", "font-medium", "font-semibold", "font-bold"]),
    fonte: c(F, ["font-family"], ["font-inter", "font-inter-tight", "font-dm-sans", "font-mono"]),
    caixa: c(F, ["text-transform"], [["Maiúsculas", "uppercase"], ["Normal", "normal-case"], ["Primeira maiúscula", "capitalize"]]),
    espacamentoDeLetras: c(F, ["letter-spacing"], ["tracking-tighter", "tracking-tight", "tracking-normal", ["0,04em (como no código)", "tracking-[0.04em]"], "tracking-wide", "tracking-wider", "tracking-widest"]),
    alinhamento: c(F, ["text-align"], ["text-left", "text-center", "text-right"]),
    cor: c(F, ["color"], TEXTO_COR)
  },
  celula: {
    fundo: c(F, ["background-color"], FUNDO),
    respiroEmCima: c(F, ["padding-top"], ["pt-0.5", "pt-1", "pt-1.5", "pt-2", "pt-2.5", "pt-3", "pt-4"]),
    respiroEmbaixo: c(F, ["padding-bottom"], ["pb-0.5", "pb-1", "pb-1.5", "pb-2", "pb-2.5", "pb-3", "pb-4"]),
    respiroEsquerda: c(F, ["padding-left"], ["pl-1", "pl-2", "pl-3", "pl-4", "pl-5", "pl-6"]),
    respiroDireita: c(F, ["padding-right"], ["pr-1", "pr-2", "pr-3", "pr-4", "pr-5", "pr-6"])
  },
  bordas: {
    esquerdaEspessura: c(F, ["border-left-width"], ESPESSURA("l")),
    esquerdaCor: c(F, ["border-left-color"], BORDA),
    emCimaEspessura: c(F, ["border-top-width"], ESPESSURA("t")),
    emCimaCor: c(F, ["border-top-color"], BORDA),
    embaixoEspessura: c(F, ["border-bottom-width"], ESPESSURA("b")),
    embaixoCor: c(F, ["border-bottom-color"], BORDA)
  },
  // cada Fase com a própria cor (por cima das de cima); "Igual às outras" deixa valer o código ou os grupos de cima
  ...Object.fromEntries(([["antes", "Antes"], ["durante", "Durante"], ["depois", "Depois"]] as const).map(([chave, nome]) => {
    const f = `.mapa .fase[data-fase="${nome}"]`, e = `.mapa .etapa[data-fase="${nome}"]`;
    const igual = (l: Opcao[]): Opcao[] => [["Igual às outras", ""], ...l];
    return [chave, {
      fundoDaFase: c(f, ["background-color"], igual(FUNDO)),
      corDaFase: c(f, ["color"], igual(TEXTO_COR)),
      faixaEmCimaEspessura: c(f, ["border-top-width"], igual(ESPESSURA("t"))),
      faixaEmCimaCor: c(f, ["border-top-color"], igual(BORDA)),
      fundoDoTopoDaEtapa: c(`${e} .etapa-topo`, ["background-color"], igual(FUNDO)),
      corDoNumeroDaEtapa: c(`${e} .etapa-n`, ["color"], igual(TEXTO_COR)),
      fundoDaColuna: c(e, ["background-color"], igual(FUNDO)),
      fundoDaColunaAberta: c(`.mapa[data-modo="etapa"] .etapa[data-fase="${nome}"][data-aberta]`, ["background-color"], igual(FUNDO))
    }];
  }))
};

const valor = (o: Opcao) => (Array.isArray(o) ? o[1] : o);

// mede uma classe num elemento de prova invisível dentro do quadro (cache por documento)
const cache = new WeakMap<Document, Map<string, CSSStyleDeclaration>>();
function medir(d: Document, classe: string) {
  let m = cache.get(d);
  if (!m) { m = new Map(); cache.set(d, m); }
  if (!m.has(classe)) {
    const p = d.createElement("div");
    p.className = `${classe} border-solid border-0`;
    p.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
    // a espessura da borda mede-se com a borda ligada (sem estilo, a largura computada é 0)
    d.body.appendChild(p);
    const cs = getComputedStyle(p), copia: Record<string, string> = {};
    for (let i = 0; i < cs.length; i++) copia[cs[i]] = cs.getPropertyValue(cs[i]);
    p.remove();
    m.set(classe, { getPropertyValue: (k: string) => copia[k] ?? "" } as CSSStyleDeclaration);
  }
  return m.get(classe)!;
}

const doc = () => quadro.contentDocument;
const pronto = (d: Document | null) => !!d?.querySelector(".mapa .fase") && d.readyState === "complete";

function padrao(d: Document, ctrl: Controle) {
  const el = d.querySelector<HTMLElement>(ctrl.sel);
  if (!el || ctrl.opcoes.some((o) => valor(o) === "")) return "";
  const atual = getComputedStyle(el);
  const achou = ctrl.opcoes.find((o) => valor(o) !== "" && ctrl.props.every((k) => medir(d, valor(o)).getPropertyValue(k) === atual.getPropertyValue(k)));
  // nenhuma opção bate com o código: começa em "Como no código" (não mexe)
  return achou ? valor(achou) : "";
}

// Sugestão de partida: cada Fase com uma família de cor, do mais quieto ao mais intenso, como a relação da escola
// com o museu cresce. Antes = neutro (a escola ainda longe, planejando); Durante = coral (o encontro, a cor principal);
// Depois = carmim (o vínculo que fica, a cor mais funda da marca). Hierarquia por Fase: célula da Fase (300) >
// topo da Etapa (200) > coluna aberta (100) > demais células (neutro-50, iguais em todas para o texto ler bem).
const SUGESTAO: Record<string, string> = {
  "antes.fundoDaFase": "bg-neutro-300", "antes.corDaFase": "text-texto-900", "antes.fundoDoTopoDaEtapa": "bg-neutro-200", "antes.fundoDaColunaAberta": "bg-neutro-100", "antes.corDoNumeroDaEtapa": "text-texto-600",
  "durante.fundoDaFase": "bg-coral-300", "durante.corDaFase": "text-coral-900", "durante.fundoDoTopoDaEtapa": "bg-coral-200", "durante.fundoDaColunaAberta": "bg-coral-100", "durante.corDoNumeroDaEtapa": "text-coral-800",
  "depois.fundoDaFase": "bg-carmim-300", "depois.corDaFase": "text-carmim-950", "depois.fundoDoTopoDaEtapa": "bg-carmim-200", "depois.fundoDaColunaAberta": "bg-carmim-100", "depois.corDoNumeroDaEtapa": "text-carmim-800"
};

const primeiro = await new Promise<Document>((ok) => {
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});

// primeiro: ver as cores das Fases sobre o mapa inteiro (desliga o "só a faixa das Fases" da bancada)
const config: Record<string, any> = { bancada: { _collapsed: false, mostrarOMapaTodo: true } };
for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
  config[grupo] = { _collapsed: !["antes", "durante", "depois"].includes(grupo) };
  for (const [nome, ctrl] of Object.entries(ctrls)) {
    // o padrão lê o código antes de acrescentar "Como no código" (senão a opção vazia faz pular a leitura)
    const def = padrao(primeiro, ctrl);
    // cópia: as listas de opções são compartilhadas entre controles (mexer nelas mudaria os outros)
    if (!ctrl.opcoes.some((o) => valor(o) === "")) ctrl.opcoes = [["Como no código", ""], ...ctrl.opcoes];
    config[grupo][nome] = {
      type: "select",
      options: ctrl.opcoes.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)),
      default: def
    };
  }
}


createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Fases do mapa", config, { id: "musa-fases-mapa-v5", persist: true });

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const d = doc();
  if (!pronto(d)) return;
  const regras: string[] = [];
  for (const [grupo, ctrls] of Object.entries(CONTROLES)) {
    for (const [nome, ctrl] of Object.entries(ctrls)) {
      const escolha: string = v[grupo][nome];
      if (!escolha) continue;
      const m = medir(d!, escolha);
      // borda com espessura precisa de estilo (as células só têm a da esquerda ligada)
      const estilo = ctrl.props.filter((k) => /^border-\w+-width$/.test(k)).map((k) => `${k.replace("width", "style")}: solid !important;`).join(" ");
      regras.push(`${ctrl.sel} { ${ctrl.props.map((k) => `${k}: ${m.getPropertyValue(k)} !important;`).join(" ")} ${estilo} }`);
    }
  }
  (window as any).mostrarTudo = v.bancada.mostrarOMapaTodo;
  const so = d!.getElementById("so-fases") as HTMLStyleElement | null;
  if (so) so.disabled = v.bancada.mostrarOMapaTodo;
  quadro.style.height = v.bancada.mostrarOMapaTodo ? "560px" : "160px";
  let folha = d!.getElementById("dial-fases");
  if (!folha) { folha = d!.createElement("style"); folha.id = "dial-fases"; d!.head.appendChild(folha); }
  folha.textContent = regras.join("\n");
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// cada estado recarrega o quadro: espera e reaplica
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
