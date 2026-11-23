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
