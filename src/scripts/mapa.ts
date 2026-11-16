// Comportamento do Mapa da Visita: modos, etapa aberta, filtro por Função, linha dos sentimentos e painel de detalhe.
// Preferências de visualização ficam no navegador (ADR 0001): modo e linha.
const raiz = document.getElementById("mapa") as HTMLElement;
const grade = raiz.querySelector(".mapa-grade") as HTMLElement;
const etapas = [...raiz.querySelectorAll<HTMLElement>(".etapa")];
const dialogo = document.getElementById("detalhe") as HTMLDialogElement;
const corpoDetalhe = document.getElementById("detalhe-corpo") as HTMLElement;
const filtro = document.getElementById("filtro-funcao") as HTMLSelectElement;
const caixaLinha = document.getElementById("mostrar-linha") as HTMLInputElement;
const celular = matchMedia("(max-width: 760px)");

const guardar = (k: string, v: string) => { try { localStorage.setItem("musa:" + k, v); } catch {} };
const ler = (k: string) => { try { return localStorage.getItem("musa:" + k); } catch { return null; } };

let atual = 0;

function abrirEtapa(i: number, { rolar = true } = {}) {
  atual = Math.max(0, Math.min(etapas.length - 1, i));
  etapas.forEach((e, j) => e.toggleAttribute("data-aberta", j === atual));
  const e = etapas[atual];
  const fase = e.querySelector(".etapa-fase")?.textContent ?? "";
  const nome = e.querySelector(".etapa-nome button")?.textContent?.replace(/^\s*\d+\s*/, "") ?? "";
  (document.getElementById("passo-n") as HTMLElement).textContent = String(atual + 1);
  (document.getElementById("passo-nome") as HTMLElement).textContent = `${fase} · ${nome}`;
  raiz.querySelectorAll<HTMLButtonElement>(".passo-seta").forEach((b) => {
    b.disabled = Number(b.dataset.passo) < 0 ? atual === 0 : atual === etapas.length - 1;
  });
  if (raiz.dataset.modo === "etapa") {
    const cols = etapas.map((_, j) => (j === atual ? "var(--col-aberta)" : "var(--col-compacta)")).join(" ");
    grade.style.setProperty("--colunas", cols);
  }
  history.replaceState(null, "", "#" + e.dataset.etapa);
  if (rolar && raiz.dataset.modo === "etapa") {
    // só na horizontal, dentro da área do mapa (scrollIntoView também rolaria a página)
    const area = grade.parentElement as HTMLElement;
    requestAnimationFrame(() => {
      const r = e.getBoundingClientRect(), a = area.getBoundingClientRect();
      const alvo = area.scrollLeft + (r.left - a.left) - 24;
      area.scrollTo({ left: Math.max(0, alvo), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }
  requestAnimationFrame(desenharLinha);
}

function definirModo(modo: string, salvar = true) {
  if (celular.matches) modo = "etapa";
  raiz.dataset.modo = modo;
  raiz.querySelectorAll<HTMLButtonElement>("[data-escolher-modo]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.escolherModo === modo)));
  if (modo === "inteiro") grade.style.removeProperty("--colunas");
  if (salvar) guardar("modo", modo);
  abrirEtapa(atual, { rolar: false });
}

function filtrar(funcao: string) {
  raiz.querySelectorAll<HTMLElement>(".etapa .pratica").forEach((p) => { p.hidden = !!funcao && p.dataset.funcao !== funcao; });
  raiz.querySelectorAll<HTMLElement>(".camada-boas, .camada-evitar").forEach((c) => {
    const total = c.querySelectorAll(".pratica").length;
    const visiveis = c.querySelectorAll(".pratica:not([hidden])").length;
    (c.querySelector(".vazio-filtro") as HTMLElement).hidden = !(total && !visiveis);
  });
  requestAnimationFrame(desenharLinha);
}

// Linha dos sentimentos: um ponto por Etapa, na camada Sentimentos, altura pelo peso (−2…+2). Etapa sem registro interrompe a linha.
function desenharLinha() {
  const svg = grade.querySelector(".linha-sentimentos") as SVGSVGElement;
  const caminho = svg.querySelector("path") as SVGPathElement;
  if (raiz.dataset.linha === "nao" || celular.matches) { caminho.setAttribute("d", ""); return; }
  const base = grade.getBoundingClientRect();
  let d = "", aberto = false;
  for (const e of etapas) {
    const camada = e.querySelector(".camada-sentimentos") as HTMLElement;
    const r = camada.getBoundingClientRect();
    const peso = e.dataset.peso === "" ? null : Number(e.dataset.peso);
    if (peso === null) { aberto = false; continue; }
    const x = r.left - base.left + r.width / 2;
    // faixa dos avatares (topo da camada), para não cruzar o Pensamento do professor
    const y = r.top - base.top + 32 - peso * 9;
    d += (aberto ? " L" : " M") + x.toFixed(1) + " " + y.toFixed(1);
    aberto = true;
  }
  svg.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);
  caminho.setAttribute("d", d.trim());
}

function abrirDetalhe(id: string) {
  const t = document.getElementById("detalhe-" + id) as HTMLTemplateElement | null;
  if (!t) return;
  corpoDetalhe.replaceChildren(t.content.cloneNode(true));
  corpoDetalhe.querySelector(".det-nome")?.setAttribute("id", "detalhe-titulo");
  if (filtro.value) corpoDetalhe.querySelectorAll<HTMLElement>(".pratica").forEach((p) => { p.hidden = p.dataset.funcao !== filtro.value; });
  dialogo.showModal();
  corpoDetalhe.scrollTop = 0;
}

// eventos
raiz.addEventListener("click", (ev) => {
  const alvo = ev.target as HTMLElement;
  const modo = alvo.closest<HTMLElement>("[data-escolher-modo]");
  if (modo) return definirModo(modo.dataset.escolherModo!);
  const passo = alvo.closest<HTMLElement>("[data-passo]");
  if (passo) return abrirEtapa(atual + Number(passo.dataset.passo));
  const det = alvo.closest<HTMLElement>("[data-detalhe]");
  if (det) return abrirDetalhe(det.dataset.detalhe!);
  const ir = alvo.closest<HTMLElement>("[data-ir]");
  if (ir) {
    const i = Number(ir.dataset.ir);
    if (raiz.dataset.modo === "inteiro" || i === atual) return abrirDetalhe(etapas[i].dataset.etapa!);
    return abrirEtapa(i);
  }
  if (alvo.closest("[data-fechar]")) dialogo.close();
});
dialogo.addEventListener("click", (ev) => { if (ev.target === dialogo) dialogo.close(); });
filtro.addEventListener("change", () => filtrar(filtro.value));
caixaLinha.addEventListener("change", () => {
  raiz.dataset.linha = caixaLinha.checked ? "sim" : "nao";
  guardar("linha", raiz.dataset.linha);
  desenharLinha();
});
document.addEventListener("keydown", (ev) => {
  if (dialogo.open || raiz.dataset.modo !== "etapa") return;
  if ((ev.target as HTMLElement).closest("select, input")) return;
  if (ev.key === "ArrowRight") abrirEtapa(atual + 1);
  if (ev.key === "ArrowLeft") abrirEtapa(atual - 1);
});
// deslizar no celular
let toqueX: number | null = null;
grade.addEventListener("touchstart", (ev) => { toqueX = ev.touches[0].clientX; }, { passive: true });
grade.addEventListener("touchend", (ev) => {
  if (toqueX === null) return;
  const dx = ev.changedTouches[0].clientX - toqueX; toqueX = null;
  if (Math.abs(dx) > 50) abrirEtapa(atual + (dx < 0 ? 1 : -1));
});
new ResizeObserver(() => requestAnimationFrame(desenharLinha)).observe(grade);
celular.addEventListener("change", () => definirModo(ler("modo") ?? "etapa", false));

// início: etapa do link (#agendar), modo e linha lembrados
const doLink = etapas.findIndex((e) => "#" + e.dataset.etapa === location.hash);
atual = doLink >= 0 ? doLink : 0;
if (ler("linha") === "nao") { raiz.dataset.linha = "nao"; caixaLinha.checked = false; }
definirModo(ler("modo") ?? "etapa", false);
