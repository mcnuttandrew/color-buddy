import { JSONToPrettyString, createPalWithTags } from "../utils";
import { schema } from "../constants";
import type { LintProgram } from "../ColorLint";
import { Color, makePalFromString } from "color-buddy-palette";
import type { LintFixer } from "../linter-tools/lint-fixer";

type LLProgram = Parameters<typeof JSONToPrettyString>[0];
const buildProgram = (level: number, textOnly: boolean): LLProgram => {
  const program: LLProgram = {
    // @ts-ignore
    $schema: schema,
    all: {
      in: "colors",
      varb: "a",
      where: { isTag: "a", value: "text" },
      predicate: {
        ">": {
          left: {
            contrast: { left: "a", right: "background" },
            algorithm: "WCAG21",
          },
          right: level,
        },
      },
    },
  };
  if (!textOnly) {
    delete (program.all as any).where;
  }

  return program;
};

const lintBase: LintProgram = {
  program: JSONToPrettyString(false),
  requiredTags: [],
  name: "WCAG Contrast -- AA (text colors only)",
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "error",
  group: "accessibility",
  description: `All colors in a palette should have a sufficient contrast ratio with the background color. This is because if they are not, then they will not be differentiable from each other in some contexts. Valid algorithms are "APCA", "WCAG21", "Michelson", "Weber", "Lstar", "DeltaPhi". If this lint is not failing and you believe it should be, ensure that a color has been selected as having the "text" tag.`,
  failMessage: `These text colors ({{blame}) do not have a sufficient contrast do not have sufficient contrast with the background to be easily readable.`,
  id: "background-contrast-built-in",
  blameMode: "single" as const,
  subscribedFix: "fixBackgroundDifferentiability",
  expectedFailingTests: [],
  expectedPassingTests: [],
};

const contrastGraphicalObjects: LintProgram = {
  ...lintBase,
  program: JSONToPrettyString(buildProgram(3, false)),
  name: "WCAG Contrast Graphical Objects",
  id: "contrast-graphical-objects-built-in",
  expectedFailingTests: [makePalFromString(["#feed72", "#f8f4d2", "#eb717b"])],
  expectedPassingTests: [makePalFromString(["#cf5f67", "#468bbc", "#848475"])],
  failMessage: `These colors ({{blame}}) do not have a sufficient contrast do not have sufficient contrast with the background to be easily readable.`,
};

const contrastTextAA: LintProgram = {
  ...lintBase,
  program: JSONToPrettyString(buildProgram(4.5, true)),
  name: "WCAG Text Contrast: AA (text colors only)",
  id: "contrast-aa-built-in",
  expectedFailingTests: [
    createPalWithTags(["#feed72", "#f8f4d2", "#eb717b"], [[2, "text"]]),
  ],
  expectedPassingTests: [
    createPalWithTags(["#feed72", "#f8f4d2", "#af3b4b"], [[2, "text"]]),
  ],
};
const contrastTextAAA: LintProgram = {
  ...lintBase,
  program: JSONToPrettyString(buildProgram(7, true)),
  name: "WCAG Text Contrast: AAA (text colors only)",
  id: "contrast-aaa-built-in",
  expectedFailingTests: [
    createPalWithTags(["#feed72", "#f8f4d2", "#af3b4b"], [[2, "text"]]),
  ],
  expectedPassingTests: [
    createPalWithTags(["#feed72", "#f8f4d2", "#6c001a"], [[2, "text"]]),
  ],
};

export default [contrastGraphicalObjects, contrastTextAA, contrastTextAAA];

const getColorsCloseToBackground = (colors: Color[], background: Color) => {
  return colors.reduce((acc, x, idx) => {
    const contrast = x.toColorIO().contrast(background.toColorIO(), "WCAG21");
    return contrast <= 3 ? [...acc, idx] : acc;
  }, [] as number[]);
};

export const fixBackgroundDifferentiability: LintFixer = async (palette) => {
  const { colors, background, colorSpace } = palette;
  const backgroundL = background.toColorIO().to("lab").coords[0];
  const bgCloserToWhite = backgroundL > 50;
  const clamp = (x: number) => Math.max(0, Math.min(100, x));
  // const newL = clamp(!bgCloserToWhite ? backgroundL * 1.5 : backgroundL * 0.5);
  let colorsCloseToBackground = getColorsCloseToBackground(colors, background);
  let insufficientContrast = true;
  let newColors = colors;
  let ticker = 0;
  while (insufficientContrast && ticker < 100) {
    ticker++;
    colorsCloseToBackground = getColorsCloseToBackground(newColors, background);
    newColors = newColors.map((x, idx) => {
      if (!colorsCloseToBackground.includes(idx)) {
        return x;
      }
      const [l, a, b] = x.toColorSpace("lab").toChannels();
      const newL = clamp(bgCloserToWhite ? l - 1 : l + 1);
      const color = Color.colorFromChannels([newL, a, b], "lab").toColorSpace(
        colorSpace as any
      );
      color.tags = x.tags;
      return color;
    });
    colorsCloseToBackground = getColorsCloseToBackground(newColors, background);
    if (colorsCloseToBackground.length === 0) {
      insufficientContrast = false;
    }
  }

  return [{ ...palette, colors: newColors }];
};
