import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "@color-buddy/palette";
import type { CustomLint } from "../ColorLint";
import { schema } from "../constants";

const lint: CustomLint = {
  name: "Colors distinguishable in order",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: {
        "==": {
          left: "index(a)",
          right: { "-": { left: "index(b)", right: 1 } },
        },
      },
      predicate: {
        ">": {
          left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },
          right: 10,
        },
      },
    },
  }),
  taskTypes: ["categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Opt for colors that are perceptually distinguishable in a logical sequence when designing visual elements like charts or graphs. This ensures that viewers can easily recognize the order or progression of data points. For categorical this means that when only a small number of colors are used, they should be as different as possible. For sequential and diverging, this means that the colors should be as different as possible in order.",
  failMessage: `Some sequences of colors are too similar based on dE scores: {{blame}}. Try reordering them or making them more distinguishable`,
  id: "cat-order-similarity-built-in",
  blameMode: "pair",
  expectedPassingTests: [
    makePalFromString(["#0084a9", "#009de5", "#8ca9fa", "#bbc3ff", "#ecddff"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#0084a9", "#009de5", "#5fb1ff", "#bbc3ff", "#ecddff"]),
  ],
  requiredTags: [],
};
export default lint;
