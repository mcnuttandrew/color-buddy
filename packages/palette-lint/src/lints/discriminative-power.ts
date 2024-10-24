import { JSONToPrettyString } from "../utils";
import type { LintProgram } from "../ColorLint";
import { schema } from "../constants";

const lint: LintProgram = {
  name: "Discriminative power sufficient",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  expectedPassingTests: [],
  expectedFailingTests: [],
  requiredTags: [],
};
export default lint;
