// Painéis de dev da página inicial (só no servidor local):
// "Abertura": tocar, pausar, pular para cada passo, arrastar o tempo e mudar a velocidade, para revisar a animação.
// "Página": cor de fundo da página. As opções são classes do Tailwind da paleta (funções primeiro, depois as escalas).
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) {
  const { createDialKit } = await import("/node_modules/dialkit/dist/vanilla/index.js");
  // o root e o CSS do DialKit já são criados por dev/navbar-dials.js; espera ele existir
  for (let i = 0; i < 50 && !document.querySelector(".dialkit-root, [data-dialkit-root]"); i++) await new Promise((r) => setTimeout(r, 100));

  // ---------- Página ----------
  const FUNDOS = [
    "bg-fundo-pagina",
    "bg-fundo-superficie",
    "bg-fundo-afundado",
    "bg-fundo-inverso",
    "bg-coral-100",
    "bg-coral-200",
    "bg-coral-300",
    "bg-coral-400",
    "bg-coral-500",
    "bg-coral-600",
    "bg-coral-700",
    "bg-coral-800",
    "bg-coral-900",
    "bg-carmim-100",
    "bg-carmim-200",
    "bg-carmim-300",
    "bg-carmim-400",
    "bg-carmim-500",
    "bg-carmim-600",
    "bg-carmim-700",
    "bg-carmim-800",
    "bg-carmim-900",
    "bg-carmim-950",
    "bg-neutro-50",
    "bg-neutro-100",
    "bg-neutro-200",
    "bg-neutro-300",
    "bg-neutro-400",
    "bg-neutro-500",
    "bg-neutro-600",
    "bg-neutro-700",
    "bg-neutro-800",
    "bg-neutro-900",
    "bg-neutro-950",
    "bg-texto-950",
    "bg-texto-900",
    "bg-texto-700",
    "bg-texto-600",
    "bg-texto-400",
    "bg-texto-50"
  ];
  const corpo = document.body;
  const pagina = createDialKit("Página", {
    fundo: { type: "select", options: FUNDOS, default: FUNDOS.find((c) => corpo.classList.contains(c)) || "bg-fundo-pagina" }
  }, { id: "musa-pagina", persist: true });
  pagina.subscribe((v) => {
    FUNDOS.forEach((c) => corpo.classList.remove(c));
    corpo.classList.add(v.fundo);
    // o vazado do olho da barra usa a cor do fundo: acompanha a troca
    const papel = getComputedStyle(corpo).backgroundColor;
    const tinta = getComputedStyle(document.documentElement).getPropertyValue("--cor-secundaria-solido").trim();
    (window.MUSA_NAV_OLHOS || []).forEach((o) => o.setInk(tinta, papel));
  });

  // ---------- Abertura ----------
  const A = window.MUSA_ABERTURA;
  if (A) {
    const PASSOS = A.PASSOS.map(([rotulo, t]) => ({ value: String(t), label: rotulo }));
    let interno = false, anterior = {};
    const abertura = createDialKit("Abertura", {
      tocar: { type: "action", label: "Tocar / continuar" },
      pausar: { type: "action", label: "Pausar" },
      doInicio: { type: "action", label: "Tocar do início" },
      passo: { type: "select", options: PASSOS, default: PASSOS[0].value },
      tempo: [A.tempo, 0, A.FIM, 0.05],
      velocidade: { type: "select", options: [{ value: "0.25", label: "0,25×" }, { value: "0.5", label: "0,5×" }, { value: "1", label: "1×" }, { value: "2", label: "2×" }], default: "1" }
    }, {
      id: "musa-abertura-dev",
      onAction(caminho) {
        if (caminho === "tocar") A.tocar();
        if (caminho === "pausar") A.pausar();
        if (caminho === "doInicio") A.reiniciar();
      }
    });
    abertura.subscribe((v) => {
      if (interno) { anterior = v; return; }
      if (v.passo !== anterior.passo && anterior.passo !== undefined) { A.pausar(); A.ir(Number(v.passo)); }
      else if (v.tempo !== anterior.tempo && anterior.tempo !== undefined) { A.pausar(); A.ir(v.tempo); }
      A.velocidade(Number(v.velocidade));
      anterior = v;
    });
    // o slider de tempo acompanha a animação enquanto ela toca
    let ultimoAviso = 0;
    const seguir = ({ tempo }) => {
      const agora = performance.now();
      if (agora - ultimoAviso < 100) return;
      ultimoAviso = agora;
      interno = true; abertura.setValue("tempo", Math.round(tempo * 20) / 20); interno = false;
    };
    A.ouvir(seguir);
    (function vigiar() { if (A.tocando) seguir({ tempo: A.tempo }); requestAnimationFrame(vigiar); })();
  }
}
