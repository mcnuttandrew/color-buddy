import { JSONToPrettyString, makePalFromString } from "../utils";
import type { CustomLint } from "../ColorLint";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { schema } from "../constants";

const lint: CustomLint = {
  name: "Max Colors",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  requiredTags: [],
  expectedPassingTests: [
    makePalFromString(["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"]),
  ],
  expectedFailingTests: [
    makePalFromString([...new Array(20)].map(() => "#000000")),
  ],
};
export default lint;

export const fixMaxColors: LintFixer = async (palette) => {
  const colors = palette.colors;
  return [{ ...palette, colors: colors.slice(0, 10) }];
};
