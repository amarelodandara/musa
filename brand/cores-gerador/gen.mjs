import {hexToRgb,rgbToOklch,maxC,toHex,wcag,apca,inGamut} from './lib.mjs';
const f3=v=>+v.toFixed(3);
const coral=rgbToOklch(hexToRgb('#FF7F50')), crim=rgbToOklch(hexToRgb('#930031'));
console.log('coral',coral.map(f3),'max',f3(maxC(coral[0],coral[2])),' crimson',crim.map(f3),'max',f3(maxC(crim[0],crim[2])));
const STEPS=[50,100,200,300,400,500,600,700,800,900,950];
const LT=[.975,.937,.893,.825,.745,.665,.585,.505,.425,.345,.27];
function ramp(name,[Lb,Cb,H],pinStep){
  const pi=STEPS.indexOf(pinStep), LTx=LT.slice(); LTx[pi]=Lb;
  const frac=Cb/maxC(Lb,H);
  return STEPS.map((s,i)=>{const L=LTx[i];
    const d=(L-Lb); const u=Math.abs(d/(d>0?(1-Lb)*1.08:Lb*1.3)); const taper=Math.max(d>0?.12:.3,1-Math.pow(u,d>0?1.6:2));
    let C= i===pi?Cb: Math.min(maxC(L,H), frac*maxC(L,H)*taper); if(i!==pi) C=Math.min(C, Cb*1.02);
    return {s,L:f3(L),C:f3(C),H:f3(H),hex:i===pi?(name==='coral'?'#FF7F50':'#930031'):toHex(L,C,H)}});
}
const R={coral:ramp('coral',coral,400),carmim:ramp('carmim',crim,800)};
// neutral: hue between, chroma small; text ramp: near grey
const Hn=crim[2]+ (coral[2]-crim[2])*.5;
R.neutro=STEPS.map((s,i)=>{const L=[.985,.962,.93,.875,.78,.68,.585,.5,.42,.33,.25][i],C=[.004,.006,.008,.01,.011,.011,.011,.01,.009,.008,.007][i];return {s,L,C,H:f3(Hn),hex:toHex(L,C,Hn)}});
R.texto=[[950,.18,.006],[900,.24,.006],[700,.42,.006],[600,.5,.005],[400,.68,.004],[50,.985,.003]].map(([s,L,C])=>({s,L,C,H:f3(crim[2]),hex:toHex(L,C,crim[2])}));
for(const [k,v] of Object.entries(R)){console.log('\n'+k);for(const x of v)console.log(String(x.s).padStart(4),x.hex,`oklch(${x.L} ${x.C} ${x.H})`,'gamut',inGamut(x.L,x.C,x.H)?'ok':'OUT')}
const W='#FFFFFF',P=R.neutro[0].hex;
const pr=(fg,bg,lab)=>console.log(lab.padEnd(34),fg,'on',bg,'WCAG',wcag(fg,bg).toFixed(2),'APCA',apca(fg,bg).toFixed(1));
console.log('\npairs');
pr('#FFFFFF','#FF7F50','white on coral');pr(R.texto[0].hex,'#FF7F50','texto-950 on coral');
for(const s of [500,600,700]){const c=R.coral.find(x=>x.s===s).hex;pr('#FFFFFF',c,'white on coral-'+s)}
pr('#FFFFFF','#930031','white on carmim-800');pr('#930031',P,'carmim-800 on neutro-50');
for(const s of [600,700]){const c=R.coral.find(x=>x.s===s).hex;pr(c,P,'coral-'+s+' text on neutro-50')}
for(const t of R.texto) pr(t.hex,P,'texto-'+t.s+' on neutro-50');
pr(R.texto[1].hex,R.neutro[1].hex,'texto-900 on neutro-100');
pr(R.texto[2].hex,R.neutro[1].hex,'texto-700 on neutro-100');
pr(R.texto[3].hex,R.neutro[2].hex,'texto-600 on neutro-200');
pr(R.texto[0].hex,R.coral[1].hex,'texto-950 on coral-100');
pr(R.carmim[8].hex,R.coral[1].hex,'carmim-800 on coral-100');pr(R.texto[0].hex,R.coral[5].hex,'texto-950 on coral-500');pr(R.texto[0].hex,R.coral[2].hex,'texto-950 on coral-200');pr(R.carmim[8].hex,R.carmim[1].hex,'carmim-800 on carmim-100');pr(R.carmim[1].hex,R.carmim[8].hex,'carmim-100 on carmim-800');pr(R.texto[0].hex,R.coral[3].hex,'texto-950 on coral-300');
pr(R.neutro[3].hex,P,'neutro-300 border on neutro-50');pr(R.neutro[4].hex,P,'neutro-400 border on neutro-50');
pr(R.coral[4].hex,P,'coral-400 focus ring on neutro-50');pr(R.carmim[6].hex,P,'carmim-700 focus on neutro-50');
import {writeFileSync} from 'node:fs';writeFileSync('ramps.json',JSON.stringify(R,null,1));
