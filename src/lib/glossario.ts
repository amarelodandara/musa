// Glossário público (texto em src/data/glossario.md): "## Grupo" > "### Termo" > parágrafos. Usado na página
// /guia/glossario e na grade de grupos da entrada do Guia. Cada grupo tem um ícone do Iconoir (ICONES_GRUPO).
import texto from "../data/glossario.md?raw";

export const ancora = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const italico = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*([^*]+)\*/g, "<em>$1</em>");

// Ícones dos grupos, sem repetir os das pills de pontos de contato (src/lib/pontos-contato.ts) nem os dos controles do mapa:
// a turma (Community), as colunas do mapa (ViewColumns3), as linhas do mapa (TableRows), a pesquisa (DocMagnifyingGlass)
export const ICONES_GRUPO: Record<string, string> = {
  "a-visita": "Community",
  "o-mapa": "ViewColumns3",
  "as-camadas": "TableRows",
  "de-onde-vem-o-conteudo": "DocMagnifyingGlass"
};

export const gruposGlossario = texto.replace(/<!--[\s\S]*?-->/g, "").split(/^## /m).slice(1).map((bloco) => {
  const [titulo, ...resto] = bloco.split("\n");
  const termos = resto.join("\n").split(/^### /m).slice(1).map((t) => {
    const [nome, ...corpo] = t.split("\n");
    const paragrafos = corpo.join("\n").trim().split(/\n\s*\n/).map((p) => italico(p.replace(/\n/g, " ").trim())).filter(Boolean);
    return { nome: nome.trim(), id: ancora(nome), paragrafos };
  });
  const id = ancora(titulo);
  return { titulo: titulo.trim(), id, icone: ICONES_GRUPO[id] ?? "Book", termos };
});
