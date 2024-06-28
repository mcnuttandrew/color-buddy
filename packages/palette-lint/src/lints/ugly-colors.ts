import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "@color-buddy/palette";
import type { CustomLint } from "../ColorLint";
import { schema } from "../constants";

const lint: CustomLint = {
  name: "Palette does not have ugly colors",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        all: {
          in: ["#56FF00", "#0010FF", "#6A7E25", "#FF00EF", "#806E28"],
          varb: "b",
          predicate: {
            ">": {
              left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },

              right: 10,
            },
          },
        },
      },
    },
  }),
  taskTypes: ["categorical"],
  description: `Colors that are close to what are known as ugly colors are sometimes advised against. See https://www.colourlovers.com/palette/1416250/The_Ugliest_Colors for more details.`,
  failMessage: `This palette has some colors (specifically {{blame}}) that are close to what are known as ugly colors`,
  level: "warning",
  group: "design",
  id: "ugly-colors-built-in",
  requiredTags: [],
  blameMode: "single",
  expectedPassingTests: [
    makePalFromString(["#000", "#fff", "#f00", "#00c000", "#9c70ff"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#000000", "#56FF22"]),
    makePalFromString(["#000000", "#0010FF", "#6A7E25", "#00FF00", "#0000FF"]),
  ],
};
export default lint;
