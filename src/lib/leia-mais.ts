// "Leia mais" (entrada do Guia, /guia): fontes de fora para aprofundar os assuntos do site.
// DADOS DE EXEMPLO: títulos, autorias e veículos inventados, só para desenhar a seção em /dev/guia-leia-mais-grade.
// Trocar pelas fontes de verdade antes de publicar. href: o link da fonte, quando houver (os de exemplo usam example.org,
// domínio reservado para exemplos); sem href, o cartão fica sem link.
export type TipoFonte = "livro" | "artigo" | "documento" | "video" | "site";
export interface Fonte { tipo: TipoFonte; titulo: string; autoria: string; ano: number; veiculo: string; resumo: string; temas: string[]; href?: string }

// ícones do Iconoir de cada tipo, sem repetir os das pills de pontos de contato nem os do glossário
export const TIPOS: Record<TipoFonte, { rotulo: string; plural: string; icone: string }> = {
  livro: { rotulo: "Livro", plural: "Livros", icone: "Book" },
  artigo: { rotulo: "Artigo", plural: "Artigos", icone: "Journal" },
  documento: { rotulo: "Documento", plural: "Documentos", icone: "EmptyPage" },
  video: { rotulo: "Vídeo", plural: "Vídeos", icone: "MediaVideo" },
  site: { rotulo: "Site", plural: "Sites", icone: "Globe" }
};

export const fontes: Fonte[] = [
  { tipo: "livro", titulo: "A escola vai ao museu", autoria: "Helena Barros Fontoura", ano: 2019, veiculo: "Editora Exemplo", resumo: "Como professores escolhem, preparam e retomam uma visita, contado a partir de vinte escolas públicas.", temas: ["Público escolar", "Visita"] },
  { tipo: "artigo", titulo: "O agendamento como primeira mediação", autoria: "Rafael Quintela e Marina Ost", ano: 2022, veiculo: "Revista Exemplo de Museologia", resumo: "Por que a forma de marcar uma visita já diz à escola se ela é bem-vinda.", temas: ["Atendimento", "Visita"], href: "https://example.org/artigo-2" },
  { tipo: "documento", titulo: "Caderno de orientações para ações educativas", autoria: "Instituto Exemplo de Museus", ano: 2018, veiculo: "Documento oficial", resumo: "Diretrizes para planejar, registrar e avaliar as ações educativas de um museu.", temas: ["Educação museal", "Gestão"], href: "https://example.org/documento-3" },
  { tipo: "livro", titulo: "Serviços que se veem", autoria: "Teodoro Lins", ano: 2016, veiculo: "Editora Exemplo", resumo: "Introdução ao design de serviços: jornadas, pontos de contato e o que acontece nos bastidores.", temas: ["Design de serviços"] },
  { tipo: "video", titulo: "Mediar para quem nunca entrou num museu", autoria: "Coletivo Exemplo", ano: 2021, veiculo: "Palestra, 42 min", resumo: "Mediadoras contam o que mudaram para receber turmas que visitam um museu pela primeira vez.", temas: ["Mediação", "Público escolar"], href: "https://example.org/video-5" },
  { tipo: "artigo", titulo: "Antes, durante e depois: a visita como jornada", autoria: "Lúcia Amaral Peixoto", ano: 2020, veiculo: "Cadernos Exemplo de Educação", resumo: "Uma leitura da visita escolar com ferramentas do design de serviços.", temas: ["Design de serviços", "Visita"], href: "https://example.org/artigo-6" },
  { tipo: "documento", titulo: "Guia de acessibilidade em espaços culturais", autoria: "Secretaria Exemplo de Cultura", ano: 2023, veiculo: "Documento oficial", resumo: "Recomendações de acesso físico, comunicacional e atitudinal para equipamentos culturais.", temas: ["Acessibilidade", "Espaço"], href: "https://example.org/documento-7" },
  { tipo: "site", titulo: "Observatório Exemplo de Públicos", autoria: "Rede Exemplo de Museus", ano: 2024, veiculo: "Site", resumo: "Dados abertos sobre quem visita os museus do país, com recortes por região e faixa etária.", temas: ["Públicos", "Gestão"], href: "https://example.org/site-8" },
  { tipo: "livro", titulo: "O educativo no centro", autoria: "Joana Ferraz e Caio Monteverde", ano: 2021, veiculo: "Editora Exemplo", resumo: "Ensaios sobre o lugar do setor educativo na gestão de museus pequenos e médios.", temas: ["Educação museal", "Gestão"] },
  { tipo: "artigo", titulo: "Quem atende o telefone também educa", autoria: "Bruno Sayão", ano: 2023, veiculo: "Revista Exemplo de Museologia", resumo: "O papel da recepção e da vigilância na experiência das turmas escolares.", temas: ["Atendimento", "Funções"], href: "https://example.org/artigo-10" },
  { tipo: "video", titulo: "Planejar a visita com o professor", autoria: "Museu Exemplo", ano: 2022, veiculo: "Oficina gravada, 1 h 10 min", resumo: "Uma oficina com professores da rede pública para desenhar a visita junto com o educativo.", temas: ["Mediação", "Visita"], href: "https://example.org/video-11" },
  { tipo: "documento", titulo: "Política Exemplo de Educação em Museus", autoria: "Ministério Exemplo", ano: 2017, veiculo: "Documento oficial", resumo: "Os princípios e eixos que orientam a educação nos museus públicos.", temas: ["Educação museal"], href: "https://example.org/documento-12" }
];
