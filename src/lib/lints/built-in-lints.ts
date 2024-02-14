import type { CustomLint } from "./CustomLint";
import type { LintProgram } from "../lint-language/lint-type";
import { JSONStringify } from "../utils";
import type { TaskType } from "./ColorLint";

const toString = (x: LintProgram) => JSONStringify(JSON.stringify(x));
// @ts-ignore
const $schema = `${location.href}lint-schema.json`;

const blindTypes = [
  "deuteranopia",
  "protanopia",
  "tritanopia",
  "grayscale",
] as const;
const blindnessLabels: Record<(typeof blindTypes)[number], string> = {
  deuteranopia: "(ie can't see green)",
  protanopia: "(ie can't see red)",
  tritanopia: "(ie can't see blue)",
  grayscale: "",
};
const BUILT_INS: CustomLint[] = [
  // https://www.sciencedirect.com/science/article/pii/S0167947308005549?casa_token=s8jmZqboaYgAAAAA:7lsAu7YUHVBTQA_eaKJ_3FFGv309684j_NTisGO9mIr3UZNIJ6hlAlxPQo04xzsowG7-dH0vzm4
  {
    name: "Avoid extreme colors",
    program: toString({
      // @ts-ignore
      $schema,
      all: {
        in: "colors",
        varb: "a",
        predicate: {
          all: {
            in: ["#000000", "#ffffff"],
            varb: "b",
            predicate: {
              not: { similar: { left: "a", right: "b", threshold: 12 } },
            },
          },
        },
      },
    }),

    taskTypes: ["sequential", "diverging", "categorical"] as const,
    level: "warning",
    group: "design",
    description: `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.`,
    failMessage: `Colors at either end of the lightness spectrum {{blame}} are hard to discriminate in some contexts, and are sometimes advised against`,
    id: "extreme-colors-built-in",
    blameMode: "single",
  },
  {
    name: "Avoid too many colors",
    program: toString({
      // @ts-ignore
      $schema,
      "<": { left: { count: "colors" }, right: 10 },
    }),
    taskTypes: ["sequential", "diverging", "categorical"] as const,
    level: "warning",
    group: "design",
    description:
      "Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.",
    failMessage: `This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10.`,
    id: "too-many-colors-built-in",
    blameMode: "single",
  },
  {
    name: "Palette does not have ugly colors",
    program: toString({
      // @ts-ignore
      $schema,
      all: {
        in: "colors",
        varb: "a",
        predicate: {
          all: {
            in: ["#56FF00", "#0010FF", "#6A7E25", "#FF00EF", "#806E28"],
            varb: "b",
            predicate: {
              ">": {
                left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },

                right: 10,
              },
            },
          },
        },
      },
    }),
    taskTypes: ["categorical"],
    description: `Colors that are close to what are known as ugly colors are sometimes advised against. See https://www.colourlovers.com/palette/1416250/The_Ugliest_Colors for more details.`,
    failMessage: `This palette has some colors (specifically {{blame}}) that are close to what are known as ugly colors`,
    level: "warning",
    group: "design",
    id: "ugly-colors-built-in",
    blameMode: "single",
  },
  ...blindTypes.map((type) => ({
    // old algorithm - https://github.dev/gka/palettes
    //     let distanceNorm = colorA.symmetricDeltaE(colorB);
    // if (distanceNorm < smallestPerceivableDistance) continue;
    // let distanceSim = colorA.symmetricDeltaE(colorB);
    // let isNotOk =
    //   distanceNorm / distanceSim > ratioThreshold &&
    //   distanceSim < smallestPerceivableDistance;
    program: toString({
      // @ts-ignore
      $schema,
      all: {
        in: "colors",
        varbs: ["a", "b"],
        where: { "!=": { left: "index(a)", right: "index(b)" } },
        predicate: {
          not: {
            similar: {
              left: { cvdSim: "a", type },
              right: { cvdSim: "b", type },
              threshold: 9,
            },
          },
        },
      },
    }),
    name: `Colorblind Friendly for ${type}`,
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    group: "accessibility",
    description: `All colors in a palette should be differentiable by people with ${type} ${blindnessLabels[type]}. This is because if they are not, then they will not be differentiable from each other in some contexts.`,
    level: "error" as const,
    failMessage: `This palette is not colorblind friendly for ${type} color blindness ${blindnessLabels[type]}. The following pairs are undifferentiable: ({{blame}})`,
    id: `colorblind-friendly-${type}-built-in`,
    blameMode: "pair" as const,
  })),

  {
    program: toString({
      all: {
        in: "colors",
        varbs: ["a", "b"],
        where: { "!=": { left: "index(a)", right: "index(b)" } },
        predicate: {
          ">": {
            left: { dist: { left: "a", right: "b" }, space: "lab" },
            right: 15,
          },
        },
      },
    }),
    name: "Mutually Distinct",
    taskTypes: ["categorical"] as const,
    group: "usability",
    level: "error",
    description: `All colors in a palette should be different from each other. This is because if they are not, then they will not be differentiable from each other in some contexts.`,
    failMessage: `Some colors in this palette ({{blame}}) are not differentiable from each other.`,
    id: "mutually-distinct-built-in",
    blameMode: "pair" as const,
  },
  {
    program: toString({
      all: {
        in: "colors",
        varb: "a",
        predicate: {
          ">": {
            left: {
              contrast: { left: "a", right: "background" },
              algorithm: "APCA",
            },
            right: 4.5,
          },
        },
      },
    }),
    name: "Background Contrast",
    taskTypes: ["sequential", "diverging", "categorical"] as const,
    level: "error",
    group: "accessibility",
    description: `All colors in a palette should have a sufficient contrast ratio with the background color. This is because if they are not, then they will not be differentiable from each other in some contexts. Valid algorithms are APCA, WCAG21, Michelson, Weber, Lstar, DeltaPhi.`,
    failMessage: `These colors ({{blame}}) do not have a sufficient contrast ratio with the background and may be hard to discriminate in some contexts.`,
    id: "background-contrast-built-in",
    blameMode: "single" as const,
  },
];

export default BUILT_INS;
