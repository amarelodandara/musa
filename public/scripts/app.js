(function () {
  const { FASES, ETAPAS, GRUPOS, LINHAS, PERCURSO, CELULAS, FONTES } = window;
  const ROTULO_ORIGEM = { fonte: "Fonte", adaptada: "Adaptada", hipotese: "Hipótese" };

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const etapa = (id) => ETAPAS.find((e) => e.id === id);
  const linha = (id) => LINHAS.find((l) => l.id === id);
  const fase = (id) => FASES.find((f) => f.id === id);

  async function copiar(texto, botao) {
    const original = botao.textContent;
    try {
      await navigator.clipboard.writeText(texto);
      botao.textContent = "Link copiado";
    } catch {
      window.prompt("Copie o link:", texto);
    }
    setTimeout(() => (botao.textContent = original), 1800);
  }
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-copiar]");
    if (b) copiar(location.href, b);
  });

  // Página inicial
  const atalhos = document.getElementById("atalhos");
  if (atalhos) {
    atalhos.innerHTML = FASES.map(
      (f) =>
        `<div><h3>${esc(f.nome)}</h3>${ETAPAS.filter((e) => e.fase === f.id)
          .map((e) => `<a href="/mapa#${e.id}">${esc(e.nome)}</a>`)
          .join("")}</div>`
    ).join("");
    document.getElementById("fontes").innerHTML = Object.entries(FONTES)
      .map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`)
      .join("");
    return;
  }

  // Mapa
  const quadro = document.getElementById("quadro");
  const painel = document.getElementById("painel");

  const itens = (cel) => [...(cel.ajuda || []), ...(cel.atrapalha || [])];
  const todos = LINHAS.flatMap((l) =>
    ETAPAS.filter((e) => CELULAS[l.id] && CELULAS[l.id][e.id]).map((e) => `${l.id}/${e.id}`)
  );

  function itemCurto(i, sinal) {
    return `<div class="item"><b class="sinal" aria-label="${sinal === "+" ? "tende a ajudar" : "tende a atrapalhar"}">${sinal}</b>
      <span class="corpo">${esc(i.t)}<br><span class="selo ${i.o}">${i.r ? esc(i.r) : ROTULO_ORIGEM[i.o]}</span></span></div>`;
  }

  function desenhar() {
    const cab1 = FASES.map(
      (f) => `<th colspan="${ETAPAS.filter((e) => e.fase === f.id).length}" scope="colgroup">${esc(f.nome)}</th>`
    ).join("");
    const cab2 = ETAPAS.map(
      (e, n) => `<th id="col-${e.id}" scope="col"><small>${n + 1}</small>${esc(e.nome)}</th>`
    ).join("");

    const corpo = GRUPOS.map((g) => {
      const sep = `<tr class="separador"><th colspan="${ETAPAS.length + 1}"><span class="faixa">${
        g.linha ? `<b>– – ${esc(g.linha)} – –</b>` : ""
      }<b>${esc(g.nome)}</b><span class="nota">${esc(g.nota)}</span></span></th></tr>`;
      const linhas = LINHAS.filter((l) => l.grupo === g.id)
        .map((l) => {
          const tds = ETAPAS.map((e) => {
            if (g.id === "escola") {
              const t = PERCURSO[l.id] && PERCURSO[l.id][e.id];
              return `<td class="percurso" data-etapa="${e.id}">${t ? esc(t) : "—"}</td>`;
            }
            const cel = CELULAS[l.id] && CELULAS[l.id][e.id];
            if (!cel) return `<td class="vazia" data-etapa="${e.id}">A investigar</td>`;
            const html =
              (cel.ajuda || []).map((i) => itemCurto(i, "+")).join("") +
              (cel.atrapalha || []).map((i) => itemCurto(i, "−")).join("");
            return `<td class="celula" data-etapa="${e.id}"><button type="button" data-cel="${l.id}/${e.id}" aria-pressed="false" aria-label="${esc(l.nome)}, ${esc(e.nome)}">${html}</button></td>`;
          }).join("");
          return `<tr><th class="rotulo" scope="row">${esc(l.nome)}</th>${tds}</tr>`;
        })
        .join("");
      return sep + linhas;
    }).join("");

    quadro.innerHTML = `<table>
      <thead>
        <tr><th class="rotulo"></th>${cab1}</tr>
        <tr><th class="rotulo">Quem ↓ / Etapa →</th>${cab2}</tr>
      </thead>
      <tbody>${corpo}</tbody>
    </table>`;

    const lista = Object.values(CELULAS).flatMap((c) => Object.values(c)).flatMap(itens);
    const n = (o) => lista.filter((i) => i.o === o).length;
    document.getElementById("contagem").textContent =
      `${todos.length} de ${ETAPAS.length * 6} células · ${n("fonte")} de fonte, ${n("adaptada")} adaptados, ${n("hipotese")} hipóteses`;
  }

  function itemPainel(i) {
    const ref = i.r || "Sem base documental ainda";
    return `<div class="item"><span class="corpo">${esc(i.t)}<span class="ref"><span class="selo ${i.o}">${ROTULO_ORIGEM[i.o]}</span> ${esc(ref)}</span></span></div>`;
  }

  function abrir(chave, opts = {}) {
    const [l, e] = chave.split("/");
    const cel = CELULAS[l] && CELULAS[l][e];
    if (!cel) return fechar();
    const pos = todos.indexOf(chave);
    painel.innerHTML = `
      <button class="fechar" type="button" data-fechar aria-label="Fechar">×</button>
      <p class="contexto">${esc(fase(etapa(e).fase).nome)} · ${esc(linha(l).nome)}</p>
      <h2>${esc(etapa(e).nome)}</h2>
      ${cel.ajuda && cel.ajuda.length ? `<h3>+ Tende a ajudar</h3>${cel.ajuda.map(itemPainel).join("")}` : ""}
      ${cel.atrapalha && cel.atrapalha.length ? `<h3>− Tende a atrapalhar</h3>${cel.atrapalha.map(itemPainel).join("")}` : ""}
      <div class="acoes"><button class="botao secundario" type="button" data-copiar>Copiar link desta célula</button></div>
      <div class="navegar">
        <button type="button" data-ir="${esc(todos[pos - 1] || "")}" ${pos > 0 ? "" : "disabled"}>← Célula anterior</button>
        <button type="button" data-ir="${esc(todos[pos + 1] || "")}" ${pos < todos.length - 1 ? "" : "disabled"}>Próxima célula →</button>
      </div>`;
    painel.hidden = false;
    quadro.querySelectorAll("[aria-pressed]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cel === chave)));
    const alvo = quadro.querySelector(`[data-cel="${chave}"]`);
    if (alvo && opts.rolar) alvo.closest("td").scrollIntoView({ block: "center", inline: "center" });
    if (location.hash !== `#${chave}`) history.replaceState(null, "", `#${chave}`);
  }

  function fechar() {
    if (painel.hidden) return;
    const chave = location.hash.slice(1);
    painel.hidden = true;
    quadro.querySelectorAll("[aria-pressed]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    history.replaceState(null, "", location.pathname + location.search);
    const volta = quadro.querySelector(`[data-cel="${chave}"]`);
    if (volta) volta.focus({ preventScroll: true });
  }

  function focarEtapa(id) {
    const th = document.getElementById(`col-${id}`);
    if (!th) return;
    const rot = quadro.querySelector(".rotulo").offsetWidth;
    quadro.scrollLeft = th.offsetLeft - rot;
  }

  function rotear() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.includes("/")) abrir(h, { rolar: true });
    else if (h) focarEtapa(h);
  }

  desenhar();
  quadro.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-cel]");
    if (b) abrir(b.dataset.cel);
  });
  painel.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-fechar]")) return fechar();
    const ir = ev.target.closest("[data-ir]");
    if (ir && ir.dataset.ir) abrir(ir.dataset.ir, { rolar: true });
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") fechar();
  });
  window.addEventListener("hashchange", rotear);
  rotear();
})();
