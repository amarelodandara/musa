// Estados do menu de filtro do mapa, com os dados reais (Etapas e Funções da planilha).
// Cada estado é uma seleção inicial; o menu abre já nesse estado.
import { conteudo, FASES } from "../../../lib/conteudo";

const rotuloFase = (f: string) => FASES.find((x) => x.nome === f)?.rotulo ?? f;
export const etapas = conteudo.etapas.map((e) => ({ id: e.id, nome: e.nome, fase: rotuloFase(e.fase) }));
export const funcoes = conteudo.funcoes.map((f) => ({ id: f.id, nome: f.nome }));

const idsDaFase = (nome: string) => conteudo.etapas.filter((e) => e.fase === nome).map((e) => e.id);
const [antes, durante] = FASES.map((f) => f.nome);
const todasEtapas = etapas.map((e) => e.id);
const todasFuncoes = funcoes.map((f) => f.id);
const funcao = (nome: string) => funcoes.find((f) => f.nome === nome)?.id ?? funcoes[0].id;

export interface Estado { id: string; rotulo: string; etapas: string[]; funcoes: string[] }
export const GRUPOS: { titulo: string; estados: Estado[] }[] = [
  { titulo: "Sem filtro", estados: [
    { id: "tudo", rotulo: "Tudo à vista", etapas: todasEtapas, funcoes: todasFuncoes }
  ]},
  { titulo: "Etapas", estados: [
    { id: "sem-antes", rotulo: "Uma fase desligada", etapas: todasEtapas.filter((id) => !idsDaFase(antes).includes(id)), funcoes: todasFuncoes },
    { id: "so-durante", rotulo: "Uma fase só", etapas: idsDaFase(durante), funcoes: todasFuncoes }
  ]},
  { titulo: "Funções", estados: [
    { id: "sem-mediacao", rotulo: "Uma função desligada", etapas: todasEtapas, funcoes: todasFuncoes.filter((id) => id !== funcao("Mediação")) },
    { id: "so-mediacao", rotulo: "Uma função só", etapas: todasEtapas, funcoes: [funcao("Mediação")] },
    { id: "tres-funcoes", rotulo: "Três funções", etapas: todasEtapas, funcoes: [funcao("Professor(a)"), funcao("Mediação"), funcao("Gestão")] }
  ]},
  { titulo: "Etapas e funções", estados: [
    { id: "fase-e-funcao", rotulo: "Sem antes, só mediação", etapas: todasEtapas.filter((id) => !idsDaFase(antes).includes(id)), funcoes: [funcao("Mediação")] }
  ]}
];
