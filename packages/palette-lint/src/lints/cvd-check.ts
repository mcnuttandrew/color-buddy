import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "color-buddy-palette";
import type { LintProgram } from "../ColorLint";
import { schema } from "../constants";

// old algorithm - https://github.dev/gka/palettes
//     let distanceNorm = colorA.symmetricDeltaE(colorB);
// if (distanceNorm < smallestPerceivableDistance) continue;
// let distanceSim = colorA.symmetricDeltaE(colorB);
// let isNotOk =
//   distanceNorm / distanceSim > ratioThreshold &&
//   distanceSim < smallestPerceivableDistance;

const cvdLabels = {
  // deuteranopia: "(ie can't see green)",
  // protanopia: "(ie can't see red)",
  // tritanopia: "(ie can't see blue)",
  deuteranopia: "(effects 0.56% of population)",
  protanopia: "(effects 0.59% of population)",
  tritanopia: "",
  grayscale: "",
};
const cvdTypes = Object.keys(cvdLabels) as (keyof typeof cvdLabels)[];
const tableau10 = [
  "#0078b4",
  "#ff7e0e",
  "#3d9f2f",
  "#da2827",
  "#8c69bc",
  "#8e564b",
  "#e179c1",
  "#7f7f7f",
  "#c4bc27",
  "#00becf",
];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lints: LintProgram[] = cvdTypes.map((type) => ({
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  name:
    type === "grayscale"
      ? "Right in black and white"
      : `${capitalize(type)}-friendly`,
  taskTypes: ["sequential", "diverging", "categorical"],
  group: "contrast-accessibility",
  description: `All colors in a palette should be differentiable by people with ${type} ${cvdLabels[type]}. This is because if they are not, then they will not be differentiable from each other in some contexts.`,
  level: "error" as const,
  failMessage:
    type === "grayscale"
      ? `This palette may not work in black and white. The following pairs are hard to tell the difference between: ({{blame}})`
      : `This palette is not friendly for people with ${type} color vision deficiency. The following pairs are undifferentiable: ({{blame}})`,
  id: `cvd-friendly-${type}-built-in`,
  blameMode: "pair" as const,
  expectedPassingTests: [
    makePalFromString(["#000000", "#ffffff", "#ff0000", "#0000ff"]),
  ],
  expectedFailingTests: [makePalFromString(tableau10)],
  requiredTags: [],
}));
export default lints;
