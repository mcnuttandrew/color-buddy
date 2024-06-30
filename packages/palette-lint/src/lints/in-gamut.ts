import { JSONToPrettyString } from "../utils";
import { makePalFromString, clipToGamut } from "@color-buddy/palette";
import type { LintProgram } from "../ColorLint";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { schema } from "../constants";

const lint: LintProgram = {
  name: "In Gamut",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  requiredTags: [],
  subscribedFix: "fixGamut",
  expectedPassingTests: [
    makePalFromString(["#0084a9", "#009de5", "#8ca9fa", "#ff0000"]),
  ],
  expectedFailingTests: [makePalFromString(["lab(50.625% -91.737 -88.303)"])],
};
export default lint;

export const fixGamut: LintFixer = async (palette) => {
  const colors = palette.colors.map((color) => ({
    ...color,
    color: color.color.fromChannels(clipToGamut(color.color)),
  }));
  return [{ ...palette, colors }];
};
