import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "color-buddy-palette";
import type { LintProgram } from "../ColorLint";
import { schema } from "../constants";

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

const testCase = {
  Thin: {
    passing: [makePalFromString(["#0084a9", "#bad", "#008000"])],
    failing: [makePalFromString(["#0084a9", "#009de5", "#8ca9fa"])],
  },
  Medium: {
    passing: [
      makePalFromString([
        "#cf5f67",
        "#468bbc",
        "#848475",
        "#c55eab",
        "#ff008c",
      ]),
    ],
    failing: [
      makePalFromString([
        "#a77865",
        "#468bbc",
        "#bc6c6c",
        "#a67873",
        "#ff008c",
      ]),
    ],
  },
  Wide: {
    passing: [
      makePalFromString([
        "#cf5f67",
        "#468bbc",
        "#848475",
        "#c55eab",
        "#ff008c",
      ]),
    ],
    failing: [
      makePalFromString([
        "#a77865",
        "#468bbc",
        "#bc6c6c",
        "#a67873",
        "#ff008c",
      ]),
    ],
  },
};

const itemSizeDescriptions = {
  Thin: "small blocks such as small circles or lines",
  Medium: "medium blocks such as bars in a bar chart or small graphics",
  Wide: "large blocks of color such as backgrounds or countries on a map",
} as const;
const keys = ["Thin", "Medium", "Wide"] as const;
const lints: LintProgram[] = keys.map((key) => {
  const p = "default";
  const s = key as keyof typeof sMap;
  const jnd = jndLabInterval(p, s);
  return {
    name: `Color Distinctness: ${key} Size Objects`,
    program: JSONToPrettyString({
      // @ts-ignore
      $schema: schema,
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
    description: `Pairs of colors in a palette should be differentiable from each other in ${key} marks. `,
    failMessage: `This palette has some colors ({{blame}}) that are close to each other in perceptual space and will not be resolvable for ${key} areas. This involves elements like ${itemSizeDescriptions[key]}`,
    id: `${key}-discrim-built-in`,
    blameMode: "pair",
    expectedPassingTests: testCase[key].passing,
    expectedFailingTests: testCase[key].failing,
    requiredTags: [],
  };
});

export default lints;
