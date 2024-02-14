import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
const lint: CustomLint = {
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
      predicate: {
        ">": {
          left: { dist: { left: "a", right: "b" }, space: "lab" },
          right: 15,
        },
      },
    },
  }),
  name: "Mutually Distinct",
  taskTypes: ["categorical"] as const,
  group: "usability",
  level: "error",
  description: `All colors in a palette should be different from each other. This is because if they are not, then they will not be differentiable from each other in some contexts.`,
  failMessage: `Some colors in this palette ({{blame}}) are not differentiable from each other.`,
  id: "mutually-distinct-built-in",
  blameMode: "pair" as const,
};

export default lint;
