import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
import { Color } from "../Color";
import type { Palette } from "../../stores/color-store";
import type { LintFixer } from "../linter-tools/lint-fixer";

const lint: CustomLint = {
  name: "Sequential Pal Order",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
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
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "error",
  group: "usability",
  description:
    "Sequential palettes should be ordered by lightness. This is a defining property of a sequential palette and ensures that values are understood as having an increase (or decreasing) value.",
  failMessage: `This pal should be ordered by lightness if being used as a sequential palette. {{blame}} may be to blame.`,
  id: "sequential-order-built-in",
  blameMode: "single",
  subscribedFix: "fixSequentialOrder",
};
export default lint;

const getLightness = (color: Color) => color.toColorIO().to("lab").coords[0];
export const fixSequentialOrder: LintFixer = async (palette: Palette) => {
  const colors = [...palette.colors];
  colors.sort((a, b) => getLightness(a) - getLightness(b));
  return [{ ...palette, colors }];
};
