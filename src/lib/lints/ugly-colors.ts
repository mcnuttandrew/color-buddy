import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";

const lint: CustomLint = {
  name: "Palette does not have ugly colors",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
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
  blameMode: "single",
};
export default lint;
