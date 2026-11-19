// Glossário público (texto em src/data/glossario.md): "## Grupo" > "### Termo" > parágrafos > "#### Subtermo" > parágrafos. Usado na página
// /guia/glossario e na grade de grupos da entrada do Guia. Cada grupo tem um ícone do Iconoir (ICONES_GRUPO).
import texto from "../data/glossario.md?raw";
// o comentário do topo do arquivo, para o playground /dev/guia-glossario-lista manter ao reescrever
export const cabecalhoGlossario = texto.match(/^<!--[\s\S]*?-->/)?.[0] ?? "";

export const ancora = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const italico = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*([^*]+)\*/g, "<em>$1</em>");

// Ícones dos grupos, sem repetir os das pills de pontos de contato (src/lib/pontos-contato.ts) nem os dos controles do mapa:
// as colunas do mapa (ViewColumns3), as fases da visita (Calendar), as pessoas das funções (Community), a pesquisa (DocMagnifyingGlass)
export const ICONES_GRUPO: Record<string, string> = {
  "o-mapa": "ViewColumns3",
  "a-visita": "Calendar",
  "as-funcoes": "Community",
  "de-onde-vem-o-conteudo": "DocMagnifyingGlass"
};

const paragrafosDe = (corpo: string) => corpo.trim().split(/\n\s*\n/).map((p) => italico(p.replace(/\n/g, " ").trim())).filter(Boolean);

// Cada grupo tem poucos termos principais ("### "), os que aparecem no cartão da entrada do Guia; cada um pode ter
// subtermos ("#### "), que só aparecem na página do glossário, embaixo dele.
export const gruposGlossario = texto.replace(/<!--[\s\S]*?-->/g, "").split(/^## /m).slice(1).map((bloco) => {
  const [titulo, ...resto] = bloco.split("\n");
  const termos = resto.join("\n").split(/^### /m).slice(1).map((t) => {
    const [nome, ...corpo] = t.split("\n");
    const [proprio, ...subs] = corpo.join("\n").split(/^#### /m);
    const subtermos = subs.map((st) => {
      const [subnome, ...subcorpo] = st.split("\n");
      return { nome: subnome.trim(), id: ancora(subnome), paragrafos: paragrafosDe(subcorpo.join("\n")) };
    });
    // texto: o markdown cru do termo, com os subtermos (o playground /dev/guia-glossario-lista reescreve o arquivo com ele)
    return { nome: nome.trim(), id: ancora(nome), paragrafos: paragrafosDe(proprio), subtermos, texto: corpo.join("\n").trim() };
  });
  const id = ancora(titulo);
  return { titulo: titulo.trim(), id, icone: ICONES_GRUPO[id] ?? "Book", termos };
});
