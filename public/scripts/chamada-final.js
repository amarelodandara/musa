// Chamada final da página inicial: grifo de giz sob o fim da frase (.grifo), como na abertura.
// Um traço por linha do trecho grifado (getClientRects), com a mesma leve curva da abertura.
// As linhas são desenhadas uma depois da outra, com calma (curva suave nas pontas, como uma mão que acelera e assenta);
// cada palavra do trecho fica carmim no instante em que o traço passa por baixo dela.
// Desenha uma vez só, na primeira vez que a frase entra na tela; depois só acompanha o layout.
// Ritmo nas variáveis da seção (ajustáveis em /dev/chamada-final): --grifo-ms (por linha), --grifo-pausa-ms (entre linhas),
// --grifo-curva (cubic-bezier) e --cf-grifo-texto (a cor que as palavras ganham).
(() => {
  const secao = document.querySelector("[data-chamada-final]");
  if (!secao) return;
  const grupo = secao.querySelector(".chamada-grifos"), trecho = secao.querySelector(".grifo");
  const NS = "http://www.w3.org/2000/svg";
  const calmo = matchMedia("(prefers-reduced-motion: reduce)");
  let tracos = [], desenhado = false;

  // cada palavra do trecho num span, para mudar de cor no tempo do traço (o espaço comum fica entre elas, o &nbsp; une)
  const palavras = [];
  [...trecho.childNodes].forEach((no) => {
    if (no.nodeType !== Node.TEXT_NODE) return;
    const frag = document.createDocumentFragment();
    no.textContent.split(/( +)/).forEach((pedaco) => {
      if (!pedaco) return;
      if (/^ +$/.test(pedaco)) { frag.appendChild(document.createTextNode(pedaco)); return; }
      const s = document.createElement("span"); s.className = "grifo-palavra"; s.textContent = pedaco; frag.appendChild(s); palavras.push(s);
    });
    no.replaceWith(frag);
  });

  function montar() {
    const r = secao.getBoundingClientRect(), fs = parseFloat(getComputedStyle(trecho).fontSize);
    const base = parseFloat(getComputedStyle(secao).getPropertyValue("--grifo-base")) || 0;
    const linhas = [...trecho.getClientRects()].filter((b) => b.width > 1);
    while (tracos.length < linhas.length) { const t = document.createElementNS(NS, "path"); t.setAttribute("class", "chamada-grifo"); t.setAttribute("pathLength", "1"); grupo.appendChild(t); tracos.push(t); }
    while (tracos.length > linhas.length) tracos.pop().remove();
    linhas.forEach((b, i) => {
      const x0 = b.left - r.left, x1 = b.right - r.left;
      const y = b.bottom - r.top + base * fs, h = (x1 - x0) * 0.012; // leve curva, como à mão
      tracos[i].setAttribute("d", `M${x0.toFixed(1)} ${(y + h).toFixed(1)} Q${((x0 + x1) / 2).toFixed(1)} ${(y - h).toFixed(1)} ${x1.toFixed(1)} ${(y + h * 0.4).toFixed(1)}`);
      if (desenhado) tracos[i].style.strokeDashoffset = "0";
    });
    return linhas;
  }

  // ritmo
  const ler = (nome, padrao) => getComputedStyle(secao).getPropertyValue(nome).trim() || padrao;
  function curva() {
    const m = ler("--grifo-curva", "cubic-bezier(0.37, 0, 0.63, 1)").match(/cubic-bezier\(([^)]+)\)/);
    const p = m ? m[1].split(",").map(Number) : [0.37, 0, 0.63, 1];
    return p.length === 4 && p.every(Number.isFinite) ? p : [0.37, 0, 0.63, 1];
  }
  // em que momento (0–1) da animação a curva chega a uma fração f do traço: inverte a cubic-bezier por bisseção
  function instante([x1, y1, x2, y2], f) {
    const bz = (a, b, s) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const s = (lo + hi) / 2; if (bz(y1, y2, s) < f) lo = s; else hi = s; }
    return bz(x1, x2, (lo + hi) / 2);
  }
  // a cor final, resolvida (o WAAPI precisa da cor pronta, não de var())
  function corFinal() {
    const p = document.createElement("span"); p.style.color = "var(--cf-grifo-texto, var(--carmim-800))"; secao.appendChild(p);
    const c = getComputedStyle(p).color; p.remove(); return c;
  }

  function desenhar() {
    desenhado = true;
    const linhas = montar();
    const alvo = corFinal();
    if (calmo.matches) {
      tracos.forEach((t) => { t.style.strokeDashoffset = "0"; });
      palavras.forEach((w) => { w.style.color = alvo; });
      return;
    }
    const ms = parseFloat(ler("--grifo-ms", "1100")), pausa = parseFloat(ler("--grifo-pausa-ms", "120"));
    const pontos = curva(), easing = `cubic-bezier(${pontos.join(", ")})`;
    const inicio = (i) => 250 + i * (ms + pausa);
    // linhas em sequência, como uma mão que segue a frase
    tracos.forEach((t, i) => {
      t.animate([{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }], { duration: ms, delay: inicio(i), easing, fill: "both" })
        .finished.then(() => { t.style.strokeDashoffset = "0"; }).catch(() => {});
    });
    // cada palavra acende quando o traço da linha dela chega ao começo da palavra
    palavras.forEach((w) => {
      const b = w.getBoundingClientRect(), meio = (b.top + b.bottom) / 2;
      let i = linhas.findIndex((l) => meio >= l.top && meio <= l.bottom);
      if (i < 0) i = 0;
      const l = linhas[i], x = b.left + b.width * 0.15;
      const f = Math.min(1, Math.max(0, (x - l.left) / (l.width || 1)));
      const base = getComputedStyle(w).color;
      w.animate([{ color: base }, { color: alvo }], { duration: 400, delay: inicio(i) + instante(pontos, f) * ms, easing: "ease-out", fill: "both" });
    });
  }

  function apagar() {
    desenhado = false;
    tracos.forEach((t) => { t.getAnimations().forEach((a) => a.cancel()); t.style.strokeDashoffset = ""; });
    palavras.forEach((w) => { w.getAnimations().forEach((a) => a.cancel()); w.style.color = ""; });
  }

  montar();
  document.fonts?.ready.then(montar);
  // para o playground /dev/chamada-final: remedir depois de mudar o texto, e desenhar de novo do zero
  secao.addEventListener("chamada:medir", montar);
  secao.addEventListener("chamada:redesenhar", () => { apagar(); desenhar(); });
  new ResizeObserver(montar).observe(secao);
  const io = new IntersectionObserver((entradas) => {
    if (!entradas.some((e) => e.isIntersecting)) return;
    io.disconnect(); desenhar();
  }, { threshold: 1, rootMargin: "0px 0px -15% 0px" });
  io.observe(trecho);
})();
