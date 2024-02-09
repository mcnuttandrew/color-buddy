import type { CustomLint } from "../lib/lints/CustomLint";
import type { TaskType } from "../lib/lints/ColorLint";
import { JSONStringify } from "../lib/utils";

const toString = (x: any) => JSONStringify(JSON.stringify(x));
const $schema = `${location.href}lint-schema.json`;
const BUILT_INS: CustomLint[] = [
  // https://www.sciencedirect.com/science/article/pii/S0167947308005549?casa_token=s8jmZqboaYgAAAAA:7lsAu7YUHVBTQA_eaKJ_3FFGv309684j_NTisGO9mIr3UZNIJ6hlAlxPQo04xzsowG7-dH0vzm4
  {
    program: toString({
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
    name: "Avoid extreme colors",
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    level: "warning",
    group: "design",
    description: `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.`,
    failMessage: `Colors at either end of the lightness spectrum {{blame}} are hard to discriminate in some contexts, and are sometimes advised against`,
    id: "extreme-colors-built-in",
  },
  {
    name: "Avoid too many colors",
    program: toString({
      $schema,
      "<": { left: { count: "colors" }, right: 10 },
    }),
    taskTypes: ["sequential", "diverging", "categorical"] as TaskType[],
    level: "warning",
    group: "design",
    description:
      "Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.",
    failMessage: `This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10.`,
    id: "too-many-colors-built-in",
  },
  {
    name: "Palette does not have ugly colors",
    program: toString({
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
    description: `!!Colors that are close to what are known as ugly colors are sometimes advised against. See https://www.colourlovers.com/palette/1416250/The_Ugliest_Colors for more details.`,
    failMessage: `This palette has some colors (specifically {{blame}}) that are close to what are known as ugly colors`,
    level: "warning",
    group: "design",
    id: "ugly-colors-built-in",
  },
];

export default BUILT_INS;
