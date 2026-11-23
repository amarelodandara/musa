// Grafia do nome da marca: sempre "musà", minúsculo, com acento grave (à), qualquer que seja a forma digitada.
// O grave é escolha da marca (poética, como no logotipo), não erro: não "corrigir" para agudo.
// Troca qualquer acento no "a" (musá, musâ, musã, musä), o acento separado da letra (a + U+0300 etc.), entidades
// HTML (mus&aacute;, mus&#225;…) e maiúsculas (Musá, MUSÀ). "musa" sem acento não muda: é o nome nos caminhos e
// arquivos, e também a palavra comum ("a musa da sua visita").
// Usado por src/middleware.ts em todo HTML que o site gera.

const ACENTO = String.raw`(?:[àáâãäÀÁÂÃÄ]|[aA][̀-̈]|&(?:[aA](?:grave|acute|circ|tilde|uml));|&#(?:22[4-8]|19[2-6]);|&#[xX](?:[eE][0-4]|[cC][0-4]);)`;
const NOME = new RegExp(String.raw`(?<![\p{L}\p{N}])[mM][uU][sS]${ACENTO}(?![\p{L}\p{N}])`, "gu");

export const grafarMusa = (texto: string) => texto.replace(NOME, "musà");
