// Conteúdo do Mapa da Visita, gerado pela planilha (npm run conteudo) ou, até lá, pelos dados de exemplo.
import dados from "../data/conteudo.json";

export type Fase = "Antes" | "Durante" | "Depois";
export type Origem = "Documento" | "Adaptado de documento" | "Pesquisa de campo";

export interface Etapa {
  ordem: number; id: string; nome: string; fase: Fase;
  descricao: string | null; acoesEscola: string | null;
  sentimento: string | null; pensamento: string | null;
  origemSentimento: string | null; fonteSentimento: string | null;
  // Nível de desafio da Etapa para o professor; da coluna "Nível de desafio" da planilha (ver desafio())
  desafio?: Desafio | null;
}
export type Desafio = "baixo" | "medio" | "alto";
export interface Funcao { id: string; nome: string; descricao: string | null }
export interface PontoContato { etapa: string; canal: string; descricao: string | null; origem: string | null; fonte: string | null }
// funcoes: uma ou mais (a planilha separa por vírgula); funcao: a primeira delas
export interface Pratica { id: string; etapa: string; funcoes: string[]; funcao: string; tipo: "boa" | "evitar"; titulo: string; detalhe: string | null; origem: Origem; fonte: string | null }
export interface Fonte { codigo: string; referencia: string }

export const conteudo = dados as unknown as {
  origem: "mock" | "planilha"; geradoEm: string | null;
  etapas: Etapa[]; funcoes: Funcao[]; pontosContato: PontoContato[]; praticas: Pratica[]; fontes: Fonte[];
};

export const FASES: { nome: Fase; rotulo: string }[] = [
  { nome: "Antes", rotulo: "Antes da visita" },
  { nome: "Durante", rotulo: "Durante a visita" },
  { nome: "Depois", rotulo: "Depois da visita" }
];

export const fonte = (codigo: string | null) => conteudo.fontes.find((f) => f.codigo === codigo)?.referencia ?? null;
export const funcao = (id: string) => conteudo.funcoes.find((f) => f.id === id);
// nomes das Funções de uma Prática, juntos ("Gestão · Coordenação do educativo")
export const nomesFuncoes = (p: Pratica) => p.funcoes.map((id) => funcao(id)?.nome).filter(Boolean).join(" · ");

// Ordem das Práticas dentro de cada Etapa (25/11/2026): a sequência em que o museu as executaria, como uma história
// que a coluna conta, sem número (não é lista de tarefas). Boas práticas e O que evitar se intercalam nessa sequência.
// Pelo título, para sobreviver a uma nova importação da planilha; título fora da lista vai para o fim, na ordem da planilha.
// O ideal é a planilha já vir nessa ordem: aí esta lista pode sair.
const ORDEM_PRATICAS = [
  // Descoberta: primeiro o museu define o que oferece, depois mostra como agendar, prepara quem atende e só então divulga
  "Explicar as modalidades de visita e o que cada uma oferece",
  "Apresentar os roteiros e temas disponíveis",
  "Informar custos, datas e apoios possíveis",
  "Deixar claro como agendar uma visita educativa",
  "Preparar a recepção para informar como agendar",
  "Levar a programação educativa às escolas",
  // Agendamento: abrir a agenda, colher os dados (com a acessibilidade), combinar os grupos, planejar para quem vem
  "Comunicar quando a agenda abre",
  "Reunir as informações da escola em um só lugar",
  "Deixar de perguntar sobre acessibilidade",
  "Informar o limite de alunos por horário e combinar a divisão dos grupos",
  "Planejar somente acessibilidade física",
  // Preparação: escala e plano internos, depois a conversa com o professor e as orientações para o dia
  "Definir com antecedência quem conduz cada visita",
  "Planejar a visita só a partir do conteúdo da exposição",
  "Checagem de equipamentos",
  "Ter planos para atrasos e imprevistos",
  "Confirmar a visita e falar com o professor antes da data",
  "Alinhar expectativas sobre o que será visto",
  "Achar que o professor já conhece bem os temas da exposição",
  "Deixar a escola descobrir as condições de chegada só no dia",
  // Recepção
  "Preparar a equipe para receber grupos escolares",
  "Deixar turmas entrarem sem acolhimento",
  // Mediação: dividir a turma, combinar as regras antes de entrar, conduzir, enriquecer
  "Dividir a turma conforme a capacidade dos espaços e da equipe",
  "Orientar os alunos sobre obras sensíveis",
  "Adaptar o ritmo à idade e à atenção da turma",
  "Usar recursos complementares",
  // Encerramento: ouvir o grupo (os alunos também), o professor e, por último, a própria equipe
  "Ouvir o grupo ao final da visita",
  "Excluir os alunos da avaliação",
  "Pedir ao professor uma avaliação da visita",
  "Colher os aprendizados do educativo",
  // Vínculo
  "Convidar a escola para as próximas exposições",
  "Usar o histórico da escola nos próximos atendimentos"
];
const posicaoPratica = (p: Pratica) => { const i = ORDEM_PRATICAS.indexOf(p.titulo.trim()); return i < 0 ? ORDEM_PRATICAS.length : i; };
// as Práticas na ordem de execução (sort é estável: as de fora da lista mantêm a ordem da planilha)
export const emOrdem = (lista: Pratica[]) => [...lista].sort((a, b) => posicaoPratica(a) - posicaoPratica(b));

// Sentimentos: peso na linha e humor do avatar. Lista provisória, ver docs/sentimentos-e-avatar.md (to-do #45 no Solo).
export const SENTIMENTOS: Record<string, { peso: number; humor: "feliz" | "neutro" | "triste" }> = {
  Animado: { peso: 2, humor: "feliz" },
  Confiante: { peso: 1, humor: "feliz" },
  Curioso: { peso: 1, humor: "feliz" },
  Tranquilo: { peso: 0, humor: "neutro" },
  Inseguro: { peso: -1, humor: "triste" },
  Frustrado: { peso: -2, humor: "triste" }
};
export const AVATAR = { feliz: "/brand/musa-avatar-happy.svg", neutro: "/brand/musa-mark-avatar.svg", triste: "/brand/musa-avatar-sad.svg" };

// Nível de desafio: o quanto cada Etapa desafia o professor (substitui os Sentimentos na grade). Cada nível tem um avatar.
export const DESAFIOS: Record<Desafio, { nome: string; avatar: string }> = {
  baixo: { nome: "Baixo", avatar: AVATAR.feliz },
  medio: { nome: "Médio", avatar: AVATAR.neutro },
  alto: { nome: "Alto", avatar: AVATAR.triste }
};
// Provisório: níveis decididos em /dev/desafio (18/11/2026), até a planilha ganhar a coluna "Desafio" (que passa na frente)
const DESAFIO_PROVISORIO: Record<string, Desafio> = {
  descoberta: "baixo", agendamento: "baixo", preparacao: "alto", recepcao: "alto", mediacao: "medio", encerramento: "alto", vinculo: "baixo"
};
export const desafio = (e: Etapa): Desafio | null => e.desafio ?? DESAFIO_PROVISORIO[e.id] ?? null;
