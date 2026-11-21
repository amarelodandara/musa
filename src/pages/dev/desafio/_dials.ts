// Painel DialKit da linha "Desafio" (no lugar de Sentimentos), no playground /dev/desafio (desenvolvimento).
// A linha passa a mostrar o quanto cada Etapa desafia o professor, em três níveis fixos (baixo, médio, alto), como um
// mapa de jornada com valores discretos: três trilhas com guias tracejadas, um avatar do musá por Etapa (baixo = feliz,
// médio = neutro, alto = triste) e uma linha ligando os avatares. O Pensamento do professor aparece ao passar o mouse
// (ou focar) no avatar. Tudo é montado dentro do quadro (o /mapa de verdade): esconde o conteúdo antigo da célula e a
// linha antiga, reserva a altura das trilhas, põe os rótulos dos níveis na coluna dos rótulos (encostados na borda
// direita) e desenha guias e linha num SVG, com os avatares numa camada de HTML por cima.
// Os níveis de cada Etapa ainda não existem no conteúdo: o painel começa com um mapeamento provisório a partir do
// sentimento (feliz = baixo, neutro = médio, triste = alto) e cada Etapa pode ser trocada no grupo "niveis".
// Para levar ao código: Copy parameters, colar na conversa com o Claude.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

const quadro = document.querySelector(".state-stage iframe") as HTMLIFrameElement;
const doc = () => quadro.contentDocument;
const pronto = (d: Document | null) => !!d?.querySelector(".mapa .camada-sentimentos") && d.readyState === "complete";

// todas as cores do tema
const TOKENS = ["coral-50", "coral-100", "coral-200", "coral-300", "coral-400", "coral-500", "coral-600", "coral-700", "coral-800", "coral-900", "carmim-100", "carmim-200", "carmim-300", "carmim-400", "carmim-500", "carmim-600", "carmim-700", "carmim-800", "carmim-900", "carmim-950", "neutro-50", "neutro-100", "neutro-200", "neutro-300", "neutro-400", "neutro-500", "neutro-600", "neutro-700", "neutro-800", "neutro-900", "neutro-950", "texto-950", "texto-900", "texto-700", "texto-600", "texto-400", "texto-50"];
const COR = (def: string) => ({ type: "select", options: TOKENS, default: def });
const cor = (t: string) => `var(--${t})`;

type Nivel = "baixo" | "medio" | "alto";
const NIVEIS: Nivel[] = ["baixo", "medio", "alto"];
// provisório: do sentimento de cada Etapa (src/lib/conteudo.ts SENTIMENTOS)
const DO_SENTIMENTO: Record<string, Nivel> = { Animado: "baixo", Confiante: "baixo", Curioso: "baixo", Tranquilo: "medio", Inseguro: "alto", Frustrado: "alto" };

const primeiro = await new Promise<Document>((ok) => {
  const t = setInterval(() => { const d = doc(); if (pronto(d)) { clearInterval(t); ok(d!); } }, 100);
});

// as Etapas, lidas do mapa (nome e sentimento de hoje)
const ETAPAS = [...primeiro.querySelectorAll<HTMLElement>(".mapa .etapa")].map((e) => ({
  id: e.dataset.etapa!,
  nome: e.querySelector(".etapa-abrir")?.textContent?.trim() ?? e.dataset.etapa!,
  ordem: e.querySelector(".etapa-n")?.textContent?.trim() ?? "",
  sentimento: e.querySelector(".sentimento-nome")?.textContent?.trim() ?? ""
}));

// níveis escolhidos (colados do Copy parameters em 18/11/2026)
const NIVEIS_ESCOLHIDOS: Record<string, Nivel> = { descoberta: "baixo", agendamento: "baixo", preparacao: "alto", recepcao: "alto", mediacao: "medio", encerramento: "alto", vinculo: "baixo" };

// padrões: valores colados do Copy parameters em 18/11/2026
const config: Record<string, any> = {
  niveis: Object.fromEntries(ETAPAS.map((e) => [e.id, {
    type: "select",
    label: `${e.ordem} ${e.nome}`,
    options: [{ value: "baixo", label: "Baixo" }, { value: "medio", label: "Médio" }, { value: "alto", label: "Alto" }, { value: "nenhum", label: "Sem registro" }],
    default: NIVEIS_ESCOLHIDOS[e.id] ?? DO_SENTIMENTO[e.sentimento] ?? "nenhum"
  }])),
  rotulos: {
    titulo: { type: "select", options: ["Desafio", "Nível de desafio", "Dificuldade"], default: "Nível de desafio" },
    niveis: { type: "select", options: [{ value: "curto", label: "Baixo / Médio / Alto" }, { value: "longo", label: "Baixo desafio / Médio / Alto desafio" }, { value: "nenhum", label: "Sem rótulos" }], default: "curto" },
    // chave nova (não "ordem"): o valor salvo no navegador ainda é "baixoEmCima" e passaria por cima do padrão
    ordemDosNiveis: { type: "select", options: [{ value: "altoEmCima", label: "Alto em cima" }, { value: "baixoEmCima", label: "Baixo em cima" }], default: "altoEmCima" },
    tamanho: [11, 9, 14, 0.5],
    cor: COR("texto-600")
  },
  trilhas: {
    inicio: [41, 12, 80, 1],
    espaco: [30, 12, 56, 1],
    respiroEmbaixo: [24, 0, 48, 1],
    guiaCor: COR("coral-200"),
    guiaEspessura: [1, 0.5, 2, 0.5],
    guiaTraco: [3, 0, 12, 1],
    guiaVao: [7, 0, 12, 1]
  },
  rotulosDosNiveis: {
    // os rótulos dos níveis encostam na borda direita da coluna dos rótulos
    alinhamento: { type: "select", options: [{ value: "direita", label: "Na borda direita" }, { value: "esquerda", label: "Na borda esquerda" }], default: "direita" },
    respiroDireita: [12, 0, 24, 1],
    guiaNaColunaDosRotulos: false
  },
  // os pontos são os avatares do musá: baixo = feliz, médio = neutro, alto = triste
  avatares: {
    posicao: { type: "select", options: [{ value: "centro", label: "Centro da coluna" }, { value: "inicio", label: "Início da coluna" }], default: "centro" },
    tamanho: [24, 12, 48, 1],
    cinza: false,
    opacidade: [80, 20, 100, 1],
    escalaAoPassar: [1.3, 1, 1.5, 0.05]
  },
  // a linha que liga os avatares, com o traço do caminho da abertura (Abertura.astro: carmim-600, ponta redonda,
  // filtro de giz de cera #giz). Grupo novo ("caminho", e não "linha"): os valores salvos da linha cinza não voltam.
  caminho: {
    mostrar: true,
    cor: COR("carmim-600"),
    espessura: [3, 0.5, 6, 0.5],
    // curva suave (escolhida): cada trecho sai e chega na horizontal; "à mão" entorta o trecho como um traço desenhado
    traco: { type: "select", options: [{ value: "mao", label: "À mão" }, { value: "suave", label: "Curva suave" }, { value: "reta", label: "Reta" }], default: "suave" },
    // quanto o traço à mão se afasta da reta (px) e a semente do sorteio (outro número, outro desenho)
    torto: [6, 0, 20, 0.5],
    semente: [7, 1, 50, 1],
    // vão entre a ponta da linha e o avatar
    folga: [4, 0, 12, 1],
    giz: true,
    ondulacao: [2, 0, 6, 0.1],
    grao: [1.35, 0.3, 3, 0.05]
  },
  // o Pensamento do professor sai da célula e aparece ao passar o mouse (ou focar) no avatar
  pensamento: {
    lado: { type: "select", options: [{ value: "acima", label: "Acima do avatar" }, { value: "abaixo", label: "Abaixo do avatar" }], default: "acima" },
    distancia: [8, 0, 24, 1],
    larguraMaxima: [240, 140, 360, 10],
    tamanho: [12, 11, 16, 0.5],
    cor: COR("texto-900"),
    fundo: COR("neutro-50"),
    borda: COR("neutro-100"),
    duracao: [150, 0, 400, 10],
    // entre um cartão e outro, quando a Etapa tem mais de um Pensamento
    espacoEntre: [6, 0, 20, 1]
  },
  // cada Pensamento é um cartão; o primeiro sobe junto do avatar e os outros saem de trás do anterior, um depois do outro
  // (valores pela skill emil-design-eng: entrada ease-out forte abaixo de 300ms, 30–80ms entre itens, saída mais rápida)
  animacaoDosCartoes: {
    entrada: [180, 0, 400, 10],
    escalonamento: [60, 0, 150, 5],
    saida: [100, 0, 300, 10],
    deslocamentoDoPrimeiro: [4, 0, 16, 1],
    escalaInicial: [0.96, 0.85, 1, 0.01],
    // antes de abrir (evita abrir sem querer ao passar o mouse pela linha); indo direto a outro avatar, abre na hora
    atrasoParaAbrir: [100, 0, 400, 10],
    instantaneoEntreAvatares: true
  },
  // elevação dos cartões: fundo um pouco transparente com o que está atrás desfocado, e uma sombra mais larga
  // (desfoque até 20px: mais que isso pesa, sobretudo no Safari)
  elevacao: {
    desfoqueAtras: [16, 0, 20, 1],
    opacidadeDoFundo: [100, 40, 100, 1],
    sombraY: [4, 0, 24, 1],
    sombraDesfoque: [24, 0, 48, 1],
    sombraOpacidade: [7, 0, 30, 1]
  }
};

createDialRoot({ position: "bottom-right", theme: "light", defaultOpen: true });
const kit = createDialKit("Desafio", config, { id: "musa-desafio-v1", persist: true });
let v = kit.getValues() as Record<string, any>;

const ROTULOS: Record<string, Record<Nivel, string>> = {
  curto: { baixo: "Baixo", medio: "Médio", alto: "Alto" },
  longo: { baixo: "Baixo desafio", medio: "Médio", alto: "Alto desafio" },
  nenhum: { baixo: "", medio: "", alto: "" }
};

// posição vertical de cada nível, a partir do topo da linha
const yDo = (n: Nivel) => {
  const i = v.rotulos.ordemDosNiveis === "baixoEmCima" ? NIVEIS.indexOf(n) : 2 - NIVEIS.indexOf(n);
  return v.trilhas.inicio + i * v.trilhas.espaco;
};

// Pensamentos a mais, só no playground, para desenhar o passar do mouse com mais de um Pensamento por Etapa.
// O primeiro de cada Etapa continua vindo do conteúdo (planilha); estes entram depois dele.
const PENSAMENTOS_EXTRAS: Record<string, string[]> = {
  descoberta: [
    "Será que tem atividade para a idade da minha turma?",
    "Quanto custa? A escola não paga ônibus e entrada."
  ]
};

const AVATAR: Record<Nivel, string> = { baixo: "/brand/musa-avatar-happy.svg", medio: "/brand/musa-mark-avatar.svg", alto: "/brand/musa-avatar-sad.svg" };
const NOME_DO_NIVEL: Record<Nivel, string> = { baixo: "baixo", medio: "médio", alto: "alto" };

// monta (uma vez por documento): reserva das trilhas nas células, rótulos dos níveis, SVG e camada dos avatares
function montar(d: Document) {
  if (d.getElementById("desafio-base")) return;
  // o mapa já tem o Nível de desafio no código (desde 18/11/2026): nada a montar; o painel deixa de mexer no quadro
  if (d.querySelector(".mapa .desafio")) return;
  const f = d.createElement("style"); f.id = "desafio-base";
  f.textContent = `
    .mapa .linha-sentimentos, .mapa .camada-sentimentos .sentimento, .mapa .camada-sentimentos .vazio { display: none !important; }
    .mapa .mapa-grade { grid-template-rows: auto auto auto auto auto auto auto !important; }
    .mapa .camada-sentimentos { padding-top: 0 !important; padding-bottom: 0 !important; }
    .mapa .rotulo-sentimentos { position: relative; }
    .desafio-reserva { display: block; }
    .desafio-niveis { position: absolute; left: 12px; top: 0; pointer-events: none; }
    .desafio-nivel { position: absolute; left: 0; right: 0; display: flex; align-items: center; gap: 8px; translate: 0 -50%;
      font-weight: 400; white-space: nowrap; }
    .desafio-nivel i { flex: 1; height: 0; }
    .desafio-svg { position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible; z-index: 1; }
    .desafio-avatares { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
    .desafio-avatar { position: absolute; translate: -50% -50%; padding: 0; border: 0; background: none; border-radius: 999px;
      pointer-events: auto; cursor: default; outline: none; transition: scale var(--dur) cubic-bezier(0.23, 1, 0.32, 1); }
    .desafio-avatar img { display: block; width: 100%; height: 100%; }
    .desafio-avatar:focus-visible { outline: 2px solid var(--texto-950); outline-offset: 2px; }
    /* contêiner sem caixa: só empilha os cartões (o primeiro junto do avatar) */
    .desafio-dica { position: absolute; z-index: 3; display: flex; align-items: center; gap: var(--entre, 6px); pointer-events: none; }
    .desafio-dica[data-lado="acima"] { flex-direction: column-reverse; }
    .desafio-dica[data-lado="abaixo"] { flex-direction: column; }
    .desafio-cartao { position: relative; z-index: calc(10 - var(--i)); margin: 0; box-sizing: border-box; max-width: var(--largura);
      padding: 8px 10px; border: 1px solid var(--cartao-borda); border-radius: 4px;
      background: color-mix(in srgb, var(--cartao-fundo) var(--fundo-opacidade), transparent);
      -webkit-backdrop-filter: blur(var(--desfoque-atras)); backdrop-filter: blur(var(--desfoque-atras));
      box-shadow: 0 var(--sombra-y) var(--sombra-desfoque) rgb(0 0 0 / var(--sombra-opacidade)); font-style: italic; line-height: 1.4;
      /* fechado: o primeiro um pouco mais perto do avatar; os outros escondidos atrás do anterior (a própria altura + o vão) */
      opacity: 0; scale: var(--escala-inicial); translate: 0 var(--de);
      transition: opacity var(--saida) ease-out, scale var(--saida) ease-out, translate var(--saida) ease-out; }
    .desafio-dica[data-lado="acima"] .desafio-cartao { --de: calc(100% + var(--entre, 6px)); transform-origin: 50% 100%; }
    .desafio-dica[data-lado="abaixo"] .desafio-cartao { --de: calc(-100% - var(--entre, 6px)); transform-origin: 50% 0; }
    .desafio-dica[data-lado="acima"] .desafio-cartao:first-child { --de: var(--deslocamento); }
    .desafio-dica[data-lado="abaixo"] .desafio-cartao:first-child { --de: calc(-1 * var(--deslocamento)); }
    /* aberto: cada cartão entra depois do anterior */
    .desafio-dica[data-visivel] .desafio-cartao { opacity: 1; scale: 1; translate: 0 0;
      transition: opacity var(--entrada) cubic-bezier(0.23, 1, 0.32, 1), scale var(--entrada) cubic-bezier(0.23, 1, 0.32, 1),
        translate var(--entrada) cubic-bezier(0.23, 1, 0.32, 1);
      transition-delay: calc(var(--i) * var(--escalonamento)); }
    .desafio-dica[data-instantaneo] .desafio-cartao { transition: none !important; }
    @media (prefers-reduced-motion: reduce) {
      .desafio-avatar { transition: none; }
      .desafio-cartao, .desafio-dica[data-visivel] .desafio-cartao { scale: 1; translate: 0 0; }
    }
  `;
  d.head.appendChild(f);
  d.querySelectorAll<HTMLElement>(".mapa .camada-sentimentos").forEach((c) => {
    const reserva = d.createElement("div"); reserva.className = "desafio-reserva";
    c.prepend(reserva);
  });
  const rot = d.querySelector<HTMLElement>(".mapa .rotulo-sentimentos")!;
  const niveis = d.createElement("div"); niveis.className = "desafio-niveis";
  niveis.innerHTML = NIVEIS.map((n) => `<div class="desafio-nivel" data-nivel="${n}"><i></i><span></span></div>`).join("");
  rot.append(niveis);
  const grade = d.querySelector<HTMLElement>(".mapa .mapa-grade")!;
  const svg = d.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.classList.add("desafio-svg");
  const camada = d.createElement("div"); camada.className = "desafio-avatares";
  const dica = d.createElement("div"); dica.className = "desafio-dica"; dica.setAttribute("role", "tooltip"); dica.id = "desafio-dica";
  camada.append(dica);
  grade.append(svg, camada);
  // avatar: mostra os Pensamentos (um cartão cada) ao passar o mouse ou focar pelo teclado
  let espera = 0, fechouEm = 0, aberto: HTMLElement | null = null;
  const mostrar = (b: HTMLElement, instantaneo: boolean) => {
    const lista: string[] = JSON.parse(b.dataset.pensamentos || "[]");
    if (!lista.length) return;
    const pv = v.pensamento, an = v.animacaoDosCartoes, x = parseFloat(b.style.left), y = parseFloat(b.style.top), r = v.avatares.tamanho / 2;
    dica.removeAttribute("data-visivel");
    dica.toggleAttribute("data-instantaneo", instantaneo);
    dica.dataset.lado = pv.lado;
    for (const [k, val] of Object.entries({ "--entre": pv.espacoEntre + "px", "--largura": pv.larguraMaxima + "px", "--entrada": an.entrada + "ms",
      "--saida": an.saida + "ms", "--escalonamento": an.escalonamento + "ms", "--deslocamento": an.deslocamentoDoPrimeiro + "px",
      "--escala-inicial": String(an.escalaInicial), "--cartao-fundo": cor(pv.fundo), "--cartao-borda": cor(pv.borda),
      "--desfoque-atras": v.elevacao.desfoqueAtras + "px", "--fundo-opacidade": v.elevacao.opacidadeDoFundo + "%",
      "--sombra-y": v.elevacao.sombraY + "px", "--sombra-desfoque": v.elevacao.sombraDesfoque + "px",
      "--sombra-opacidade": String(v.elevacao.sombraOpacidade / 100) })) dica.style.setProperty(k, val);
    dica.innerHTML = lista.map((t, i) => `<p class="desafio-cartao" style="--i:${i}">“${t.replace(/</g, "&lt;")}”</p>`).join("");
    dica.style.left = x + "px";
    dica.style.top = (pv.lado === "acima" ? y - r - pv.distancia : y + r + pv.distancia) + "px";
    dica.style.translate = pv.lado === "acima" ? "-50% -100%" : "-50% 0";
    // cartões novos começam no estado fechado: lê o layout antes de abrir, para a transição acontecer
    void dica.offsetHeight;
    dica.setAttribute("data-visivel", "");
    b.setAttribute("aria-describedby", "desafio-dica");
    b.style.scale = String(v.avatares.escalaAoPassar);
    aberto = b;
  };
  const abrir = (b: HTMLElement) => {
    if (aberto === b) return;
    clearTimeout(espera);
    const an = v.animacaoDosCartoes;
    // indo de um avatar direto a outro (ou ainda aberto): sem espera e sem animação
    const seguido = an.instantaneoEntreAvatares && (aberto !== null || performance.now() - fechouEm < 300);
    if (seguido) mostrar(b, true);
    else espera = window.setTimeout(() => mostrar(b, false), an.atrasoParaAbrir);
  };
  const fechar = (b: HTMLElement) => {
    clearTimeout(espera);
    b.removeAttribute("aria-describedby"); b.style.scale = "";
    if (aberto !== b) return;
    // a saída é sempre animada (rápida, sem escalonamento), mesmo depois de uma abertura instantânea
    dica.removeAttribute("data-instantaneo");
    dica.removeAttribute("data-visivel");
    aberto = null; fechouEm = performance.now();
  };
  for (const ev of ["pointerover", "focusin"]) camada.addEventListener(ev, (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".desafio-avatar"); if (b) abrir(b); });
  // passar do botão para a imagem dentro dele também dispara pointerout: só fecha ao sair do avatar de fato
  for (const ev of ["pointerout", "focusout"]) camada.addEventListener(ev, (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>(".desafio-avatar");
    const para = (e as PointerEvent | FocusEvent).relatedTarget as Node | null;
    if (b && !(para && b.contains(para))) fechar(b);
  });
  // redesenha quando a grade muda de tamanho ou de estado (Etapa aberta, modo, filtro)
  new (d.defaultView as any).ResizeObserver(() => requestAnimationFrame(desenhar)).observe(grade);
  new (d.defaultView as any).MutationObserver(() => requestAnimationFrame(desenhar))
    .observe(d.querySelector(".mapa")!, { attributes: true, subtree: true, attributeFilter: ["data-aberta", "data-modo", "hidden"] });
}

function desenhar() {
  const d = doc();
  if (!pronto(d) || !d!.getElementById("desafio-base")) return;
  const t = v.trilhas, a = v.avatares, l = v.caminho, r = v.rotulos, rn = v.rotulosDosNiveis, pv = v.pensamento;
  d!.querySelectorAll<HTMLElement>(".desafio-reserva").forEach((e) => { e.style.height = t.inicio + 2 * t.espaco + t.respiroEmbaixo + "px"; });
  // rótulos: título da linha e os três níveis
  const rot = d!.querySelector<HTMLElement>(".mapa .rotulo-sentimentos")!;
  if (rot.firstChild?.nodeType === 3) rot.firstChild.textContent = r.titulo;
  const niveis = rot.querySelector<HTMLElement>(".desafio-niveis")!;
  niveis.style.right = rn.respiroDireita + "px";
  rot.querySelectorAll<HTMLElement>(".desafio-nivel").forEach((e) => {
    const n = e.dataset.nivel as Nivel;
    e.style.top = yDo(n) + "px";
    e.style.fontSize = r.tamanho + "px";
    e.style.color = cor(r.cor);
    e.style.flexDirection = rn.alinhamento === "direita" ? "row" : "row-reverse";
    e.querySelector("span")!.textContent = ROTULOS[r.niveis][n];
    const guia = e.querySelector("i") as HTMLElement;
    guia.style.borderTop = rn.guiaNaColunaDosRotulos ? `${t.guiaEspessura}px ${t.guiaTraco ? "dashed" : "solid"} ${cor(t.guiaCor)}` : "0";
  });
  // SVG: guias tracejadas e linha; avatares numa camada de HTML por cima (para o passar do mouse)
  const grade = d!.querySelector<HTMLElement>(".mapa .mapa-grade")!, base = grade.getBoundingClientRect();
  const linhaTopo = rot.getBoundingClientRect().top - base.top;
  const svg = grade.querySelector<SVGSVGElement>(".desafio-svg")!;
  const camada = grade.querySelector<HTMLElement>(".desafio-avatares")!;
  camada.style.setProperty("--dur", pv.duracao + "ms");
  camada.querySelectorAll(".desafio-avatar").forEach((e) => e.remove());
  const dica = camada.querySelector<HTMLElement>(".desafio-dica")!;
  dica.removeAttribute("data-visivel");
  Object.assign(dica.style, { width: "max-content", fontSize: pv.tamanho + "px", color: cor(pv.cor) });
  svg.setAttribute("width", String(base.width)); svg.setAttribute("height", String(base.height));
  const visiveis = [...grade.querySelectorAll<HTMLElement>(".etapa:not([hidden])")];
  if (!visiveis.length) { svg.innerHTML = ""; return; }
  const x0 = visiveis[0].getBoundingClientRect().left - base.left, x1 = visiveis[visiveis.length - 1].getBoundingClientRect().right - base.left;
  const traco = t.guiaTraco ? `stroke-dasharray="${t.guiaTraco} ${t.guiaVao}"` : "";
  let s = NIVEIS.map((n) => `<line x1="${x0}" x2="${x1}" y1="${linhaTopo + yDo(n)}" y2="${linhaTopo + yDo(n)}" stroke="${cor(t.guiaCor)}" stroke-width="${t.guiaEspessura}" ${traco} />`).join("");
  const pts: [number, number, Nivel, HTMLElement | null][] = [];
  for (const e of visiveis) {
    const n = v.niveis[e.dataset.etapa!] as Nivel | "nenhum";
    if (n === "nenhum") { pts.push([NaN, NaN, "baixo", null]); continue; }
    const c = (e.querySelector(".camada-sentimentos") as HTMLElement).getBoundingClientRect();
    const x = a.posicao === "centro" ? c.left - base.left + c.width / 2 : c.left - base.left + 12 + a.tamanho / 2;
    pts.push([x, linhaTopo + yDo(n), n, e]);
  }
  if (l.mostrar) {
    // Etapa sem registro interrompe a linha
    let dd = "", aberto = false, ant: [number, number] | null = null;
    for (const [i, [x, y]] of pts.entries()) {
      if (Number.isNaN(x)) { aberto = false; ant = null; continue; }
      if (!aberto) dd += ` M${x} ${y}`;
      else if (l.traco === "suave" && ant) { const mx = (ant[0] + x) / 2; dd += ` C${mx} ${ant[1]} ${mx} ${y} ${x} ${y}`; }
      else if (l.traco === "mao" && ant) dd += " " + aMao(ant[0], ant[1], x, y, l.torto, l.semente * 100 + i);
      else dd += ` L${x} ${y}`;
      aberto = true; ant = [x, y];
    }
    // giz de cera: o mesmo filtro do caminho da abertura (#giz em Abertura.astro), em px da grade
    const giz = `<filter id="desafio-giz" filterUnits="userSpaceOnUse" x="0" y="0" width="${base.width}" height="${base.height}" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" seed="3" result="ondula"/>
      <feDisplacementMap in="SourceGraphic" in2="ondula" scale="${l.ondulacao}" xChannelSelector="R" yChannelSelector="G" result="borda"/>
      <feTurbulence type="fractalNoise" baseFrequency="${l.grao}" numOctaves="2" seed="11" result="grao"/>
      <feColorMatrix in="grao" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.2 -0.82" result="mascara"/>
      <feComposite in="borda" in2="mascara" operator="in"/></filter>`;
    // a linha não passa por trás dos avatares: máscara com um furo em cada um (raio + folga)
    const furos = pts.filter(([x]) => !Number.isNaN(x)).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${a.tamanho / 2 + l.folga}" fill="black" />`).join("");
    const mascara = `<mask id="desafio-furos" maskUnits="userSpaceOnUse" x="0" y="0" width="${base.width}" height="${base.height}"><rect width="${base.width}" height="${base.height}" fill="white" />${furos}</mask>`;
    s += `<defs>${giz}${mascara}</defs><g mask="url(#desafio-furos)"><path d="${dd.trim()}" fill="none" stroke="${cor(l.cor)}" stroke-width="${l.espessura}" stroke-linecap="round" stroke-linejoin="round" ${l.giz ? 'filter="url(#desafio-giz)"' : ""} /></g>`;
  }
  svg.innerHTML = s;
  for (const [x, y, n, e] of pts) {
    if (Number.isNaN(x) || !e) continue;
    const b = d!.createElement("button");
    b.type = "button"; b.className = "desafio-avatar";
    const nome = e.querySelector(".etapa-abrir")?.textContent?.trim() ?? "";
    const pensamento = e.querySelector(".pensamento")?.textContent?.replace(/^[“"]|[”"]$/g, "").trim() ?? "";
    b.dataset.pensamentos = JSON.stringify([pensamento, ...(PENSAMENTOS_EXTRAS[e.dataset.etapa!] ?? [])].filter(Boolean));
    b.setAttribute("aria-label", `${nome}: desafio ${NOME_DO_NIVEL[n]}`);
    Object.assign(b.style, { left: x + "px", top: y + "px", width: a.tamanho + "px", height: a.tamanho + "px",
      filter: a.cinza ? "grayscale(1)" : "none", opacity: String(a.opacidade / 100) });
    b.innerHTML = `<img src="${AVATAR[n]}" alt="" width="${a.tamanho}" height="${a.tamanho}">`;
    camada.append(b);
  }
}
// sorteio com semente: o mesmo desenho a cada redesenho (só muda se a semente mudar)
function sorteio(semente: number) {
  let a = semente >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// um trecho desenhado à mão de (x0, y0) a (x1, y1): duas curvas que se afastam da reta para lados e alturas sorteados,
// com um ponto do meio que também escapa um pouco, como quem puxa o lápis sem régua
function aMao(x0: number, y0: number, x1: number, y1: number, torto: number, semente: number) {
  const r = sorteio(semente), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L; // perpendicular
  const desvio = () => (r() * 2 - 1) * torto;
  const ponto = (t: number, d: number) => [x0 + dx * t + nx * d, y0 + dy * t + ny * d];
  const meio = ponto(0.45 + r() * 0.1, desvio() * 0.6);
  const [c1, c2, c3, c4] = [ponto(0.15 + r() * 0.1, desvio()), ponto(0.3 + r() * 0.1, desvio()), ponto(0.6 + r() * 0.1, desvio()), ponto(0.8 + r() * 0.1, desvio())];
  const f = (p: number[]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `C${f(c1)} ${f(c2)} ${f(meio)} C${f(c3)} ${f(c4)} ${x1} ${y1}`;
}

function aplicar() { const d = doc(); if (!pronto(d)) return; montar(d!); desenhar(); }
kit.subscribe((novo: Record<string, any>) => { v = novo; aplicar(); });

// cada estado recarrega o quadro: espera e monta de novo
function vigiar() { if (pronto(doc())) aplicar(); else setTimeout(vigiar, 100); }
quadro.addEventListener("load", () => setTimeout(vigiar, 0));
vigiar();
