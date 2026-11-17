// Painel DialKit do playground da marca em tamanho pequeno (/dev/marca-pequena). Só roda no servidor local.
// Mexe nos anéis do logo (quantidade, espessura, pupila e folga) e aplica ao vivo: nas peças da página, no olho da
// barra de navegação (e na cópia invertida, que espelha o original). Os valores partem do preset "pequeno".
// Para levar ao código: Copy parameters do painel, colar na conversa com o Claude.
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname) && window.MUSA) {
  const { createDialKit, createDialRoot } = await import("/node_modules/dialkit/dist/vanilla/index.js");
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/node_modules/dialkit/dist/vanilla/styles.css";
  document.head.appendChild(css);

  const M = window.MUSA, base = M.RING_PRESETS.pequeno;
  const raiz = getComputedStyle(document.documentElement);
  const cor = (n, r) => raiz.getPropertyValue(n).trim() || r;
  const CARMIM = cor("--carmim-800", "#930031"), CLARO = cor("--neutro-50", "#FDF9F9");
  // tamanho da peça no viewBox: o ícone é o tile, o símbolo é a moldura
  const LADO = { tile: M.SPEC.tile.size, symbol: M.SPEC.frame.size };

  const desenhar = (p) => {
    document.querySelectorAll(".mp-peca").forEach((el) => {
      el.innerHTML = M.svg(el.dataset.variante, { params: p, color: el.dataset.fundo === "carmim" ? CLARO : CARMIM, title: false });
    });
    const vao = M.rings(p).gap;
    document.querySelectorAll(".mp-vao").forEach((el) => {
      const px = vao * Number(el.dataset.tamanho) / LADO[el.dataset.variante];
      el.textContent = `· vão ${px.toFixed(2)}px`;
      el.toggleAttribute("data-ruim", px < 1);
    });
  };

  createDialRoot({ position: "top-right", theme: "light", defaultOpen: true });
  const kit = createDialKit("Logo pequeno", {
    aneis: {
      quantidade: [base.count, 1, 8, 1],
      espessura: [base.weight, 0.2, 0.95, 0.001],
      raioDaPupila: [base.pupilR, 0, 12, 0.01],
      folgaDaPupila: [base.pupilGap, 0, 8, 0.01]
    }
  }, { id: "musa-marca-pequena-v2", persist: true });

  kit.subscribe((v) => {
    const a = v.aneis;
    const p = { label: "Teste (playground)", R: base.R, count: Math.round(a.quantidade), weight: a.espessura, pupilR: a.raioDaPupila, pupilGap: a.folgaDaPupila };
    M.RING_PRESETS.teste = p;
    desenhar(p);
    window.MUSA_NAV_OLHOS?.forEach((o) => o.setLogo(p));
  });
}
