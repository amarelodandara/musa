// Painéis da página de revisão da abertura, dev/abertura.html (só no servidor local).
// Tudo o que é visual troca classes do Tailwind. Sliders de posição escolhem uma classe padrão
// (left-N, right-N, top-N, w-N), que dentro do palco escala com ele (ver .palco em estilo.css).
// Para levar ao código: "Copy parameters" de cada painel (e "Copiar caminho"), colar na conversa.
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) {
  const { createDialKit, createDialRoot } = await import("/node_modules/dialkit/dist/vanilla/index.js");
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/node_modules/dialkit/dist/vanilla/styles.css";
  document.head.appendChild(css);
  createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });

  const FUNDOS = [
    "bg-neutro-50",
    "bg-neutro-100",
    "bg-neutro-200",
    "bg-carmim-800",
    "bg-coral-100",
    "bg-coral-200",
    "bg-coral-300",
    "bg-coral-400",
    "bg-coral-500",
    "bg-coral-600",
    "bg-coral-700",
    "bg-coral-800",
    "bg-coral-900",
    "bg-carmim-100",
    "bg-carmim-200",
    "bg-carmim-300",
    "bg-carmim-400",
    "bg-carmim-500",
    "bg-carmim-600",
    "bg-carmim-700",
    "bg-carmim-900",
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
    "text-coral-50",
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
  const TRACOS_COR = [
    "stroke-texto-950",
    "stroke-texto-900",
    "stroke-texto-700",
    "stroke-texto-600",
    "stroke-texto-400",
    "stroke-texto-50",
    "stroke-neutro-300",
    "stroke-neutro-600",
    "stroke-neutro-800",
    "stroke-carmim-700",
    "stroke-coral-300",
    "stroke-coral-400",
    "stroke-coral-500",
    "stroke-carmim-300",
    "stroke-carmim-800",
    "stroke-carmim-900",
    "stroke-coral-100",
    "stroke-coral-200",
    "stroke-coral-600",
    "stroke-coral-700",
    "stroke-coral-800",
    "stroke-coral-900",
    "stroke-carmim-100",
    "stroke-carmim-200",
    "stroke-carmim-400",
    "stroke-carmim-500",
    "stroke-carmim-600",
    "stroke-carmim-950",
    "stroke-neutro-50",
    "stroke-neutro-100",
    "stroke-neutro-200",
    "stroke-neutro-400",
    "stroke-neutro-500",
    "stroke-neutro-700",
    "stroke-neutro-900",
    "stroke-neutro-950"
  ];
  const TAMANHOS = ["text-2xs", "text-xs", "text-sm", "text-md", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl"];
  const PESOS = ["font-light", "font-normal", "font-medium", "font-semibold", "font-bold"];
  const FAMILIAS = ["font-inter", "font-inter-tight", "font-dm-sans", "font-mono"];
  const ENTRELINHAS = ["leading-none", "leading-tight", "leading-snug", "leading-normal", "leading-relaxed"];
  const TRACKINGS = ["tracking-tighter", "tracking-tight", "tracking-normal", "tracking-wide", "tracking-wider", "tracking-widest"];
  const ALINHA = ["text-left", "text-center", "text-right"];
  const CAIXA = [{ value: "uppercase", label: "MAIÚSCULAS" }, { value: "normal-case", label: "Como escrito" }];
  const OPACIDADES = ["opacity-100", "opacity-90", "opacity-80", "opacity-70", "opacity-60", "opacity-50", "opacity-40", "opacity-30"];
  const TRACOS_PLANTA = ["traco-0.5", "traco-0.75", "traco-1", "traco-1.25", "traco-1.5", "traco-2"];
  const TRACOS_CAMINHO = ["traco-2", "traco-3", "traco-4", "traco-5", "traco-6", "traco-7", "traco-8", "traco-9", "traco-10", "traco-12", "traco-14"];

  const doc = document;
  const el = (s) => doc.querySelector(s);
  const atual = (sel, lista) => { const c = el(sel)?.classList; return lista.find((x) => c?.contains(x)) || lista[0]; };
  const num = (sel, prefixo, padrao) => { const c = [...(el(sel)?.classList || [])].find((x) => x.startsWith(prefixo + "-")); return c ? Number(c.slice(prefixo.length + 1)) : padrao; };
  const trocar = (sel, lista, valor) => { const e = el(sel); if (!e) return; lista.forEach((x) => e.classList.remove(x)); if (valor) e.classList.add(...valor.split(" ")); };
  const trocarNum = (sel, prefixo, valor) => { const e = el(sel); if (!e) return; [...e.classList].filter((x) => x.startsWith(prefixo + "-")).forEach((x) => e.classList.remove(x)); e.classList.add(`${prefixo}-${valor}`); };
  const sel = (lista, sel_) => ({ type: "select", options: lista, default: atual(sel_, lista) });

  // Foco (só na abertura com o mapa): um assunto por vez, para o painel não pesar.
  //   sem parâmetro ou ?foco=texto: só o painel "Texto de entrada", com a abertura parada no fim (texto inteiro à vista)
  //   ?foco=animacao: só "Linha do tempo" e "Entrada do texto"
  //   ?foco=fim: só "Quadro final", com a abertura parada no último quadro
  //   ?foco=tudo: todos os painéis, como antes
  const FOCO = el(".abertura-mapa") ? (new URLSearchParams(location.search).get("foco") || "texto") : "tudo";
  const mostrar = (assunto) => FOCO === "tudo" || FOCO === assunto;

  // ---------- Linha do tempo (primeiro painel: tocar, pausar e andar pela animação) ----------
  const A = window.MUSA_ABERTURA;
  if (A && (FOCO === "texto" || FOCO === "fim")) { A.pausar(); A.ir(A.FIM); }
  if (A && mostrar("animacao")) {
    const PASSOS = A.PASSOS.map(([rotulo, t]) => ({ value: String(t), label: rotulo }));
    let interno = false, anterior = {};
    const abertura = createDialKit("Linha do tempo", {
      tocar: { type: "action", label: "Tocar / continuar" },
      pausar: { type: "action", label: "Pausar" },
      doInicio: { type: "action", label: "Tocar do início" },
      passo: { type: "select", options: PASSOS, default: "0" },
      tempo: [Math.min(12.2, A.FIM), 0, A.FIM, 0.05], // arraste para andar pela animação (pausa sozinha)
      velocidade: { type: "select", options: [{ value: "0.25", label: "0,25×" }, { value: "0.5", label: "0,5×" }, { value: "1", label: "1×" }, { value: "2", label: "2×" }], default: "1" }
    }, {
      id: "musa-abertura-dev",
      onAction(p) { if (p === "tocar") A.tocar(); if (p === "pausar") A.pausar(); if (p === "doInicio") A.reiniciar(); }
    });
    abertura.subscribe((v) => {
      if (interno) { anterior = v; return; }
      if (v.passo !== anterior.passo && anterior.passo !== undefined) { A.pausar(); A.ir(Number(v.passo)); }
      else if (v.tempo !== anterior.tempo && anterior.tempo !== undefined) { A.pausar(); A.ir(v.tempo); }
      A.velocidade(Number(v.velocidade));
      anterior = v;
    });
    let ultimoAviso = 0;
    (function vigiar() {
      if (A.tocando && performance.now() - ultimoAviso > 100) {
        ultimoAviso = performance.now();
        interno = true; abertura.setValue("tempo", Math.round(A.tempo * 20) / 20); interno = false;
      }
      requestAnimationFrame(vigiar);
    })();
  }

  // ---------- Texto de entrada (só na abertura com o mapa) ----------
  // Conteúdo, aparência e entrada (uma linha por vez) do título, subtítulo e botões.
  // Aparência vai em style no elemento (vence o estilo.css); a entrada vai em data-* no .hero, lida pelo abertura-mapa.js.
  if (el(".abertura-mapa") && A) {
    const H = ".abertura-mapa .hero";
    const tam = (c) => `var(--tamanho-${c.replace("text-", "")})`;
    const corV = (c) => `var(--${c.replace("text-", "")})`;
    const PESO = { "font-light": "300", "font-normal": "400", "font-medium": "500", "font-semibold": "600", "font-bold": "700" };
    const FAM = { "font-inter": "var(--fonte-inter)", "font-inter-tight": "var(--fonte-inter-tight)", "font-dm-sans": "var(--fonte-dm-sans)", "font-mono": "var(--fonte-mono)" };
    const ENTRE = { "leading-none": "1", "leading-tight": "1.15", "leading-snug": "1.3", "leading-normal": "1.45", "leading-relaxed": "1.6" };
    const TRACK = { "tracking-tighter": "-0.03em", "tracking-tight": "-0.01em", "tracking-normal": "0em", "tracking-wide": "0.02em", "tracking-wider": "0.04em", "tracking-widest": "0.1em" };
    const CURVAS = [
      { value: "cubic-bezier(0.23, 1, 0.32, 1)", label: "Saída forte (padrão)" },
      { value: "cubic-bezier(0.16, 1, 0.3, 1)", label: "Saída suave (expo)" },
      { value: "cubic-bezier(0.77, 0, 0.175, 1)", label: "Entra e sai" },
      { value: "ease", label: "ease" },
      { value: "linear", label: "Linear" }
    ];
    const s1 = (lista, def) => ({ type: "select", options: lista, default: def });
    const texto = (q) => { const e = el(`${H} ${q}`); return e ? (e.dataset.original ?? e.textContent.trim()) : ""; };
    const textoDeEntrada = mostrar("texto") ? createDialKit("Texto de entrada", {
      conteudo: {
        _collapsed: true,
        titulo: { type: "text", default: texto("h1") },
        subtitulo: { type: "text", default: texto(".lead") },
        botaoPrincipal: { type: "text", default: texto(".acoes-hero a:not(.secundario)") },
        botaoSecundario: { type: "text", default: texto(".acoes-hero a.secundario") }
      },
      titulo: { _collapsed: false, tamanho: s1(TAMANHOS, "text-2xl"), peso: s1(Object.keys(PESO), "font-semibold"), familia: s1(Object.keys(FAM), "font-dm-sans"), cor: s1(TEXTOS, "text-texto-950"),
        entrelinha: s1(Object.keys(ENTRE), "leading-tight"), espacamento: s1(Object.keys(TRACK), "tracking-tight"), largura: [30, 10, 40, 1] },
      subtitulo: { _collapsed: true, tamanho: s1(TAMANHOS, "text-lg"), peso: s1(Object.keys(PESO), "font-normal"), familia: s1(Object.keys(FAM), "font-inter"), cor: s1(TEXTOS, "text-texto-900"),
        entrelinha: s1(Object.keys(ENTRE), "leading-normal"), largura: [60, 30, 80, 1] },
      espacos: { _collapsed: true, tituloAteSubtitulo: [8, 0, 64, 2], subtituloAteBotoes: [24, 0, 80, 2],
        alinhamento: s1([{ value: "center", label: "Centro" }, { value: "left", label: "Esquerda" }], "center") }
    }, { id: "musa-abertura-mapa-texto-v2", persist: true }) : null;
    let anterior = "";
    textoDeEntrada?.subscribe((v) => {
      const chave = JSON.stringify(v); if (chave === anterior) return; anterior = chave;
      const hero = el(H), C = v.conteudo;
      const pro = (q, d) => { const e = el(`${H} ${q}`); if (e) Object.assign(e.style, d); return e; };
      const conteudo = (q, t) => { const e = el(`${H} ${q}`); if (e && e.dataset.original !== t) e.dataset.original = t; };
      conteudo("h1", C.titulo); conteudo(".lead", C.subtitulo);
      const b1 = el(`${H} .acoes-hero a:not(.secundario)`), b2 = el(`${H} .acoes-hero a.secundario`);
      if (b1) b1.textContent = C.botaoPrincipal; if (b2) b2.textContent = C.botaoSecundario;
      const T = v.titulo, L = v.subtitulo, E = v.espacos;
      pro("h1", { fontSize: tam(T.tamanho), fontWeight: PESO[T.peso], fontFamily: FAM[T.familia], color: corV(T.cor), lineHeight: ENTRE[T.entrelinha], letterSpacing: TRACK[T.espacamento],
        maxWidth: `${T.largura}ch`, margin: `0 ${E.alinhamento === "center" ? "auto" : "0"} ${E.tituloAteSubtitulo}px` });
      pro(".lead", { fontSize: tam(L.tamanho), fontWeight: PESO[L.peso], fontFamily: FAM[L.familia], color: corV(L.cor), lineHeight: ENTRE[L.entrelinha],
        maxWidth: `${L.largura}ch`, margin: `0 ${E.alinhamento === "center" ? "auto" : "0"} ${E.subtituloAteBotoes}px` });
      hero.style.textAlign = E.alinhamento;
      const acoes = el(`${H} .acoes-hero`); if (acoes) acoes.style.justifyContent = E.alinhamento === "center" ? "center" : "flex-start";
      const t = A.tempo; A.remontar(); A.ir(t); // refaz as linhas (texto ou tamanho mudaram) e mantém o ponto da animação
    });

    // Entrada do texto: uma linha por vez (data-* no .hero, lidos pelo abertura-mapa.js)
    const entrada = mostrar("animacao") ? createDialKit("Entrada do texto", {
      atraso: [0.1, 0, 2, 0.05], intervalo: [0.09, 0, 0.5, 0.01], duracao: [0.8, 0.2, 2, 0.05], deslocamento: [12, 0, 40, 1], desfoque: [6, 0, 20, 0.5],
      curva: s1(CURVAS, CURVAS[0].value), reverTocar: { type: "action", label: "Ver a entrada de novo" }
    }, {
      id: "musa-abertura-mapa-entrada", persist: true,
      onAction(p) { if (p === "reverTocar") { A.ir(0); A.tocar(); } }
    }) : null;
    let entradaAnterior = "";
    entrada?.subscribe((N) => {
      const chave = JSON.stringify(N); if (chave === entradaAnterior) return; entradaAnterior = chave;
      Object.assign(el(H).dataset, { linhaAtraso: N.atraso, linhaIntervalo: N.intervalo, linhaDur: N.duracao, linhaY: N.deslocamento, linhaDesfoque: N.desfoque, linhaCurva: N.curva });
      const t = A.tempo; A.remontar(); A.ir(t);
    });
  }

  // ---------- Quadro final (o mapa no fim da abertura) ----------
  // Variáveis --quadro-* no .palco-quadro (ver AberturaMapa.astro) e data-vista (quanto do mapa cabe na largura).
  // Cada mudança remonta a abertura: o mapa é reencaixado e a linha de giz mede de novo onde pousar.
  if (el(".abertura-mapa .palco-quadro") && A && mostrar("fim")) {
    const q = el(".abertura-mapa .palco-quadro");
    // preto (o de hoje) e todos os tons da paleta (os mesmos de TEXTOS, sem o "text-")
    const CORES_SOMBRA = [{ value: "preto", label: "Preto" }, ...TEXTOS.map((c) => c.replace("text-", ""))];
    const quadroFinal = createDialKit("Quadro final", {
      tamanho: {
        largura: [124, 60, 180, 1],   // % da largura do palco (não passa da janela)
        topo: [0, -20, 40, 1],       // % da altura do palco
        altura: [132, 40, 260, 1],    // % da altura do palco; acima de 100 desce por trás do texto
        mapaVisivel: [1540, 900, 3200, 4] // px do mapa que cabem na largura: menor = mapa maior (zoom)
      },
      esmaecer: {
        inicio: [44, 0, 100, 1],     // % da altura do quadro onde começa a sumir
        fim: [84, 0, 100, 1],        // % onde já sumiu (cor do fundo)
        lados: [0, 0, 30, 1]         // % da largura que some em cada lado (0 = sem degradê nos lados)
      },
      acabamento: {
        cantos: [4, 0, 24, 1],
        sombra: [0.22, 0, 1, 0.01],
        corDaSombra: { type: "select", options: CORES_SOMBRA, default: "carmim-800" }
      },
      verFim: { type: "action", label: "Ir para o fim" },
      verTransicao: { type: "action", label: "Ver o quadro entrar" }
    }, {
      id: "musa-abertura-mapa-quadro-v2", persist: true,
      onAction(p) {
        if (p === "verFim") { A.pausar(); A.ir(A.FIM); }
        if (p === "verTransicao") { const p5 = A.PASSOS.find(([r]) => r.includes("Tudo esmaece")); A.ir(p5 ? p5[1] : 9.6); A.tocar(); }
      }
    });
    let qAnterior = "";
    quadroFinal.subscribe((v) => {
      const chave = JSON.stringify(v); if (chave === qAnterior) return; qAnterior = chave;
      const T = v.tamanho, E = v.esmaecer, K = v.acabamento;
      q.style.setProperty("--quadro-largura", `${T.largura}%`);
      q.style.setProperty("--quadro-topo", `${T.topo}%`);
      q.style.setProperty("--quadro-altura", `${T.altura}%`);
      q.style.setProperty("--quadro-esmaece-inicio", `${Math.min(E.inicio, E.fim)}%`);
      q.style.setProperty("--quadro-esmaece-fim", `${E.fim}%`);
      q.style.setProperty("--quadro-esmaece-lados", `${E.lados}%`);
      q.style.setProperty("--quadro-cantos", `${K.cantos}px`);
      q.style.setProperty("--quadro-sombra", String(K.sombra));
      q.style.setProperty("--quadro-sombra-cor", K.corDaSombra === "preto" ? "#000" : `var(--${K.corDaSombra})`);
      q.dataset.vista = T.mapaVisivel;
      const t = A.tempo; A.remontar(); A.ir(t);
    });
  }

  // os outros painéis (página, conteúdo, textos, desenho, giz) só aparecem com ?foco=tudo
  if (FOCO === "tudo") {

  // ---------- Página ----------
  const pagina = createDialKit("Página", { fundo: { type: "select", options: FUNDOS, default: FUNDOS.find((c) => doc.body.classList.contains(c)) || "bg-neutro-50" } }, { id: "musa-pagina-v2", persist: true });
  pagina.subscribe((v) => trocar("body", FUNDOS, v.fundo));

  // ---------- Textos e "Seu museu" ----------
  // [seletor, controles numéricos (prefixo, rótulo, min, max, passo, padrão), selects]
  const TEXTO = (s, pos) => ({
    ...Object.fromEntries(pos.map(([pre, nome, min, max, passo, padrao]) => [nome, [num(s, pre, padrao), min, max, passo]])),
    tamanhoDaFonte: sel(TAMANHOS, s),
    familia: sel(FAMILIAS, s), peso: sel(PESOS, s), cor: sel(TEXTOS, s),
    entrelinha: sel(ENTRELINHAS, s), espacamento: sel(TRACKINGS, s), alinhamento: sel(ALINHA, s)
  });
  // unidades do palco: 1 = 4 px num palco de 1080 × 600 (largura vai até 270, altura até 150)
  const POS_A = [["right", "direita", 0, 270, 1, 153], ["top", "topo", 0, 150, 1, 21], ["w", "largura", 10, 270, 1, 67]];
  const POS_B = [["left", "esquerda", 0, 270, 1, 136], ["top", "topo", 0, 150, 1, 102], ["w", "largura", 10, 270, 1, 113]];
  const POS_R = [["right", "direita", 0, 270, 1, 96], ["top", "topo", 0, 150, 1, 31]];
  // ---------- Conteúdo de cada camada de texto ----------
  // Na frase final, *palavra* vira grifo (o sublinhado animado).
  const CONTEUDO = {
    fraseInicial: ".frase-a", fraseFinal: ".frase-b", seuMuseu: ".rotulo-museu",
    busca: ".busca-texto", agendaTitulo: ".agenda-titulo", agendaDetalhe: ".agenda-detalhe", pular: ".pular",
    tagline: ".abertura .tagline", titulo: ".abertura h1", subtitulo: ".abertura .lead",
    botaoUsar: ".abertura .acoes-hero a:not(.secundario)", botaoAprender: ".abertura .acoes-hero a.secundario"
  };
  // na abertura com o mapa, o texto de entrada tem painel próprio ("Texto de entrada")
  if (el(".abertura-mapa")) ["tagline", "titulo", "subtitulo", "botaoUsar", "botaoAprender"].forEach((k) => delete CONTEUDO[k]);
  const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const lerConteudo = (k, e) => k === "busca" ? e.dataset.texto
    : k === "fraseFinal" ? [...e.childNodes].map((n) => n.nodeType === 1 && n.classList.contains("grifo") ? `*${n.textContent}*` : n.textContent).join("")
    : e.textContent.trim();
  const conteudo = createDialKit("Conteúdo", Object.fromEntries(Object.entries(CONTEUDO).map(([k, s]) =>
    [k, { type: "text", default: el(s) ? lerConteudo(k, el(s)) : "" }])), { id: "musa-abertura-conteudo", persist: true });
  // palavras grifadas no HTML original: se o texto salvo no painel não tiver *asteriscos*
  // (salvo antes de existir o grifo), elas voltam a ser grifadas, para os traços não sumirem
  const GRIFADAS = [...(el(".frase-b")?.querySelectorAll(".grifo") || [])].map((g) => g.textContent);
  const comGrifos = (t) => t.includes("*") ? t : GRIFADAS.reduce((a, w) => a.replace(w, `*${w}*`), t);
  let conteudoAnterior = "";
  conteudo.subscribe((v) => {
    const chave = JSON.stringify(v); if (chave === conteudoAnterior) return; conteudoAnterior = chave;
    for (const [k, s] of Object.entries(CONTEUDO)) {
      const e = el(s); if (!e) continue;
      if (k === "busca") e.dataset.texto = v[k];
      else if (k === "fraseFinal") e.innerHTML = esc(comGrifos(v[k])).replace(/\*([^*]+)\*/g, '<span class="grifo">$1</span>');
      else e.textContent = v[k];
    }
    window.MUSA_ABERTURA?.remontar();
  });

  const textos = createDialKit("Textos", {
    fraseInicial: TEXTO(".frase-a", POS_A),
    fraseFinal: { _collapsed: true, ...TEXTO(".frase-b", POS_B) },
    seuMuseu: { ...TEXTO(".rotulo-museu", POS_R), caixa: sel(CAIXA.map((c) => c.value), ".rotulo-museu") }
  }, { id: "musa-abertura-textos-v3", persist: true });
  const ALVOS = { fraseInicial: [".frase-a", POS_A], fraseFinal: [".frase-b", POS_B], seuMuseu: [".rotulo-museu", POS_R] };
  textos.subscribe((v) => {
    for (const [grupo, [s, pos]] of Object.entries(ALVOS)) {
      const g = v[grupo];
      pos.forEach(([pre, nome]) => trocarNum(s, pre, g[nome]));
      trocar(s, TAMANHOS, g.tamanhoDaFonte);
      trocar(s, FAMILIAS, g.familia); trocar(s, PESOS, g.peso); trocar(s, TEXTOS, g.cor);
      trocar(s, ENTRELINHAS, g.entrelinha); trocar(s, TRACKINGS, g.espacamento); trocar(s, ALINHA, g.alinhamento);
      if (g.caixa) trocar(s, CAIXA.map((c) => c.value), g.caixa);
    }
    window.MUSA_ABERTURA?.remontar(); // os grifos seguem as palavras
  });

  // ---------- Desenho: planta e caminho ----------
  const caminho = el("#caminho");
  const ORIGINAL = caminho.getAttribute("d");
  let salvo = null;
  try { salvo = localStorage.getItem("musa-caminho"); } catch (e) {}
  if (salvo && A) A.definirCaminho(salvo);

  // ---------- Editor de pontos do caminho ----------
  // Âncoras (círculos cheios) e alças (círculos vazados) da curva; arrastar uma âncora leva as alças junto.
  const editor = (() => {
    const svg = el(".palco-svg"), NS = "http://www.w3.org/2000/svg";
    const camada = doc.createElementNS(NS, "g");
    camada.style.display = "none";
    svg.appendChild(camada);
    let ligado = false, pts = [];
    const ler = () => { const n = caminho.getAttribute("d").match(/-?\d*\.?\d+/g).map(Number); pts = []; for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]); };
    const escrever = () => "M" + pts[0].join(" ") + pts.slice(1).reduce((s, p, i) => s + (i % 3 === 0 ? " C" : " ") + p.map((v) => Math.round(v)).join(" "), "");
    const ancora = (i) => i === 0 || i % 3 === 0;
    function redesenhar() {
      if (!ligado) return;
      ler();
      camada.innerHTML = "";
      for (let i = 1; i < pts.length; i += 3) {
        [[i - 1, i], [i + 2, i + 1]].forEach(([a, c]) => {
          const l = doc.createElementNS(NS, "line");
          l.setAttribute("x1", pts[a][0]); l.setAttribute("y1", pts[a][1]); l.setAttribute("x2", pts[c][0]); l.setAttribute("y2", pts[c][1]);
          l.setAttribute("stroke", "#1E5BD8"); l.setAttribute("stroke-width", "1"); l.setAttribute("vector-effect", "non-scaling-stroke");
          camada.appendChild(l);
        });
      }
      pts.forEach(([x, y], i) => {
        const c = doc.createElementNS(NS, "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", ancora(i) ? 6 : 4.5);
        c.setAttribute("fill", ancora(i) ? "#1E5BD8" : "#fff"); c.setAttribute("stroke", "#1E5BD8"); c.setAttribute("stroke-width", "1.5");
        c.setAttribute("vector-effect", "non-scaling-stroke"); c.style.cursor = "grab"; c.dataset.i = i;
        camada.appendChild(c);
      });
    }
    let arrasto = null;
    const paraSvg = (e) => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return [p.x, p.y]; };
    camada.addEventListener("pointerdown", (e) => {
      const i = Number(e.target.dataset?.i); if (Number.isNaN(i)) return;
      e.preventDefault(); camada.setPointerCapture(e.pointerId);
      arrasto = { i, inicio: paraSvg(e), orig: pts.map((p) => p.slice()) };
    });
    camada.addEventListener("pointermove", (e) => {
      if (!arrasto) return;
      const [x, y] = paraSvg(e), dx = x - arrasto.inicio[0], dy = y - arrasto.inicio[1], i = arrasto.i;
      const mover = ancora(i) ? [i - 1, i, i + 1].filter((j) => j >= 0 && j < pts.length) : [i];
      mover.forEach((j) => { pts[j] = [arrasto.orig[j][0] + dx, arrasto.orig[j][1] + dy]; });
      A?.definirCaminho(escrever());
      redesenhar();
    });
    camada.addEventListener("pointerup", () => {
      if (!arrasto) return; arrasto = null;
      try { localStorage.setItem("musa-caminho", caminho.getAttribute("d")); } catch (e) {}
    });
    return {
      redesenhar,
      ligar(sim) {
        if (sim === ligado) return; ligado = sim;
        camada.style.display = sim ? "" : "none";
        svg.style.pointerEvents = sim ? "auto" : "";
        svg.style.zIndex = sim ? "5" : ""; // acima dos textos, para as alças receberem o arrasto
        svg.closest(".palco").style.userSelect = sim ? "none" : "";
        if (sim && A) { A.pausar(); A.ir(A.roteiro.caminho + A.roteiro.caminhoDur + 0.3); }
        redesenhar();
      }
    };
  })();

  window.MUSA_EDITOR_CAMINHO = editor; // acesso pelo console, se precisar
  const desenho = createDialKit("Desenho", {
    planta: { traco: sel(TRACOS_PLANTA, ".planta-traco"), cor: sel(TRACOS_COR, ".planta-traco"), opacidade: sel(OPACIDADES, ".planta") },
    caminho: {
      traco: sel(TRACOS_CAMINHO, "#caminho"), cor: sel(TRACOS_COR, "#caminho"),
      duracaoDoDesenhoS: [A ? A.roteiro.caminhoDur : 4, 1.5, 10, 0.1],
      editarPontos: false,
      copiarCaminho: { type: "action", label: "Copiar caminho" },
      restaurarCaminho: { type: "action", label: "Voltar ao caminho original" }
    }
  }, {
    id: "musa-abertura-desenho-v2", persist: true,
    onAction(p) {
      if (p === "caminho.copiarCaminho") navigator.clipboard?.writeText(caminho.getAttribute("d")).catch(() => {});
      if (p === "caminho.restaurarCaminho") { try { localStorage.removeItem("musa-caminho"); } catch (e) {} A?.definirCaminho(ORIGINAL); editor.redesenhar(); }
    }
  });
  desenho.subscribe((v) => {
    trocar(".planta-traco", TRACOS_PLANTA, v.planta.traco); trocar(".planta-traco", TRACOS_COR, v.planta.cor); trocar(".planta", OPACIDADES, v.planta.opacidade);
    trocar("#caminho", TRACOS_CAMINHO, v.caminho.traco); trocar("#caminho", TRACOS_COR, v.caminho.cor);
    A?.sincronizarGiz(); // os grifos copiam a classe de traço e a cor do caminho
    if (A && A.roteiro.caminhoDur !== v.caminho.duracaoDoDesenhoS) { A.roteiro.caminhoDur = v.caminho.duracaoDoDesenhoS; A.remontar(); }
    editor.ligar(v.caminho.editarPontos);
  });

  // ---------- Giz de cera (caminho e grifos) ----------
  // Mexe nos números do filtro #giz em index.html (o mesmo filtro no caminho e nos grifos).
  // Para levar ao código: "Copy parameters" e colar na conversa (os números vão para o <filter id="giz">).
  {
    const f = el("#giz"), [ruidoBorda, desloca, ruidoGrao, matriz] = [...f.children];
    const freq = (n) => Number(n.getAttribute("baseFrequency").split(/[\s,]+/)[0]);
    const m = matriz.getAttribute("values").trim().split(/\s+/).map(Number);
    const contraste0 = m[18], cobertura0 = m[19] + m[18] / 2; // cobertura = opacidade do traço no ruído médio
    const palco = el(".palco");
    const lerEm = (prop, padrao) => parseFloat(getComputedStyle(palco).getPropertyValue(prop)) || padrao;
    const giz = createDialKit("Giz", {
      ligado: true,
      grao: {
        tamanho: [freq(ruidoGrao), 0.2, 4, 0.05],          // frequência do ruído: maior = grão mais fino
        cobertura: [Math.round(cobertura0 * 100) / 100, 0.2, 1.6, 0.01], // menor = mais papel aparecendo
        contraste: [contraste0, 0, 12, 0.1],              // maior = falhas mais nítidas
        camadas: [Number(ruidoGrao.getAttribute("numOctaves")), 1, 5, 1],
        semente: [Number(ruidoGrao.getAttribute("seed")), 1, 99, 1]
      },
      borda: {
        aspereza: [Number(desloca.getAttribute("scale")), 0, 12, 0.1], // quanto o contorno treme
        frequencia: [freq(ruidoBorda), 0.02, 2, 0.01],                 // menor = ondas longas, maior = serrilhado
        camadas: [Number(ruidoBorda.getAttribute("numOctaves")), 1, 5, 1],
        semente: [Number(ruidoBorda.getAttribute("seed")), 1, 99, 1]
      },
      grifo: {
        // cor e espessura seguem o caminho (painel Desenho); aqui só a altura do grifo em relação ao texto
        baseEm: [lerEm("--grifo-base", -0.045), -0.3, 0.4, 0.005]
      }
    }, { id: "musa-abertura-giz", persist: true });
    giz.subscribe((v) => {
      palco.dataset.giz = v.ligado ? "sim" : "nao";
      ruidoGrao.setAttribute("baseFrequency", v.grao.tamanho);
      ruidoGrao.setAttribute("numOctaves", v.grao.camadas);
      ruidoGrao.setAttribute("seed", v.grao.semente);
      const c = v.grao.contraste, b = v.grao.cobertura - c / 2;
      matriz.setAttribute("values", `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${c} ${Math.round(b * 1000) / 1000}`);
      desloca.setAttribute("scale", v.borda.aspereza);
      ruidoBorda.setAttribute("baseFrequency", v.borda.frequencia);
      ruidoBorda.setAttribute("numOctaves", v.borda.camadas);
      ruidoBorda.setAttribute("seed", v.borda.semente);
      palco.style.setProperty("--grifo-base", v.grifo.baseEm + "em");
      A?.sincronizarGiz();
    });
  }

  } // fim do foco "tudo"
}
