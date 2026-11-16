import {readFileSync,writeFileSync} from 'node:fs';import {wcag,apca,hexToRgb,rgbToOklch} from './lib.mjs';
const R=JSON.parse(readFileSync('ramps.json','utf8'));
const pinned={'coral-400':'#FF7F50','carmim-800':'#930031'};
const ok=(x,name)=>{if(pinned[name]){const [L,C,H]=rgbToOklch(hexToRgb(pinned[name]));return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(3)})`}return `oklch(${x.L} ${x.C} ${x.H})`};
const keep={coral:[100,200,300,400,500,600,700,800,900],carmim:[100,200,300,400,500,600,700,800,900,950],neutro:[50,100,200,300,400,500,600,700,800,900,950],texto:[950,900,700,600,400,50]};
const hex={};let prim='';
for(const k of Object.keys(keep)){prim+=`\n  /* ${k} */\n`;for(const x of R[k]){if(!keep[k].includes(x.s))continue;const n=`${k}-${x.s}`;hex[n]=pinned[n]||x.hex;prim+=`  --${n}: ${ok(x,n)};${' '.repeat(Math.max(1,34-ok(x,n).length))}/* ${hex[n]}${pinned[n]?' · cor da marca, fixa':''} */\n`}}
const sem=[
['Superfícies',[['--cor-fundo-pagina','neutro-50'],['--cor-fundo-superficie','neutro-100'],['--cor-fundo-afundado','neutro-200'],['--cor-fundo-inverso','carmim-800']]],
['Texto',[['--cor-texto-titulo','texto-950'],['--cor-texto-corpo','texto-900'],['--cor-texto-secundario','texto-700'],['--cor-texto-terciario','texto-600'],['--cor-texto-desabilitado','texto-400'],['--cor-texto-inverso','texto-50']]],
['Bordas',[['--cor-borda-separador','neutro-300'],['--cor-borda','neutro-600'],['--cor-borda-forte','neutro-800'],['--cor-borda-foco','carmim-700']]],
['Principal: coral (ação, destaque)',[['--cor-principal-sutil','coral-100'],['--cor-principal-sutil-hover','coral-200'],['--cor-principal-borda','coral-300'],['--cor-principal-solido','coral-400'],['--cor-principal-solido-hover','coral-500'],['--cor-principal-texto','coral-700'],['--cor-texto-sobre-principal','texto-950']]],
['Secundária: carmim (marca, links, inverso)',[['--cor-secundaria-sutil','carmim-100'],['--cor-secundaria-borda','carmim-300'],['--cor-secundaria-solido','carmim-800'],['--cor-secundaria-solido-hover','carmim-900'],['--cor-secundaria-texto','carmim-800'],['--cor-secundaria-texto-hover','carmim-950'],['--cor-texto-sobre-secundaria','texto-50']]]];
let semc='';for(const [g,items] of sem){semc+=`\n  /* ${g} */\n`;for(const [t,p] of items)semc+=`  ${t}: var(--${p});\n`}
const css=`/*
 * musá — cores da interface.
 * Duas camadas: primitivas (rampas por matiz e passo) e semânticas (por função).
 * Componentes usam só as semânticas.
 *
 * Coral #FF7F50 é a principal e carmim #930031 a secundária, ambas fixas na rampa
 * (coral no passo 400, carmim no 800). Cada rampa mantém o próprio matiz do início ao fim.
 * O neutro tem um leve tom entre os dois matizes. O texto tem rampa própria, quase cinza.
 *
 * Coral é clara (L 0,735): texto branco sobre ela mede 2,50:1 e reprova.
 * Por isso o botão coral leva texto escuro (texto-950, 7,52:1).
 * Gerado em ${new Date().toISOString().slice(0,10)}; contrastes medidos em cores.md.
 */
:root {${prim}
  /* ---- semânticas ---- */${semc}}
`;
writeFileSync('/Users/nicolydandara/Projects/musa/brand/cores.css',css);
// measure every semantic pair that renders
const v=t=>{for(const [,items] of sem)for(const [n,p] of items)if(n===t)return hex[p]};
const pairs=[
['Título','--cor-texto-titulo','--cor-fundo-pagina','texto'],['Corpo','--cor-texto-corpo','--cor-fundo-pagina','texto'],['Corpo em superfície','--cor-texto-corpo','--cor-fundo-superficie','texto'],
['Secundário','--cor-texto-secundario','--cor-fundo-pagina','texto'],['Secundário em superfície','--cor-texto-secundario','--cor-fundo-superficie','texto'],['Terciário','--cor-texto-terciario','--cor-fundo-pagina','texto'],['Terciário em afundado','--cor-texto-terciario','--cor-fundo-afundado','texto'],['Desabilitado','--cor-texto-desabilitado','--cor-fundo-pagina','isento'],
['Botão coral','--cor-texto-sobre-principal','--cor-principal-solido','texto'],['Botão coral hover','--cor-texto-sobre-principal','--cor-principal-solido-hover','texto'],['Texto em destaque coral sutil','--cor-texto-corpo','--cor-principal-sutil','texto'],['Texto coral','--cor-principal-texto','--cor-fundo-pagina','texto'],
['Botão carmim','--cor-texto-sobre-secundaria','--cor-secundaria-solido','texto'],['Link carmim','--cor-secundaria-texto','--cor-fundo-pagina','texto'],['Link em superfície','--cor-secundaria-texto','--cor-fundo-superficie','texto'],['Texto em fundo inverso','--cor-texto-inverso','--cor-fundo-inverso','texto'],
['Borda de controle','--cor-borda','--cor-fundo-pagina','ui'],['Anel de foco','--cor-borda-foco','--cor-fundo-pagina','ui'],['Botão coral contra a página','--cor-principal-solido','--cor-fundo-pagina','ui'],['Separador','--cor-borda-separador','--cor-fundo-pagina','divisor']];
let md='| Par | Texto | Fundo | WCAG | APCA Lc | Exigência |\n|---|---|---|---|---|---|\n';
for(const [lab,a,b,kind] of pairs){const A=v(a),B=v(b),w=wcag(A,B),l=apca(A,B);const req=kind==='texto'?(w>=4.5?'passa AA 4,5':'**reprova 4,5**'):kind==='ui'?(w>=3?'passa 3:1':'**reprova 3:1**'):kind==='isento'?'isento (desabilitado)':'só precisa ser visível';md+=`| ${lab} | \`${a}\` ${A} | \`${b}\` ${B} | ${w.toFixed(2)}:1 | ${l.toFixed(1)} | ${req} |\n`}
writeFileSync('table.md',md);console.log(md);
