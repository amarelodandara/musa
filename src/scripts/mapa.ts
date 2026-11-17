// Comportamento da grade do Mapa da Visita: modos, etapa aberta, filtro por Função e linha dos sentimentos.
// Os controles (guia, modo, setas, filtro, painel de detalhe) são a ilha ControlesMapa, com Base UI (ADR 0006).
// Conversa com ela: emite "musa-mapa:estado" e "musa-mapa:detalhe"; recebe ordens por window.musaMapa.
// Preferências ficam no navegador (ADR 0001): o modo.
const raiz = document.getElementById("mapa") as HTMLElement;
const grade = raiz.querySelector(".mapa-grade") as HTMLElement;
const etapas = [...raiz.querySelectorAll<HTMLElement>(".etapa")];
const topo = raiz.querySelector(".mapa-topo") as HTMLElement;
const celular = matchMedia("(max-width: 760px)");

const guardar = (k: string, v: string) => { try { localStorage.setItem("musa:" + k, v); } catch {} };
const ler = (k: string) => { try { return localStorage.getItem("musa:" + k); } catch { return null; } };

let atual = 0;

// Etapas à vista (o filtro de Etapas pode esconder algumas)
const visiveis = () => etapas.filter((e) => !e.hidden);

function abrirEtapa(i: number, { rolar = true } = {}) {
  atual = Math.max(0, Math.min(etapas.length - 1, i));
  // se a pedida está escondida pelo filtro, abre a primeira à vista
  if (etapas[atual].hidden) atual = etapas.indexOf(visiveis()[0] ?? etapas[0]);
  etapas.forEach((e, j) => e.toggleAttribute("data-aberta", j === atual));
  const e = etapas[atual];
  // a Fase da Etapa aberta fica ativa (na visão detalhada ganha um tom mais forte, no CSS)
  raiz.querySelectorAll<HTMLElement>(".fase").forEach((f) => f.toggleAttribute("data-ativa", f.dataset.fase === e.dataset.fase));
  avisar();
  atualizarSetas();
  if (raiz.dataset.modo === "etapa") {
    const cols = visiveis().map((v) => (v === e ? "var(--col-aberta)" : "var(--col-compacta)")).join(" ");
    grade.style.setProperty("--colunas", cols);
  }
  history.replaceState(null, "", "#" + e.dataset.etapa);
  if (rolar && raiz.dataset.modo === "etapa") {
    // só na horizontal, dentro da área do mapa (scrollIntoView também rolaria a página)
    const area = grade.parentElement as HTMLElement;
    requestAnimationFrame(() => {
      const r = e.getBoundingClientRect(), a = area.getBoundingClientRect();
      // a coluna dos rótulos fica presa à esquerda: a Etapa aberta para logo depois dela
      const rotulos = (raiz.querySelector(".rotulos") as HTMLElement).offsetWidth;
      const alvo = area.scrollLeft + (r.left - a.left) - rotulos;
      area.scrollTo({ left: Math.max(0, alvo), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }
  requestAnimationFrame(desenharLinha);
}

function definirModo(modo: string, salvar = true) {
  if (celular.matches) modo = "etapa";
  raiz.dataset.modo = modo;
  if (modo === "inteiro") grade.style.removeProperty("--colunas");
  if (salvar) guardar("modo", modo);
  abrirEtapa(atual, { rolar: false });
}

// próxima/anterior entre as Etapas à vista
function vizinha(d: number) {
  const v = visiveis(), k = v.indexOf(etapas[atual]);
  return v[k + d] ?? null;
}
// setas no topo da Etapa aberta: somem se não há vizinha à vista; o nome da vizinha vai no rótulo
function atualizarSetas() {
  const e = etapas[atual];
  e.querySelectorAll<HTMLButtonElement>("[data-passo]").forEach((b) => {
    const d = Number(b.dataset.passo), alvo = vizinha(d);
    b.hidden = !alvo;
    if (alvo) {
      const nome = alvo.querySelector(".etapa-abrir")?.textContent?.replace(/^\s*\d+\s*/, "").trim() ?? "";
      b.title = nome;
      b.setAttribute("aria-label", `${d < 0 ? "Etapa anterior" : "Próxima etapa"}: ${nome}`);
    }
  });
}
function passo(d: number) {
  const alvo = vizinha(d);
  if (alvo) abrirEtapa(etapas.indexOf(alvo));
}

// Filtro de Etapas: ids à vista (null = todas). Ajusta colunas, faixas das Fases e a linha.
function mostrarEtapas(ids: string[] | null) {
  etapas.forEach((e) => { e.hidden = !!ids && !ids.includes(e.dataset.etapa!); });
  const v = visiveis();
  grade.style.setProperty("--n", String(v.length));
  raiz.querySelectorAll<HTMLElement>(".fase").forEach((f) => {
    const n = v.filter((e) => e.dataset.fase === f.dataset.fase).length;
    f.hidden = n === 0;
    f.style.gridColumn = `span ${n || 1}`;
  });
  abrirEtapa(atual, { rolar: false });
}

// Filtro de Funções: ids à vista (null ou vazio = todas)
function filtrar(funcoes: string[] | null) {
  const so = funcoes && funcoes.length ? funcoes : null;
  raiz.querySelectorAll<HTMLElement>(".etapa .pratica").forEach((p) => { p.hidden = !!so && !so.includes(p.dataset.funcao!); });
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
  if (celular.matches) { caminho.setAttribute("d", ""); return; }
  const base = grade.getBoundingClientRect();
  let d = "", aberto = false;
  for (const e of visiveis()) {
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

// conversa com a ilha de controles
const estado = () => ({ modo: raiz.dataset.modo as "etapa" | "inteiro", atual, total: etapas.length, celular: celular.matches });
function avisar() { document.dispatchEvent(new CustomEvent("musa-mapa:estado", { detail: estado() })); }
function abrirDetalhe(id: string) { document.dispatchEvent(new CustomEvent("musa-mapa:detalhe", { detail: { id } })); }
window.musaMapa = {
  modo: (m: string) => definirModo(m),
  passo,
  filtrar,
  mostrarEtapas,
  estado
};

// eventos da grade
raiz.addEventListener("click", (ev) => {
  const alvo = ev.target as HTMLElement;
  const passo = alvo.closest<HTMLElement>("[data-passo]");
  if (passo && !passo.hidden) {
    window.musaMapa!.passo(Number(passo.dataset.passo));
    // o foco segue para a mesma seta na Etapa que abriu (ou a outra, se não houver), para dar para seguir clicando
    const nova = etapas[atual];
    (nova.querySelector<HTMLElement>(`[data-passo="${passo.dataset.passo}"]`) ?? nova.querySelector<HTMLElement>("[data-passo]"))?.focus({ preventScroll: true });
    return;
  }
  const det = alvo.closest<HTMLElement>("[data-detalhe]");
  if (det) return abrirDetalhe(det.dataset.detalhe!);
  const ir = alvo.closest<HTMLElement>("[data-ir]");
  if (ir) {
    const i = Number(ir.dataset.ir);
    if (raiz.dataset.modo === "inteiro" || i === atual) return abrirDetalhe(etapas[i].dataset.etapa!);
    return abrirEtapa(i);
  }
});
// altura da barra do topo no :root, para a barra lateral do guia (que vive num portal) ficar logo abaixo dela
new ResizeObserver(() => document.documentElement.style.setProperty("--altura-topo", topo.offsetHeight + "px")).observe(topo);
document.addEventListener("keydown", (ev) => {
  // com o painel de detalhe aberto (atributo posto pela ilha) ou foco num controle, as setas são do controle
  if (document.documentElement.hasAttribute("data-mapa-detalhe") || raiz.dataset.modo !== "etapa") return;
  if ((ev.target as HTMLElement).closest("select, input, [role='listbox'], [role='option'], [role='group'], [role='dialog']")) return;
  if (ev.key === "ArrowRight") passo(1);
  if (ev.key === "ArrowLeft") passo(-1);
});
// deslizar no celular
let toqueX: number | null = null;
grade.addEventListener("touchstart", (ev) => { toqueX = ev.touches[0].clientX; }, { passive: true });
grade.addEventListener("touchend", (ev) => {
  if (toqueX === null) return;
  const dx = ev.changedTouches[0].clientX - toqueX; toqueX = null;
  if (Math.abs(dx) > 50) passo(dx < 0 ? 1 : -1);
});
new ResizeObserver(() => requestAnimationFrame(desenharLinha)).observe(grade);
celular.addEventListener("change", () => { definirModo(ler("modo") ?? "etapa", false); avisar(); });

// início: etapa do link (#agendamento) e modo lembrado.
// O link também pode trazer o modo (?modo=inteiro): vale como escolha da pessoa e fica lembrado.
// Visão detalhada = modo etapa (a padrão); visão geral = modo inteiro (os nomes que a pessoa vê, no topo e no rodapé).
const pedido = new URLSearchParams(location.search);
const modoDoLink = pedido.get("modo");
if (modoDoLink === "etapa" || modoDoLink === "inteiro") guardar("modo", modoDoLink);
const doLink = etapas.findIndex((e) => "#" + e.dataset.etapa === location.hash);
atual = doLink >= 0 ? doLink : 0;
definirModo(ler("modo") ?? "etapa", false);
