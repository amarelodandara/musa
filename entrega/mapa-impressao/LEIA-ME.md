# Mapa da Visita · pacote para a impressão

Tudo o que o mapa usa hoje na tela, no estado sem nenhuma Etapa aberta (todas as colunas lado a lado). É a base da versão impressa.

## O que tem aqui

- `referencia/mapa-estado-zero@2x.png`: o mapa inteiro como está no site, em 2× (4864 × 2600 px; em 1× são 2432 × 1300 px).
- `referencia/medidas.json`: fonte, tamanho, peso, espaçamento entre letras, cor (com o nome da cor e o hex), fundo, bordas, respiros e a caixa (x, y, largura, altura em px, em 1×) de cada peça do mapa.
- `referencia/linha-nivel-de-desafio.svg`: a linha do Nível de desafio (a curva e as três guias tracejadas) na posição exata da referência. No site a curva tem um efeito de giz (um filtro); para a impressão, use a curva lisa ou refaça o giz à mão.
- `marca/`: o logotipo em SVG.
  - `musa-tile-crimson-pequeno.svg`: o quadrado carmim com os 3 anéis, o que aparece na barra do mapa. Versão reduzida: use esta abaixo de ~128 px.
  - `musa-symbol-crimson-pequeno.svg`: o símbolo de 3 anéis, sem o quadrado.
  - `musa-symbol-crimson.svg`: o símbolo completo (8 anéis), para tamanhos grandes.
  - `musa-lockup-crimson.svg` e `musa-logotype-crimson.svg`: símbolo com o nome, e só o nome.
  - O nome da marca se escreve **musà**, com acento grave, de propósito.
- `icones/`: os ícones dos 13 pontos de contato (traço 1,6 px num quadro de 24 px, na cor coral-600 #CC4E17) e os dois marcadores das Práticas: rosto feliz = Boa prática (coral-300 #F7B39C), rosto triste = O que evitar (neutro-300 #DCD3D2).
- `avatares/`: os três rostos do Nível de desafio, em carmim-800 #930031. Na tela aparecem com 80% de opacidade, com 24 px. Feliz = Baixo, neutro (o olho) = Médio, triste = Alto.
- `cores.csv`: as 37 cores da marca, com o nome usado no site, o hex, o RGB e o valor original (OKLCH). Os hex são a conversão para sRGB; para a gráfica, peça a prova de cor da coral (#FF7F50) e da carmim (#930031), que são as cores fixas da marca.

## Fontes (todas gratuitas, Google Fonts)

- **Inter** (variável, com tamanho óptico): corpo do mapa, números, pills.
- **Inter Tight**: os nomes das Fases (Antes, Durante, Depois da visita).
- **DM Sans**: rótulos das linhas (Etapas, Ações do professor…) e o título "Mapa da Visita".

Baixe em fonts.google.com. No mapa, o número da Etapa usa Inter Light (300).

## Medidas principais (em 1×)

- Coluna dos rótulos: 192 px. Cada Etapa: 320 px. Total: 2432 px de largura.
- Faixa das Fases: 32 px de altura. Topo de cada Etapa: 90 px, com o número e o nome encostados embaixo.
- Linhas da grade: 1 px. As colunas se alternam: uma no fundo neutro-50 (#FDF9F9), a seguinte num tom entre neutro-50 e neutro-100 (≈ #FAF5F4).

## Conteúdo

O texto de cada Etapa, Ação do professor, ponto de contato e Prática vem da planilha "musá · Conteúdo do Mapa da Visita". Se algo mudar na planilha, a referência precisa ser gerada de novo.
