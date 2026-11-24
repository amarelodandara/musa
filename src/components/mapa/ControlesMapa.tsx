// Controles do Mapa da Visita, com Base UI (ADR 0006). Ordem no topo: botão de ajuda (guia) à esquerda, logo depois da marca
// (que fica fora da ilha, na ponta esquerda da barra, em mapa.astro); à direita o filtro e a visão (detalhada/geral). Mais o painel de detalhe de uma Etapa.
// Quem desenha a grade é src/scripts/mapa.ts. A conversa é por eventos e pela API window.musaMapa:
//   mapa.ts → "musa-mapa:estado" { modo, atual, total, celular } e "musa-mapa:detalhe" { id }
//   aqui    → window.musaMapa.modo(m) / .passo(±1) / .filtrar(funções) / .mostrarEtapas(etapas)
// A introdução (o guia) abre sozinha só na primeira visita (localStorage "musa:guia-visto"); depois, só pelo botão.
import { useCallback, useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { Menu } from "@base-ui/react/menu";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Check, Filter, SidebarCollapse, SidebarExpand, Xmark } from "iconoir-react";

interface Funcao { id: string; nome: string }
interface EtapaInfo { id: string; nome: string; fase: string }
interface Props {
  funcoes: Funcao[]; etapas: EtapaInfo[]; totalEtapas: number;
  // só para a página de estados (/dev/estados-menu-filtro): seleção inicial do filtro e menu já aberto. O mapa não passa.
  filtroInicial?: { etapas?: string[]; funcoes?: string[] };
  menuFiltroAberto?: boolean;
}
interface Estado { modo: "etapa" | "inteiro"; atual: number; total: number; celular: boolean }
interface MusaMapa {
  modo(m: string): void;
  passo(d: number): void;
  filtrar(f: string[] | null): void;
  mostrarEtapas(ids: string[] | null): void;
  estado(): Estado;
}
declare global { interface Window { musaMapa?: MusaMapa } }

const slug = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// na vitrine da página inicial (?vitrine) nada é guardado e a introdução não abre sozinha
const naVitrine = () => typeof location !== "undefined" && ["vitrine", "impressao"].some((k) => new URLSearchParams(location.search).has(k));
const guardar = (k: string, v: string) => { if (naVitrine()) return; try { localStorage.setItem("musa:" + k, v); } catch {} };
const ler = (k: string) => { if (naVitrine()) return k === "guia-visto" ? "sim" : null; try { return localStorage.getItem("musa:" + k); } catch { return null; } };

// classes comuns: controles de 36px, texto de 14px e ícone de 18px (24/11/2026; antes 28px, 13px e 16px), cinza (é uma ferramenta de uso longo)
const foco = "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-texto-950";
const botao = `inline-flex items-center justify-center gap-2 h-9 rounded-sm border border-neutro-300 bg-neutro-50 text-texto-900 text-sm font-inter cursor-pointer select-none hover:bg-neutro-100 active:bg-neutro-200 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-neutro-50 ${foco}`;

// itens do menu de filtros
// filtro-*: só ganchos para o painel de ajuste da bancada (dev/estados-menu-filtro/_dials.ts); não têm estilo próprio.
const rotuloGrupo = "filtro-rotulo px-3 pt-2 pb-1 text-2xs font-normal normal-case tracking-normal text-texto-600 font-inter";
// implicito: marcado só porque "Todas" está marcado. Mostra um círculo em vez do check; o check fica para as escolhas
// feitas uma a uma.
function ItemMarcavel({ rotulo, marcado, aoMudar, forte = false, implicito = false }: { rotulo: string; marcado: boolean; aoMudar: (m: boolean) => void; forte?: boolean; implicito?: boolean }) {
  return (
    <Menu.CheckboxItem checked={marcado} onCheckedChange={aoMudar}
      className={`filtro-item ${forte ? "filtro-todas font-medium" : "font-normal"} grid grid-cols-[14px_1fr] items-center gap-2.5 py-2 pl-3 pr-3 mx-0 rounded-none font-inter text-xs text-texto-700 cursor-default outline-none select-none touch-manipulation data-highlighted:bg-neutro-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-texto-950`}>
      {/* marcado em coral (a cor principal da marca): mostra que está ligado. coral-600 mede ~4:1 sobre o fundo claro. */}
      <Menu.CheckboxItemIndicator className="filtro-indicador col-start-1 flex items-center justify-center text-coral-600">
        {implicito ? <span className="filtro-circulo block size-1 rounded-full bg-coral-600" /> : <Check {...icPequeno} strokeWidth={2} className="filtro-check" />}
      </Menu.CheckboxItemIndicator>
      <span className="col-start-2">{rotulo}</span>
    </Menu.CheckboxItem>
  );
}

// botão do filtro com filtro ligado: troca borda, fundo e cor do botão (coral; só ícone, sem texto)
const filtroLigado = (classes: string) => classes
  .replace("border-neutro-300 bg-neutro-50 text-texto-900", "border-coral-200 bg-coral-200 text-coral-600")
  .replace("hover:bg-neutro-100 active:bg-neutro-200", "hover:bg-coral-200 active:bg-coral-300 data-popup-open:bg-coral-200");
// segmento do seletor de visão (largura fixa de 128px, inteira: o filtro, à esquerda dele, não cai em meio pixel e não borra): trilho neutro-100; a visão escolhida em coral-300, texto escuro (cores escolhidas em /dev/visao-cores, 24/11/2026)
const segmento = `h-8 rounded border-0 bg-transparente text-sm font-inter text-texto-700 cursor-pointer select-none whitespace-nowrap transition-colors duration-150 ease-out hover:text-texto-950 data-pressed:bg-coral-300 data-pressed:text-texto-950 data-pressed:shadow-xs ${foco}`;
// Botão de ícone que se abre: ao passar o mouse, focar pelo teclado ou com o painel aberto, o rótulo aparece ao lado
// do ícone (no lugar de uma dica flutuante). A largura cresce pela coluna do grid (0fr → 1fr), rápido e sem quicar.
// sempre: o rótulo fica à vista o tempo todo (botão da introdução, que sozinho não diz o que é)
function Rotulo({ texto, sempre = false }: { texto: string; sempre?: boolean }) {
  if (sempre) return <span className="block pl-2 pr-1.5 whitespace-nowrap">{texto}</span>;
  return (
    <span aria-hidden="true" className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/abre:grid-cols-[1fr] group-focus-visible/abre:grid-cols-[1fr] group-data-popup-open/abre:grid-cols-[1fr] motion-reduce:transition-none">
      <span className="overflow-hidden whitespace-nowrap"><span className="block pl-2 pr-1">{texto}</span></span>
    </span>
  );
}
// sem o gap do botão: com o rótulo fechado ele sobraria à direita do ícone; o espaço vem do pl-2 do próprio rótulo
const botaoQueAbre = `${botao.replace("gap-2 ", "")} group/abre px-2`; // 8 + 18 + 8 + 2 de borda = 36, quadrado como os outros

// Ícones: Iconoir (traço de 1,5 px), só onde o controle não tem texto. Tamanho fixo em px, cor herdada.
const ic = { width: 18, height: 18, strokeWidth: 1.5, "aria-hidden": true } as const;
const icPequeno = { ...ic, width: 14, height: 14 } as const;

export default function ControlesMapa({ funcoes, etapas, totalEtapas, filtroInicial, menuFiltroAberto }: Props) {
  const [estado, setEstado] = useState<Estado>({ modo: "etapa", atual: 0, total: totalEtapas, celular: false });
  // filtros: o que está à vista. Começa com tudo; nunca fica vazio (desmarcar o último volta para todos).
  const [funcoesVistas, setFuncoesVistas] = useState<string[]>(() => filtroInicial?.funcoes ?? funcoes.map((f) => f.id));
  const [etapasVistas, setEtapasVistas] = useState<string[]>(() => filtroInicial?.etapas ?? etapas.map((e) => e.id));
  const [guia, setGuia] = useState(false);
  const [detalhe, setDetalhe] = useState<string | null>(null);

  useEffect(() => {
    const aoMudar = (ev: Event) => setEstado((ev as CustomEvent<Estado>).detail);
    const aoDetalhe = (ev: Event) => setDetalhe((ev as CustomEvent<{ id: string }>).detail.id);
    document.addEventListener("musa-mapa:estado", aoMudar);
    document.addEventListener("musa-mapa:detalhe", aoDetalhe);
    if (window.musaMapa) setEstado(window.musaMapa.estado());
    // primeira visita: o guia abre sozinho uma vez
    if (ler("guia-visto") !== "sim") { setGuia(true); guardar("guia-visto", "sim"); }
    return () => {
      document.removeEventListener("musa-mapa:estado", aoMudar);
      document.removeEventListener("musa-mapa:detalhe", aoDetalhe);
    };
  }, []);

  // com o detalhe aberto, as setas do teclado não trocam de Etapa (mapa.ts lê este atributo)
  useEffect(() => {
    document.documentElement.toggleAttribute("data-mapa-detalhe", !!detalhe);
  }, [detalhe]);

  const todasFuncoes = funcoesVistas.length === funcoes.length;
  const todasEtapas = etapasVistas.length === etapas.length;

  // Os filtros ficam no endereço (?fases=antes-da-visita&funcoes=mediacao), para a pessoa mandar para a equipe
  // exatamente o que está vendo. Sem filtro, o parâmetro sai. Ao abrir, o endereço vale.
  const fasesDe = (ids: string[]) => [...new Set(etapas.filter((e) => ids.includes(e.id)).map((e) => e.fase))];
  const gravarNoEndereco = (eV: string[], fV: string[]) => {
    const u = new URL(location.href);
    if (eV.length === etapas.length) u.searchParams.delete("fases"); else u.searchParams.set("fases", fasesDe(eV).map(slug).join(","));
    if (fV.length === funcoes.length) u.searchParams.delete("funcoes"); else u.searchParams.set("funcoes", fV.join(","));
    history.replaceState(history.state, "", u);
  };
  // aviso para leitor de tela quando o filtro muda (o mapa muda em silêncio)
  const [aviso, setAviso] = useState("");
  const avisar = (eV: string[], fV: string[]) =>
    setAviso(`${eV.length} de ${etapas.length} etapas e ${fV.length} de ${funcoes.length} funções à vista.`);

  const aplicar = (eIds: string[], fIds: string[], { gravar = true, anunciar = true } = {}) => {
    const eV = eIds.length ? eIds : etapas.map((e) => e.id);
    const fV = fIds.length ? fIds : funcoes.map((f) => f.id);
    setEtapasVistas(eV); setFuncoesVistas(fV);
    window.musaMapa?.mostrarEtapas(eV.length === etapas.length ? null : eV);
    window.musaMapa?.filtrar(fV.length === funcoes.length ? null : fV);
    if (gravar && !menuFiltroAberto) gravarNoEndereco(eV, fV);
    if (anunciar) avisar(eV, fV);
  };
  const aplicarFuncoes = (ids: string[]) => aplicar(etapasVistas, ids);
  const aplicarEtapas = (ids: string[]) => aplicar(ids, funcoesVistas);

  // filtros vindos do endereço (depois de montar, para não divergir do HTML gerado no servidor)
  useEffect(() => {
    if (menuFiltroAberto) return;
    const q = new URLSearchParams(location.search);
    const fases = q.get("fases")?.split(",").filter(Boolean);
    const fs = q.get("funcoes")?.split(",").filter((id) => funcoes.some((f) => f.id === id));
    const eIds = fases ? etapas.filter((e) => fases.includes(slug(e.fase))).map((e) => e.id) : [];
    if (eIds.length || fs?.length) aplicar(eIds, fs ?? [], { gravar: false, anunciar: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const alternar = (lista: string[], id: string, marcar: boolean, ordem: string[]) =>
    ordem.filter((x) => (x === id ? marcar : lista.includes(x)));

  // conteúdo do detalhe: vem do <template id="detalhe-<etapa>"> que o Astro já gerou
  const [tituloDetalhe, setTituloDetalhe] = useState("");
  const preencherDetalhe = useCallback((el: HTMLDivElement | null) => {
    if (!el || !detalhe) return;
    const t = document.getElementById("detalhe-" + detalhe) as HTMLTemplateElement | null;
    if (!t) return;
    const conteudo = t.content.cloneNode(true) as DocumentFragment;
    const nome = conteudo.querySelector(".det-nome");
    setTituloDetalhe(nome?.textContent ?? "");
    nome?.remove();
    if (!todasFuncoes) conteudo.querySelectorAll<HTMLElement>(".pratica").forEach((p) => { p.hidden = !p.dataset.funcao!.split(" ").some((f) => funcoesVistas.includes(f)); });
    el.replaceChildren(conteudo);
  }, [detalhe, funcoesVistas, todasFuncoes]);

  const ordemFuncoes = funcoes.map((f) => f.id), ordemEtapas = etapas.map((e) => e.id);
  // "Limpar" desligado (nenhum filtro): ao passar o mouse, uma nota embaixo dele diz por quê.
  // Embaixo, e não em cima, para o botão não sair do lugar debaixo do cursor.
  const semFiltro = todasFuncoes && todasEtapas;
  const [sobreLimpar, setSobreLimpar] = useState(false);
  const fases = [...new Set(etapas.map((e) => e.fase))];
  const { modo, celular } = estado;

  return (
    <>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* barra lateral da introdução (o guia) */}
        <Drawer.Root open={guia} onOpenChange={setGuia} modal={false} disablePointerDismissal swipeDirection="left">
          <Drawer.Trigger className={`${botaoQueAbre} data-popup-open:bg-neutro-200`} aria-label={guia ? "Fechar a introdução" : "Introdução"}
            onClick={(ev) => { if (guia) { ev.preventDefault(); setGuia(false); } }}>
            {guia ? <SidebarCollapse {...ic} /> : <SidebarExpand {...ic} />}
            <Rotulo sempre texto={guia ? "Fechar a introdução" : "Introdução"} />
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Viewport className="fixed inset-x-0 bottom-0 top-(--altura-topo) z-20 flex pointer-events-none">
              <Drawer.Popup className="pointer-events-auto h-full w-80 max-w-full box-border overflow-y-auto overscroll-contain bg-neutro-50 border-r border-neutro-300 shadow-lg p-5 font-inter text-sm text-texto-900 outline-none [transform:translateX(var(--drawer-swipe-movement-x))] transition-[translate] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-starting-style:-translate-x-full data-ending-style:-translate-x-full data-swiping:select-none motion-reduce:transition-none max-[760px]:w-full max-[760px]:border-r-0">
                <Drawer.Content>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <Drawer.Title className="m-0 font-inter text-md font-semibold text-texto-950">Como usar o mapa</Drawer.Title>
                    <Drawer.Close className={`${botao} w-9 px-0`} aria-label="Fechar a introdução"><Xmark {...ic} /></Drawer.Close>
                  </div>
                  <Drawer.Description className="m-0 mb-2 text-texto-700">
                    O mapa mostra a visita escolar do ponto de vista da escola, do primeiro contato ao retorno.
                  </Drawer.Description>
                  <Guia totalEtapas={totalEtapas} />
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>

        <div className="ml-auto flex items-center gap-2">
          {/* filtros: um menu com duas seções, Etapas e Funções, cada uma com "todas" e a lista */}
          {/* na bancada (menuFiltroAberto) o menu fica sempre aberto e não modal: a lista de estados e o painel de ajuste ao lado recebem clique */}
          <Menu.Root open={menuFiltroAberto ? true : undefined} modal={!menuFiltroAberto}>
            {/* com filtro ligado o botão fica colorido (coral, a cor principal), no lugar de um ponto */}
            <Menu.Trigger aria-label={semFiltro ? "Filtrar visualização" : "Filtrar visualização (há filtros ligados)"}
              className={semFiltro ? `${botaoQueAbre} touch-manipulation data-popup-open:bg-neutro-200` : `${filtroLigado(botaoQueAbre)} touch-manipulation`}>
              <Filter {...ic} />
              <Rotulo texto="Filtrar visualização" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={14} align="end" className="z-30 outline-none">
                <Menu.Popup className="filtro-popup w-64 max-h-(--available-height) overflow-y-auto overscroll-contain rounded-sm border border-neutro-300 bg-neutro-50 py-1 shadow-lg outline-none origin-(--transform-origin) transition-[scale,opacity] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 motion-reduce:transition-none">
                  <Menu.Group>
                    <Menu.GroupLabel className={rotuloGrupo}>Mostrar etapas</Menu.GroupLabel>
                    <ItemMarcavel rotulo="Todas as etapas" marcado={todasEtapas} aoMudar={(m) => aplicarEtapas(m ? ordemEtapas : [])} forte />
                    {/* só as Fases (antes, durante, depois): marcar uma mostra todas as Etapas dela */}
                    {fases.map((fase) => {
                      const daFase = etapas.filter((e) => e.fase === fase).map((e) => e.id);
                      const marcada = daFase.every((id) => etapasVistas.includes(id));
                      return (
                        <ItemMarcavel key={fase} rotulo={fase} marcado={marcada} implicito={todasEtapas}
                          aoMudar={(m) => aplicarEtapas(ordemEtapas.filter((id) => (daFase.includes(id) ? m : etapasVistas.includes(id))))} />
                      );
                    })}
                  </Menu.Group>
                  <Menu.Separator className="filtro-separador my-1 h-px bg-neutro-200" />
                  <Menu.Group>
                    <Menu.GroupLabel className={rotuloGrupo}>Mostrar funções</Menu.GroupLabel>
                    <ItemMarcavel rotulo="Todas as funções" marcado={todasFuncoes} aoMudar={(m) => aplicarFuncoes(m ? ordemFuncoes : [])} forte />
                    {funcoes.map((f) => (
                      <ItemMarcavel key={f.id} rotulo={f.nome} marcado={funcoesVistas.includes(f.id)} implicito={todasFuncoes}
                        aoMudar={(m) => aplicarFuncoes(alternar(funcoesVistas, f.id, m, ordemFuncoes))} />
                    ))}
                  </Menu.Group>
                  {/* limpar: volta tudo à vista de uma vez e fecha o menu; desligado quando não há filtro */}
                  <Menu.Separator className="filtro-separador mt-1 mb-0 h-px bg-neutro-200" />
                  <Menu.Item disabled={semFiltro} onClick={() => aplicar(ordemEtapas, ordemFuncoes)}
                    onPointerEnter={() => setSobreLimpar(true)} onPointerLeave={() => setSobreLimpar(false)}
                    aria-describedby={semFiltro ? "filtro-nota" : undefined}
                    className="filtro-limpar m-1 mb-0 flex items-center justify-center rounded py-1.5 font-inter text-xs font-medium text-texto-900 cursor-default outline-none select-none touch-manipulation data-highlighted:bg-neutro-200 data-disabled:text-texto-400 data-disabled:data-highlighted:bg-transparente focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-texto-950">
                    Limpar filtros
                  </Menu.Item>
                  {/* sempre no DOM quando desligado (leitor de tela lê pelo aria-describedby); visível só com o mouse em cima */}
                  {semFiltro && (
                    <p id="filtro-nota" role="presentation"
                      hidden={!sobreLimpar}
                      className="filtro-nota m-0 px-3 pt-1 pb-1.5 font-inter text-2xs leading-snug text-center text-texto-600 transition-[opacity,translate] duration-150 ease-out starting:opacity-0 starting:-translate-y-0.5 motion-reduce:transition-none">
                      Nenhum filtro ligado: tudo está à vista.
                    </p>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

          {/* visão: detalhada = etapa por etapa (a padrão, vem primeiro), geral = mapa inteiro; mesmos nomes do rodapé. No celular só a detalhada.
              As setas para ir de uma Etapa a outra ficam no topo da Etapa aberta, na grade (mapa.astro), não aqui. */}
          {!celular && (
            <ToggleGroup aria-label="Como ver o mapa" value={[modo]} onValueChange={(v) => { if (v[0]) window.musaMapa?.modo(v[0]); }}
              className="inline-flex gap-0.5 p-0.5 rounded-sm bg-neutro-100">
              <Toggle value="etapa" className={`${segmento} w-32 px-0`}>Visão detalhada</Toggle>
              <Toggle value="inteiro" className={`${segmento} w-32 px-0`}>Visão geral</Toggle>
            </ToggleGroup>
          )}

        </div>
      </div>

      <p className="sr-only" aria-live="polite">{aviso}</p>

      {/* detalhe de uma Etapa: painel à direita (folha de baixo no celular) */}
      <Dialog.Root open={!!detalhe} onOpenChange={(aberto) => { if (!aberto) setDetalhe(null); }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-texto-950/20 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
          <Dialog.Popup className="fixed z-50 right-0 top-0 h-dvh w-[min(520px,100vw)] box-border overflow-y-auto overscroll-contain bg-neutro-50 border-l border-neutro-300 shadow-xl font-inter text-texto-900 outline-none transition-[translate,opacity] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] data-starting-style:translate-x-6 data-starting-style:opacity-0 data-ending-style:translate-x-6 data-ending-style:opacity-0 motion-reduce:transition-none max-[760px]:top-auto max-[760px]:bottom-0 max-[760px]:h-auto max-[760px]:max-h-[85dvh] max-[760px]:w-full max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:rounded-t-2xl max-[760px]:data-starting-style:translate-x-0 max-[760px]:data-starting-style:translate-y-10 max-[760px]:data-ending-style:translate-x-0 max-[760px]:data-ending-style:translate-y-10">
            <div className="sticky top-0 flex items-start justify-between gap-3 px-6 pt-5 pb-3 bg-neutro-50 border-b border-neutro-200">
              <Dialog.Title className="m-0 font-inter text-2xl font-semibold text-texto-950">{tituloDetalhe}</Dialog.Title>
              <Dialog.Close className={`${botao} w-9 px-0 shrink-0`} aria-label="Fechar"><Xmark {...ic} /></Dialog.Close>
            </div>
            <div className="detalhe-corpo" ref={preencherDetalhe} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function Guia({ totalEtapas }: { totalEtapas: number }) {
  const h3 = "mt-5 mb-1.5 text-xs font-semibold uppercase tracking-wider text-texto-600";
  const ul = "m-0 pl-4.5 grid gap-1.5 leading-normal";
  return (
    <>
      <h3 className={h3}>Como ler</h3>
      <ul className={ul}>
        <li>Cada coluna é uma etapa da visita. As etapas estão agrupadas em antes, durante e depois.</li>
        <li>Cada linha é uma camada: Ações do professor, Nível de desafio, Pontos de contato e Práticas.</li>
        <li>A linha que liga os rostos mostra o quanto cada etapa desafia o professor: baixo, médio ou alto. Passe o mouse num rosto para ler o que o professor pensa ali.</li>
        <li>Nas práticas, o rosto feliz marca o que tende a ajudar; o triste, o que tende a atrapalhar.</li>
      </ul>
      <h3 className={h3}>Como navegar</h3>
      <ul className={ul}>
        <li><strong>Visão detalhada</strong> abre uma etapa de cada vez. Passe para a próxima ou volte para a anterior pelas setas ao lado do nome da etapa, ou pelas teclas ← e →.</li>
        <li><strong>Visão geral</strong> mostra as {totalEtapas} etapas lado a lado.</li>
        <li>Clique no nome de uma etapa para ver tudo sobre ela, com a origem de cada prática.</li>
        <li>No filtro do topo, escolha quais etapas aparecem e de quais funções são as práticas mostradas.</li>
      </ul>
      <h3 className={h3}>Para imprimir</h3>
      <p className="m-0 mb-2.5 leading-normal">O mapa em A1, A2 ou A4, com espaço para a equipe escrever.</p>
      <a className={`${botao} px-3.5 no-underline`} href="/baixar">Baixar mapa</a>
    </>
  );
}
