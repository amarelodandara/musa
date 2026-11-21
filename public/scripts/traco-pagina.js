// Página inicial: um traço de giz que acompanha a rolagem, do fim da abertura até a chamada final.
// Sai do ícone da agenda (a ponta direita da linha em que a abertura termina), passa por cima da seção da ferramenta,
// desce pelo vão entre as duas colunas, faz um laço no espaço vazio embaixo do texto da esquerda, desce pela margem
// esquerda ao lado do bento (entrando por trás dos blocos de vez em quando) e chega pela esquerda na chamada final,
// terminando encostado no grifo de "o serviço", que continua o traço.
// Fica fora do texto: a rota é montada a partir das caixas de verdade (recalculada quando o layout muda) e só passa
// por espaço vazio ou por trás dos blocos do bento. Só em telas com as duas colunas da ferramenta (acima de 720 px).
// A ponta do traço segue um ponto a --traco-ponta (62%) da altura da janela, com um leve atraso, como uma mão.
(() => {
  const main = document.querySelector(".inicio-corpo");
  const svg = document.querySelector(".traco-pagina");
  if (!main || !svg) return;
  const caminho = svg.querySelector(".traco-pagina-caminho"), filtro = svg.querySelector("filter");
  const calmo = matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (s) => document.querySelector(s);

  let total = 0, amostras = [], atual = 0, alvo = 0, raf = 0, ativo = false;

  // caixa em coordenadas do svg (px a partir do canto de cima à esquerda do main)
  function caixa(el) {
    const m = main.getBoundingClientRect(), b = el.getBoundingClientRect();
    return { l: b.left - m.left, t: b.top - m.top, r: b.right - m.left, b: b.bottom - m.top, w: b.width, h: b.height };
  }
  // ponto do viewBox do palco da abertura (1080 × 600, preserveAspectRatio meet) em coordenadas do svg
  function doPalco(x, y) {
    const p = $("#palco"); if (!p) return null;
    const r = p.getBoundingClientRect(), m = main.getBoundingClientRect();
    const s = Math.min(r.width / 1080, r.height / 600), ox = (r.width - 1080 * s) / 2, oy = (r.height - 600 * s) / 2;
    return [r.left - m.left + ox + x * s, r.top - m.top + oy + y * s];
  }

  // curva suave pelos pontos (Catmull-Rom → Bézier cúbica)
  function suave(pts) {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }

  function rota() {
    const fer = $(".ferramenta"), ideia = $(".ferramenta-ideia"), razoes = $(".razoes"), bento = $(".bento"), cf = $("[data-chamada-final]"), trecho = $("[data-chamada-final] .grifo");
    if (!fer || !ideia || !razoes || !bento || !cf || !trecho) return null;
    const F = caixa(fer), I = caixa(ideia), Z = caixa(razoes), B = caixa(bento), C = caixa(cf);
    const g = trecho.getClientRects()[0], m = main.getBoundingClientRect();
    if (!g) return null;
    const fs = parseFloat(getComputedStyle(trecho).fontSize), base = parseFloat(getComputedStyle(cf).getPropertyValue("--grifo-base")) || 0;
    const G = { l: g.left - m.left, b: g.bottom - m.top + base * fs };
    const vao = (I.r + Z.l) / 2;                       // meio do vão entre as colunas da ferramenta
    const margem = Math.max(16, B.l * 0.55);            // na margem à esquerda do bento, um pouco mais perto dele
    const ag = doPalco(1046, 560) || [Z.r - 60, F.t - 40];
    const pts = [
      [ag[0], ag[1] + 26],                              // logo abaixo do ícone da agenda
      [ag[0] - 30, F.t + 22],
      [Z.l + (Z.r - Z.l) * 0.55, I.t - 42],            // por cima das razões, no respiro da seção
      [vao + 26, I.t - 24],
      [vao, I.t + 60],                                  // desce pelo vão entre as colunas
      [vao - 6, I.b - 20],
      [vao - 30, I.b + 70],
      // laço no vazio embaixo do texto da esquerda
      [I.l + I.w * 0.62, I.b + 170],
      [I.l + I.w * 0.38, I.b + 128],
      [I.l + I.w * 0.44, I.b + 64],
      [I.l + I.w * 0.56, I.b + 118],
      [I.l + I.w * 0.30, F.b - 40],
      // para a margem do bento e desce por ela, entrando por trás dos blocos de vez em quando
      [margem + 10, B.t - 30],
      [margem - 4, B.t + B.h * 0.16],
      [B.l + 40, B.t + B.h * 0.27],                     // por trás do primeiro bloco
      [margem, B.t + B.h * 0.4],
      [margem + 6, B.t + B.h * 0.6],
      [B.l + 34, B.t + B.h * 0.72],                     // por trás do último bloco
      [margem - 2, B.t + B.h * 0.86],
      [margem + 8, B.b + 30],
      // chega pela esquerda na chamada final e encosta no começo do grifo
      // (por baixo das linhas de cima da frase, quase na horizontal, para não raspar no começo delas)
      [Math.min(G.l - 260, C.l + (G.l - C.l) * 0.3), C.t + (G.b - C.t) * 0.55],
      [G.l - 170, G.b + 6],
      [G.l - 70, G.b + 8],
      [G.l - 6, G.b]
    ];
    return pts;
  }

  function montar() {
    ativo = getComputedStyle($(".ferramenta") || main).gridTemplateColumns.split(" ").length > 1;
    svg.style.display = ativo ? "" : "none";
    if (!ativo) return;
    const pts = rota();
    if (!pts) { svg.style.display = "none"; ativo = false; return; }
    caminho.setAttribute("d", suave(pts));
    total = caminho.getTotalLength();
    // amostras (comprimento → altura máxima já alcançada): a ponta só avança, mesmo onde o traço sobe (laço)
    amostras = []; let maior = -Infinity;
    for (let l = 0; l <= total; l += 4) { maior = Math.max(maior, caminho.getPointAtLength(l).y); amostras.push([l, maior]); }
    amostras.push([total, Math.max(maior, caminho.getPointAtLength(total).y)]);
    caminho.style.strokeDasharray = `${total} ${total + 10}`;
    if (calmo.matches) { atual = alvo = total; desenhar(); return; }
    medirAlvo(); atual = alvo; desenhar();
  }

  // comprimento cuja altura máxima ainda está acima da ponta (busca binária nas amostras)
  function medirAlvo() {
    const ponta = parseFloat(getComputedStyle(svg).getPropertyValue("--traco-ponta")) || 0.62;
    const y = innerHeight * ponta - main.getBoundingClientRect().top;
    let lo = 0, hi = amostras.length - 1;
    if (!amostras.length || y <= amostras[0][1]) { alvo = 0; return; }
    while (lo < hi) { const md = (lo + hi + 1) >> 1; if (amostras[md][1] <= y) lo = md; else hi = md - 1; }
    alvo = amostras[lo][0];
  }

  function desenhar() {
    caminho.style.strokeDashoffset = String(total - atual);
    // o giz só é calculado na faixa da janela (o ruído é preso às coordenadas, então a textura não muda ao rolar)
    const m = main.getBoundingClientRect();
    filtro.setAttribute("y", String(Math.round(-m.top - 200)));
    filtro.setAttribute("height", String(Math.round(innerHeight + 400)));
    filtro.setAttribute("x", "-200"); filtro.setAttribute("width", String(Math.round(m.width + 400)));
  }

  function quadro() {
    raf = 0;
    atual += (alvo - atual) * 0.14;                     // a mão vai atrás da rolagem, sem tranco
    if (Math.abs(alvo - atual) < 0.5) atual = alvo;
    desenhar();
    if (atual !== alvo) raf = requestAnimationFrame(quadro);
  }
  function rolou() {
    if (!ativo || calmo.matches) return;
    medirAlvo();
    if (!raf) raf = requestAnimationFrame(quadro);
  }

  montar();
  document.fonts?.ready.then(montar);
  addEventListener("load", montar);
  addEventListener("scroll", rolou, { passive: true });
  addEventListener("resize", () => { montar(); rolou(); });
  new ResizeObserver(() => { montar(); }).observe(main);
  calmo.addEventListener?.("change", montar);
})();
