import chroma from "chroma-js";
import type { Color as ChromaColor } from "chroma-js";
import { Color, toColorSpace } from "./Color";
import type { Palette } from "../stores/color-store";

/////////////// MAUREEN'S CODE ///////////////////////

export function computeStats(
  colors: ChromaColor[],
  dE_type: "dE94" | "dE" | "none"
) {
  if (dE_type == "none") return null;
  const stats = { dE: [] as number[], minE: 0, maxE: 0, aveE: 0, totalE: 0 };
  let prev = colors[0];
  let total = 0;
  for (let i = 1; i < colors.length; i++) {
    if (dE_type == "dE94") {
      stats.dE[i - 1] = deltaE94(prev, colors[i]);
    } else {
      stats.dE[i - 1] = deltaE(prev, colors[i]);
    }
    total = total + stats.dE[i - 1];
    prev = colors[i];
    stats.dE[i - 1] = Math.round(stats.dE[i - 1] * 10) / 10.0;
  }
  stats.minE = Math.min(...stats.dE);
  stats.maxE = Math.max(...stats.dE);
  stats.aveE = Math.round(total / stats.dE.length);
  stats.totalE = Math.round(total);
  return stats;
}
//color differences between chroma.js colors the basic one.
export function deltaE(c1: ChromaColor, c2: ChromaColor) {
  const lab1 = c1.lab();
  const lab2 = c2.lab();
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  const dE = Math.sqrt(dL * dL + da * da + db * db);
  return dE;
}

//A somewhat better one. But, note this is an asymmetric function, deltaE94(c1,c2) != deltaE94(c2,c1)
function deltaE94(c1: ChromaColor, c2: ChromaColor) {
  const lab1 = c1.lab(); //.lch() returns the wrong h
  const lab2 = c2.lab();
  const C1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]); //sqrt(a*a+b*b)
  const C2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]); //sqrt(a*a+b*b)
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  const dC = C1 - C2;

  //various weights. There are also kL, kC, kH, but they are all 1.0
  const K1 = 0.045;
  const K2 = 0.015;
  const SL = 1;
  const SC = 1 + K1 * C1; //note the dependency on C1 only
  const SH = 1 + K2 * C1;
  //these factors are dV/SV, will distance them below
  const fdL = (lab1[0] - lab2[0]) / SL;
  const fdC = (C1 - C2) / SC;
  const fdH = Math.sqrt(da * da + db * db - dC * dC) / SH;
  const dE94 = Math.sqrt(fdL * fdL + fdC * fdC + fdH * fdH);
  return dE94;
}

/////////// JEFF'S CODE ///////////////////////
