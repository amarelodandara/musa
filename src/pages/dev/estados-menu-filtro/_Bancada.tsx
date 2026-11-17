// Bancada de estados do menu de filtro: o componente real (ControlesMapa) com o menu aberto em cada estado e o
// seletor de estados ao lado (fora do sistema visual de propósito). O estado vive no parâmetro __state do endereço.
import { useEffect, useState } from "react";
import ControlesMapa from "../../../components/mapa/ControlesMapa";
import type { Estado } from "./_estados";

interface Props { grupos: { titulo: string; estados: Estado[] }[]; etapas: any[]; funcoes: any[] }

export default function Bancada({ grupos, etapas, funcoes }: Props) {
  const todos = grupos.flatMap((g) => g.estados);
  const doEndereco = () => new URLSearchParams(location.search).get("__state");
  const [atual, setAtual] = useState(() => (typeof location !== "undefined" && todos.find((e) => e.id === doEndereco())?.id) || todos[0].id);
  const [escondido, setEscondido] = useState(false);

  const ir = (id: string) => {
    setAtual(id);
    const u = new URL(location.href); u.searchParams.set("__state", id);
    history.replaceState(null, "", u);
  };

  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey) return;
      const alvo = ev.target as HTMLElement;
      if (alvo.closest("input, textarea, select, [contenteditable]")) return;
      if (ev.key === "h" || ev.key === "H") { ev.preventDefault(); ev.stopPropagation(); setEscondido((x) => !x); return; }
      const d = ev.key === "ArrowDown" || ev.key === "ArrowRight" ? 1 : ev.key === "ArrowUp" || ev.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      // nesta bancada as setas trocam de estado mesmo com o foco no menu aberto (captura antes do menu)
      ev.preventDefault(); ev.stopPropagation();
      const i = todos.findIndex((e) => e.id === atual);
      ir(todos[(i + d + todos.length) % todos.length].id);
    };
    addEventListener("keydown", tecla, { capture: true });
    return () => removeEventListener("keydown", tecla, { capture: true });
  });

  useEffect(() => { document.querySelector(".state-switcher [aria-pressed='true']")?.scrollIntoView({ block: "nearest" }); }, [atual]);

  const estado = todos.find((e) => e.id === atual)!;
  const seta = <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v4a3 3 0 0 0 3 3h7" /><path d="m10 7 3 3-3 3" /></svg>;

  return (
    <div className="state-page">
      <div className="state-layout">
        <nav className="state-switcher" aria-label="Estados" hidden={escondido}>
          {grupos.map((g, gi) => (
            <div key={g.titulo} className="state-switcher-group" role="group" aria-labelledby={`estados-${gi}`}>
              <span className="state-switcher-heading" id={`estados-${gi}`}>{seta}{g.titulo}</span>
              {g.estados.map((e) => (
                <button key={e.id} type="button" data-state={e.id} aria-pressed={e.id === atual} onClick={() => ir(e.id)}>{e.rotulo}</button>
              ))}
            </div>
          ))}
        </nav>
        <div className="state-switcher-select" hidden={escondido}>
          <select aria-label="Estado" value={atual} onChange={(ev) => ir(ev.target.value)}>
            {grupos.map((g) => <optgroup key={g.titulo} label={g.titulo}>{g.estados.map((e) => <option key={e.id} value={e.id}>{e.rotulo}</option>)}</optgroup>)}
          </select>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
        </div>
        <div className="state-stage">
          {/* a barra do mapa como em produção (44 px, borda de baixo), com o menu de filtro aberto no estado escolhido */}
          <header className="mapa-topo-bancada">
            <ControlesMapa key={estado.id} funcoes={funcoes} etapas={etapas} totalEtapas={etapas.length}
              filtroInicial={{ etapas: estado.etapas, funcoes: estado.funcoes }} menuFiltroAberto />
          </header>
        </div>
      </div>
    </div>
  );
}
