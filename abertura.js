// Abertura da página inicial.
// 1. A planta do museu se desenha com "Onde você acha que começa a jornada do seu visitante".
// 2. Uma busca digita "museu de ciências em bh".
// 3. Dali nasce o caminho: dá voltas, entra no museu, zanza, sai. Aparece "Onde realmente começa e termina…".
// 4. Termina num evento de agenda: "Voltar no museu".
// 5. Tudo esmaece menos o caminho e os ícones; o caminho vira uma linha reta na base do palco
//    (onde vai encaixar a demonstração da ferramenta) e o texto de entrada aparece.
//
// Tudo roda num relógio só (T, em segundos): cada animação do WAAPI fica pausada e recebe
// currentTime = T; o que é JS (digitação, linha reta) é calculado a partir de T.
// Assim dá para tocar, pausar e pular para qualquer passo (window.MUSA_ABERTURA, usado no painel de dev).
// Toca ao abrir e a cada recarregada. Pula (abre no fim) com "reduzir movimento" ou ao voltar de outra página do site na mesma sessão.
(function () {
  "use strict";
  const abertura = document.querySelector(".abertura");
  const palco = document.getElementById("palco");
  if (!abertura || !palco) return;

  const $ = (s) => palco.querySelector(s);
  const caminho = $("#caminho"), planta = $(".planta"), plantaTraco = $(".planta-traco"), rotulo = $(".rotulo-museu");
  const fraseA = $(".frase-a"), fraseB = $(".frase-b");
  const busca = $(".busca"), buscaTexto = $(".busca-texto"), cursor = $(".cursor-texto"), agenda = $(".agenda");
  const agendaCorpo = $(".agenda-corpo"), iconeBusca = $(".icone-busca"), iconeAgenda = $(".icone-agenda");
  const hero = abertura.querySelector(".hero"), pular = abertura.querySelector(".pular");

  const SAIDA = "cubic-bezier(0.23, 1, 0.32, 1)";       // entradas e saídas
  const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";       // o que se move na tela
  const LINHA = { x0: 60, x1: 1020, y: 560 };           // linha final, em unidades do viewBox

  // Roteiro (segundos). Os passos aparecem no painel de dev para revisar um a um.
  const R = {
    planta: 0.2, busca: 1.6, digita: 2.0, caminho: 3.3, caminhoDur: 4, fraseB: 4.8, grifo: 5.8,
    agenda: 7.5, esmaece: 9.0, reta: 9.6, retaDur: 1.3, texto: 10.7, fim: 11.4
  };
  const PASSOS = [
    ["1 · Planta e primeira frase", R.planta], ["2 · Busca digitando", R.busca], ["3 · Caminho nasce", R.caminho],
    ["3 · Segunda frase", R.fraseB], ["3 · Grifos", R.grifo], ["4 · Agenda", R.agenda],
    ["5 · Tudo esmaece", R.esmaece], ["5 · Linha reta", R.reta], ["5 · Texto de entrada", R.texto], ["Fim", R.fim]
  ];
  const DIGITO = 0.045;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visto = false;
  try { visto = sessionStorage.getItem("musa-abertura") === "1"; } catch (e) {}
  // recarregar a página (⌘R) sempre toca de novo; só quem volta de outra página do site, na mesma sessão, pula
  if (performance.getEntriesByType?.("navigation")[0]?.type === "reload") visto = false;
  if (window.MUSA_ABERTURA_SEMPRE) visto = false; // página de revisão: sempre do começo

  let comprimento, caminhoOriginal, pontos;
  const tracoLen = plantaTraco.getTotalLength();

  // pontos do caminho, para a transformação em linha reta (recalculados se o caminho mudar)
  const N = 260;
  function medirCaminho() {
    comprimento = caminho.getTotalLength();
    caminhoOriginal = caminho.getAttribute("d");
    pontos = Array.from({ length: N + 1 }, (_, i) => { const p = caminho.getPointAtLength((comprimento * i) / N); return [p.x, p.y]; });
  }
  medirCaminho();
  const linhaD = (t) => "M" + pontos.map(([x, y], i) => {
    const lx = LINHA.x0 + ((LINHA.x1 - LINHA.x0) * i) / N, ly = LINHA.y;
    return (x + (lx - x) * t).toFixed(1) + " " + (y + (ly - y) * t).toFixed(1);
  }).join("L");
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

  function montar() {
    anims.forEach((a) => a.cancel()); // volta tudo ao lugar do HTML antes de medir os ícones e os grifos
    sincronizarGiz();
    anims = [];
    const [bx, by] = deslocamento(iconeBusca, LINHA.x0 - 26, LINHA.y);
    const [ax, ay] = deslocamento(iconeAgenda, LINHA.x1 + 26, LINHA.y);
    // 1
    anima(plantaTraco, [{ strokeDashoffset: tracoLen }, { strokeDashoffset: 0 }], R.planta, 1.8, MOVE);
    entra(rotulo, R.planta + 1.0, 0.6, 4);
    entra(fraseA, R.planta, 0.7);
    // 2
    entra(busca, R.busca, 0.5, 6);
    // 3 (o traço em velocidade constante, como uma mão desenhando)
    anima(caminho, [{ strokeDashoffset: comprimento }, { strokeDashoffset: 0 }], R.caminho, R.caminhoDur, "linear");
    entra(fraseB, R.fraseB, 0.8, 12);
    // grifos: pathLength 1, então o tracejado não depende do tamanho da palavra; 1.05 esconde a ponta redonda
    grifos.forEach((g, i) => { g.style.strokeDasharray = "1 2"; anima(g, [{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }], R.grifo + i * 0.25, 0.5); });
    // 4
    entra(agenda, R.agenda, 0.5, 6);
    // 5
    [planta, rotulo, fraseA, fraseB, grifosG].forEach((el) => some(el, R.esmaece, 0.6));
    [buscaTexto, cursor, agendaCorpo].forEach((el) => some(el, R.esmaece, 0.4));
    [busca, agenda].forEach((c) => anima(c,
      [{ backgroundColor: "var(--neutro-50)", borderColor: "var(--neutro-300)", boxShadow: "0 0.3cqw 1.2cqw var(--neutro-200)" },
       { backgroundColor: "transparent", borderColor: "transparent", boxShadow: "0 0 0 transparent" }], R.esmaece, 0.5));
    anima(iconeBusca, [{ transform: "none" }, { transform: `translate(${bx}px, ${by}px)` }], R.reta, R.retaDur, MOVE);
    anima(iconeAgenda, [{ transform: "none" }, { transform: `translate(${ax}px, ${ay}px)` }], R.reta, R.retaDur, MOVE);
    entra(hero, R.texto, 0.7, 12);
    anima(pular, [{ opacity: 1 }, { opacity: 0 }], R.texto, 0.3);
  }

  let T = 0, tocando = false, velocidade = 1, ultimo = 0, raf = 0;
  function aplicar() {
    anims.forEach((a) => { a.currentTime = T * 1000; });
    // digitação
    const alvo = buscaTexto.dataset.texto || ""; // lido a cada quadro: o painel pode trocar o texto
    const n = Math.max(0, Math.min(alvo.length, Math.floor((T - R.digita) / DIGITO)));
    if (buscaTexto.textContent !== alvo.slice(0, n)) buscaTexto.textContent = alvo.slice(0, n);
    cursor.style.visibility = T >= R.busca && T < R.esmaece && Math.floor(T * 2) % 2 === 0 ? "visible" : "hidden";
    // caminho: desenhando (tracejado) até a linha reta, depois a transformação
    if (T < R.reta) {
      if (caminho.getAttribute("d") !== caminhoOriginal) caminho.setAttribute("d", caminhoOriginal);
      caminho.style.strokeDasharray = comprimento;
    } else {
      caminho.style.strokeDasharray = "none";
      caminho.setAttribute("d", linhaD(emInOut(Math.min(1, (T - R.reta) / R.retaDur))));
    }
    const fim = T >= R.texto;
    abertura.dataset.estado = fim ? "fim" : "tocando";
    hero.inert = !fim;
    pular.hidden = fim;
    if (T >= R.fim) { try { sessionStorage.setItem("musa-abertura", "1"); } catch (e) {} }
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

  pular.addEventListener("click", () => { API.pausar(); API.ir(R.fim); });
  addEventListener("resize", () => { montar(); aplicar(); });
  document.fonts?.ready.then(() => { montar(); aplicar(); }); // a fonte muda a largura das palavras grifadas

  plantaTraco.style.strokeDasharray = tracoLen;
  montar();
  if (reduzir || visto) API.ir(R.fim);
  else { API.ir(0); API.tocar(); }
})();
