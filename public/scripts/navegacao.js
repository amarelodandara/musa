// Marca da barra de navegação: o ícone vira olho e o nome "musá" aparece.
// Acontece ao passar o mouse (só em dispositivos com mouse), ao focar pelo teclado
// e, na página inicial, de vez em quando quando a pessoa fica parada no topo da página.
// O olho segue o cursor pela página toda (brand/musa-eye.js).
// O estado aberto é o atributo data-aberto na marca; o CSS (classes group-data-aberto:* do Tailwind) faz o resto.
// Os números do comportamento ficam em window.MUSA_NAV e podem ser ajustados ao vivo (dev/navbar-dials.js).
(function () {
  "use strict";
  const NAV = (window.MUSA_NAV = Object.assign({
    aneis: "pequeno",      // anéis do logo: "pequeno" (3 anéis, para tamanho pequeno como esta barra) ou "lockup" (8)
    ocioso: true,          // olho acorda sozinho quando a pessoa fica parada no topo da página inicial
    esperarS: 5,           // segundos sem mexer até acordar
    repetirMinS: 12,       // intervalo entre uma vez e outra (mínimo e máximo, sorteado)
    repetirMaxS: 20,
    duracaoS: 6            // quanto tempo fica aberto quando acorda sozinho
  }, window.MUSA_NAV || {}));

  // a marca da camada invertida (sobre o rodapé) não ganha olho próprio: espelha a da camada normal
  const marcas = [...document.querySelectorAll(".nav-marca:not(.nav-marca-invertida)")];
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
      invert: cor("--neutro-50", "#FDF9F9"), // aberto, o tile some no fundo da barra e fica só o olho carmim, sem moldura
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

  // Camada invertida da barra (claro sobre carmim): recortada para aparecer só na faixa que já está sobre o rodapé.
  // O recorte acompanha a borda do rodapé a cada quadro de rolagem. A marca dela espelha o olho da camada normal.
  const barra = document.querySelector(".nav"), invertida = barra && barra.querySelector(".nav-invertida");
  const rodape = document.querySelector(".rodape");
  if (invertida && rodape) {
    const gemea = invertida.querySelector(".nav-marca-invertida"), original = controles[0];
    if (gemea && original) {
      window.MusaEye.create(gemea.querySelector(".nav-olho"), {
        frame: "tile", logo: window.MUSA.RING_PRESETS[NAV.aneis] || window.MUSA.RING_PRESETS.lockup, mirror: original.olho,
        ink: cor("--neutro-50", "#FDF9F9"), paper: cor("--carmim-800", "#930031"), invert: cor("--carmim-800", "#930031"), quality: 0.6
      });
      if (mouse) {
        gemea.addEventListener("pointerenter", original.abrir);
        gemea.addEventListener("pointerleave", original.fechar);
      }
      // o estado aberto (data-aberto) vale para as duas marcas
      new MutationObserver(() => gemea.toggleAttribute("data-aberto", original.marca.hasAttribute("data-aberto")))
        .observe(original.marca, { attributes: true, attributeFilter: ["data-aberto"] });
    }
    let pedido = 0, ultimo = -1;
    const recortar = () => {
      pedido = 0;
      const b = barra.getBoundingClientRect(), topo = rodape.getBoundingClientRect().top;
      const corte = Math.round(Math.min(b.height, Math.max(0, topo - b.top)));
      if (corte === ultimo) return;
      ultimo = corte;
      invertida.style.clipPath = `inset(${corte}px 0 0 0)`;
      invertida.style.display = corte >= b.height ? "none" : ""; // fora do rodapé: some de vez (e o olho espelho para de desenhar)
    };
    const agendar = () => { if (!pedido) pedido = requestAnimationFrame(recortar); };
    addEventListener("scroll", agendar, { passive: true });
    addEventListener("resize", agendar);
    recortar();
  }

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
