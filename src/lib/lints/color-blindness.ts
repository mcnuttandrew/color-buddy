import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "./CustomLint";

// old algorithm - https://github.dev/gka/palettes
//     let distanceNorm = colorA.symmetricDeltaE(colorB);
// if (distanceNorm < smallestPerceivableDistance) continue;
// let distanceSim = colorA.symmetricDeltaE(colorB);
// let isNotOk =
//   distanceNorm / distanceSim > ratioThreshold &&
//   distanceSim < smallestPerceivableDistance;

const blindnessLabels = {
  deuteranopia: "(ie can't see green)",
  protanopia: "(ie can't see red)",
  tritanopia: "(ie can't see blue)",
  grayscale: "",
};
const blindTypes = Object.keys(
  blindnessLabels
) as (keyof typeof blindnessLabels)[];
const lints: CustomLint[] = blindTypes.map((type) => ({
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
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
  taskTypes: ["sequential", "diverging", "categorical"],
  group: "accessibility",
  description: `All colors in a palette should be differentiable by people with ${type} ${blindnessLabels[type]}. This is because if they are not, then they will not be differentiable from each other in some contexts.`,
  level: "error" as const,
  failMessage: `This palette is not colorblind friendly for ${type} color blindness ${blindnessLabels[type]}. The following pairs are undifferentiable: ({{blame}})`,
  id: `colorblind-friendly-${type}-built-in`,
  blameMode: "pair" as const,
}));
export default lints;
