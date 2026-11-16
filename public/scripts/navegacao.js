// Marca da barra de navegação: o ícone vira olho e o nome "musá" aparece.
// Acontece ao passar o mouse (só em dispositivos com mouse), ao focar pelo teclado
// e, na página inicial, de vez em quando quando a pessoa fica parada no topo da página.
// O olho segue o cursor pela página toda (brand/musa-eye.js).
// O estado aberto é o atributo data-aberto na marca; o CSS (classes group-data-aberto:* do Tailwind) faz o resto.
// Os números do comportamento ficam em window.MUSA_NAV e podem ser ajustados ao vivo (dev/navbar-dials.js).
(function () {
  "use strict";
  const NAV = (window.MUSA_NAV = Object.assign({
    aneis: "lockup",       // conjunto de anéis do logo: "lockup" (Vector.svg) ou "v6" (playground)
    ocioso: true,          // olho acorda sozinho quando a pessoa fica parada no topo da página inicial
    esperarS: 5,           // segundos sem mexer até acordar
    repetirMinS: 12,       // intervalo entre uma vez e outra (mínimo e máximo, sorteado)
    repetirMaxS: 20,
    duracaoS: 3.5          // quanto tempo fica aberto quando acorda sozinho
  }, window.MUSA_NAV || {}));

  const marcas = [...document.querySelectorAll(".nav-marca")];
  if (!marcas.length || !window.MUSA || !window.MusaEye) return;

  const raiz = getComputedStyle(document.documentElement);
  const cor = (nome, reserva) => raiz.getPropertyValue(nome).trim() || reserva;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const controles = marcas.map((marca) => {
    const olho = window.MusaEye.create(marca.querySelector(".nav-olho"), {
      frame: "tile",
      logo: window.MUSA.RING_PRESETS[NAV.aneis] || window.MUSA.RING_PRESETS.lockup,
      ink: cor("--carmim-800", "#930031"),
      paper: cor("--neutro-50", "#FDF9F9"),
      state: 0,
      quality: 0.6
    });
    let pedidos = 0; // quantas razões pedem o olho aberto (mouse, foco, ocioso)
    const abrir = () => { if (pedidos++ === 0) { olho.setState(1); marca.setAttribute("data-aberto", ""); } };
    const fechar = () => { if (--pedidos <= 0) { pedidos = 0; olho.setState(0); marca.removeAttribute("data-aberto"); } };
    if (mouse) {
      marca.addEventListener("pointerenter", abrir);
      marca.addEventListener("pointerleave", fechar);
    }
    marca.addEventListener("focus", () => { if (marca.matches(":focus-visible")) { marca.dataset.foco = "1"; abrir(); } });
    marca.addEventListener("blur", () => { if (marca.dataset.foco) { delete marca.dataset.foco; fechar(); } });
    return { marca, olho, abrir, fechar };
  });
  window.MUSA_NAV_OLHOS = controles.map((c) => c.olho);
  window.MUSA_NAV_TROCAR_ANEIS = (nome) => {
    const p = window.MUSA.RING_PRESETS[nome]; if (!p) return;
    NAV.aneis = nome; controles.forEach((c) => c.olho.setLogo(p));
  };

  // Ocioso no topo da página inicial: abre, olha em volta, fecha.
  const topo = document.querySelector("[data-hero]");
  if (!topo || reduzir) return;
  const principal = controles[0];
  let ultimo = performance.now(), visivel = true, proximo = performance.now() + 4000, tocando = false;
  for (const tipo of ["pointermove", "pointerdown", "keydown", "scroll", "wheel", "touchstart"]) {
    addEventListener(tipo, () => { ultimo = performance.now(); }, { passive: true });
  }
  new IntersectionObserver((es) => { visivel = es[0].isIntersecting; }, { threshold: 0.35 }).observe(topo);

  setInterval(() => {
    const agora = performance.now();
    if (!NAV.ocioso || tocando || !visivel || document.hidden || agora - ultimo < NAV.esperarS * 1000 || agora < proximo) return;
    if (document.querySelector('.abertura[data-estado="tocando"]')) return; // não competir com a abertura
    tocando = true;
    principal.abrir();
    const w = innerWidth, h = innerHeight, d = NAV.duracaoS * 1000;
    setTimeout(() => principal.olho.look(w * 0.65, h * 0.55, d / 3000), d * 0.26);
    setTimeout(() => principal.olho.look(w * 0.25, h * 0.75, d / 3000), d * 0.57);
    setTimeout(() => {
      tocando = false;
      principal.fechar();
      const min = NAV.repetirMinS, max = Math.max(min, NAV.repetirMaxS);
      proximo = performance.now() + (min + Math.random() * (max - min)) * 1000;
    }, d);
  }, 500);
})();
