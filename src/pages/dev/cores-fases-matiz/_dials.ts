// Painel DialKit do playground /dev/cores-fases-matiz (1ª tentativa, guardada para o dossiê). Três combinações (A, B, C):
// em cada uma, "Antes" ganha uma cor nova (matiz e intensidade), na mesma escada de claridade do coral, para ficar do
// mesmo peso das outras duas; Durante e Depois escolhem entre as famílias que já existem.
import { createDialKit, createDialRoot } from "dialkit/vanilla";
import "dialkit/vanilla/styles.css";

// claridade (L) e croma (C) do coral por degrau: a família nova segue a mesma escada
const ESCADA: Record<string, [number, number]> = {
  "100": [0.937, 0.014], "200": [0.893, 0.036], "400": [0.7351, 0.168], "800": [0.425, 0.119], "900": [0.345, 0.09], "950": [0.27, 0.07]
};
const nova = (h: number, k: number) =>
  Object.fromEntries(Object.entries(ESCADA).map(([d, [l, c]]) => [d, `oklch(${l} ${(c * k).toFixed(3)} ${h})`]));
const existente = (fam: string) => Object.fromEntries(Object.keys(ESCADA).map((d) => [d, `var(--${fam}-${fam === "coral" && d === "950" ? "900" : d})`]));
const FAMILIAS = ["coral", "carmim"];

createDialRoot({ position: "top-right", theme: "light", defaultOpen: true });
const combo = (h: number, k: number, durante: string, depois: string) => ({
  matizDoAntes: [h, 0, 360, 1],
  intensidadeDoAntes: [k, 0.3, 1.6, 0.05],
  durante: { type: "select", options: FAMILIAS, default: durante },
  depois: { type: "select", options: FAMILIAS, default: depois }
});
const kit = createDialKit("Cores das fases: matiz", {
  a: combo(250, 0.8, "coral", "carmim"),
  b: combo(160, 0.8, "coral", "carmim"),
  c: combo(85, 0.9, "coral", "carmim")
}, { id: "musa-cores-fases-v1", persist: true });

function aplicar(v: Record<string, any>) {
  for (const c of ["a", "b", "c"]) {
    const o = v[c];
    const cores: Record<string, Record<string, string>> = {
      antes: nova(o.matizDoAntes, o.intensidadeDoAntes),
      durante: existente(o.durante),
      depois: existente(o.depois)
    };
    document.querySelectorAll<HTMLElement>(`[data-combo="${c}"] [data-fase]`).forEach((el) => {
      const fam = cores[el.dataset.fase!];
      for (const [d, cor] of Object.entries(fam)) el.style.setProperty(`--f${d}`, cor);
    });
  }
}
aplicar(kit.getValues());
kit.subscribe(aplicar);
