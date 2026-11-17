/*
 * musá — geometria da marca.
 * Fonte única para a página de marca e para os SVGs exportados (export.mjs).
 * Coordenadas no sistema original de Vector.svg (viewBox 0 0 419.458 118.801).
 * O acento do "a" é grave (à), espelhado do agudo original: alusão a "à serviço do museu".
 */
(function (root) {
  "use strict";

  const COLORS = { crimson: "#930031", offwhite: "#FFFBFB" };

  const SPEC = {
    lockup: { width: 419.458, height: 118.801 },
    frame: { x: 0, y: 4.97852, size: 113.822, stroke: 0.889236 },
    tile: { x: 7.55851, y: 12.537, size: 98.70549 },
    center: { x: 56.9111, y: 61.8897 },
    wordmark: {
      left: 142.114, right: 419.458,
      baseline: 92.619, xTop: 30.627,
      overshootTop: 29.151, overshootBottom: 94.095,
      accentTop: 5.529, // acento ajustado em 2026-11-12 (musa-acento.html): inclinação 7.7°, afinamento 0.92
      letters: [
        { ch: "m", left: 142.114, right: 240.391 },
        { ch: "u", left: 245.124, right: 303.795 },
        { ch: "s", left: 306.896, right: 360.36 },
        { ch: "à", left: 362.632, right: 419.458 }
      ]
    }
  };

  // Parâmetros dos anéis. R (raio externo) é fixo; o resto é livre.
  // Duas versões do logo, mesma pupila e espessura, só muda a quantidade de anéis:
  //   lockup  (8 anéis): a versão completa, para peças grandes (lockup, página de marca, impressos, telas grandes).
  //   pequeno (3 anéis): para peças pequenas (barra de navegação, favicon, avatares). Com 8 anéis o vão entre eles
  //     fica abaixo de 1 px de tela em ícones menores que ~128 px e os anéis viram uma mancha.
  //     Regra: ícone (tile) abaixo de 128 px usa "pequeno". Valores do playground /dev/marca-pequena (17 nov 2026).
  const RING_PRESETS = {
    lockup: { label: "Vector.svg (lockup atual)", R: 30.4563, pupilR: 4.2238, pupilGap: 1.2228, count: 8, weight: 0.7586 },
    pequeno: { label: "Pequeno (3 anéis)", R: 30.4563, pupilR: 4.2238, pupilGap: 1.2228, count: 3, weight: 0.7586 },
    v6: { label: "Playground v6 (musa-mark-logo.svg)", R: 30.4563, pupilR: 3.7, pupilGap: 1.42, count: 8, weight: 0.624 }
  };
  const AVATAR = { R: 30.4563, inner: 8 };

  const WORDMARK = [
    "M142.114 92.619V30.627H155.152L156.382 39.114C158.35 35.998 160.933 33.579 164.131 31.857C167.411 30.053 171.142 29.151 175.324 29.151C178.44 29.151 181.228 29.561 183.688 30.381C186.23 31.201 188.444 32.431 190.33 34.071C192.298 35.711 193.897 37.761 195.127 40.221C197.423 36.777 200.416 34.071 204.106 32.103C207.796 30.135 211.814 29.151 216.16 29.151C221.326 29.151 225.713 30.217 229.321 32.349C232.929 34.399 235.676 37.474 237.562 41.574C239.448 45.592 240.391 50.553 240.391 56.457V92.619H225.754V57.933C225.754 52.685 224.688 48.667 222.556 45.879C220.424 43.091 217.267 41.697 213.085 41.697C210.215 41.697 207.673 42.394 205.459 43.788C203.327 45.182 201.646 47.232 200.416 49.938C199.186 52.562 198.571 55.801 198.571 59.655V92.619H183.934V57.933C183.934 52.685 182.868 48.667 180.736 45.879C178.604 43.091 175.406 41.697 171.142 41.697C168.436 41.697 165.976 42.394 163.762 43.788C161.63 45.182 159.949 47.232 158.719 49.938C157.489 52.562 156.874 55.801 156.874 59.655V92.619H142.114Z",
    "M268.986 94.095C263.984 94.095 259.679 93.111 256.071 91.143C252.545 89.093 249.839 86.059 247.953 82.041C246.067 77.941 245.124 72.898 245.124 66.912V30.627H259.884V65.436C259.884 70.766 260.991 74.825 263.205 77.613C265.501 80.319 268.945 81.672 273.537 81.672C276.489 81.672 279.113 80.975 281.409 79.581C283.787 78.187 285.632 76.178 286.944 73.554C288.338 70.848 289.035 67.568 289.035 63.714V30.627H303.795V92.619H290.757L289.65 82.287C287.764 85.895 285.017 88.765 281.409 90.897C277.883 93.029 273.742 94.095 268.986 94.095Z",
    "M334.94 94.095C329.446 94.095 324.649 93.234 320.549 91.512C316.531 89.708 313.333 87.248 310.955 84.132C308.659 80.934 307.306 77.285 306.896 73.185H321.656C322.066 74.907 322.804 76.506 323.87 77.982C324.936 79.376 326.371 80.483 328.175 81.303C330.061 82.123 332.275 82.533 334.817 82.533C337.277 82.533 339.286 82.205 340.844 81.549C342.402 80.811 343.55 79.868 344.288 78.72C345.026 77.572 345.395 76.342 345.395 75.03C345.395 73.062 344.862 71.545 343.796 70.479C342.73 69.413 341.172 68.593 339.122 68.019C337.154 67.363 334.776 66.748 331.988 66.174C329.036 65.6 326.166 64.903 323.378 64.083C320.672 63.181 318.212 62.074 315.998 60.762C313.866 59.45 312.144 57.769 310.832 55.719C309.602 53.669 308.987 51.168 308.987 48.216C308.987 44.608 309.93 41.369 311.816 38.499C313.784 35.629 316.572 33.374 320.18 31.734C323.87 30.012 328.257 29.151 333.341 29.151C340.557 29.151 346.297 30.832 350.561 34.194C354.907 37.474 357.449 42.107 358.187 48.093H344.165C343.755 45.797 342.607 44.034 340.721 42.804C338.835 41.492 336.334 40.836 333.218 40.836C330.02 40.836 327.56 41.451 325.838 42.681C324.198 43.829 323.378 45.387 323.378 47.355C323.378 48.585 323.87 49.733 324.854 50.799C325.92 51.783 327.437 52.644 329.405 53.382C331.373 54.038 333.792 54.694 336.662 55.35C341.254 56.252 345.313 57.318 348.839 58.548C352.365 59.778 355.153 61.582 357.203 63.96C359.253 66.338 360.278 69.7 360.278 74.046C360.36 77.982 359.335 81.467 357.203 84.501C355.153 87.535 352.242 89.913 348.47 91.635C344.698 93.275 340.188 94.095 334.94 94.095Z",
    "M385.264 94.095C380.18 94.095 375.957 93.234 372.595 91.512C369.233 89.79 366.732 87.494 365.092 84.624C363.452 81.754 362.632 78.638 362.632 75.276C362.632 71.34 363.616 67.937 365.584 65.067C367.634 62.197 370.627 59.983 374.563 58.425C378.499 56.785 383.337 55.965 389.077 55.965H404.698C404.698 52.685 404.247 49.979 403.345 47.847C402.443 45.633 401.049 43.993 399.163 42.927C397.277 41.861 394.858 41.328 391.906 41.328C388.544 41.328 385.674 42.107 383.296 43.665C380.918 45.141 379.442 47.437 378.868 50.553H364.354C364.846 46.125 366.322 42.353 368.782 39.237C371.242 36.039 374.481 33.579 378.499 31.857C382.599 30.053 387.068 29.151 391.906 29.151C397.728 29.151 402.689 30.176 406.789 32.226C410.889 34.194 414.005 37.064 416.137 40.836C418.351 44.526 419.458 48.995 419.458 54.243V92.619H406.912L405.436 82.656C404.616 84.296 403.55 85.813 402.238 87.207C401.008 88.601 399.573 89.831 397.933 90.897C396.293 91.881 394.407 92.66 392.275 93.234C390.225 93.808 387.888 94.095 385.264 94.095ZM388.585 82.41C390.963 82.41 393.054 82 394.858 81.18C396.744 80.278 398.343 79.048 399.655 77.49C401.049 75.85 402.115 74.046 402.853 72.078C403.591 70.11 404.083 68.019 404.329 65.805V65.559H390.676C387.806 65.559 385.428 65.928 383.542 66.666C381.656 67.322 380.303 68.306 379.483 69.618C378.663 70.93 378.253 72.447 378.253 74.169C378.253 75.891 378.663 77.367 379.483 78.597C380.303 79.827 381.492 80.77 383.05 81.426C384.608 82.082 386.453 82.41 388.585 82.41ZM375.027 5.529L405.052 10.014L407.474 20.119L377.487 16.49Z"
  ];

  const f = (n) => +n.toFixed(4);

  // Bandas dos anéis: [{inner, outer}], de dentro para fora.
  // pitch P = (R - pupilR - pupilGap) / (count - 1 + weight); espessura = weight * P.
  function rings(p) {
    const P = (p.R - p.pupilR - p.pupilGap) / (p.count - 1 + p.weight);
    const t = p.weight * P, gap = P - t;
    const bands = [];
    let r = p.pupilR + p.pupilGap;
    for (let i = 0; i < p.count; i++) { bands.push({ inner: r, outer: r + t }); r += P; }
    return { pitch: P, thickness: t, gap, bands, pupil: p.pupilR };
  }

  function circle(cx, cy, r) {
    if (r <= 0) return "";
    return `M${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}Z`;
  }
  function square(x, y, s) { return `M${f(x)} ${f(y)}H${f(x + s)}V${f(y + s)}H${f(x)}Z`; }

  // Círculos aninhados para evenodd: pupila + cada banda.
  function ringCircles(cx, cy, p, simple) {
    if (simple) return circle(cx, cy, AVATAR.R) + circle(cx, cy, AVATAR.inner);
    const g = rings(p);
    return g.bands.slice().reverse().map(b => circle(cx, cy, b.outer) + circle(cx, cy, b.inner)).join("") + circle(cx, cy, g.pupil);
  }

  // Peças, cada uma um path evenodd.
  function parts(p, o) {
    const { frame, tile, center } = SPEC;
    const s = frame.stroke;
    return {
      frame: square(frame.x, frame.y, frame.size) + square(frame.x + s, frame.y + s, frame.size - 2 * s),
      tile: square(tile.x, tile.y, tile.size) + ringCircles(center.x, center.y, p, o.simple), // anéis vazados
      cutout: square(tile.x, tile.y, tile.size) + circle(center.x, center.y, AVATAR.R), // só o círculo maior vazado: janela para fotos
      rings: ringCircles(center.x, center.y, p, o.simple) // anéis positivos, sem tile
    };
  }

  const VARIANTS = {
    lockup:   { name: "Lockup",    box: [0, 0, SPEC.lockup.width, SPEC.lockup.height], use: ["frame", "tile", "wordmark"] },
    symbol:   { name: "Símbolo",   box: [0, SPEC.frame.y, SPEC.frame.size, SPEC.frame.size], use: ["frame", "tile"] },
    tile:     { name: "Ícone",     box: [SPEC.tile.x, SPEC.tile.y, SPEC.tile.size, SPEC.tile.size], use: ["tile"] },
    cutout:   { name: "Recorte",   box: [0, SPEC.frame.y, SPEC.frame.size, SPEC.frame.size], use: ["frame", "cutout"] },
    logotype: { name: "Logotipo",  box: [SPEC.wordmark.left, 0, SPEC.wordmark.right - SPEC.wordmark.left, SPEC.wordmark.overshootBottom], use: ["wordmark"] },
    rings:    { name: "Anéis",     box: [SPEC.center.x - 30.4563, SPEC.center.y - 30.4563, 60.9126, 60.9126], use: ["rings"] },
    avatar:   { name: "Avatar",    box: [SPEC.center.x - 30.4563, SPEC.center.y - 30.4563, 60.9126, 60.9126], use: ["rings"], simple: true }
  };

  /**
   * svg("lockup", { color, params, simple, width, pad })
   * color: cor única de tinta. Vazados ficam transparentes, então o fundo aparece.
   */
  function svg(variant, opts = {}) {
    const v = VARIANTS[variant];
    const color = opts.color || COLORS.crimson;
    const p = opts.params || RING_PRESETS.lockup;
    const simple = opts.simple ?? !!v.simple;
    const pad = opts.pad || 0;
    const pr = parts(p, { simple });
    const [x, y, w, h] = v.box;
    const vb = [x - pad, y - pad, w + 2 * pad, h + 2 * pad].map(f).join(" ");
    const width = opts.width || 1024;
    const height = f(width * (h + 2 * pad) / (w + 2 * pad));
    const out = [];
    for (const k of v.use) {
      if (k === "wordmark") WORDMARK.forEach(d => out.push(`<path d="${d}" fill="${color}"/>`));
      else out.push(`<path d="${pr[k]}" fill-rule="evenodd" clip-rule="evenodd" fill="${color}"/>`);
    }
    const title = opts.title === false ? "" : `<title>musá ${v.name.toLowerCase()}</title>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vb}" fill="none" role="img">${title}${out.join("")}</svg>`;
  }

  // Menor tamanho (px de altura do símbolo) em que o vão entre anéis ainda tem `minGapPx`.
  function minSymbolPx(p, minGapPx = 0.5) {
    return Math.ceil(minGapPx * SPEC.frame.size / rings(p).gap);
  }

  const api = { COLORS, SPEC, RING_PRESETS, AVATAR, WORDMARK, VARIANTS, rings, svg, minSymbolPx, circle };
  root.MUSA = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
