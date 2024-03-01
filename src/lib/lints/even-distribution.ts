import { JSONToPrettyString, makePalFromString } from "../utils";
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
  expectedPassingTests: [
    makePalFromString(["#ffc5b8", "#00dec1", "#006095", "#b7d119", "#6e0074"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#ffb9ba", "#67de25", "#25d4c3", "#724dd6", "#6d0e44"]),
  ],
};
export default lint;
