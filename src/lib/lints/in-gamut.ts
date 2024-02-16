import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { clipToGamut } from "../utils";

const lint: CustomLint = {
  name: "In Gamut",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "a",
      predicate: { "==": { left: { inGamut: "a" }, right: true } },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Checks if the colors are in the sRGB gamut. This is important to ensure that the colors are visible and can be displayed on most devices.",
  failMessage: `A color or colors is not in the sRGB gamut ({{blame}}). Please adjust the color so that it can be displayed on most devices.`,
  id: "gamut-check-built-in",
  blameMode: "single",
  subscribedFix: "fixGamut",
};
export default lint;

export const fixGamut: LintFixer = async (palette) => {
  const colors = palette.colors.map((color) =>
    color.fromChannels(clipToGamut(color))
  );
  return [{ ...palette, colors }];
};
