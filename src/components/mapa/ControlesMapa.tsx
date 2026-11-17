// Controles do Mapa da Visita, com Base UI (ADR 0006): botão e barra lateral do guia, seletor de modo,
// setas das Etapas, filtro por Função e o painel de detalhe de uma Etapa.
// Quem desenha a grade é src/scripts/mapa.ts. A conversa é por eventos e pela API window.musaMapa:
//   mapa.ts → "musa-mapa:estado" { modo, atual, total, celular } e "musa-mapa:detalhe" { id }
//   aqui    → window.musaMapa.modo(m) / .passo(±1) / .filtrar(funcao)
// O guia abre sozinho só na primeira visita (localStorage "musa:guia-visto"); depois, só pelo botão.
import { useCallback, useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { Select } from "@base-ui/react/select";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Tooltip } from "@base-ui/react/tooltip";
import { Check, NavArrowDown, NavArrowLeft, NavArrowRight, SidebarCollapse, SidebarExpand, Xmark } from "iconoir-react";

interface Funcao { id: string; nome: string }
interface Props { funcoes: Funcao[]; totalEtapas: number }
interface Estado { modo: "etapa" | "inteiro"; atual: number; total: number; celular: boolean }
interface MusaMapa {
  modo(m: string): void;
  passo(d: number): void;
  filtrar(f: string): void;
  estado(): Estado;
}
declare global { interface Window { musaMapa?: MusaMapa } }

const TODAS = "todas";
const guardar = (k: string, v: string) => { try { localStorage.setItem("musa:" + k, v); } catch {} };
const ler = (k: string) => { try { return localStorage.getItem("musa:" + k); } catch { return null; } };

// classes comuns: controles pequenos e cinza (é uma ferramenta de uso longo)
const foco = "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-texto-950";
const botao = `inline-flex items-center justify-center gap-1.5 h-7 rounded-md border border-neutro-300 bg-neutro-50 text-texto-900 text-xs font-inter cursor-pointer select-none hover:bg-neutro-100 active:bg-neutro-200 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-neutro-50 ${foco}`;
const dica = "rounded-md bg-texto-950 px-2 py-1 text-xs font-inter text-neutro-50 origin-(--transform-origin) transition-[opacity,scale] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-instant:duration-0";

function ComDica({ texto, children }: { texto: string; children: React.ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} className="z-30">
          <Tooltip.Popup className={dica}>{texto}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// Ícones: Iconoir (traço de 1,5 px), só onde o controle não tem texto. Tamanho fixo em px, cor herdada.
const ic = { width: 16, height: 16, strokeWidth: 1.5, "aria-hidden": true } as const;
const icPequeno = { ...ic, width: 14, height: 14 } as const;

export default function ControlesMapa({ funcoes, totalEtapas }: Props) {
  const [estado, setEstado] = useState<Estado>({ modo: "etapa", atual: 0, total: totalEtapas, celular: false });
  const [funcao, setFuncao] = useState<string>(TODAS);
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

  const escolherFuncao = (v: string | null) => {
    const f = v ?? TODAS;
    setFuncao(f);
    window.musaMapa?.filtrar(f === TODAS ? "" : f);
  };

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
    if (funcao !== TODAS) conteudo.querySelectorAll<HTMLElement>(".pratica").forEach((p) => { p.hidden = p.dataset.funcao !== funcao; });
    el.replaceChildren(conteudo);
  }, [detalhe, funcao]);

  const itens = [{ value: TODAS, label: "Todas as funções" }, ...funcoes.map((f) => ({ value: f.id, label: f.nome }))];
  const { modo, atual, total, celular } = estado;

  return (
    <Tooltip.Provider delay={400}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* barra lateral do guia */}
        <Drawer.Root open={guia} onOpenChange={setGuia} modal={false} disablePointerDismissal swipeDirection="left">
          <ComDica texto={guia ? "Esconder o guia" : "Como usar o mapa"}>
            <Drawer.Trigger className={`${botao} w-7 px-0 data-popup-open:bg-neutro-200`} aria-label="Como usar o mapa"
              onClick={(ev) => { if (guia) { ev.preventDefault(); setGuia(false); } }}>
              {guia ? <SidebarCollapse {...ic} /> : <SidebarExpand {...ic} />}
            </Drawer.Trigger>
          </ComDica>
          <Drawer.Portal>
            <Drawer.Viewport className="fixed inset-x-0 bottom-0 top-(--altura-topo) z-20 flex pointer-events-none">
              <Drawer.Popup className="pointer-events-auto h-full w-80 max-w-full box-border overflow-y-auto overscroll-contain bg-neutro-50 border-r border-neutro-300 shadow-lg p-5 font-inter text-sm text-texto-900 outline-none [transform:translateX(var(--drawer-swipe-movement-x))] transition-[translate] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-starting-style:-translate-x-full data-ending-style:-translate-x-full data-swiping:select-none motion-reduce:transition-none max-[760px]:w-full max-[760px]:border-r-0">
                <Drawer.Content>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <Drawer.Title className="m-0 font-dm-sans text-md font-semibold text-texto-950">Como usar o mapa</Drawer.Title>
                    <Drawer.Close className={`${botao} w-7 px-0`} aria-label="Fechar o guia"><Xmark {...ic} /></Drawer.Close>
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
          {/* modo (no celular só existe etapa por etapa) */}
          {!celular && (
            <ToggleGroup aria-label="Como ver o mapa" value={[modo]} onValueChange={(v) => { if (v[0]) window.musaMapa?.modo(v[0]); }}
              className="inline-flex gap-0.5 p-0.5 rounded-md bg-neutro-200">
              {[["etapa", "Etapa por etapa"], ["inteiro", "Mapa inteiro"]].map(([v, rotulo]) => (
                <Toggle key={v} value={v} className={`h-6 px-2 rounded border-0 bg-transparente text-xs font-inter text-texto-700 cursor-pointer select-none hover:text-texto-950 data-pressed:bg-neutro-50 data-pressed:text-texto-950 data-pressed:shadow-xs ${foco}`}>
                  {rotulo}
                </Toggle>
              ))}
            </ToggleGroup>
          )}

          {/* setas das Etapas (só no modo etapa por etapa) */}
          {modo === "etapa" && (
            <nav className="flex items-center gap-1" aria-label="Etapas">
              <ComDica texto="Etapa anterior (←)">
                <button type="button" className={`${botao} w-7 px-0`} aria-label="Etapa anterior" disabled={atual === 0} onClick={() => window.musaMapa?.passo(-1)}><NavArrowLeft {...ic} /></button>
              </ComDica>
              <p className="m-0 min-w-14 text-center text-xs text-texto-700 tabular-nums" aria-live="polite">
                <span className="sr-only">Etapa </span>{atual + 1} de {total}
              </p>
              <ComDica texto="Próxima etapa (→)">
                <button type="button" className={`${botao} w-7 px-0`} aria-label="Próxima etapa" disabled={atual === total - 1} onClick={() => window.musaMapa?.passo(1)}><NavArrowRight {...ic} /></button>
              </ComDica>
            </nav>
          )}

          {/* filtro por Função */}
          <Select.Root items={itens} value={funcao} onValueChange={escolherFuncao}>
            <Select.Trigger aria-label="Filtrar por função" className={`${botao} px-2 min-w-40 justify-between data-popup-open:bg-neutro-100`}>
              <Select.Value />
              <Select.Icon className="flex text-texto-600"><NavArrowDown {...icPequeno} /></Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner sideOffset={4} className="z-30 outline-none select-none">
                <Select.Popup className="min-w-(--anchor-width) origin-(--transform-origin) rounded-md border border-neutro-300 bg-neutro-50 py-1 shadow-lg outline-none transition-[scale,opacity] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:transition-none">
                  <Select.List className="max-h-(--available-height) overflow-y-auto">
                    {itens.map((it) => (
                      <Select.Item key={it.value} value={it.value} className="grid grid-cols-[14px_1fr] items-center gap-2 py-1.5 pl-2 pr-4 font-inter text-xs text-texto-900 cursor-default outline-none select-none data-highlighted:bg-neutro-200">
                        <Select.ItemIndicator className="col-start-1 flex"><Check {...icPequeno} /></Select.ItemIndicator>
                        <Select.ItemText className="col-start-2">{it.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* detalhe de uma Etapa: painel à direita (folha de baixo no celular) */}
      <Dialog.Root open={!!detalhe} onOpenChange={(aberto) => { if (!aberto) setDetalhe(null); }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-texto-950/20 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
          <Dialog.Popup className="fixed z-50 right-0 top-0 h-dvh w-[min(520px,100vw)] box-border overflow-y-auto overscroll-contain bg-neutro-50 border-l border-neutro-300 shadow-xl font-inter text-texto-900 outline-none transition-[translate,opacity] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] data-starting-style:translate-x-6 data-starting-style:opacity-0 data-ending-style:translate-x-6 data-ending-style:opacity-0 motion-reduce:transition-none max-[760px]:top-auto max-[760px]:bottom-0 max-[760px]:h-auto max-[760px]:max-h-[85dvh] max-[760px]:w-full max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:rounded-t-2xl max-[760px]:data-starting-style:translate-x-0 max-[760px]:data-starting-style:translate-y-10 max-[760px]:data-ending-style:translate-x-0 max-[760px]:data-ending-style:translate-y-10">
            <div className="sticky top-0 flex items-start justify-between gap-3 px-6 pt-5 pb-3 bg-neutro-50 border-b border-neutro-200">
              <Dialog.Title className="m-0 font-dm-sans text-2xl font-semibold text-texto-950">{tituloDetalhe}</Dialog.Title>
              <Dialog.Close className={`${botao} w-7 px-0 shrink-0`} aria-label="Fechar"><Xmark {...ic} /></Dialog.Close>
            </div>
            <div className="detalhe-corpo" ref={preencherDetalhe} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Tooltip.Provider>
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
        <li>Cada linha é uma camada: Sentimentos, Ações da escola, Pontos de contato, Boas práticas e O que evitar.</li>
        <li>A linha que liga os rostos mostra como a escola se sente ao longo da visita.</li>
        <li><strong>+</strong> marca o que tende a ajudar; <strong>−</strong>, o que tende a atrapalhar.</li>
      </ul>
      <h3 className={h3}>Como navegar</h3>
      <ul className={ul}>
        <li><strong>Etapa por etapa</strong> abre uma etapa de cada vez. Passe para a próxima pelas setas no topo ou pelas teclas ← e →.</li>
        <li><strong>Mapa inteiro</strong> mostra as {totalEtapas} etapas lado a lado.</li>
        <li>Clique no nome de uma etapa para ver tudo sobre ela, com a origem de cada prática.</li>
        <li>Escolha uma função no topo para ver só as práticas de quem cuida daquela parte da visita.</li>
      </ul>
      <h3 className={h3}>Para imprimir</h3>
      <p className="m-0 mb-2.5 leading-normal">O mapa em A1, A2 ou A4, com espaço para a equipe escrever.</p>
      <a className={`${botao} px-2.5 no-underline`} href="/baixar">Baixar o mapa</a>
    </>
  );
}
