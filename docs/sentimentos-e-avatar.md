# Sentimentos e avatar (rascunho, em aberto)

Status: **em aberto**. Esta é a lógica proposta para a Camada Sentimentos; a lista final de sentimentos e os humores do avatar ainda não foram decididos.

## O que já está decidido

- Cada Etapa tem um **sentimento nomeado**, que vem da pesquisa (não é calculado a partir das Práticas).
- O sentimento é ilustrado pelo **avatar do musá** (o olho, `brand/musa-eye.js`) com o humor correspondente.
- Cada Etapa tem também um **Pensamento do professor**: uma frase curta em primeira pessoa.
- Uma **linha** liga as Etapas. A altura de cada ponto vem do peso do sentimento daquela Etapa, então linha, avatar e rótulo contam sempre a mesma história.
- A linha pode ser **mostrada ou escondida** por completo. Não existe a opção "linha neutra".
- Etapa sem sentimento preenchido aparece como **ponto vazio** na linha, nunca com um valor inventado.

## Como entra na planilha

Na aba **Etapas**:

| Coluna | Conteúdo |
|---|---|
| Sentimento | um valor da lista fechada (menu de opções) |
| Pensamento do professor | frase curta em primeira pessoa |
| Origem / Fonte | de onde vem o sentimento, como nas Práticas |

Cada sentimento da lista tem um **peso** (posição na linha) e um **humor do avatar**. Essa tabela fica fixa no código ou numa aba própria da planilha.

## Proposta de lista (não decidida)

| Sentimento | Peso | Avatar |
|---|---|---|
| Animado | +2 | feliz |
| Confiante | +1 | feliz |
| Tranquilo | 0 | neutro |
| Inseguro | −1 | triste |
| Frustrado | −2 | triste |

- Hoje o avatar tem três humores: neutro, feliz e triste. A proposta acima não exige humores novos; dois sentimentos podem dividir o mesmo avatar, porque o rótulo escrito desfaz a dúvida.
- Alternativa: criar humores novos (ansioso, surpreso…). É mais expressivo, mas custa desenho e animação.
- As palavras devem vir do que apareceu nas entrevistas.

## Falta decidir

1. A lista final de sentimentos e as palavras exatas.
2. O peso de cada um.
3. Se o avatar ganha humores novos ou fica com neutro, feliz e triste.
4. Onde a tabela sentimento → peso → avatar vive (código ou aba da planilha).
