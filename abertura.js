// Abertura da página inicial.
// 1. A planta do museu se desenha com "Onde você acha que começa a jornada do seu visitante".
// 2. Uma busca digita "museu de ciências em bh".
// 3. Dali nasce o caminho: dá voltas, entra no museu, zanza, sai. Aparece "Onde realmente começa e termina…".
// 4. Termina num evento de agenda: "Voltar no museu".
// 5. Tudo esmaece menos o caminho e os ícones; o caminho vira uma linha reta na base do palco
//    (onde vai encaixar a demonstração da ferramenta) e o texto de entrada aparece.
// Toca uma vez por sessão. Com "reduzir movimento" ou depois da primeira vez, abre direto no fim.
(function () {
  "use strict";
  const abertura = document.querySelector(".abertura");
  const palco = document.getElementById("palco");
  if (!abertura || !palco) return;

  const $ = (s) => palco.querySelector(s);
  const caminho = $("#caminho"), planta = $(".planta"), plantaTraco = $(".planta-traco"), plantaFundo = $(".planta-fundo");
  const fraseA = $(".frase-a"), fraseB = $(".frase-b"), grifos = [...palco.querySelectorAll(".grifo")];
  const busca = $(".busca"), buscaTexto = $(".busca-texto"), cursor = $(".cursor-texto"), agenda = $(".agenda");
  const iconeBusca = $(".icone-busca"), iconeAgenda = $(".icone-agenda");
  const hero = abertura.querySelector(".hero"), pular = abertura.querySelector(".pular");

  const SAIDA = "cubic-bezier(0.23, 1, 0.32, 1)";       // entradas e saídas
  const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";       // o que se move na tela
  const LINHA = { x0: 60, x1: 1020, y: 560 };           // linha final, em unidades do viewBox
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visto = false;
  try { visto = sessionStorage.getItem("musa-abertura") === "1"; } catch (e) {}

  const comprimento = caminho.getTotalLength();
  const timers = [], animacoes = [];
  let raf = 0, acabou = false;
  const em = (s, fn) => timers.push(setTimeout(fn, s * 1000));
  const anima = (el, quadros, opts) => { const a = el.animate(quadros, { fill: "both", ...opts }); animacoes.push(a); return a; };
  const entra = (el, dur = 0.6, y = 10) => anima(el, [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "none" }], { duration: dur * 1000, easing: SAIDA });
  const some = (el, dur = 0.5) => anima(el, [{ opacity: 1 }, { opacity: 0 }], { duration: dur * 1000, easing: SAIDA });

  // pontos do caminho, para a transformação em linha reta
  const N = 260;
  const pontos = Array.from({ length: N + 1 }, (_, i) => { const p = caminho.getPointAtLength((comprimento * i) / N); return [p.x, p.y]; });
  const linhaD = (t) => "M" + pontos.map(([x, y], i) => {
    const lx = LINHA.x0 + ((LINHA.x1 - LINHA.x0) * i) / N, ly = LINHA.y;
    return (x + (lx - x) * t).toFixed(1) + " " + (y + (ly - y) * t).toFixed(1);
  }).join("L");

  // posição de um ponto do viewBox em pixels do palco (o svg é "meet", então há sobra nas bordas)
  function noPalco(x, y) {
    const r = palco.getBoundingClientRect(), s = Math.min(r.width / 1080, r.height / 600);
    return [(r.width - 1080 * s) / 2 + x * s, (r.height - 600 * s) / 2 + y * s];
  }
  function deslocamento(el, x, y) {
    const r = palco.getBoundingClientRect(), b = el.getBoundingClientRect();
    const [px, py] = noPalco(x, y);
    return [px - (b.left - r.left + b.width / 2), py - (b.top - r.top + b.height / 2)];
  }

  function estadoFinal() {
    acabou = true;
    timers.forEach(clearTimeout); cancelAnimationFrame(raf);
    animacoes.forEach((a) => a.cancel());
    [planta, fraseA, fraseB, busca, agenda].forEach((el) => { el.style.opacity = "0"; });
    caminho.style.strokeDasharray = "none";
    caminho.setAttribute("d", linhaD(1));
    busca.style.opacity = agenda.style.opacity = "1";
    [busca, agenda].forEach((c) => { c.style.background = "transparent"; c.style.borderColor = "transparent"; c.style.boxShadow = "none"; });
    buscaTexto.style.opacity = "0"; cursor.style.opacity = "0"; agenda.querySelector(".agenda-corpo").style.opacity = "0";
    iconeBusca.style.transform = iconeAgenda.style.transform = "";
    pular.hidden = true;
    const [bx, by] = deslocamento(iconeBusca, LINHA.x0 - 26, LINHA.y);
    const [ax, ay] = deslocamento(iconeAgenda, LINHA.x1 + 26, LINHA.y);
    iconeBusca.style.transform = `translate(${bx}px, ${by}px)`;
    iconeAgenda.style.transform = `translate(${ax}px, ${ay}px)`;
    abertura.dataset.estado = "fim";
    try { sessionStorage.setItem("musa-abertura", "1"); } catch (e) {}
  }

  pular.addEventListener("click", () => {
    estadoFinal();
    anima(hero, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: SAIDA });
  });
  addEventListener("resize", () => { if (acabou) estadoFinal(); });

  if (reduzir || visto) { estadoFinal(); return; }

  abertura.dataset.estado = "tocando";
  caminho.style.strokeDasharray = comprimento;
  caminho.style.strokeDashoffset = comprimento;
  [fraseA, fraseB, busca, agenda].forEach((el) => { el.style.opacity = "0"; });
  grifos.forEach((g) => g.style.setProperty("--grifo", "0"));
  const tracoLen = plantaTraco.getTotalLength();
  plantaTraco.style.strokeDasharray = tracoLen;
  plantaTraco.style.strokeDashoffset = tracoLen;
  plantaFundo.style.opacity = "0";

  // 1. planta + primeira frase
  em(0.2, () => {
    anima(plantaTraco, [{ strokeDashoffset: tracoLen }, { strokeDashoffset: 0 }], { duration: 1600, easing: MOVE });
    anima(plantaFundo, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 600, easing: SAIDA });
    entra(fraseA, 0.7);
  });
  // 2. busca digitando
  em(1.6, () => entra(busca, 0.5, 6));
  em(2.0, () => {
    const alvo = buscaTexto.dataset.texto;
    for (let i = 1; i <= alvo.length; i++) em(i * 0.045, () => { buscaTexto.textContent = alvo.slice(0, i); });
    anima(cursor, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, iterations: 6, direction: "alternate", easing: "steps(1, end)" });
  });
  // 3. o caminho nasce da busca; segunda frase no meio do caminho
  em(3.3, () => anima(caminho, [{ strokeDashoffset: comprimento }, { strokeDashoffset: 0 }], { duration: 4600, easing: "linear" })); // traço em velocidade constante, como uma mão desenhando
  em(4.8, () => entra(fraseB, 0.8, 12));
  em(5.8, () => grifos.forEach((g, i) => anima(g, [{ "--grifo": 0 }, { "--grifo": 1 }], { duration: 500, delay: i * 250, easing: SAIDA })));
  // 4. agenda no fim do caminho
  em(7.5, () => entra(agenda, 0.5, 6));
  // 5. esmaece tudo menos o caminho e os ícones; caminho vira linha; texto de entrada aparece
  em(9.0, () => {
    [planta, fraseA, fraseB].forEach((el) => some(el, 0.6));
    [buscaTexto, cursor, agenda.querySelector(".agenda-corpo")].forEach((el) => some(el, 0.4));
    [busca, agenda].forEach((c) => anima(c, [{ backgroundColor: getComputedStyle(c).backgroundColor, borderColor: getComputedStyle(c).borderColor, boxShadow: getComputedStyle(c).boxShadow }, { backgroundColor: "transparent", borderColor: "transparent", boxShadow: "none" }], { duration: 500, easing: SAIDA }));
  });
  em(9.6, () => {
    caminho.style.strokeDasharray = "none";
    const ini = performance.now(), dur = 1300;
    const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    const [bx, by] = deslocamento(iconeBusca, LINHA.x0 - 26, LINHA.y);
    const [ax, ay] = deslocamento(iconeAgenda, LINHA.x1 + 26, LINHA.y);
    anima(iconeBusca, [{ transform: "none" }, { transform: `translate(${bx}px, ${by}px)` }], { duration: dur, easing: MOVE });
    anima(iconeAgenda, [{ transform: "none" }, { transform: `translate(${ax}px, ${ay}px)` }], { duration: dur, easing: MOVE });
    const passo = (agora) => {
      const u = Math.min(1, (agora - ini) / dur);
      caminho.setAttribute("d", linhaD(ease(u)));
      if (u < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
  });
  em(10.7, () => {
    estadoFinal();
    entra(hero, 0.7, 12);
  });
})();
