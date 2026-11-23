// Comportamento da grade do Mapa da Visita: modos, etapa aberta, filtro por Função e a linha do Nível de desafio.
// Os controles (guia, modo, setas, filtro, painel de detalhe) são a ilha ControlesMapa, com Base UI (ADR 0006).
// Conversa com ela: emite "musa-mapa:estado" e "musa-mapa:detalhe"; recebe ordens por window.musaMapa.
// Preferências ficam no navegador (ADR 0001): o modo.
const raiz = document.getElementById("mapa") as HTMLElement;
const grade = raiz.querySelector(".mapa-grade") as HTMLElement;
const etapas = [...raiz.querySelectorAll<HTMLElement>(".etapa")];
const topo = raiz.querySelector(".mapa-topo") as HTMLElement;
const celular = matchMedia("(max-width: 760px)");

// Vitrine (?vitrine): o mapa dentro do bloco da página inicial. Não guarda nem lê preferências (para não mexer no mapa
// de quem visita), não rola sozinho (a roda do mouse passa para a página) e os links abrem fora do quadro.
// Impressão (?impressao=a1|a2|a4, &fase=1|2|3): a folha dos PDFs (scripts/pdfs.mjs). Também não guarda nada.
const impressao = new URLSearchParams(location.search).get("impressao");
const vitrine = new URLSearchParams(location.search).has("vitrine") || !!impressao;
const guardar = (k: string, v: string) => { if (vitrine) return; try { localStorage.setItem("musa:" + k, v); } catch {} };
const ler = (k: string) => { if (vitrine) return null; try { return localStorage.getItem("musa:" + k); } catch { return null; } };
if (impressao) document.documentElement.dataset.impressao = impressao;
else if (vitrine) {
  document.documentElement.dataset.vitrine = "";
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => { a.target = "_top"; });
}

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
  raiz.querySelectorAll<HTMLElement>(".etapa .pratica").forEach((p) => { p.hidden = !!so && !p.dataset.funcao!.split(" ").some((f) => so.includes(f)); });
  raiz.querySelectorAll<HTMLElement>(".camada-praticas").forEach((c) => {
    const total = c.querySelectorAll(".pratica").length;
    const visiveis = c.querySelectorAll(".pratica:not([hidden])").length;
    (c.querySelector(".vazio-filtro") as HTMLElement).hidden = !(total && !visiveis);
  });
  requestAnimationFrame(desenharLinha);
}

// Nível de desafio: guias tracejadas dos três níveis e o caminho de giz entre os avatares, em curva suave (cada trecho sai
// e chega na horizontal), com um furo na máscara em volta de cada avatar para a linha não passar por trás dele.
// Etapa sem nível interrompe o caminho. No celular (uma coluna só) não há guias nem caminho.
const NS = "http://www.w3.org/2000/svg";
function desenharLinha() {
  const svg = grade.querySelector(".linha-sentimentos") as SVGSVGElement;
  const caminho = svg.querySelector(".desafio-caminho") as SVGPathElement;
  const guias = svg.querySelector(".desafio-guias") as SVGGElement, furos = svg.querySelector(".desafio-furos") as SVGGElement;
  const base = grade.getBoundingClientRect();
  // o SVG cobre a grade inteira, não só a parte à vista: com a grade mais larga que a tela, o filtro de giz e a máscara
  // (width 100%) cortavam o caminho na borda da tela
  const largura = Math.max(base.width, grade.scrollWidth);
  svg.style.width = `${largura}px`;
  svg.setAttribute("viewBox", `0 0 ${largura} ${base.height}`);
  const v = visiveis();
  guias.replaceChildren(); furos.replaceChildren(); caminho.setAttribute("d", "");
  if (celular.matches || !v.length) return;
  // guias: da primeira à última Etapa à vista, na altura de cada trilha
  const css = getComputedStyle(raiz), px = (k: string) => parseFloat(css.getPropertyValue(k));
  const celula = v[0].querySelector(".camada-sentimentos") as HTMLElement;
  const topoDaLinha = celula.getBoundingClientRect().top - base.top;
  const x0 = v[0].getBoundingClientRect().left - base.left, x1 = v[v.length - 1].getBoundingClientRect().right - base.left;
  for (let n = 0; n < 3; n++) {
    const y = topoDaLinha + px("--desafio-inicio") + n * px("--desafio-espaco");
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", String(x0)); l.setAttribute("x2", String(x1)); l.setAttribute("y1", String(y)); l.setAttribute("y2", String(y));
    guias.append(l);
  }
  // caminho e furos: pelo centro de cada avatar (com o tamanho de repouso: o aumento ao passar o mouse não mexe na linha)
  const raio = px("--desafio-avatar") / 2 + 4;
  let d = "", ant: [number, number] | null = null;
  for (const e of v) {
    const ancora = e.querySelector(".desafio") as HTMLElement | null;
    if (!ancora) { ant = null; continue; }
    const r = ancora.getBoundingClientRect(), x = r.left - base.left, y = r.top - base.top;
    if (!ant) d += ` M${x.toFixed(1)} ${y.toFixed(1)}`;
    else { const mx = ((ant[0] + x) / 2).toFixed(1); d += ` C${mx} ${ant[1].toFixed(1)} ${mx} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`; }
    ant = [x, y];
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", String(x)); c.setAttribute("cy", String(y)); c.setAttribute("r", String(raio)); c.setAttribute("fill", "black");
    furos.append(c);
  }
  caminho.setAttribute("d", d.trim());
}

// Pensamentos ao passar o mouse (ou focar) no avatar. Espera 100ms antes de abrir (passar pela linha não abre sem querer);
// indo de um avatar direto a outro, abre na hora e sem animação. Esc fecha.
let espera = 0, fechouEm = 0, aberto: HTMLElement | null = null;
function mostrarPensamentos(a: HTMLElement, instantaneo: boolean) {
  if (aberto && aberto !== a) fecharPensamentos(aberto, true);
  a.toggleAttribute("data-instantaneo", instantaneo);
  a.setAttribute("data-visivel", "");
  aberto = a;
}
function fecharPensamentos(a: HTMLElement, trocando = false) {
  clearTimeout(espera);
  // a saída é sempre animada (rápida, sem escalonamento), salvo quando outro avatar já está abrindo no lugar
  a.toggleAttribute("data-instantaneo", trocando);
  a.removeAttribute("data-visivel");
  if (aberto === a) { aberto = null; fechouEm = performance.now(); }
}
function entrarNoAvatar(a: HTMLElement) {
  if (aberto === a) return;
  clearTimeout(espera);
  if (!a.querySelector(".desafio-cartao")) return;
  if (aberto || performance.now() - fechouEm < 300) mostrarPensamentos(a, true);
  else espera = window.setTimeout(() => mostrarPensamentos(a, false), 100);
}
for (const ev of ["pointerover", "focusin"]) grade.addEventListener(ev, (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>(".desafio-avatar")?.parentElement;
  if (a) entrarNoAvatar(a);
});
// passar do botão para a imagem dentro dele também dispara pointerout: só fecha ao sair do avatar de fato
for (const ev of ["pointerout", "focusout"]) grade.addEventListener(ev, (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>(".desafio-avatar");
  const para = (e as PointerEvent | FocusEvent).relatedTarget as Node | null;
  if (b && !(para && b.contains(para))) { clearTimeout(espera); if (aberto === b.parentElement) fecharPensamentos(aberto); }
});
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && aberto) fecharPensamentos(aberto); });

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
// na vitrine (que não guarda nada) o modo do link vale direto: a abertura da página inicial pede ?vitrine&modo=inteiro
definirModo((vitrine && modoDoLink) || ler("modo") || "etapa", false);

// impressão: visão geral, todas as Etapas (ou só as de uma Fase, &fase=1|2|3, nas folhas A4)
if (impressao) {
  definirModo("inteiro", false);
  const n = Number(pedido.get("fase"));
  const fases = [...new Set(etapas.map((e) => e.dataset.fase!))];
  if (n >= 1 && n <= fases.length) {
    mostrarEtapas(etapas.filter((e) => e.dataset.fase === fases[n - 1]).map((e) => e.dataset.etapa!));
    const rotulo = raiz.querySelector<HTMLElement>(`.fase[data-fase="${fases[n - 1]}"]`)?.textContent ?? "";
    raiz.querySelector(".impressao-fase")!.textContent = ` · ${rotulo}`;
  }
  history.replaceState(null, "", location.pathname + location.search);
  document.documentElement.dataset.impressaoPronta = "";
}
