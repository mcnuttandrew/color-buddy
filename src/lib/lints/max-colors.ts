import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
import type { LintFixer } from "../linter-tools/lint-fixer";

const lint: CustomLint = {
  name: "Max Colors",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    "<": { left: { count: "colors" }, right: 11 },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.",
  failMessage: `This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10.`,
  id: "too-many-colors-built-in",
  blameMode: "single",
  subscribedFix: "fixMaxColors",
};
export default lint;

export const fixMaxColors: LintFixer = async (palette) => {
  const colors = palette.colors;
  return [{ ...palette, colors: colors.slice(0, 10) }];
};
