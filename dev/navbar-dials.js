// Painel DialKit para ajustar a barra de navegação ao vivo. Só roda no servidor local.
// Tudo o que é visual troca classes do Tailwind (as opções abaixo são classes inteiras,
// escritas por extenso para o Tailwind gerar todas). O olho e o "ocioso" são números do
// comportamento, então usam sliders.
// Para levar os ajustes ao código: botão Copy do painel, colar na conversa com o Claude.
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) {
  const { createDialKit, createDialRoot } = await import("/node_modules/dialkit/dist/vanilla/index.js");
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/node_modules/dialkit/dist/vanilla/styles.css";
  document.head.appendChild(css);

  // Cores: primeiro as funções (o que os componentes devem usar), depois todas as primitivas das escalas.
  // Listas escritas por extenso para o Tailwind gerar cada classe.
  const FUNDOS = [
    "bg-transparente",
    "bg-neutro-50",
    "bg-neutro-100",
    "bg-neutro-200",
    "bg-carmim-800",
    "bg-coral-100",
    "bg-coral-200",
    "bg-coral-400",
    "bg-coral-500",
    "bg-carmim-100",
    "bg-carmim-900",
    "bg-coral-300",
    "bg-coral-600",
    "bg-coral-700",
    "bg-coral-800",
    "bg-coral-900",
    "bg-carmim-200",
    "bg-carmim-300",
    "bg-carmim-400",
    "bg-carmim-500",
    "bg-carmim-600",
    "bg-carmim-700",
    "bg-carmim-950",
    "bg-neutro-300",
    "bg-neutro-400",
    "bg-neutro-500",
    "bg-neutro-600",
    "bg-neutro-700",
    "bg-neutro-800",
    "bg-neutro-900",
    "bg-neutro-950",
    "bg-texto-950",
    "bg-texto-900",
    "bg-texto-700",
    "bg-texto-600",
    "bg-texto-400",
    "bg-texto-50"
  ];
  const TEXTOS = [
    "text-texto-950",
    "text-texto-900",
    "text-texto-700",
    "text-texto-600",
    "text-texto-400",
    "text-texto-50",
    "text-coral-700",
    "text-carmim-800",
    "text-carmim-950",
    "text-coral-100",
    "text-coral-200",
    "text-coral-300",
    "text-coral-400",
    "text-coral-500",
    "text-coral-600",
    "text-coral-800",
    "text-coral-900",
    "text-carmim-100",
    "text-carmim-200",
    "text-carmim-300",
    "text-carmim-400",
    "text-carmim-500",
    "text-carmim-600",
    "text-carmim-700",
    "text-carmim-900",
    "text-neutro-50",
    "text-neutro-100",
    "text-neutro-200",
    "text-neutro-300",
    "text-neutro-400",
    "text-neutro-500",
    "text-neutro-600",
    "text-neutro-700",
    "text-neutro-800",
    "text-neutro-900",
    "text-neutro-950"
  ];
  const BORDAS = [
    "border-neutro-300",
    "border-neutro-600",
    "border-neutro-800",
    "border-carmim-700",
    "border-coral-300",
    "border-carmim-300",
    "border-coral-100",
    "border-coral-200",
    "border-coral-400",
    "border-coral-500",
    "border-coral-600",
    "border-coral-700",
    "border-coral-800",
    "border-coral-900",
    "border-carmim-100",
    "border-carmim-200",
    "border-carmim-400",
    "border-carmim-500",
    "border-carmim-600",
    "border-carmim-800",
    "border-carmim-900",
    "border-carmim-950",
    "border-neutro-50",
    "border-neutro-100",
    "border-neutro-200",
    "border-neutro-400",
    "border-neutro-500",
    "border-neutro-700",
    "border-neutro-900",
    "border-neutro-950",
    "border-texto-950",
    "border-texto-900",
    "border-texto-700",
    "border-texto-600",
    "border-texto-400",
    "border-texto-50"
  ];
  const FUNDOS_HOVER = [
    "hover:bg-transparente",
    "hover:bg-neutro-50",
    "hover:bg-neutro-100",
    "hover:bg-neutro-200",
    "hover:bg-carmim-800",
    "hover:bg-coral-100",
    "hover:bg-coral-200",
    "hover:bg-coral-400",
    "hover:bg-coral-500",
    "hover:bg-carmim-100",
    "hover:bg-carmim-900",
    "hover:bg-coral-300",
    "hover:bg-coral-600",
    "hover:bg-coral-700",
    "hover:bg-coral-800",
    "hover:bg-coral-900",
    "hover:bg-carmim-200",
    "hover:bg-carmim-300",
    "hover:bg-carmim-400",
    "hover:bg-carmim-500",
    "hover:bg-carmim-600",
    "hover:bg-carmim-700",
    "hover:bg-carmim-950",
    "hover:bg-neutro-300",
    "hover:bg-neutro-400",
    "hover:bg-neutro-500",
    "hover:bg-neutro-600",
    "hover:bg-neutro-700",
    "hover:bg-neutro-800",
    "hover:bg-neutro-900",
    "hover:bg-neutro-950",
    "hover:bg-texto-950",
    "hover:bg-texto-900",
    "hover:bg-texto-700",
    "hover:bg-texto-600",
    "hover:bg-texto-400",
    "hover:bg-texto-50"
  ];
  const TEXTOS_ATUAL = [
    "data-atual:text-texto-950",
    "data-atual:text-texto-900",
    "data-atual:text-texto-700",
    "data-atual:text-texto-600",
    "data-atual:text-texto-400",
    "data-atual:text-texto-50",
    "data-atual:text-coral-700",
    "data-atual:text-carmim-800",
    "data-atual:text-carmim-950",
    "data-atual:text-coral-100",
    "data-atual:text-coral-200",
    "data-atual:text-coral-300",
    "data-atual:text-coral-400",
    "data-atual:text-coral-500",
    "data-atual:text-coral-600",
    "data-atual:text-coral-800",
    "data-atual:text-coral-900",
    "data-atual:text-carmim-100",
    "data-atual:text-carmim-200",
    "data-atual:text-carmim-300",
    "data-atual:text-carmim-400",
    "data-atual:text-carmim-500",
    "data-atual:text-carmim-600",
    "data-atual:text-carmim-700",
    "data-atual:text-carmim-900",
    "data-atual:text-neutro-50",
    "data-atual:text-neutro-100",
    "data-atual:text-neutro-200",
    "data-atual:text-neutro-300",
    "data-atual:text-neutro-400",
    "data-atual:text-neutro-500",
    "data-atual:text-neutro-600",
    "data-atual:text-neutro-700",
    "data-atual:text-neutro-800",
    "data-atual:text-neutro-900",
    "data-atual:text-neutro-950"
  ];
  const TEXTOS_HOVER = [
    "hover:text-texto-950",
    "hover:text-texto-900",
    "hover:text-texto-700",
    "hover:text-texto-600",
    "hover:text-texto-400",
    "hover:text-texto-50",
    "hover:text-coral-700",
    "hover:text-carmim-800",
    "hover:text-carmim-950",
    "hover:text-coral-100",
    "hover:text-coral-200",
    "hover:text-coral-300",
    "hover:text-coral-400",
    "hover:text-coral-500",
    "hover:text-coral-600",
    "hover:text-coral-800",
    "hover:text-coral-900",
    "hover:text-carmim-100",
    "hover:text-carmim-200",
    "hover:text-carmim-300",
    "hover:text-carmim-400",
    "hover:text-carmim-500",
    "hover:text-carmim-600",
    "hover:text-carmim-700",
    "hover:text-carmim-900",
    "hover:text-neutro-50",
    "hover:text-neutro-100",
    "hover:text-neutro-200",
    "hover:text-neutro-300",
    "hover:text-neutro-400",
    "hover:text-neutro-500",
    "hover:text-neutro-600",
    "hover:text-neutro-700",
    "hover:text-neutro-800",
    "hover:text-neutro-900",
    "hover:text-neutro-950"
  ];

  // caminho do controle -> [elementos que recebem a classe, opções]
  // opção: "classe(s)" ou [rótulo, "classe(s)"]
  const CLASSES = {
    barra: {
      posicao: [".nav", [["Fixa no topo", "sticky top-0"], ["Rola com a página", "relative"]]],
      fundo: [".nav", FUNDOS],
      borda: [".nav", [["Sem borda", "border-b-0"], ["1 px", "border-b"], ["2 px", "border-b-2"]]],
      corDaBorda: [".nav", BORDAS],
      sombra: [".nav", ["shadow-none", "shadow-xs", "shadow-sm", "shadow-md"]],
      altura: [".nav-dentro", ["h-12", "h-14", "h-15", "h-16", "h-18", "h-20"]],
      larguraMaxima: [".nav-dentro", ["max-w-3xl", "max-w-4xl", "max-w-5xl", "max-w-6xl", "max-w-7xl", "max-w-none"]],
      margemLateral: [".nav-dentro", ["px-2", "px-3", "px-4", "px-6", "px-8", "px-12"]],
      espacoMarcaLinks: [".nav-dentro", ["gap-2", "gap-4", "gap-6", "gap-8", "gap-12"]]
    },
    marca: {
      tamanhoDoIcone: [".nav-olho", ["size-6", "size-7", "size-8", "size-9", "size-10", "size-11", "size-12"]],
      espacoIconeNome: [".nav-marca", ["gap-1", "gap-1.5", "gap-2", "gap-2.5", "gap-3", "gap-4"]],
      alturaDoNome: [".nav-nome img", ["h-3", "h-4", "h-5", "h-6", "h-7"]],
      entrada: [".nav-nome", [
        ["Recorte + deslize", "opacity-0 clip-esconde -translate-x-1 group-data-aberto:opacity-100 group-data-aberto:clip-mostra group-data-aberto:translate-x-0"],
        ["Recorte", "clip-esconde group-data-aberto:clip-mostra"],
        ["Esmaecer", "opacity-0 group-data-aberto:opacity-100"],
        ["Deslize", "opacity-0 -translate-x-3 group-data-aberto:opacity-100 group-data-aberto:translate-x-0"],
        ["Desfoque", "opacity-0 blur-xs group-data-aberto:opacity-100 group-data-aberto:blur-none"],
        ["Sempre visível", "opacity-100"]
      ]],
      duracaoDoNome: [".nav-nome", ["duration-100", "duration-150", "duration-200", "duration-250", "duration-300", "duration-400", "duration-500"]],
      curvaDoNome: [".nav-nome", ["ease-forte", "ease-out", "ease-in-out", "ease-entra-sai", "ease-linear"]],
      atrasoDoNome: [".nav-nome", ["delay-0", "delay-75", "delay-100", "delay-150", "delay-200", "delay-300"]]
    },
    links: {
      alinhamento: [".nav-links", [["Direita", "ml-auto"], ["Centro", "mx-auto"], ["Junto da marca", "ml-0"]]],
      espacoEntreLinks: [".nav-lista", ["gap-0", "gap-1", "gap-2", "gap-3", "gap-4", "gap-6"]],
      fonte: [".nav-link", ["font-inter", "font-inter-tight", "font-dm-sans"]],
      tamanho: [".nav-link", ["text-xs", "text-sm", "text-md", "text-lg"]],
      peso: [".nav-link", ["font-normal", "font-medium", "font-semibold", "font-bold"]],
      cor: [".nav-link", TEXTOS],
      respiroLateral: [".nav-link", ["px-0", "px-1", "px-2", "px-2.5", "px-3", "px-4"]],
      respiroVertical: [".nav-link", ["py-1", "py-1.5", "py-2", "py-2.5", "py-3"]],
      cantos: [".nav-link", ["rounded-none", "rounded-xs", "rounded-sm", "rounded-md", "rounded-lg", "rounded-full"]],
      fundoNoHover: [".nav-link", FUNDOS_HOVER],
      corNoHover: [".nav-link", TEXTOS_HOVER],
      corDaPaginaAtual: [".nav-link", TEXTOS_ATUAL],
      sublinhado: [".nav-link", [["Nunca", "no-underline"], ["No hover", "no-underline hover:underline"], ["Sempre", "underline"]]],
      duracaoDoHover: [".nav-link", ["duration-0", "duration-100", "duration-150", "duration-200", "duration-300"]]
    }
  };

  const valor = (o) => (Array.isArray(o) ? o[1] : o);
  const tokens = (s) => s.split(/\s+/).filter(Boolean);
  // padrão = a opção que já está no HTML
  const padrao = (sel, opts) => {
    const el = document.querySelector(sel);
    const atual = el ? [...el.classList] : [];
    const achou = opts.find((o) => tokens(valor(o)).every((t) => atual.includes(t)));
    return valor(achou || opts[0]);
  };

  const config = {};
  for (const [grupo, ctrls] of Object.entries(CLASSES)) {
    config[grupo] = { _collapsed: grupo !== "marca" };
    for (const [nome, [sel, opts]] of Object.entries(ctrls)) {
      config[grupo][nome] = {
        type: "select",
        options: opts.map((o) => (Array.isArray(o) ? { value: o[1], label: o[0] } : o)),
        default: padrao(sel, opts)
      };
    }
  }

  const E = window.MusaEye.CONFIG, N = window.MUSA_NAV || {};
  config.olho = {
    _collapsed: true,
    aneis: { type: "select", options: [{ value: "lockup", label: "Vector.svg (lockup)" }, { value: "v6", label: "Playground v6" }], default: N.aneis || "lockup" },
    duracaoDaTransicao: [E.morphDur, 0.1, 1.5, 0.05],
    atrasoEntreAneis: [E.stagger, 0, 0.6, 0.01],
    olharEmRepouso: { type: "pad", x: [E.restGaze[0], -1, 1, 0.01], y: [E.restGaze[1], -1, 1, 0.01], labels: { x: "horizontal", y: "vertical" } },
    seguirCursor: E.follow,
    pesoDoCursor: [E.followMix, 0, 1, 0.01],
    olhadelas: [E.glance, 0, 0.6, 0.01],
    piscarACadaS: [E.blinkEvery, 0, 12, 0.5],
    respiracao: [E.breathe, 0, 2, 0.05]
  };
  config.ocioso = {
    _collapsed: true,
    ativo: N.ocioso ?? true,
    esperarS: [N.esperarS ?? 5, 1, 20, 0.5],
    repetirMinS: [N.repetirMinS ?? 12, 2, 60, 1],
    repetirMaxS: [N.repetirMaxS ?? 20, 2, 60, 1],
    duracaoS: [N.duracaoS ?? 3.5, 1, 8, 0.1]
  };

  createDialRoot({ position: "bottom-left", theme: "light", defaultOpen: false });
  const kit = createDialKit("Barra de navegação", config, { id: "musa-navbar-v2", persist: true });

  kit.subscribe((v) => {
    for (const [grupo, ctrls] of Object.entries(CLASSES)) {
      for (const [nome, [sel, opts]] of Object.entries(ctrls)) {
        const todas = new Set(opts.flatMap((o) => tokens(valor(o))));
        const escolha = tokens(v[grupo][nome]);
        document.querySelectorAll(sel).forEach((el) => {
          todas.forEach((t) => el.classList.remove(t));
          escolha.forEach((t) => el.classList.add(t));
        });
      }
    }
    const o = v.olho;
    if (o.aneis !== window.MUSA_NAV.aneis) window.MUSA_NAV_TROCAR_ANEIS?.(o.aneis);
    E.morphDur = o.duracaoDaTransicao;
    E.stagger = o.atrasoEntreAneis;
    E.restGaze = [o.olharEmRepouso.x, o.olharEmRepouso.y];
    E.follow = o.seguirCursor;
    E.followMix = o.pesoDoCursor;
    E.glance = o.olhadelas;
    E.blinkEvery = o.piscarACadaS;
    E.breathe = o.respiracao;
    Object.assign(window.MUSA_NAV, {
      ocioso: v.ocioso.ativo, esperarS: v.ocioso.esperarS,
      repetirMinS: v.ocioso.repetirMinS, repetirMaxS: v.ocioso.repetirMaxS, duracaoS: v.ocioso.duracaoS
    });
  });
}
