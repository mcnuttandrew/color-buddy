import { JSONToPrettyString } from "../utils";
import { makePalFromString, distributePoints } from "@color-buddy/palette";
import type { LintProgram } from "../ColorLint";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { schema } from "../constants";

const evenHue: LintProgram = {
  name: "Even Distribution in Hue",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  requiredTags: [],
  description:
    "Categorical values should have an even distribution around the hue circle in LCH color space",
  failMessage: `This palette does not evenly distribute the colors around its range correctly. Try making the spacing between the colors more regular to resolve this issue. `,
  id: "even-colors-built-in",
  blameMode: "none",
  expectedPassingTests: [
    makePalFromString(["#ffc5b8", "#00dec1", "#006095", "#b7d119", "#6e0074"]),
    makePalFromString(["#4682b4"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#ffb9ba", "#67de25", "#25d4c3", "#724dd6", "#6d0e44"]),
  ],
  subscribedFix: "fixHueDistribution",
};

export const fixHueDistribution: LintFixer = async (palette) => {
  const colors = palette.colors.map((x) => x.toColorSpace("lch"));
  const focusedColors = colors.map((_, idx) => idx);
  const newColors = distributePoints(
    { direction: "vertical", name: "whatever" },
    focusedColors,
    colors,
    "lch"
  ).map((x) => x.toColorSpace(palette.colorSpace));

  return [{ ...palette, colors: newColors }];
};

const evenLightness: LintProgram = {
  name: "Even Distribution in Lightness",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    "<": {
      left: {
        std: { speed: { sort: "colors", func: { "lch.l": "x" }, varb: "x" } },
      },
      right: 5,
    },
  }),
  taskTypes: ["categorical", "diverging", "sequential"] as const,
  level: "warning",
  group: "design",
  requiredTags: [],
  description: "Values should be space evenly in lightness in LCH color space",
  failMessage: `This palette does not evenly distribute the colors in lightness (in LCH space) correctly. Try making the spacing between the colors more regular to resolve this issue.`,
  id: "even-colors-lightness-built-in",
  blameMode: "none",
  expectedPassingTests: [
    makePalFromString(["#1a4400", "#1f6e00", "#4a9500", "#74bd28", "#9ee754"]),
    makePalFromString(["#4682b4"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#ffb9ba", "#67de25", "#25d4c3", "#724dd6", "#6d0e44"]),
    makePalFromString(["#174c00", "#166100", "#267500", "#78c12d", "#b7ff6d"]),
  ],
  subscribedFix: "fixLightnessDistribution",
};

export const fixLightnessDistribution: LintFixer = async (palette) => {
  const colors = palette.colors.map((x) => x.toColorSpace("lch"));
  const focusedColors = colors.map((_, idx) => idx);
  const newColors = distributePoints(
    { direction: "in z space", name: "whatever" },
    focusedColors,
    colors,
    "lch"
  ).map((x) => x.toColorSpace(palette.colorSpace));

  return [{ ...palette, colors: newColors }];
};

export default [evenHue, evenLightness];
