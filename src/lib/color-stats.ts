import { Color } from "./Color";
import type { Palette } from "../stores/color-store";

/////////////// MAUREEN'S CODE ///////////////////////

export function computeStats(colors: Color[], dE_type: "dE94" | "dE" | "none") {
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
//color differences between colors the basic one.
export function deltaE(c1: Color, c2: Color) {
  const lab1 = c1.toColorSpace("lab").toChannels();
  const lab2 = c2.toColorSpace("lab").toChannels();
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  const dE = Math.sqrt(dL * dL + da * da + db * db);
  return dE;
}

//A somewhat better one. But, note this is an asymmetric function, deltaE94(c1,c2) != deltaE94(c2,c1)
function deltaE94(c1: Color, c2: Color) {
  const lab1 = c1.toColorSpace("lab").toChannels(); //.lch() returns the wrong h
  const lab2 = c2.toColorSpace("lab").toChannels();
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

// // const jsonData = require("../assets/c3-data.json");
// import jsonData from "../assets/c3-data.json";

// function c3_api() {
//   const C = c3.color.length;
//   const W = c3.terms.length;
//   const T = c3.T;
//   const A = c3.A;
//   const ccount = c3.color.count;
//   const tcount = c3.terms.count;

//   c3.count = (c: number, w: number) => T[c * W + w] || 0;
//   c3.terms.prob = (w: number, c: number) => (T[c * W + w] || 0) / tcount[w];

//   c3.terms.entropy = function (w: number) {
//     let H = 0;
//     let p;
//     for (let c = 0; c < C; ++c) {
//       p = (T[c * W + w] || 0) / tcount[w];
//       if (p > 0) H += (p * Math.log(p)) / Math.LN2;
//     }
//     return H;
//   };

//   c3.terms.perplexity = (w: any) => Math.pow(2, -c3.terms.entropy(w));

//   c3.terms.cosine = function (a: number, b: number) {
//     let sa = 0;
//     let sb = 0;
//     let sc = 0;
//     let ta: number;
//     let tb: number;
//     for (let c = 0; c < C; ++c) {
//       ta = T[c * W + a] || 0;
//       tb = T[c * W + b] || 0;
//       sa += ta * ta;
//       sb += tb * tb;
//       sc += ta * tb;
//     }
//     return sc / Math.sqrt(sa * sb);
//   };

//   c3.color.cosine = function (a: number, b: number) {
//     let sa = 0;
//     let sb = 0;
//     let sc = 0;
//     let ta: number;
//     let tb: number;
//     for (let w = 0; w < W; ++w) {
//       ta = T[a * W + w] || 0;
//       tb = T[b * W + w] || 0;
//       sa += ta * ta;
//       sb += tb * tb;
//       sc += ta * tb;
//     }
//     return sc / Math.sqrt(sa * sb);
//   };

//   c3.color.prob = (c: number, w: number) => (T[c * W + w] || 0) / ccount[c];

//   c3.color.entropy = function (c: number) {
//     let H = 0;
//     let p: number;
//     for (let w = 0; w < W; ++w) {
//       p = (T[c * W + w] || 0) / ccount[c];
//       if (p > 0) H += (p * Math.log(p)) / Math.LN2;
//     }
//     return H;
//   };

//   c3.terms.hellinger = function (a: number, b: number) {
//     let bc = 0;
//     let pa: number;
//     let pb: number;
//     let z = Math.sqrt(tcount[a] * tcount[b]);
//     for (let c = 0; c < C; ++c) {
//       pa = T[c * W + a] || 0;
//       pb = T[c * W + b] || 0;
//       bc += Math.sqrt(pa * pb);
//     }
//     return Math.sqrt(1 - bc / z);
//   };

//   c3.color.perplexity = (c: any) => Math.pow(2, -c3.color.entropy(c));

//   c3.color.hellinger = function (a: number, b: number) {
//     let bc = 0;
//     let pa: number;
//     let pb: number;
//     let z = Math.sqrt(ccount[a] * ccount[b]);
//     for (let w = 0; w < W; ++w) {
//       pa = T[a * W + w] || 0;
//       pb = T[b * W + w] || 0;
//       bc += Math.sqrt(pa * pb);
//     }
//     return Math.sqrt(1 - bc / z);
//   };

//   c3.terms.relatedTerms = function (w: number, limit: number | undefined) {
//     const c = c3.terms.center[w];
//     const list = [];
//     for (let i = 0; i < W; ++i) {
//       if (i != w) list.push({ index: i, score: A[i * W + w] });
//     }
//     list.sort(function (a, b) {
//       let ca: { de00: (arg0: any) => number };
//       let cb: { de00: (arg0: any) => number };

//       let cmp = b.score - a.score;
//       if (Math.abs(cmp) < 0.00005) {
//         // break near ties by distance between centers
//         ca = c3.terms.center[a.index];
//         cb = c3.terms.center[b.index];
//         cmp = ca.de00(c) - cb.de00(c);
//       }
//       return cmp;
//     });
//     list.unshift({ index: w, score: A[w * W + w] });
//     return limit ? list.slice(0, limit) : list;
//   };

//   c3.terms.relatedColors = function (w: number, limit: number | undefined) {
//     const list = [];
//     for (let c = 0; c < C; ++c) {
//       const s = (T[c * W + w] || 0) / ccount[c];
//       if (s > 0) list.push({ index: c, score: s });
//     }
//     list.sort(function (a, b) {
//       return b.score - a.score;
//     });
//     return limit ? list.slice(0, limit) : list;
//   };

//   c3.color.relatedTerms = function (
//     c: number,
//     limit: number | undefined,
//     minCount: number
//   ) {
//     const cc = c * W;
//     let list = [];
//     let sum = 0;
//     let s: any;
//     let cnt = c3.terms.count;
//     for (let w = 0; w < W; ++w) {
//       if ((s = T[cc + w]) !== undefined) {
//         list.push({ index: w, score: s });
//         sum += s;
//       }
//     }
//     if (minCount) {
//       list = list.filter(function (d) {
//         return cnt[d.index] > minCount;
//       });
//     }
//     list.sort(function (a, b) {
//       return b.score - a.score;
//     });
//     list.forEach(function (d) {
//       d.score /= sum;
//     });
//     return limit ? list.slice(0, limit) : list;
//   };

//   // compute representative colors
//   c3.terms.center = Array.from({ length: W }, (_, i) => i).map(function (w) {
//     const list = c3.terms
//       .relatedColors(w, 5)
//       .map(function (d: { index: string | number }) {
//         return c3.color[d.index];
//       });
//     let L = 0;
//     let a = 0;
//     let b = 0;
//     let N = list.length;
//     list.forEach(function (c: { L: any; a: any; b: any }) {
//       L += c.L;
//       a += c.a;
//       b += c.b;
//     });
//     return chroma.lab(Math.round(L / N), Math.round(a / N), Math.round(b / N));
//     // return d3.lab(Math.round(L / N), Math.round(a / N), Math.round(b / N));
//   });
// }

// function c3_init(json: {
//   color: string | any[];
//   terms: any;
//   T: string | any[];
//   A: any;
// }) {
//   let i: number;
//   let C: number;
//   let W: number;
//   let T: any[];
//   let A: any;
//   let ccount: any[];
//   let tcount: any[];

//   // parse colors
//   c3.color = [];
//   for (i = 0; i < json.color.length; i += 3) {
//     c3.color[i / 3] = chroma.lab(
//       json.color[i],
//       json.color[i + 1],
//       json.color[i + 2]
//     );
//   }
//   C = c3.color.length;

//   // parse terms
//   c3.terms = json.terms;
//   W = c3.terms.length;

//   // parse count table
//   c3.T = T = [];
//   for (let i = 0; i < json.T.length; i += 2) {
//     T[json.T[i]] = json.T[i + 1];
//   }

//   // construct counts
//   c3.color.count = ccount = [];
//   for (i = 0; i < C; ++i) ccount[i] = 0;
//   c3.terms.count = tcount = [];
//   for (i = 0; i < W; ++i) tcount[i] = 0;
//   T.forEach((_x, idx) => {
//     const c = Math.floor(idx / W);
//     const w = Math.floor(idx % W);
//     const v = T[idx] || 0;
//     ccount[c] += v;
//     tcount[w] += v;
//   });

//   // parse word association matrix
//   c3.A = A = json.A;

//   const labToString = (L: number, a: number, b: number) =>
//     [5 * Math.round(L / 5), 5 * Math.round(a / 5), 5 * Math.round(b / 5)].join(
//       ","
//     );
//   var map: Record<string, any> = {};
//   for (var c = 0; c < c3.color.length; ++c) {
//     const [L, a, b] = chroma(c3.color[c]).lab();
//     map[labToString(L, a, b)] = c;
//   }

//   function index(c: string) {
//     const [L, a, b] = chroma(c).lab();
//     const s = labToString(L, a, b);
//     return map[s];
//   }

//   c3.colorIdentity = (colorString: string) => {
//     // NOTE: entropy min/max currently hard-wired to XKCD results
//     const minE = -4.5;
//     const maxE = 0;
//     var c = index(colorString);
//     var h = (c3.color.entropy(c) - minE) / (maxE - minE);
//     var t = c3.color
//       .relatedTerms(c, 1)
//       .map((x: any) => ({ score: x.score, word: c3.terms[x.index] }));
//     var [L, a, b] = chroma(colorString).lab();
//     const z = ~~L + ", " + ~~a + ", " + ~~b;

//     return { x: colorString, c: c, h: h, terms: t, z: z };
//   };
// }

// export function colorNameDiscrimCheck(
//   colorNames: { word: string }[]
// ): false | string {
//   const colorNameCounts = colorNames.reduce((acc, colorName) => {
//     if (!acc[colorName.word]) {
//       acc[colorName.word] = 0;
//     }
//     acc[colorName.word] += 1;
//     return acc;
//   }, {} as Record<string, number>);

//   const remaining = Object.entries(colorNameCounts as Record<string, number>)
//     .filter((x) => x[1] > 1)
//     .map((x) => x[0]);
//   if (remaining.length === 0) {
//     return false;
//   }
//   const counts = remaining.map((x) => `${x} (${colorNameCounts[x]})`);
//   return `Color Name discriminability check failed. The following color names are repeated: ${counts}`;
// }

// export const c3: any = {};
// c3_init(jsonData);
// c3_api();
