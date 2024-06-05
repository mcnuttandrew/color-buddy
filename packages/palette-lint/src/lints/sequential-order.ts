import { JSONToPrettyString, makePalFromString } from "../utils";
import type { CustomLint } from "../ColorLint";
import { Color } from "../Color";
import type { Palette } from "../types";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { schema } from "../constants";

const lint: CustomLint = {
  name: "Sequential Palette Order",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    or: [
      {
        "==": {
          left: { sort: "colors", varb: "x", func: { "lch.l": "x" } },
          right: { map: "colors", varb: "x", func: { "lch.l": "x" } },
        },
      },
      {
        "==": {
          left: { sort: "colors", varb: "x", func: { "lch.l": "x" } },
          right: {
            reverse: { map: "colors", varb: "x", func: { "lch.l": "x" } },
          },
        },
      },
    ],
  }),
  taskTypes: ["sequential"] as const,
  level: "error",
  group: "usability",
  requiredTags: [],
  description:
    "Sequential palettes should be ordered by lightness. This is a defining property of a sequential palette and ensures that values are understood as having an increase (or decreasing) value.",
  failMessage: `This palette should be ordered by lightness if being used as a sequential palette. {{blame}} may be to blame.`,
  id: "sequential-order-built-in",
  blameMode: "single",
  subscribedFix: "fixSequentialOrder",
  expectedPassingTests: [
    makePalFromString(["#0084a9", "#009de5", "#5fb1ff", "#bbc3ff", "#ecddff"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#0084a9", "#009de5", "#5fb1ff", "#ecddff", "#bbc3ff"]),
  ],
};
export default lint;

const getLightness = (color: Color) => color.toColorIO().to("lab").coords[0];
export const fixSequentialOrder: LintFixer = async (palette: Palette) => {
  const colors = [...palette.colors];
  colors.sort((a, b) => getLightness(a.color) - getLightness(b.color));
  return [{ ...palette, colors }];
};
