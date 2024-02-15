import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
import type { LintFixer } from "../linter-tools/lint-fixer";

const lint: CustomLint = {
  name: "Discriminative Power Sufficient",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    "<": {
      left: {
        std: { speed: "colors" },
      },
      right: 0,
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description: "Palette should have sufficient discriminative power. ",
  failMessage: ``,
  id: "discrim-power-built-in",
  blameMode: "single",
};
export default lint;
