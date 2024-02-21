import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";

const lint: CustomLint = {
  name: "Even Distribution",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: "http://localhost:8888/lint-schema.json",
    or: [
      {
        "<": {
          left: {
            std: {
              speed: { sort: "colors", func: { "lch.h": "x" }, varb: "x" },
            },
          },
          right: 10,
        },
      },
      {
        "<": {
          left: {
            std: {
              speed: {
                sort: "colors",
                varb: "x",
                func: {
                  "%": {
                    left: { "+": { left: { "lch.h": "x" }, right: 180 } },
                    right: 360,
                  },
                },
              },
            },
          },
          right: 10,
        },
      },
    ],
  }),
  taskTypes: ["categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Categorical values should have an even distribution around the hue circle in LCH color space",
  failMessage: `This palette does not evenly distribute the colors around its range correctly. Try making the spacing between the colors more regular to resolve this issue. `,
  id: "even-colors-built-in",
  blameMode: "none",
};
export default lint;
