// Painel DialKit do playground /dev/guia-menu (desenvolvimento): o menu lateral do Guia (src/layouts/Guia.astro).
// coluna: largura da coluna do menu, espaço até o conteúdo, distância do topo ao rolar, espaço entre migalhas e menu.
// migalhas: tamanho e cores (links, página atual, separador).
// itens: tamanho, peso, respiro, cantos, espaço entre itens e entre ícone e texto; cores parado, com o mouse e na página atual.
// icones: mostrar ou não, tamanho e cor parado / com o mouse / na página atual.
// submenu: os subitens da página aberta (grupos do glossário, títulos de um guia; mostrar ou não, recuo) e os traços de giz
//   (o das páginas, ao lado dos itens, e o do submenu: cor parado, cor da marca, espessura, duração; "Desenhar de novo" repete).
// Tudo vira variável CSS (--menu-*, --migalhas-*, --submenu-*) no .guia.
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;

// Todas as cores do tema, sempre
const PASSOS = ["coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const cores = (prefixo: string) => ["transparente", ...PASSOS].map((p) => `${prefixo}-${p}`);
const cor = (classe: string) => { const t = classe.replace(/^(border|text|bg)-/, ""); return t === "transparente" ? "transparent" : `var(--${t})`; };
const select = (options: any[], def: string) => ({ type: "select", options, default: def });
const CANTOS: Record<string, string> = { "rounded-none": "0", "rounded-xs": "2px", "rounded-sm": "4px", "rounded-md": "6px", "rounded-lg": "0.5rem", "rounded-xl": "0.75rem", "rounded-full": "999px" };
const TAMANHOS: Record<string, string> = { "text-2xs": "var(--tamanho-2xs)", "text-xs": "var(--tamanho-xs)", "text-sm": "var(--tamanho-sm)", "text-md": "var(--tamanho-md)", "text-lg": "var(--tamanho-lg)" };
const PESOS: Record<string, string> = { "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };

// valores de partida: os de src/layouts/Guia.astro hoje
const config: Record<string, any> = {
  coluna: {
    _collapsed: false,
    largura: [240, 160, 400, 4],
    espacoAteOConteudo: [40, 8, 120, 2],
    distanciaDoTopo: [104, 80, 200, 2],
    espacoEntreMigalhasEMenu: [24, 0, 64, 1]
  },
  migalhas: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    cor: select(cores("text"), "text-texto-600"),
    atual: select(cores("text"), "text-texto-900"),
    separador: select(cores("text"), "text-neutro-400")
  },
  itens: {
    _collapsed: false,
    tamanho: select(Object.keys(TAMANHOS), "text-sm"),
    peso: select(Object.keys(PESOS), "font-normal"),
    respiroVertical: [6, 0, 16, 1],
    respiroHorizontal: [10, 0, 24, 1],
    cantos: select(Object.keys(CANTOS), "rounded-md"),
    espacoEntreItens: [2, 0, 16, 1],
    espacoIconeTexto: [8, 0, 20, 1],
    cor: select(cores("text"), "text-texto-700"),
    fundoComMouse: select(cores("bg"), "bg-neutro-100"),
    corComMouse: select(cores("text"), "text-texto-900"),
    fundoAtual: select(cores("bg"), "bg-coral-100"),
    corAtual: select(cores("text"), "text-texto-900"),
    pesoAtual: select(Object.keys(PESOS), "font-medium")
  },
  icones: {
    _collapsed: false,
    mostrar: true,
    tamanho: [1.15, 0.8, 2, 0.05],
    cor: select(cores("text"), "text-texto-600"),
    corComMouse: select(cores("text"), "text-coral-600"),
    corAtual: select(cores("text"), "text-coral-600")
  },
  submenu: {
    _collapsed: false,
    mostrar: true,
    recuo: [14, 0, 40, 1],
    // o traço de giz: cinza ao abrir, a marca por cima ao clicar num grupo
    traco: select(cores("text"), "text-neutro-300"),
    tracoAoClicar: select(cores("text"), "text-carmim-600"),
    espessura: [2.5, 1, 6, 0.25],
    duracaoDoDesenho: [700, 150, 2000, 25],
    // o traço ao lado das páginas (só a estrutura, cinza)
    tracoDasPaginas: true,
    afastamentoDoTracoDasPaginas: [6, 0, 32, 1],
    // desenha de novo o traço cinza e a marca, para ver a animação
    redesenhar: { type: "action", label: "Desenhar de novo" }
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
// "Desenhar de novo": os traços cinza recomeçam e, logo depois, as marcas desenham por cima
function redesenhar() {
  const d = quadro.contentDocument;
  if (!d) return;
  const bases = [...d.querySelectorAll<SVGLineElement>(".traco-base")];
  bases.forEach((b) => (b.style.animation = "none"));
  void d.body.getBoundingClientRect();
  bases.forEach((b) => (b.style.animation = ""));
  // pelo gancho do Guia.astro, sem clicar no link: a marca do submenu vai até o primeiro subitem, com a curva
  setTimeout(() => (quadro.contentWindow as any)?.musaSubmenu?.desenhar?.(0), 900);
}
const kit = createDialKit("Guia: menu lateral", config, { id: "musa-guia-menu", persist: true, onAction: (acao: string) => { if (acao.endsWith("redesenhar")) redesenhar(); } } as any);

let v = kit.getValues() as Record<string, any>;
function aplicar() {
  const guia = quadro.contentDocument?.querySelector<HTMLElement>(".guia");
  if (!guia) return;
  const { coluna: C, migalhas: M, itens: I, icones: X, submenu: S } = v;
  const vars: Record<string, string> = {
    "--menu-largura": `${C.largura}px`, "--menu-gap": `${C.espacoAteOConteudo}px`, "--menu-topo": `${C.distanciaDoTopo}px`, "--menu-espaco-migalhas": `${C.espacoEntreMigalhasEMenu}px`,
    "--migalhas-tamanho": TAMANHOS[M.tamanho], "--migalhas-cor": cor(M.cor), "--migalhas-atual-cor": cor(M.atual), "--migalhas-separador-cor": cor(M.separador),
    "--menu-tamanho": TAMANHOS[I.tamanho], "--menu-peso": PESOS[I.peso], "--menu-py": `${I.respiroVertical}px`, "--menu-px": `${I.respiroHorizontal}px`,
    "--menu-raio": CANTOS[I.cantos], "--menu-entre": `${I.espacoEntreItens}px`, "--menu-icone-gap": `${I.espacoIconeTexto}px`,
    "--menu-cor": cor(I.cor), "--menu-hover-fundo": cor(I.fundoComMouse), "--menu-hover-cor": cor(I.corComMouse),
    "--menu-atual-fundo": cor(I.fundoAtual), "--menu-atual-cor": cor(I.corAtual), "--menu-atual-peso": PESOS[I.pesoAtual],
    "--menu-icone": `${X.tamanho}em`, "--menu-icone-cor": cor(X.cor), "--menu-icone-hover": cor(X.corComMouse), "--menu-icone-atual": cor(X.corAtual),
    "--submenu-recuo": `${S.recuo}px`, "--submenu-linha": cor(S.traco), "--submenu-marca": cor(S.tracoAoClicar),
    "--submenu-espessura": `${S.espessura}px`, "--submenu-desenha-ms": `${S.duracaoDoDesenho}ms`,
    "--menu-traco-afastamento": `${S.afastamentoDoTracoDasPaginas}px`
  };
  Object.entries(vars).forEach(([k, x]) => guia.style.setProperty(k, x));
  guia.toggleAttribute("data-sem-icones", !X.mostrar);
  guia.toggleAttribute("data-sem-submenu", !S.mostrar);
  guia.toggleAttribute("data-sem-traco-paginas", !S.tracoDasPaginas);
}
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// o quadro recarrega ao trocar de página ou largura: espera e reaplica
function vigiar() { if (quadro.contentDocument?.querySelector(".guia")) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
