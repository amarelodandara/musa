<p align="center">
  <img src="public/brand/assets/musa-lockup-crimson.svg" alt="musá" width="220">
</p>

<p align="center">
  A visita escolar inteira, do ponto de vista da escola, para quem trabalha em museus.
</p>

<p align="center">
  <a href="https://usemusa.app">usemusa.app</a>
</p>

---

O **musá** é uma ferramenta gratuita que mostra para equipes de museus a visita escolar inteira: antes, durante e depois do dia no museu, com as práticas que tendem a ajudar ou atrapalhar em cada etapa.

A peça principal é o **Mapa da Visita**, uma grade que cruza as Etapas da visita com cinco Camadas de conteúdo (Sentimentos, Ações da escola, Pontos de contato, Boas práticas e O que evitar). O mapa pode ser filtrado por Função e baixado em PDF para impressão em A1, A2 e A4.

Não tem cadastro nem backend: o site é estático e o que a pessoa marca fica só no navegador dela.

## Sumário

- [Como rodar](#como-rodar)
- [Comandos](#comandos)
- [Como o conteúdo chega ao site](#como-o-conteúdo-chega-ao-site)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Marca](#marca)
- [Publicação](#publicação)
- [Documentação](#documentação)
- [Licença](#licença)

## Como rodar

Precisa de Node.js 24 (a versão está em `.nvmrc`).

```sh
nvm use          # opcional, se usar nvm
npm install
npm run dev      # http://127.0.0.1:4321
```

Em desenvolvimento aparecem painéis de revisão (Agentation e DialKit) que não vão para o site publicado.

Para gerar os PDFs é preciso o Chromium do Playwright, instalado uma vez:

```sh
npx playwright install chromium
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o site em modo de desenvolvimento. |
| `npm run build` | Gera o site estático em `dist/`. |
| `npm run preview` | Serve o `dist/` localmente. |
| `npm run conteudo` | Baixa a planilha, valida e grava `src/data/conteudo.json`. |
| `npm run conteudo:checar` | Só valida a planilha, sem gravar nada. |
| `npm run pdfs` | Faz o build, gera os PDFs do mapa em `public/arquivos/` e avisa se algum conteúdo transbordou. |
| `npm run marca` | Regera os SVGs da marca e a página de marca a partir da geometria. |

Quem usa o [Solo](https://soloterm.com) tem esses mesmos comandos prontos em `solo.yml`.

## Como o conteúdo chega ao site

O conteúdo do mapa (Etapas, Funções, Pontos de contato, Práticas e Fontes) é escrito numa planilha do Google Sheets, que é a fonte única. O site nunca consulta a planilha enquanto alguém navega: ele lê um retrato congelado, commitado no repositório.

```
Planilha do Google Sheets
        │  npm run conteudo   (baixa, valida e grava)
        ▼
src/data/conteudo.json  ──►  commit  ──►  site estático
        │
        │  npm run pdfs
        ▼
public/arquivos/*.pdf
```

Para publicar uma mudança de conteúdo:

1. Editar a planilha.
2. `npm run conteudo:checar` e corrigir o que aparecer.
3. `npm run conteudo` para gravar o JSON.
4. `npm run pdfs` para atualizar os PDFs.
5. Conferir o diff, commitar e subir.

Linhas que começam com `Exemplo:` e Práticas com Origem `Hipótese` ficam de fora. A planilha precisa estar compartilhada como "qualquer pessoa com o link pode ver". Os motivos estão no [ADR 0002](docs/adr/0002-conteudo-no-google-sheets.md) e no [ADR 0004](docs/adr/0004-pdfs-gerados-na-publicacao.md).

## Estrutura do projeto

```
src/
  pages/            páginas do site (início, mapa, sobre, baixar)
    imprimir/       modelo de impressão usado pelos PDFs
    dev/            páginas de revisão, só em desenvolvimento
  components/       cabeçalho, rodapé, abertura, marca
  layouts/          layout base
  lib/conteudo.ts   leitura e tipos do conteúdo
  data/             conteudo.json gerado da planilha (não editar à mão)
  scripts/          JavaScript do mapa interativo
  styles/           Tailwind e estilos do site
public/
  brand/            marca: geometria, cores, tipografia, SVGs e página de marca
  arquivos/         PDFs do mapa para baixar
  scripts/          animação de abertura e navegação
scripts/            importação da planilha e geração dos PDFs
docs/adr/           registros de decisão
GLOSSARY.md         vocabulário do domínio
```

Stack: [Astro](https://astro.build) com saída estática, [Tailwind CSS v4](https://tailwindcss.com) e [Playwright](https://playwright.dev) para os PDFs. Só a página do mapa leva JavaScript no navegador.

## Marca

A marca vive em `public/brand/`. Os SVGs em `public/brand/assets/` são gerados a partir de `musa-geometry.js` com `npm run marca`; não edite os SVGs à mão.

- `cores.css`: escala de cores da marca.
- `tipografia.css`: DM Sans nos títulos e Inter Tight no texto.
- `marca.html`: página de marca, gerada a partir de `marca.src.html`.

O nome se escreve **musá** em qualquer texto e `musa`, sem acento, em caminhos, pastas e nomes de pacote.

## Publicação

O site é publicado no [Vercel](https://vercel.com), ligado a este repositório: cada push na `main` vai para o ar em [usemusa.app](https://usemusa.app), e cada pull request ganha uma prévia. O CI do GitHub confere se o build passa.

## Documentação

- [`GLOSSARY.md`](GLOSSARY.md): o vocabulário do projeto (Visita, Etapa, Camada, Prática, Origem…). Use esses termos em código, issues e textos.
- [`docs/adr/`](docs/adr/): as decisões de arquitetura e por que foram tomadas.
- [`AGENTS.md`](AGENTS.md): instruções para agentes de código.

Bugs e sugestões vão para as [issues](https://github.com/amarelodandara/musa/issues).

## Licença

- Código: [MIT](LICENSE).
- Conteúdo do Mapa da Visita, textos do site, PDFs e marca: [CC BY 4.0](LICENSE-CONTEUDO.md). Pode usar, adaptar e compartilhar, desde que dê o crédito ao musá.
