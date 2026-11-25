// Importa o conteúdo do Mapa da Visita da planilha do Google Sheets (ADR 0002).
// Uso: npm run conteudo            → baixa, valida e grava src/data/conteudo.json
//      npm run conteudo -- --checar → só valida, sem gravar
// Lê cada aba pelo link público em CSV; não precisa de login.
// Linhas que começam com "Exemplo:" e Práticas com Origem "Hipótese" ficam de fora.
import { writeFileSync } from "node:fs";

const PLANILHA = "1GRiHBK1M1K_Vp7NEJkzcSshjS3pPcVkb_FFX5KJwN9o";
const DESTINO = new URL("../src/data/conteudo.json", import.meta.url);
const SO_CHECAR = process.argv.includes("--checar");

const FASES = ["Antes", "Durante", "Depois"];
const ORIGENS = ["Documento", "Adaptado de documento", "Pesquisa de campo", "Hipótese"];
const TIPOS = { "Boa prática": "boa", "O que evitar": "evitar" };

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const vazio = (v) => v == null || String(v).trim() === "";
const limpo = (v) => (vazio(v) ? null : String(v).trim());

// CSV com aspas (formato do export do Google)
function lerCsv(texto) {
  const linhas = []; let linha = [], campo = "", aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = "";
    } else campo += c;
  }
  if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

async function aba(nome) {
  const url = `https://docs.google.com/spreadsheets/d/${PLANILHA}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(nome)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Não consegui ler a aba "${nome}" (HTTP ${r.status}). A planilha está compartilhada por link?`);
  const [cab, ...resto] = lerCsv(await r.text());
  return resto
    .map((valores, i) => ({ linha: i + 2, ...Object.fromEntries(cab.map((c, j) => [c.trim(), valores[j] ?? ""])) }))
    .filter((l) => !Object.entries(l).every(([k, v]) => k === "linha" || vazio(v)))
    .filter((l) => !Object.values(l).some((v) => typeof v === "string" && v.trim().startsWith("Exemplo:")));
}

const erros = [], avisos = [];
const erro = (abaNome, linha, msg) => erros.push(`${abaNome}, linha ${linha}: ${msg}`);

const [etapasBrutas, funcoesBrutas, pontosBrutos, praticasBrutas, fontesBrutas] = await Promise.all(
  ["Etapas", "Funções", "Pontos de contato", "Práticas", "Fontes"].map(aba)
);

const fontes = fontesBrutas.map((l) => ({ codigo: limpo(l["Código"]), referencia: limpo(l["Referência completa"]), linha: l.linha }));
const codigos = new Set(fontes.map((f) => f.codigo));
fontes.forEach((f) => { if (!f.codigo || !f.referencia) erro("Fontes", f.linha, "código e referência são obrigatórios"); });

const checarOrigem = (abaNome, l, origem, fonte) => {
  if (origem && !ORIGENS.includes(origem)) erro(abaNome, l.linha, `Origem "${origem}" não existe`);
  if (fonte && !codigos.has(fonte)) erro(abaNome, l.linha, `Fonte "${fonte}" não está na aba Fontes`);
};

// ids curtos das Etapas (usados em links #etapa, no playground e nos níveis provisórios); nome novo cai no slug
const ID_ETAPA = { "Descoberta do museu": "descoberta", "Agendamento da visita": "agendamento", "Preparação para visita": "preparacao",
  "Recepção no museu": "recepcao", "Mediação no museu": "mediacao", "Encerramento da visita": "encerramento", "Criação de vínculo": "vinculo" };

const nivelDesafio = (v) => ({ baixo: "baixo", medio: "medio", "médio": "medio", alto: "alto" })[(limpo(v) ?? "").toLowerCase()] ?? null;

const etapas = etapasBrutas.map((l) => {
  const e = {
    ordem: Number(l["Ordem"]), id: ID_ETAPA[limpo(l["Etapa"])] ?? slug(l["Etapa"]), nome: limpo(l["Etapa"]), fase: limpo(l["Fase"]),
    descricao: limpo(l["Descrição"]), acoesEscola: limpo(l["Ações da escola"]),
    sentimento: limpo(l["Sentimento"]), pensamento: limpo(l["Pensamento do professor"]),
    origemSentimento: limpo(l["Origem do sentimento"]), fonteSentimento: limpo(l["Fonte do sentimento"]),
    // coluna "Nível de desafio" (antes "Desafio"): Baixo, Médio ou Alto (sem ela, o mapa usa os níveis provisórios de src/lib/conteudo.ts)
    desafio: nivelDesafio(l["Nível de desafio"] ?? l["Desafio"])
  };
  const desafioBruto = l["Nível de desafio"] ?? l["Desafio"];
  if (!vazio(desafioBruto) && !e.desafio) erro("Etapas", l.linha, `Nível de desafio "${desafioBruto}" inválido (use Baixo, Médio ou Alto)`);
  if (!e.nome) erro("Etapas", l.linha, "Etapa sem nome");
  if (!FASES.includes(e.fase)) erro("Etapas", l.linha, `Fase "${e.fase}" inválida`);
  checarOrigem("Etapas", l, e.origemSentimento, e.fonteSentimento);
  return e;
}).sort((a, b) => a.ordem - b.ordem);
if (etapas.length !== 7) avisos.push(`Etapas: esperava 7, encontrei ${etapas.length}`);
const idEtapa = Object.fromEntries(etapas.map((e) => [e.nome, e.id]));

const funcoes = funcoesBrutas.map((l) => ({ id: slug(l["Função"]), nome: limpo(l["Função"]), descricao: limpo(l["Descrição"]) }));
// Funções de uma Prática: uma ou mais, separadas por vírgula; nomes comparados sem acento e sem caixa
// ("Vigilância" acha "Vigilancia"); uma parte que não é Função mas junta duas com " e " ("Vigilância e Mediação") vira as duas
const idFuncao = Object.fromEntries(funcoes.map((f) => [f.id, f.id]));
const funcoesDe = (v) => (limpo(v) ?? "").split(",").map((t) => t.trim()).filter(Boolean).flatMap((t) => {
  if (idFuncao[slug(t)]) return [{ id: idFuncao[slug(t)] }];
  const partes = t.split(/\s+e\s+/);
  return partes.length > 1 && partes.every((x) => idFuncao[slug(x)]) ? partes.map((x) => ({ id: idFuncao[slug(x)] })) : [{ id: null, nome: t }];
});

// Pontos de contato (25/11/2026): a aba "Pontos de contato" é a lista única (nome e descrição); em que Etapa cada um
// aparece vem da coluna "Pontos de contato" da aba Etapas (menu com várias seleções, nomes separados por vírgula).
const listaPontos = pontosBrutos.map((l) => ({ nome: limpo(l["Ponto de contato"]), descricao: limpo(l["Descrição"]), linha: l.linha })).filter((p) => p.nome);
const pontoPorChave = Object.fromEntries(listaPontos.map((p) => [slug(p.nome), p]));
const pontosContato = etapasBrutas.flatMap((l) => {
  const etapa = idEtapa[limpo(l["Etapa"])];
  return (limpo(l["Pontos de contato"]) ?? "").split(",").map((t) => t.trim()).filter(Boolean).flatMap((nome) => {
    const p = pontoPorChave[slug(nome)];
    if (!p) { erro("Etapas", l.linha, `Ponto de contato "${nome}" não está na aba Pontos de contato`); return []; }
    return [{ etapa, canal: p.nome, descricao: p.descricao, origem: null, fonte: null }];
  // na ordem da lista (e não na da seleção), para a mesma ordem em todas as Etapas
  }).sort((a, b) => listaPontos.findIndex((x) => x.nome === a.canal) - listaPontos.findIndex((x) => x.nome === b.canal));
});

let hipoteses = 0;
const praticas = praticasBrutas.flatMap((l, i) => {
  const origem = limpo(l["Origem"]);
  if (origem === "Hipótese") { hipoteses++; return []; }
  const p = {
    id: `p${i + 1}`, etapa: idEtapa[limpo(l["Etapa"])], funcoes: funcoesDe(l["Função"]).map((f) => f.id), tipo: TIPOS[limpo(l["Tipo"])],
    titulo: limpo(l["Título"]), detalhe: limpo(l["Detalhe"]), origem, fonte: limpo(l["Fonte"])
  };
  if (!p.etapa) erro("Práticas", l.linha, `Etapa "${l["Etapa"]}" não existe`);
  funcoesDe(l["Função"]).filter((f) => !f.id).forEach((f) => erro("Práticas", l.linha, `Função "${f.nome}" não existe`));
  if (!p.funcoes.length) erro("Práticas", l.linha, "Função vazia");
  p.funcao = p.funcoes[0]; // a primeira, para quem ainda lê uma só
  if (!p.tipo) erro("Práticas", l.linha, `Tipo "${l["Tipo"]}" deve ser Boa prática ou O que evitar`);
  if (!p.titulo) erro("Práticas", l.linha, "Título vazio");
  if (!p.origem) erro("Práticas", l.linha, "Origem vazia");
  checarOrigem("Práticas", l, p.origem, p.fonte);
  return [p];
});

console.log(`Etapas ${etapas.length} · Funções ${funcoes.length} · Pontos de contato ${pontosContato.length} · Práticas ${praticas.length} (${hipoteses} hipóteses fora) · Fontes ${fontes.length}`);
avisos.forEach((a) => console.warn("aviso: " + a));
if (erros.length) {
  console.error(`\n${erros.length} problema(s) na planilha; nada foi gravado:`);
  erros.forEach((e) => console.error("  • " + e));
  process.exit(1);
}
if (SO_CHECAR) { console.log("Planilha ok (só checagem)."); process.exit(0); }
if (!praticas.length) {
  console.error("A planilha ainda não tem Práticas publicáveis; mantive o conteúdo atual.");
  process.exit(1);
}
const saida = { origem: "planilha", geradoEm: new Date().toISOString(), etapas, funcoes, pontosContato, praticas, fontes: fontes.map(({ linha, ...f }) => f) };
writeFileSync(DESTINO, JSON.stringify(saida, null, 2) + "\n");
console.log("Gravado em src/data/conteudo.json");
