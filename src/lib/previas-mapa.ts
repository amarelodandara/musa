// Termos do glossário que são peças do mapa: um link para eles no Guia mostra a peça redesenhada
// (src/components/guia/PreviaMapa.astro) num cartão, com a legenda: a primeira frase da definição no glossário,
// que diz para que a peça serve (não descreve o desenho).
import { gruposGlossario } from "./glossario";

export const TERMOS_COM_PREVIA = ["etapa", "fase", "camada", "nivel-de-desafio", "pensamento-do-professor", "funcao", "origem"];

const todos = gruposGlossario.flatMap((g) => g.termos.flatMap((t) => [t, ...t.subtermos]));
export const legendaPrevia = (id: string) => {
  const t = todos.find((x) => x.id === id);
  const def = (t?.paragrafos[0] ?? "").replace(/<[^>]+>/g, "");
  return def.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? def;
};
