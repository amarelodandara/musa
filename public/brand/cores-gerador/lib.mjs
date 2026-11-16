export const toLin=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4, toGam=c=>c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055;
export function hexToRgb(h){const n=parseInt(h.replace('#',''),16);return [(n>>16)/255,(n>>8&255)/255,(n&255)/255]}
export function rgbToOklch([r,g,b]){r=toLin(r);g=toLin(g);b=toLin(b);
const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
const L=.2104542553*l+.793617785*m-.0040720468*s,A=1.9779984951*l-2.428592205*m+.4505937099*s,B=.0259040371*l+.7827717662*m-.808675766*s;
return [L,Math.hypot(A,B),(Math.atan2(B,A)*180/Math.PI+360)%360]}
export function oklchToLinRgb(L,C,H){const a=C*Math.cos(H*Math.PI/180),b=C*Math.sin(H*Math.PI/180);
const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s]}
export const inGamut=(L,C,H)=>oklchToLinRgb(L,C,H).every(v=>v>=-1e-4&&v<=1+1e-4);
export function maxC(L,H){let lo=0,hi=.4;for(let i=0;i<30;i++){const m=(lo+hi)/2;inGamut(L,m,H)?lo=m:hi=m}return lo}
export function toHex(L,C,H){return '#'+oklchToLinRgb(L,C,H).map(v=>Math.round(Math.min(1,Math.max(0,toGam(Math.min(1,Math.max(0,v)))))*255).toString(16).padStart(2,'0')).join('').toUpperCase()}
const Y=h=>{const [r,g,b]=hexToRgb(h).map(toLin);return .2126*r+.7152*g+.0722*b};
export const wcag=(a,b)=>{const x=Y(a),y=Y(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
export function apca(txt,bg){const sY=h=>{const [r,g,b]=hexToRgb(h).map(c=>c**2.4);return .2126729*r+.7151522*g+.0721750*b};
let t=sY(txt),B=sY(bg);const clamp=y=>y>.022?y:y+(.022-y)**1.414;t=clamp(t);B=clamp(B);
let S;if(B>t){S=(B**.56-t**.57)*1.14;return S<.1?0:(S-.027)*100}else{S=(B**.65-t**.62)*1.14;return S>-.1?0:(S+.027)*100}}
