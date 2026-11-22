// Abertura da página inicial, versão com o mapa (AberturaMapa.astro; a anterior é abertura.js, em /dev/abertura).
// 0. O texto de entrada (hero) aparece primeiro, embaixo do palco, e fica.
// 1. A planta do museu se desenha com "Onde você acha que começa a jornada do seu visitante".
// 2. Uma busca digita "museu de ciências em bh".
// 3. Dali nasce o caminho: dá voltas, entra no museu, zanza, sai. Aparece "Onde realmente começa e termina…".
// 4. Termina na agenda: o dia aparece e o evento "Voltar no museu" é marcado nele.
// 5. Tudo esmaece menos o caminho; o caminho vira a linha do Nível de desafio do professor, já no lugar onde ela fica
//    no mapa; aí o quadro com o mapa de verdade (/mapa?vitrine&modo=inteiro) aparece por baixo dela, da esquerda para
//    a direita, e a do mapa assume.
//
// Tudo roda num relógio só (T, em segundos): cada animação do WAAPI fica pausada e recebe
// currentTime = T; o que é JS (digitação, transformação do caminho) é calculado a partir de T.
// Assim dá para tocar, pausar e pular para qualquer passo (window.MUSA_ABERTURA, usado no painel de dev).
// Toca ao abrir e a cada recarregada. Pula (abre no fim) com "reduzir movimento" ou ao voltar de outra página do site na mesma sessão.
(function () {
  "use strict";
  const abertura = document.querySelector(".abertura");
  const palco = document.getElementById("palco");
  if (!abertura || !palco) return;

  const $ = (s) => palco.querySelector(s);
  const caminho = $("#caminho"), planta = $(".planta"), contorno = $(".planta-contorno"), dentro = $(".planta-dentro"), rotulo = $(".rotulo-museu");
  const fraseA = $(".frase-a"), fraseB = $(".frase-b");
  const moveis = [...palco.querySelectorAll(".planta-movel")], sugestoes = $(".busca-sugestoes");
  const busca = $(".busca"), buscaTexto = $(".busca-texto"), cursor = $(".cursor-texto"), agenda = $(".agenda");
  const agendaEvento = $(".agenda-evento"), agendaCorpo = $(".agenda-corpo"), iconeBusca = $(".icone-busca"), iconeAgenda = $(".icone-agenda");
  const hero = abertura.querySelector(".hero"); // sem botão de pular (tirado em 22/11/2026)
  const quadroMapa = $(".palco-quadro"), mapa = quadroMapa.querySelector("iframe"), svg = $(".palco-svg");

  const SAIDA = "cubic-bezier(0.23, 1, 0.32, 1)";       // entradas e saídas
  const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";       // o que se move na tela
  const LINHA = { x0: 60, x1: 1020, y: 560 };           // reserva: linha reta, se o mapa ainda não carregou
  const VISTA = 2432;                                    // largura do mapa na visão geral (192 + 7 × 320 px): cabe inteiro no quadro

  // Roteiro (segundos). Os passos aparecem no painel de dev para revisar um a um.
  // (reta = começo da transformação do caminho na linha de desafio; revela = a linha do mapa assume no lugar da de giz)
  const R = {
    texto: 0, planta: 0.8, busca: 2.2, digita: 2.6, caminho: 3.9, caminhoDur: 4, fraseB: 5.4, grifo: 6.4,
    agenda: 8.1, esmaece: 9.6, reta: 9.9, retaDur: 1.4, quadro: 11.2, quadroDur: 1.5, revela: 12.4, fim: 13.0
  };
  const PASSOS = [
    ["0 · Texto de entrada", R.texto], ["1 · Planta e primeira frase", R.planta], ["2 · Busca digitando", R.busca], ["3 · Caminho nasce", R.caminho],
    ["3 · Segunda frase", R.fraseB], ["3 · Grifos", R.grifo], ["4 · Agenda", R.agenda],
    ["5 · Tudo esmaece", R.esmaece], ["5 · Linha de desafio", R.reta], ["5 · Quadro do mapa", R.quadro], ["5 · O mapa assume", R.revela], ["Fim", R.fim]
  ];
  const DIGITO = 0.045;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visto = false;
  try { visto = sessionStorage.getItem("musa-abertura-mapa") === "1"; } catch (e) {}
  // recarregar a página (⌘R) sempre toca de novo; só quem volta de outra página do site, na mesma sessão, pula
  if (performance.getEntriesByType?.("navigation")[0]?.type === "reload") visto = false;
  if (window.MUSA_ABERTURA_SEMPRE) visto = false; // página de revisão: sempre do começo

  let comprimento, caminhoOriginal, pontos;
  const contornoLen = contorno.getTotalLength(), dentroLen = dentro.getTotalLength();

  // pontos do caminho, para a transformação em linha reta (recalculados se o caminho mudar)
  const N = 260;
  function medirCaminho() {
    comprimento = caminho.getTotalLength();
    caminhoOriginal = caminho.getAttribute("d");
    pontos = Array.from({ length: N + 1 }, (_, i) => { const p = caminho.getPointAtLength((comprimento * i) / N); return [p.x, p.y]; });
  }
  medirCaminho();
  // alvo da transformação: os pontos da linha do Nível de desafio do mapa (no quadro), em unidades do viewBox do palco.
  // Sem o mapa pronto, a linha reta de reserva.
  let alvo = null;
  const reta = (i) => [LINHA.x0 + ((LINHA.x1 - LINHA.x0) * i) / N, LINHA.y];
  const linhaD = (t) => "M" + pontos.map(([x, y], i) => {
    const [lx, ly] = alvo ? alvo[i] : reta(i);
    return (x + (lx - x) * t).toFixed(1) + " " + (y + (ly - y) * t).toFixed(1);
  }).join("L");

  // o mapa no quadro: largura de VISTA px, reduzido para a largura do quadro
  function encaixarMapa() {
    // largura útil da seção: o quadro pode passar do palco para os lados, mas não da seção (--secao-largura, no CSS)
    abertura.style.setProperty("--secao-largura", abertura.clientWidth - 32 + "px");
    const vista = Number(quadroMapa.dataset.vista) || VISTA; // data-vista no quadro troca quanto do mapa aparece (painel de dev)
    const janela = quadroMapa.querySelector(".palco-quadro-janela") || quadroMapa;
    const k = janela.clientWidth / vista || 1;
    mapa.style.width = vista + "px";
    mapa.style.height = janela.clientHeight / k + "px";
    mapa.style.transform = `scale(${k})`;
  }
  const docMapa = () => { try { return mapa.contentDocument; } catch (e) { return null; } };
  const linhaMapa = () => docMapa()?.querySelector(".desafio-caminho");
  // amostra a linha do mapa (no documento do quadro) e leva cada ponto para o viewBox do palco
  function medirAlvo() {
    const el = linhaMapa();
    const L = el && el.getAttribute("d") ? el.getTotalLength() : 0;
    if (!L) return null;
    const m = el.getScreenCTM(), r = mapa.getBoundingClientRect(), k = r.width / mapa.offsetWidth;
    const inv = svg.getScreenCTM().inverse(), pt = svg.createSVGPoint();
    return Array.from({ length: N + 1 }, (_, i) => {
      const p = el.getPointAtLength((L * i) / N);
      pt.x = r.left + (m.a * p.x + m.c * p.y + m.e) * k;
      pt.y = r.top + (m.b * p.x + m.d * p.y + m.f) * k;
      const q = pt.matrixTransform(inv);
      return [q.x, q.y];
    });
  }
  // a linha do mapa fica escondida até a de giz pousar nela; depois as duas trocam de lugar
  let opacidadeMapa = -1;
  function linhaDoMapa(o) {
    const el = linhaMapa();
    if (!el || o === opacidadeMapa) return;
    el.style.opacity = String(o); opacidadeMapa = o;
  }
  const emInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  // posição de um ponto do viewBox em pixels do palco (o svg é "meet", então há sobra nas bordas)
  function deslocamento(el, x, y) {
    const r = palco.getBoundingClientRect(), s = Math.min(r.width / 1080, r.height / 600);
    const px = (r.width - 1080 * s) / 2 + x * s, py = (r.height - 600 * s) / 2 + y * s;
    const b = el.getBoundingClientRect();
    return [px - (b.left - r.left + b.width / 2), py - (b.top - r.top + b.height / 2)];
  }

  // ---------- linha do tempo ----------
  let anims = [];
  // fill "both" para a primeira animação de cada elemento; as seguintes usam "forwards",
  // senão o quadro inicial delas venceria a anterior ao voltar no tempo
  const anima = (el, quadros, inicio, dur, easing = SAIDA, fill = "both") => {
    const a = el.animate(quadros, { duration: dur * 1000, delay: inicio * 1000, easing, fill });
    a.pause(); anims.push(a); return a;
  };
  const entra = (el, inicio, dur = 0.6, y = 10) => anima(el, [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "none" }], inicio, dur);
  const some = (el, inicio, dur = 0.5) => anima(el, [{ opacity: 1 }, { opacity: 0 }], inicio, dur, SAIDA, "forwards");

  // Grifos: um traço do svg sob cada palavra .grifo da frase final, com a mesma classe de traço e cor
  // do caminho e o mesmo filtro de giz. Posição medida no texto (palco em px → unidades do viewBox).
  // --grifo-base no .palco (em, relativo à fonte) sobe ou desce o traço.
  const grifosG = $(".grifos"), NS = "http://www.w3.org/2000/svg";
  let grifos = [];
  function sincronizarGiz() {
    const r = palco.getBoundingClientRect(), s = Math.min(r.width / 1080, r.height / 600) || 1;
    const ox = (r.width - 1080 * s) / 2, oy = (r.height - 600 * s) / 2;
    const base = parseFloat(getComputedStyle(palco).getPropertyValue("--grifo-base")) || 0;
    const classes = [...caminho.classList].filter((c) => /^(traco|stroke)-/.test(c));
    const palavras = [...palco.querySelectorAll(".grifo")];
    while (grifos.length < palavras.length) { const g = document.createElementNS(NS, "path"); g.setAttribute("pathLength", "1"); grifosG.appendChild(g); grifos.push(g); }
    while (grifos.length > palavras.length) grifos.pop().remove();
    palavras.forEach((w, i) => {
      const b = w.getBoundingClientRect(), fs = parseFloat(getComputedStyle(w).fontSize);
      const x0 = (b.left - r.left - ox) / s, x1 = (b.right - r.left - ox) / s;
      const y = (b.bottom - r.top - oy + base * fs) / s, h = (x1 - x0) * 0.012; // leve curva, como à mão
      grifos[i].setAttribute("class", ["grifo-traco", ...classes].join(" "));
      grifos[i].setAttribute("d", `M${x0.toFixed(1)} ${(y + h).toFixed(1)} Q${((x0 + x1) / 2).toFixed(1)} ${(y - h).toFixed(1)} ${x1.toFixed(1)} ${(y + h * 0.4).toFixed(1)}`);
    });
  }

  // Texto de entrada: entra uma linha por vez (como a página inicial do Linear): cada linha visual do selo, do título e do
  // subtítulo vira um bloco próprio e aparece subindo um pouco, saindo do desfoque; os botões entram por último.
  // Ajustes em data-* no .hero (painel "Texto de entrada" em /dev/abertura-mapa): atraso, intervalo e duração (s),
  // deslocamento (px), desfoque (px) e curva. O texto original fica em data-original (o painel troca o texto ali).
  const LINHAS_DE = [".tagline", "h1", ".lead"];
  function dividirLinhas(bloco) {
    const texto = bloco.dataset.original ?? (bloco.dataset.original = bloco.textContent.trim());
    bloco.textContent = "";
    // \n no texto força uma quebra de linha ali
    const palavras = texto.split("\n").flatMap((trecho, t) => {
      if (t) bloco.append(document.createElement("br"));
      return trecho.split(/\s+/).filter(Boolean).map((w, i) => {
        if (i) bloco.append(" ");
        const s = document.createElement("span"); s.textContent = w; bloco.append(s); return s;
      });
    });
    const linhas = [];
    palavras.forEach((s) => { const y = s.offsetTop, ult = linhas[linhas.length - 1]; if (ult && Math.abs(ult.y - y) < 2) ult.p.push(s.textContent); else linhas.push({ y, p: [s.textContent] }); });
    bloco.textContent = "";
    return linhas.map((l) => { const s = document.createElement("span"); s.className = "linha"; s.textContent = l.p.join(" "); bloco.append(s); return s; });
  }
  function entradaDoTexto() {
    const d = hero.dataset, n = (k, p) => (d[k] !== undefined && !isNaN(Number(d[k])) ? Number(d[k]) : p);
    const atraso = n("linhaAtraso", 0.1), intervalo = n("linhaIntervalo", 0.09), dur = n("linhaDur", 0.8);
    const y = n("linhaY", 12), desfoque = n("linhaDesfoque", 6), curva = d.linhaCurva || SAIDA;
    const linhas = [...LINHAS_DE.flatMap((s) => { const b = hero.querySelector(s); return b ? dividirLinhas(b) : []; }), hero.querySelector(".acoes-hero")].filter(Boolean);
    linhas.forEach((l, i) => anima(l,
      [{ opacity: 0, transform: `translateY(${y}px)`, filter: `blur(${desfoque}px)` }, { opacity: 1, transform: "none", filter: "blur(0px)" }],
      R.texto + atraso + i * intervalo, dur, curva));
  }

  function montar() {
    anims.forEach((a) => a.cancel()); // volta tudo ao lugar do HTML antes de medir os grifos e a linha do mapa
    encaixarMapa();
    sincronizarGiz();
    alvo = medirAlvo();
    anims = [];
    // 0
    entradaDoTexto();
    // 1
    // o contorno fecha primeiro e "Seu museu" aparece junto; depois o que há dentro (paredes, porta, quadros, pedestais)
    anima(contorno, [{ strokeDashoffset: contornoLen }, { strokeDashoffset: 0 }], R.planta, 1.0, MOVE);
    entra(rotulo, R.planta + 0.95, 0.5, 4);
    anima(dentro, [{ strokeDashoffset: dentroLen }, { strokeDashoffset: 0 }], R.planta + 0.9, 0.9, MOVE);
    // os móveis surgem do chão, um de cada vez: esmaecem e crescem de 0.9
    moveis.forEach((m, i) => anima(m, [{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "none" }], R.planta + 1.6 + i * 0.1, 0.6, SAIDA));
    // a pergunta só esmaece para dentro (sem subir)
    anima(fraseA, [{ opacity: 0 }, { opacity: 1 }], R.planta, 0.9, SAIDA);
    // 2
    entra(busca, R.busca, 0.5, 6);
    // sugestões: abrem logo depois do fim da digitação (descem 4 px e esmaecem)
    if (sugestoes) entra(sugestoes, R.digita + (buscaTexto.dataset.texto || "").length * DIGITO + 0.1, 0.35, -4);
    // 3 (o traço em velocidade constante, como uma mão desenhando)
    anima(caminho, [{ strokeDashoffset: comprimento }, { strokeDashoffset: 0 }], R.caminho, R.caminhoDur, "linear");
    entra(fraseB, R.fraseB, 0.8, 12);
    // grifos: pathLength 1, então o tracejado não depende do tamanho da palavra; 1.05 esconde a ponta redonda
    grifos.forEach((g, i) => { g.style.strokeDasharray = "1 2"; anima(g, [{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }], R.grifo + i * 0.25, 0.5); });
    // 4
    entra(agenda, R.agenda, 0.5, 6);
    // o evento é marcado: cai no horário (desce 6 px, cresce de 0.96 e esmaece), logo depois do dia aparecer
    if (agendaEvento) anima(agendaEvento, [{ opacity: 0, transform: "translateY(-6px) scale(0.96)" }, { opacity: 1, transform: "none" }], R.agenda + 0.45, 0.45, SAIDA);
    // 5
    [planta, rotulo, fraseA, fraseB, grifosG, busca, agenda].forEach((el) => some(el, R.esmaece, 0.5));
    // o quadro do mapa aparece quando a linha de giz já está quase na forma final, sem se mexer (a linha do mapa
    // surge exatamente embaixo da de giz): um degradê corre da esquerda para a direita, no sentido da linha
    anima(quadroMapa, [{ opacity: 1, "--q-revela": "0%" }, { opacity: 1, "--q-revela": "130%" }], R.quadro, R.quadroDur, "cubic-bezier(0.45, 0, 0.25, 1)");
  }

  let T = 0, tocando = false, velocidade = 1, ultimo = 0, raf = 0;
  function aplicar() {
    anims.forEach((a) => { a.currentTime = T * 1000; });
    // digitação
    const alvo = buscaTexto.dataset.texto || ""; // lido a cada quadro: o painel pode trocar o texto
    const n = Math.max(0, Math.min(alvo.length, Math.floor((T - R.digita) / DIGITO)));
    if (buscaTexto.textContent !== alvo.slice(0, n)) buscaTexto.textContent = alvo.slice(0, n);
    cursor.style.visibility = T >= R.busca && T < R.esmaece && Math.floor(T * 2) % 2 === 0 ? "visible" : "hidden";
    // caminho: desenhando (tracejado) até a transformação, depois vira a linha de desafio do mapa
    if (T < R.reta) {
      if (caminho.getAttribute("d") !== caminhoOriginal) caminho.setAttribute("d", caminhoOriginal);
      caminho.style.strokeDasharray = comprimento;
    } else {
      caminho.style.strokeDasharray = "none";
      caminho.setAttribute("d", linhaD(emInOut(Math.min(1, (T - R.reta) / R.retaDur))));
    }
    // pousou: a linha do mapa aparece e a de giz some (0.4 s); sem o mapa pronto, a de giz fica
    const u = alvo ? Math.max(0, Math.min(1, (T - R.revela) / 0.4)) : 0;
    caminho.style.opacity = String(1 - u);
    linhaDoMapa(u);
    const fim = T >= R.revela;
    abertura.dataset.estado = fim ? "fim" : "tocando";
    if (T >= R.fim) { try { sessionStorage.setItem("musa-abertura-mapa", "1"); } catch (e) {} }
  }
  const ouvintes = new Set();
  const avisar = () => ouvintes.forEach((f) => f({ tempo: T, tocando }));
  function quadro(agora) {
    const dt = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000)); ultimo = agora;
    T = Math.min(R.fim, T + dt * velocidade);
    aplicar();
    if (T >= R.fim) { tocando = false; avisar(); return; }
    raf = requestAnimationFrame(quadro);
  }
  const API = (window.MUSA_ABERTURA = {
    PASSOS, FIM: R.fim,
    tocar() { if (T >= R.fim) T = 0; tocando = true; ultimo = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(quadro); avisar(); },
    pausar() { tocando = false; cancelAnimationFrame(raf); avisar(); },
    ir(t) { T = Math.max(0, Math.min(R.fim, t)); aplicar(); avisar(); },
    // para o painel de revisão: trocar o desenho do caminho e os tempos do roteiro ao vivo
    roteiro: R,
    remontar() { montar(); aplicar(); },
    definirCaminho(d) { caminho.setAttribute("d", d); medirCaminho(); montar(); aplicar(); },
    sincronizarGiz,
    reiniciar() { API.ir(0); API.tocar(); },
    velocidade(v) { velocidade = v; },
    get tempo() { return T; },
    get tocando() { return tocando; },
    ouvir(f) { ouvintes.add(f); return () => ouvintes.delete(f); }
  });

  addEventListener("resize", () => { montar(); aplicar(); });
  // o mapa carrega à parte: quando a linha dele estiver desenhada, mede de novo (é o alvo do caminho)
  function esperarMapa(tentativas = 0) {
    const el = linhaMapa();
    if (el && el.getAttribute("d")) { opacidadeMapa = -1; montar(); aplicar(); return; }
    if (tentativas < 100) setTimeout(() => esperarMapa(tentativas + 1), 100);
  }
  mapa.addEventListener("load", () => esperarMapa());
  if (docMapa()?.readyState === "complete") esperarMapa();
  document.fonts?.ready.then(() => { montar(); aplicar(); }); // a fonte muda a largura das palavras grifadas

  contorno.style.strokeDasharray = contornoLen;
  dentro.style.strokeDasharray = dentroLen;
  montar();
  if (reduzir || visto) API.ir(R.fim);
  else { API.ir(0); API.tocar(); }
})();
