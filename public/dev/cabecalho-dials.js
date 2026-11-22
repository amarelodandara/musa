// Painéis "Barra de navegação · tamanhos" e "Links de página" (/dev/cabecalho, só no servidor local).
// Cada opção é uma classe do Tailwind, escrita por extenso aqui para o Tailwind gerar (tailwind.css lê public/dev).
// Vale para as duas camadas da barra (a normal e a invertida, sobre o rodapé).
// Para levar ao código: "Copy parameters" no painel e colar na conversa (as classes vão para Cabecalho.astro / MarcaNav.astro).
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) {
  const { createDialKit, createDialRoot } = await import("/node_modules/dialkit/dist/vanilla/index.js");
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/node_modules/dialkit/dist/vanilla/styles.css";
  document.head.appendChild(css);
  createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });

  // caminho do controle -> [seletor, opções, padrão se nenhuma opção estiver no HTML]
  const CLASSES = {
    barra: {
      altura: [".nav-dentro", ["h-12", "h-14", "h-16", "h-18", "h-20", "h-22", "h-24"]],
      margemLateral: [".nav-dentro", ["px-3", "px-4", "px-5", "px-6", "px-8", "px-10", "px-12", "px-16"]],
      larguraMaxima: [".nav-dentro", ["max-w-5xl", "max-w-6xl", "max-w-7xl", "max-w-none"]]
    },
    marca: {
      tamanhoDoIcone: [".nav-olho", ["size-6", "size-7", "size-8", "size-9", "size-10", "size-11", "size-12", "size-14"]],
      alturaDoNome: [".nav-nome img", ["h-5", "h-6", "h-7", "h-8", "h-9", "h-10"]],
      espacoIconeNome: [".nav-marca", ["gap-1", "gap-1.5", "gap-2", "gap-2.5", "gap-3", "gap-4"]]
    },
    botoes: {
      altura: [".nav-links .botao", ["h-8", "h-9", "h-10", "h-11", "h-12"], "h-9"],
      respiroLateral: [".nav-links .botao", ["px-2.5", "px-3", "px-3.5", "px-4", "px-5", "px-6"], "px-3.5"],
      tamanhoDoTexto: [".nav-links .botao", ["text-xs", "text-sm", "text-md", "text-lg"], "text-sm"],
      espacoEntreBotoes: [".nav-links", ["gap-1", "gap-1.5", "gap-2", "gap-3", "gap-4", "gap-6"]]
    }
  };

  // ---------- Links de página (só neste playground: entram por script antes dos botões, nas duas camadas) ----------
  // Na camada invertida (sobre o rodapé carmim) a cor fica fixa em neutro-50; os controles de cor valem para a normal.
  const PAGINAS = { guia: ["Guia", "/guia"], glossario: ["Glossário", "/guia/glossario"], sobre: ["Sobre", "/sobre"] };
  document.querySelectorAll(".nav-links").forEach((nav) => {
    const invertida = !!nav.closest(".nav-invertida");
    const ul = document.createElement("ul");
    ul.className = "nav-paginas flex items-center list-none m-0 p-0 max-md:hidden";
    for (const [chave, [rotulo, href]] of Object.entries(PAGINAS)) {
      const li = document.createElement("li");
      li.dataset.pagina = chave;
      li.innerHTML = `<a class="nav-pagina no-underline transition-colors duration-150 ${invertida ? "text-neutro-50" : ""}" href="${href}"${invertida ? ' tabindex="-1"' : ""}>${rotulo}</a>`;
      ul.append(li);
    }
    nav.prepend(ul);
  });

  // listas por extenso (todas as cores da paleta), para o Tailwind gerar cada classe
  const CORES = [
      "text-coral-50",
      "text-coral-100",
      "text-coral-200",
      "text-coral-300",
      "text-coral-400",
      "text-coral-500",
      "text-coral-600",
      "text-coral-700",
      "text-coral-800",
      "text-coral-900",
      "text-carmim-100",
      "text-carmim-200",
      "text-carmim-300",
      "text-carmim-400",
      "text-carmim-500",
      "text-carmim-600",
      "text-carmim-700",
      "text-carmim-800",
      "text-carmim-900",
      "text-carmim-950",
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
      "text-neutro-950",
      "text-texto-950",
      "text-texto-900",
      "text-texto-700",
      "text-texto-600",
      "text-texto-400",
      "text-texto-50"
    ];
  const CORES_HOVER = [
      "hover:text-coral-50",
      "hover:text-coral-100",
      "hover:text-coral-200",
      "hover:text-coral-300",
      "hover:text-coral-400",
      "hover:text-coral-500",
      "hover:text-coral-600",
      "hover:text-coral-700",
      "hover:text-coral-800",
      "hover:text-coral-900",
      "hover:text-carmim-100",
      "hover:text-carmim-200",
      "hover:text-carmim-300",
      "hover:text-carmim-400",
      "hover:text-carmim-500",
      "hover:text-carmim-600",
      "hover:text-carmim-700",
      "hover:text-carmim-800",
      "hover:text-carmim-900",
      "hover:text-carmim-950",
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
      "hover:text-neutro-950",
      "hover:text-texto-950",
      "hover:text-texto-900",
      "hover:text-texto-700",
      "hover:text-texto-600",
      "hover:text-texto-400",
      "hover:text-texto-50"
    ];

  const links = createDialKit("Links de página", {
    mostrar: { guia: true, glossario: true, sobre: true },
    ordem: { type: "select", options: [
      { value: "guia glossario sobre", label: "Guia, Glossário, Sobre" },
      { value: "guia sobre glossario", label: "Guia, Sobre, Glossário" },
      { value: "sobre guia glossario", label: "Sobre, Guia, Glossário" },
      { value: "glossario guia sobre", label: "Glossário, Guia, Sobre" }
    ], default: "guia glossario sobre" },
    texto: {
      fonte: { type: "select", options: ["font-inter", "font-inter-tight", "font-dm-sans"], default: "font-inter" },
      tamanho: { type: "select", options: ["text-xs", "text-sm", "text-md", "text-lg"], default: "text-xs" },
      peso: { type: "select", options: ["font-normal", "font-medium", "font-semibold", "font-bold"], default: "font-normal" },
      cor: { type: "select", options: CORES, default: "text-texto-700" },
      corNoHover: { type: "select", options: CORES_HOVER, default: "hover:text-carmim-800" }
    },
    paginaAtual: {
      simular: { type: "select", options: [{ value: "", label: "Nenhuma" }, { value: "guia", label: "Guia" }, { value: "glossario", label: "Glossário" }, { value: "sobre", label: "Sobre" }], default: "" },
      cor: { type: "select", options: CORES, default: "text-carmim-800" },
      peso: { type: "select", options: ["font-normal", "font-medium", "font-semibold", "font-bold"], default: "font-semibold" }
    },
    espacos: {
      entreLinks: { type: "select", options: ["gap-2", "gap-3", "gap-4", "gap-5", "gap-6", "gap-8", "gap-10"], default: "gap-6" },
      ateOsBotoes: { type: "select", options: ["mr-0", "mr-2", "mr-4", "mr-6", "mr-8", "mr-10", "mr-12", "mr-16"], default: "mr-6" } // soma com o espaço entre os botões (gap do .nav-links)
    }
  }, { id: "musa-cabecalho-links", persist: true });

  const PESOS = ["font-normal", "font-medium", "font-semibold", "font-bold"];
  const troca = (el, opcoes, escolha) => { el.classList.remove(...opcoes); el.classList.add(...escolha.split(" ")); };
  links.subscribe((v) => {
    document.querySelectorAll(".nav-paginas").forEach((ul) => {
      const invertida = !!ul.closest(".nav-invertida");
      troca(ul, ["gap-2", "gap-3", "gap-4", "gap-5", "gap-6", "gap-8", "gap-10"], v.espacos.entreLinks);
      troca(ul, ["mr-0", "mr-2", "mr-4", "mr-6", "mr-8", "mr-10", "mr-12", "mr-16"], v.espacos.ateOsBotoes);
      v.ordem.split(" ").forEach((k) => ul.append(ul.querySelector(`[data-pagina="${k}"]`)));
      ul.querySelectorAll("li").forEach((li) => {
        const k = li.dataset.pagina, a = li.firstElementChild, atual = v.paginaAtual.simular === k;
        li.hidden = !v.mostrar[k];
        troca(a, ["font-inter", "font-inter-tight", "font-dm-sans"], v.texto.fonte);
        troca(a, ["text-xs", "text-sm", "text-md", "text-lg"], v.texto.tamanho);
        troca(a, PESOS, atual ? v.paginaAtual.peso : v.texto.peso);
        if (!invertida) {
          troca(a, CORES, atual ? v.paginaAtual.cor : v.texto.cor);
          troca(a, CORES_HOVER, v.texto.corNoHover);
        }
        if (atual && !invertida) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
    });
  });

  const padrao = (sel, opts, reserva) => {
    const c = document.querySelector(sel)?.classList;
    return opts.find((o) => c?.contains(o)) || reserva || opts[0];
  };
  const config = {};
  for (const [grupo, ctrls] of Object.entries(CLASSES)) {
    config[grupo] = {};
    for (const [nome, [sel, opts, reserva]] of Object.entries(ctrls))
      config[grupo][nome] = { type: "select", options: opts, default: padrao(sel, opts, reserva) };
  }

  const kit = createDialKit("Barra de navegação · tamanhos", config, { id: "musa-cabecalho-tamanhos", persist: true });
  kit.subscribe((v) => {
    for (const [grupo, ctrls] of Object.entries(CLASSES))
      for (const [nome, [sel, opts]] of Object.entries(ctrls))
        document.querySelectorAll(sel).forEach((el) => { el.classList.remove(...opts); el.classList.add(v[grupo][nome]); });
  });
}
