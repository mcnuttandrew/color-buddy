import { JSONToPrettyString, makePalFromString } from "../utils";
import type { CustomLint } from "../ColorLint";

import { Color } from "../Color";
import type { ColorWrap } from "../../types";
import type { LintFixer } from "../linter-tools/lint-fixer";

const middleIndex = { "//": { left: { count: "colors" }, right: 2 } };
const leftFilter = {
  filter: "colors",
  varb: "x",
  func: { "<": { left: "index(x)", right: middleIndex } },
};
const rightFilter = {
  filter: "colors",
  varb: "x",
  func: { ">": { left: "index(x)", right: middleIndex } },
};
const middlePred = {
  left: { "lab.l": { middle: "colors" } },
  right: { "lab.l": "z" },
};
const allLighter = {
  all: {
    in: "colors",
    varb: "z",
    where: { "!=": { left: "index(z)", right: middleIndex } },
    predicate: { ">": middlePred },
  },
};
const allDarker = {
  all: {
    in: "colors",
    varb: "z",
    where: { "!=": { left: "index(z)", right: middleIndex } },
    predicate: { "<": middlePred },
  },
};
const lint: CustomLint = {
  name: "Diverging Palettes order",
  program: JSONToPrettyString({
    $schema: `${location.href}lint-schema.json`,
    and: [
      // order
      {
        "==": {
          left: { sort: leftFilter, varb: "y", func: { "lab.l": "y" } },
          right: { map: leftFilter, varb: "y", func: { "lab.l": "y" } },
        },
      },
      {
        "==": {
          left: { sort: rightFilter, varb: "y", func: { "lab.l": "y" } },
          right: {
            reverse: {
              map: rightFilter,
              varb: "y",
              func: { "lab.l": "y" },
            },
          },
        },
      },
      // darkest or lightest is in the middle

      { or: [allLighter, allDarker] },
    ],
  }),

  taskTypes: ["diverging"] as const,
  requiredTags: [],
  level: "error",
  group: "usability",
  description: `Diverging palettes should have a middle color that is the lightest or darkest color. This is because if they are not, then they will not be differentiable from each other in some contexts.`,
  failMessage: `This palette should have a middle color that is the lightest or darkest color, from which the other colors grow darker or lighter  respectively.`,
  id: "extreme-colors-built-in",
  blameMode: "none",
  subscribedFix: "fixDivergingOrder",
  expectedPassingTests: [
    makePalFromString(["#ff7e0e"]),
    makePalFromString([
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#fff",
      "#e0e0e0",
      "#bababa",
      "#878787",
      "#4d4d4d",
      "#1a1a1a",
    ]),
    makePalFromString(["#67001f", "#fff", "#1a1a1a"]),
  ],
  expectedFailingTests: [
    makePalFromString([
      "#000000",
      "#ffffff",
      "#ff7e0e",
      "#00ff00",
      "#0084a9",
      "#0000ff",
    ]),
    makePalFromString(["#be4704", "#008000", "#801242"]),
  ],
};
export default lint;

export const fixDivergingOrder: LintFixer = async (palette) => {
  // figure out if its centered on a light color or a dark color?
  // a dumb hueristic is just look at what the center color is in lab space, and see if its darker or lighter than most colors

  let colors = [...palette.colors];
  const sortByLum = (a: ColorWrap<Color>, b: ColorWrap<Color>) => {
    const aL = a.color.luminance();
    const bL = b.color.luminance();
    if (aL === bL) return 0;
    return aL > bL ? 1 : -1;
  };
  const leftColors = [colors.at(-1)!];
  const rightColors = [colors.at(-2)!];
  for (let i = 0; i < colors.length - 2; i++) {
    const color = colors[i];
    const leftColor = leftColors.at(-1)!;
    const rightColor = rightColors.at(-1)!;
    if (
      color.color.deltaE(leftColor.color) < color.color.deltaE(rightColor.color)
    ) {
      leftColors.push(color);
    } else {
      rightColors.push(color);
    }
  }
  colors = [
    ...leftColors.sort(sortByLum),
    ...rightColors.sort(sortByLum).reverse(),
  ];
  return [{ ...palette, colors }];
};
