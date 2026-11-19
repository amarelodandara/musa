// Páginas do Guia (/guia): os guias em src/data/guia/*.md (frontmatter: titulo, resumo, ordem, icone) e o glossário,
// que tem página própria (src/pages/guia/glossario.astro, texto em src/data/glossario.md).
// icone: nome no Iconoir, sem repetir os das pills de pontos de contato nem os dos grupos do glossário
export interface PaginaGuia { slug: string; titulo: string; resumo: string; ordem: number; icone: string }

const arquivos = import.meta.glob<{ frontmatter: { titulo: string; resumo: string; ordem: number; icone: string }; Content: any; getHeadings: () => { depth: number; slug: string; text: string }[] }>("../data/guia/*.md", { eager: true });

// secoes: os títulos "## " de cada guia, que viram os subitens do guia no menu lateral quando ele está aberto
export const guias = Object.entries(arquivos).map(([caminho, m]) => ({
  slug: caminho.split("/").pop()!.replace(/\.md$/, ""), ...m.frontmatter, Content: m.Content,
  secoes: m.getHeadings().filter((h) => h.depth === 2).map((h) => ({ id: h.slug, titulo: h.text }))
})).sort((a, b) => a.ordem - b.ordem);

export const GLOSSARIO: PaginaGuia = { slug: "glossario", titulo: "Glossário", resumo: "Cada palavra do mapa explicada, para a equipe toda entender a mesma coisa.", ordem: 99, icone: "OpenBook" };

// a ordem do menu lateral: os guias e, no fim, o glossário
export const paginasGuia: PaginaGuia[] = [...guias.map(({ Content, secoes, ...p }) => p), GLOSSARIO];
