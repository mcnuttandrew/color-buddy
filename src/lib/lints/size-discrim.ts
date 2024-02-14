import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
// based on
// https://github.com/connorgr/d3-jnd/blob/master/src/jnd.js

const A = { l: 10.16, a: 10.68, b: 10.7 };
const B = { l: 1.5, a: 3.08, b: 5.74 };
const nd = (p: number, s: number) => ({
  l: p * (A.l + B.l / s),
  a: p * (A.a + B.a / s),
  b: p * (A.b + B.b / s),
});

const sMap = {
  Thin: 0.1,
  Medium: 0.5,
  Wide: 1.0,
  default: 0.1,
};
const pMap = {
  conservative: 0.8,
  default: 0.5,
};
type pType = keyof typeof pMap | number;
type sType = keyof typeof sMap | number;
function jndLabInterval(p: pType, s: sType) {
  const pVal = typeof p === "number" ? p : pMap[p] || pMap["default"];
  const sVal = typeof s === "number" ? s : sMap[s] || sMap["default"];
  return nd(pVal, sVal);
}

const lints: CustomLint[] = ["Thin", "Medium", "Wide"].map((key) => {
  const p = "default";
  const s = key as keyof typeof sMap;
  const jnd = jndLabInterval(p, s);
  return {
    name: `Works for ${key} marks`,
    program: JSONToPrettyString({
      // @ts-ignore
      $schema: `${location.href}lint-schema.json`,
      all: {
        in: "colors",
        varbs: ["x", "y"],
        where: { "!=": { left: "index(x)", right: "index(y)" } },
        predicate: {
          // this being or is real important
          or: [
            {
              ">": {
                left: {
                  absDiff: { left: { "lab.l": "x" }, right: { "lab.l": "y" } },
                },
                right: jnd.l,
              },
            },
            {
              ">": {
                left: {
                  absDiff: { left: { "lab.a": "x" }, right: { "lab.a": "y" } },
                },
                right: jnd.a,
              },
            },
            {
              ">": {
                left: {
                  absDiff: { left: { "lab.b": "x" }, right: { "lab.b": "y" } },
                },
                right: jnd.b,
              },
            },
          ],
        },
      },
    }),
    taskTypes: ["sequential", "diverging", "categorical"] as const,
    level: "warning",
    group: "usability",
    description: `Pairs of colors in a palette should be differentiable from each other in ${key} lines. `,
    failMessage: `This palette has some colors ({{blame}}) that are close to each other in perceptual space and will not be resolvable for ${key} areas.`,
    id: `${key}-discrim-built-in`,
    blameMode: "pair",
  };
});

export default lints;
