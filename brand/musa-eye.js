/*
 * musá — olho (avatar vivo).
 * Motor único do avatar: morph logo → olho, olhar em repouso para a esquerda,
 * segue o cursor pela página inteira, pisca, e troca de emoção (feliz, triste) pela pupila.
 * Valores vindos do Avatar lab (geometria, mola, parallax) e do ajuste de humor (feliz/triste).
 * Uso: const eye = MusaEye.create(svgEl, { logo: MUSA.RING_PRESETS.v6, frame: "symbol" }); eye.setState(1); eye.setMood("happy");
 * frame: de qual peça aprovada o olho nasce. Os anéis nunca aparecem sozinhos na marca, então o estado logo é sempre uma peça inteira:
 *   "symbol" (moldura + tile + anéis), "tile" (Ícone) ou "lockup" (símbolo + logotipo). "rings" fica só para uso interno.
 *   Nas peças com tile, os anéis são vazados no tile (como no arquivo da marca). Na transição o tile cresce até virar o fundo,
 *   a moldura sai, o logotipo some, e o olho fica vazado num campo de tinta.
 */
(function (root) {
  "use strict";
  const R = 30.4563, TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const easeIO = u => { u = clamp(u, 0, 1); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  const bump = u => (u <= 0 || u >= 1) ? 0 : Math.sin(Math.PI * u);
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CONFIG = {
    // geometria do avatar: um anel grosso, o centro aberto é a pupila
    avatar: { rings: 1, pupilR: 0, pupilGap: 8, weight: 0.62 },
    // morph
    morphDur: 0.7, stagger: 0.15,
    // repouso (valores do lab, 12 nov 2026): olhar para baixo e para a direita da tela, que é a esquerda do olho
    restGaze: [0.6, 1],
    glance: 0.18,          // amplitude das olhadelas em repouso
    follow: true,          // segue o cursor pela página inteira
    followMix: 0.9,        // quanto o cursor manda no olhar (o resto puxa para o repouso)
    reach: 1, outerFollow: 0.5, falloff: 1.37,
    stiff: 271, damp: 0.85,
    breathe: reduce ? 0 : 0.8, breathRate: 0.22,
    blinkEvery: 0          // piscar automático desligado (escolha da usuária no lab)
  };

  const NEUTRAL = { pupil: 0, mouthShape: 0, mouthCurve: 0, mouthW: 1.4, mouthT: 0.45, mouthY: 0, mouthRound: 0.6 };
  const MOOD_KEYS = Object.keys(NEUTRAL);
  // Do ajuste de humor: as emoções mexem só na pupila, que vira uma boca.
  // Formas ajustadas aos SVGs exportados pela usuária (Bold Text - tende a ajudar*.svg, 12 nov 2026), erro < 0,002 unidade.
  const MOODS = {
    neutral: { label: "Neutro", stiff: 271, damp: 0.85, pose: {} },
    happy: { label: "Feliz", stiff: 271, damp: 0.85, pose: { pupil: 0.993, mouthShape: 0.801, mouthCurve: 0.503, mouthW: 1.287, mouthT: 0.516, mouthY: 0.606, mouthRound: 0.41 } },
    sad: { label: "Triste", stiff: 140, damp: 0.95, pose: { pupil: 0.426, mouthShape: 0.966, mouthCurve: -0.722, mouthW: 1.128, mouthT: 0.266, mouthY: 0.862, mouthRound: 0.6 } }
  };

  /* ---------- geometria ---------- */
  function ringGeom(n, pr, pg, w) {
    n = Math.max(1, Math.round(n));
    const pitch = Math.max(.2, (R - pr - pg) / (n - 1 + w)), rings = [];
    for (let i = 0; i < n; i++) { const a = pr + pg + i * pitch; rings.push([a, a + w * pitch]); }
    return { n, pitch, rings, w, pr };
  }
  function slice(g, K, s) {
    const n = g.n, j = Math.min(n - 1, Math.floor(s * n / K));
    const first = Math.ceil(j * K / n), last = Math.ceil((j + 1) * K / n) - 1;
    const c = Math.max(1, last - first + 1), k = s - first;
    const [a, b] = g.rings[j], eps = c > 1 ? .15 : 0;
    return [a + (b - a) * k / c - (k > 0 ? eps : 0), a + (b - a) * (k + 1) / c + (k < c - 1 ? eps : 0)];
  }
  function morphGeom(logo, m) {
    const A = CONFIG.avatar;
    const gL = ringGeom(logo.count, logo.pupilR, logo.pupilGap, logo.weight);
    const gA = ringGeom(A.rings, A.pupilR, A.pupilGap, A.weight);
    const K = Math.max(gL.n, gA.n), st = clamp(CONFIG.stagger, 0, .9), strands = [];
    for (let s = 0; s < K; s++) {
      const d = K > 1 ? st * s / (K - 1) : 0, p = ease((m - d) / (1 - st));
      const L = slice(gL, K, s), Av = slice(gA, K, s);
      strands.push([lerp(L[0], Av[0], p), lerp(L[1], Av[1], p)]);
    }
    return { strands, pupilR: lerp(gL.pr, gA.pr, ease(m)), pitch: lerp(gL.pitch, gA.pitch, ease(m)) };
  }
  function makeWarp(f) {
    const gamma = Math.pow(2, -f.pupil * .85), G = CONFIG.reach * R * .5;
    const dx = clamp(f.gx, -1.25, 1.25) * G, dy = clamp(f.gy, -1.25, 1.25) * G;
    const pul = f.pulse, base = CONFIG.outerFollow, fo = CONFIG.falloff;
    return (r, th, lin) => {
      let q = Math.max(0, r / R), rr = lin ? r * lin : R * Math.pow(q, gamma); q = rr / R;
      if (pul && !lin) rr += pul * rr * ((1 - q) * .35 + .07);
      let x = rr * Math.cos(th), y = rr * Math.sin(th);
      const rho = clamp(rr / R, 0, 1), wt = base + (1 - base) * Math.pow(1 - rho * rho, fo);
      return [x + dx * wt, y + dy * wt];
    };
  }
  const fmt = v => (Math.round(v * 100) / 100).toString();
  function circlePath(W, r, rev, q) {
    const n = Math.max(20, Math.ceil(r * 3.4 * q)), o = [];
    for (let j = 0; j < n; j++) { const [x, y] = W(r, (rev ? -TAU : TAU) * j / n); o.push(fmt(x) + " " + fmt(y)); }
    return "M" + o.join("L") + "Z";
  }
  // A pupila (centro aberto) vira uma lente curva: boca que sorri ou faz bico. Sentido anti-horário = furo.
  function mouthPath(W, r0, f, q) {
    const k = clamp(f.mouthShape, 0, 1), w = r0 * Math.max(.2, f.mouthW), t0 = r0 * Math.max(.05, f.mouthT);
    const A = f.mouthCurve * w * .55;
    const wE = lerp(r0, w, k), tE = lerp(r0, t0, k), AE = A * k, oyE = f.mouthY * r0 * k;
    const b = .5 + .5 * Math.tanh(A / (.15 * w)) * Math.min(1, k * 3);
    const gamma = Math.pow(2, -f.pupil * .85), q0 = Math.pow(r0 / R, gamma);
    const lin = (R * q0 / r0) * (1 + (f.pulse || 0) * ((1 - q0) * .35 + .07));
    const rho = clamp(f.mouthRound, 0, 1) * tE;
    const n = Math.max(96, Math.ceil(r0 * 10 * q)), o = [];
    for (let j = 0; j < n; j++) {
      const th = -TAU * j / n, c = Math.cos(th), s = Math.sin(th), x = wE * c;
      const g = Math.max(0, (Math.abs(c) - .7) / .3), cap = rho * (1 - Math.sqrt(Math.max(0, 1 - g * g)));
      const y = -AE * (c * c - .5) + oyE + cap * (2 * b - 1) + 2 * tE * s * (s < 0 ? 1 - b : b) - tE * (2 * b - 1);
      const [X, Y] = W(Math.hypot(x, y), Math.atan2(y, x), lin);
      o.push(fmt(X) + " " + fmt(Y));
    }
    return "M" + o.join("L") + "Z";
  }

  function fuse(strands) {
    const out = [];
    for (const [a, b] of strands) {
      if (b - a < .02) continue;
      const g = out[out.length - 1];
      if (g && a <= g[1] + 1e-3) g[1] = Math.max(g[1], b); else out.push([a, b]);
    }
    return out;
  }

  /* ---------- ponteiro compartilhado (página inteira) ---------- */
  const pointer = { known: false, x: 0, y: 0 };
  if (typeof document !== "undefined") {
    const mv = e => { pointer.known = true; pointer.x = e.clientX; pointer.y = e.clientY; };
    document.addEventListener("pointermove", mv, { passive: true });
    document.addEventListener("pointerdown", mv, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { pointer.known = false; });
    window.addEventListener("blur", () => { pointer.known = false; });
  }

  /* ---------- instâncias ---------- */
  const eyes = [];
  let uid = 0, last = 0, running = false;

  function create(svg, opts = {}) {
    const id = "me" + (uid++);
    const frame = FRAMES[opts.frame] ? opts.frame : "rings", FR = FRAMES[frame];
    svg.setAttribute("viewBox", opts.viewBox || FR.viewBox);
    // o fundo e o tile crescem além da caixa: sempre recortar no SVG, senão pintam a página inteira
    if (frame !== "rings") svg.style.overflow = "hidden";
    const eyeG = `<g class="outer"><g class="inner"><path class="eye" d=""/></g></g>`;
    if (frame === "rings") svg.innerHTML = eyeG;
    else {
      const MU = root.MUSA, cx = MU.SPEC.center.x, cy = MU.SPEC.center.y;
      const word = frame === "lockup" ? `<g class="word" fill="currentColor"><g transform="translate(${-cx} ${-cy})">${MU.WORDMARK.map(d => `<path d="${d}"/>`).join("")}</g></g>` : "";
      svg.innerHTML = `<defs><mask id="${id}m" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="8000">
<rect x="-4000" y="-4000" width="8000" height="8000" fill="#fff"/>${eyeG.replace('class="eye"', 'class="eye" fill="#000"')}</mask></defs>
<rect class="bg" x="-4000" y="-4000" width="8000" height="8000"/>
<g class="zoom"><path class="frame" fill-rule="evenodd" fill="currentColor"/><rect class="tile" fill="currentColor" mask="url(#${id}m)"/>${word}</g>`;
    }
    const e = {
      svg, frame, FR, eyeEl: svg.querySelector(".eye"), outer: svg.querySelector(".outer"), inner: svg.querySelector(".inner"),
      zoom: svg.querySelector(".zoom"), frameEl: svg.querySelector(".frame"), tileEl: svg.querySelector(".tile"), word: svg.querySelector(".word"), bg: svg.querySelector(".bg"),
      logo: opts.logo, ink: opts.ink || "#930031", paper: opts.paper || "#FFFBFB", q: opts.quality || 1,
      T: 0, morph: { from: opts.state ?? 0, to: opts.state ?? 0, t0: 0, dur: 0 },
      mood: "neutral", S: { ...NEUTRAL, gx: 0, gy: 0 }, V: {}, sacc: [0, 0], saccNext: 1.5,
      blinkNext: 2.5, blinkT: -9, lookAt: null, onState: opts.onState
    };
    for (const k in e.S) e.V[k] = 0;
    const paint = () => {
      if (frame === "rings") e.eyeEl.setAttribute("fill", e.ink);
      else { svg.style.color = e.ink; e.bg.setAttribute("fill", e.paper); }
    };
    paint();
    const api = {
      setState(v) { const cur = morphNow(e); e.morph = { from: cur, to: v, t0: e.T, dur: reduce ? 0 : CONFIG.morphDur * Math.max(.25, Math.abs(v - cur)) }; },
      get state() { return e.morph.to; },
      setMood(name) { if (MOODS[name]) e.mood = name; if (name !== "neutral" && e.morph.to < 1) api.setState(1); },
      get mood() { return e.mood; },
      blink() { e.blinkT = e.T; },
      look(x, y, secs = 1.6) { e.lookAt = { x, y, until: e.T + secs }; },
      setInk(c, paper) { e.ink = c; if (paper) e.paper = paper; paint(); },
      setLogo(p) { e.logo = p; },
      destroy() { const i = eyes.indexOf(e); if (i >= 0) eyes.splice(i, 1); }
    };
    eyes.push(e); start();
    draw(e);
    return api;
  }
  // Enquadramento de cada peça (centro dos anéis na origem, medidas de musa-geometry.js).
  const TILE = 49.3527, FRAME = 56.911, STROKE = 0.889236;
  const FRAMES = {
    rings:  { viewBox: "-38 -38 76 76" },
    tile:   { viewBox: "-52 -52 104 104", zoomEnd: 0.8 * 52 / 30.4563, cover: true },
    symbol: { viewBox: "-60 -60 120 120", zoomEnd: 0.8 * 60 / 30.4563, cover: true, hasFrame: true },
    lockup: { viewBox: "-60 -60 426.5 120", zoomEnd: 1, cover: false, hasFrame: true, word: true }
  };
  const sq = (h) => `M${-h} ${-h}H${h}V${h}H${-h}Z`;
  function drawFrame(e, m) {
    const FR = e.FR; if (!FR.zoomEnd) return;
    const vh = parseFloat(FR.viewBox.split(" ")[3]) / 2;
    const z = lerp(1, FR.zoomEnd, easeIO(m));
    const g = ease((m - .12) / .88);
    const end = FR.cover ? vh / FR.zoomEnd * 1.6 : FRAME;
    const t = lerp(TILE, end, g);
    e.zoom.setAttribute("transform", `scale(${z.toFixed(4)})`);
    e.tileEl.setAttribute("x", -t); e.tileEl.setAttribute("y", -t);
    e.tileEl.setAttribute("width", 2 * t); e.tileEl.setAttribute("height", 2 * t);
    if (FR.hasFrame) {
      const fh = FR.cover ? t + (FRAME - TILE) : FRAME;
      e.frameEl.setAttribute("d", sq(fh) + sq(fh - STROKE));
      e.frameEl.setAttribute("opacity", (1 - ease(m / .55)).toFixed(3));
    }
    if (e.word) {
      const a = ease(m / .45);
      e.word.setAttribute("opacity", (1 - a).toFixed(3));
      e.word.setAttribute("transform", `translate(${(-14 * a).toFixed(2)} 0)`);
    }
  }

  const morphNow = e => { const u = e.morph.dur > 0 ? (e.T - e.morph.t0) / e.morph.dur : 1; return lerp(e.morph.from, e.morph.to, easeIO(u)); };

  function gazeToward(e, x, y) {
    // centro do olho na tela (a origem do SVG), também no lockup, onde o olho não fica no meio
    let ox, oy; const M = e.svg.getScreenCTM && e.svg.getScreenCTM();
    if (M) { ox = M.e; oy = M.f; } else { const b = e.svg.getBoundingClientRect(); ox = b.left + b.width / 2; oy = b.top + b.height / 2; }
    const dx = x - ox, dy = y - oy;
    const d = Math.hypot(dx, dy) || 1, scale = Math.max(160, Math.min(innerWidth, innerHeight) * .35);
    const m = Math.tanh(d / scale);
    return [dx / d * m, dy / d * m];
  }

  function step(e, dt) {
    e.T += dt;
    const m = morphNow(e), life = ease(m);
    // alvo do olhar
    let g;
    if (e.lookAt && e.T < e.lookAt.until) g = gazeToward(e, e.lookAt.x, e.lookAt.y);
    else if (CONFIG.follow && pointer.known) {
      const p = gazeToward(e, pointer.x, pointer.y), k = CONFIG.followMix;
      g = [p[0] * k + CONFIG.restGaze[0] * (1 - k), p[1] * k + CONFIG.restGaze[1] * (1 - k)];
    } else {
      if (e.T > e.saccNext) {
        e.saccNext = e.T + 1.4 + Math.random() * 2.4;
        const a = CONFIG.glance;
        e.sacc = Math.random() < .35 ? [0, 0] : [(Math.random() * 2 - 1) * a, (Math.random() * 2 - 1) * a * .6];
      }
      g = [CONFIG.restGaze[0] + e.sacc[0], CONFIG.restGaze[1] + e.sacc[1]];
    }
    const md = MOODS[e.mood], tgt = { gx: g[0], gy: g[1] };
    for (const k of MOOD_KEYS) tgt[k] = k in md.pose ? md.pose[k] : NEUTRAL[k];
    const n = Math.ceil(dt / (1 / 240)), h = dt / n;
    for (const k in tgt) {
      const gaze = k === "gx" || k === "gy";
      const kk = gaze ? CONFIG.stiff * 2.6 : md.stiff, cc = 2 * Math.sqrt(kk) * (gaze ? CONFIG.damp : md.damp);
      for (let i = 0; i < n; i++) { e.V[k] += ((tgt[k] - e.S[k]) * kk - e.V[k] * cc) * h; e.S[k] += e.V[k] * h; }
    }
    if (CONFIG.blinkEvery > 0 && life > .9 && e.T > e.blinkNext) {
      e.blinkT = e.T; if (Math.random() < .15) e.blinkT2 = e.T + .32;
      e.blinkNext = e.T + CONFIG.blinkEvery * (.5 + Math.random());
    }
    if (e.blinkT2 && e.T > e.blinkT2) { e.blinkT = e.T; e.blinkT2 = 0; }
  }

  function draw(e) {
    const m = morphNow(e), life = ease(m);
    // no estado logo a marca fica neutra; a vida entra conforme vira olho
    const f = {};
    for (const k in e.S) f[k] = k in NEUTRAL ? lerp(NEUTRAL[k], e.S[k], life) : e.S[k] * life;
    let blink = 0; const bu = (e.T - e.blinkT) / .24; if (bu > 0 && bu < 1) blink = Math.pow(bump(bu), .7) * life;
    let pulse = 0, sx = 1, sy = 1;
    if (CONFIG.breathe > 0) { const b = Math.sin(e.T * TAU * CONFIG.breathRate) * CONFIG.breathe * life; sx += .008 * b; sy += .014 * b; pulse += .06 * b; }
    f.pulse = pulse;
    const geo = morphGeom(e.logo, m), W = makeWarp(f);
    let d = "";
    // Faixas que já se tocam viram um anel só. Sem isso, as emendas sobrepostas entre faixas
    // aparecem como linhas finas dentro da boca quando ela atravessa o anel.
    fuse(geo.strands).forEach(([a, b], i) => {
      d += circlePath(W, b, false, e.q) + (i === 0 ? mouthPath(W, a, f, e.q) : circlePath(W, a, true, e.q));
    });
    if (geo.pupilR > .05) d += circlePath(W, geo.pupilR, false, e.q);
    e.eyeEl.setAttribute("d", d);
    e.outer.setAttribute("transform", `scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
    e.inner.setAttribute("transform", `scale(1 ${(1 - .93 * blink).toFixed(3)})`);
    drawFrame(e, m);
  }

  function frame(ms) {
    const now = ms / 1000, dt = Math.min(1 / 20, Math.max(0, now - (last || now))); last = now;
    for (const e of eyes) {
      const b = e.svg.getBoundingClientRect();
      const visible = b.bottom > 0 && b.top < innerHeight && b.width > 0;
      if (!visible) continue;
      step(e, dt);
      // parado no estado logo, o desenho não muda: desenha uma vez e pula os quadros seguintes
      if (e.morph.to === 0 && morphNow(e) === 0) { if (!e.parado) { draw(e); e.parado = true; } continue; }
      e.parado = false;
      draw(e);
    }
    if (eyes.length) requestAnimationFrame(frame); else running = false;
  }
  function start() { if (!running && typeof requestAnimationFrame !== "undefined") { running = true; last = 0; requestAnimationFrame(frame); } }

  root.MusaEye = { create, CONFIG, MOODS, FRAMES };
})(typeof window !== "undefined" ? window : globalThis);
