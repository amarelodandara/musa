// Painéis da página /dev/sobre-guias: guias e rabiscos em giz da página Sobre (src/pages/sobre.astro), dentro do quadro.
// Variáveis --guia-* e --rabisco-* no main.sobre, o padrão #sobre-hachura e os filtros (o de cada guia, do TracoGiz, e o
// #sobre-giz-rabisco). Para levar ao código: "Copy parameters" e colar na conversa.
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) {
  const { createDialKit, createDialRoot } = await import("/node_modules/dialkit/dist/vanilla/index.js");
  const css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "/node_modules/dialkit/dist/vanilla/styles.css";
  document.head.appendChild(css);
  createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });

  const CORES = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
  const quadro = document.querySelector(".palco iframe");
  const pronto = () => new Promise((r) => { const d = quadro.contentDocument; if (d?.readyState === "complete" && d.querySelector("main.sobre")) r(d); else quadro.addEventListener("load", () => r(quadro.contentDocument), { once: true }); });
  const doc = await pronto();
  const sobre = doc.querySelector("main.sobre");
  const css2 = (k, v) => sobre.style.setProperty(k, v);
  const num = (n, a) => Number(String(n.getAttribute(a)).split(/[\s,]+/)[0]);

  // filtros: [ondula, desloca, grao, matriz]
  const partes = (f) => { const [ondula, desloca, grao, matriz] = [...f.children]; return { ondula, desloca, grao, matriz }; };
  const aplicarGiz = (fs, G) => fs.forEach((f) => { const p = partes(f);
    p.desloca.setAttribute("scale", G.aspereza); p.ondula.setAttribute("baseFrequency", G.ondas); p.grao.setAttribute("baseFrequency", G.grao);
    const c = G.contraste, b = G.cobertura - c / 2;
    p.matriz.setAttribute("values", `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${c} ${Math.round(b * 1000) / 1000}`); });
  const lerGiz = (f) => { const p = partes(f), m = p.matriz.getAttribute("values").trim().split(/\s+/).map(Number);
    return { aspereza: num(p.desloca, "scale"), ondas: num(p.ondula, "baseFrequency"), grao: num(p.grao, "baseFrequency"), cobertura: Math.round((m[19] + m[18] / 2) * 100) / 100, contraste: m[18] }; };
  const gizControles = (g, max) => ({
    aspereza: [g.aspereza, 0, max.aspereza, 0.1],   // quanto o traço treme
    ondas: [g.ondas, 0.01, 1.5, 0.01],              // menor = ondas longas
    grao: [g.grao, 0.3, 4, 0.05],                   // maior = grão mais fino
    cobertura: [g.cobertura, 0.2, 1.6, 0.01],       // menor = mais papel aparecendo
    contraste: [g.contraste, 0, 12, 0.1]
  });

  // ---------- Guias ----------
  const filtrosGuias = [...sobre.querySelectorAll(".guia filter")]; // as guias da página e as linhas das faixas
  const guias = createDialKit("Guias", {
    cor: { type: "select", options: CORES, default: "carmim-600" },
    espessura: [2, 0.5, 6, 0.1],
    respiro: [42, 0, 120, 2],        // px da guia até o texto
    giz: { _collapsed: true, ...gizControles(lerGiz(filtrosGuias[0]), { aspereza: 8 }) }
  }, { id: "musa-sobre-guias-v2", persist: true });
  guias.subscribe((v) => {
    css2("--guia-cor", `var(--${v.cor})`); css2("--guia-espessura", String(v.espessura)); css2("--respiro", `${v.respiro}px`);
    aplicarGiz(filtrosGuias, v.giz);
  });

  // ---------- Faixas (em volta de "Quem faz"; a hachura é a dos rabiscos) ----------
  const faixas = createDialKit("Faixas", {
    altura: [40, 8, 160, 2],     // px entre as duas linhas de cada faixa
    respiro: [64, 0, 200, 2]     // px entre as faixas e o conteúdo de "Quem faz"
  }, { id: "musa-sobre-faixas", persist: true });
  faixas.subscribe((v) => { css2("--faixa-altura", `${v.altura}px`); css2("--faixa-respiro", `${v.respiro}px`); });

  // ---------- Rabiscos ----------
  const padrao = doc.getElementById("sobre-hachura"), filtroRabisco = doc.getElementById("sobre-giz-rabisco");
  const linhaB = padrao.querySelector(".hachura-b"), linhaA = padrao.querySelector(".hachura-a");
  const rabiscos = createDialKit("Rabiscos", {
    ligado: true,
    cor: { type: "select", options: CORES, default: "neutro-400" },
    opacidade: [0.55, 0, 1, 0.01],
    espacamento: [num(padrao, "width"), 3, 30, 0.5],  // px entre um risco e o próximo
    espessura: [1.2, 0.3, 5, 0.1],
    angulo: [40, -90, 90, 1],
    cruzado: false,                                    // uma segunda direção, em ângulo reto
    folga: [8, 0, 40, 1],                              // px entre os rabiscos e a guia
    giz: gizControles(lerGiz(filtroRabisco), { aspereza: 20 })
  }, { id: "musa-sobre-rabiscos", persist: true });
  rabiscos.subscribe((v) => {
    css2("--rabisco-mostrar", v.ligado ? "block" : "none");
    css2("--rabisco-cor", `var(--${v.cor})`); css2("--rabisco-opacidade", String(v.opacidade));
    css2("--rabisco-espessura", String(v.espessura)); css2("--rabisco-cruzado", v.cruzado ? "1" : "0"); css2("--rabisco-folga", `${v.folga}px`);
    const e = v.espacamento;
    padrao.setAttribute("width", e); padrao.setAttribute("height", e); padrao.setAttribute("patternTransform", `rotate(${v.angulo})`);
    linhaA.setAttribute("y1", -1); linhaA.setAttribute("y2", e + 1); linhaB.setAttribute("x1", -1); linhaB.setAttribute("x2", e + 1);
    aplicarGiz([filtroRabisco], v.giz);
  });
}
