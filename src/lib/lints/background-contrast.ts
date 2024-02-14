import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
import { Color } from "../Color";
import type { LintFixer } from "../linter-tools/lint-fixer";

const getColorsCloseToBackground = (colors: Color[], background: Color) => {
  return colors.reduce((acc, x, idx) => {
    const pass = x.symmetricDeltaE(background) < 15;
    return pass ? [...acc, idx] : acc;
  }, [] as number[]);
};

const lint: CustomLint = {
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "a",

      predicate: {
        ">": {
          left: {
            contrast: { left: "a", right: "background" },
            algorithm: "WCAG21",
          },
          right: 1.1,
        },
      },
    },
  }),
  name: "Background Contrast",
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "error",
  group: "accessibility",
  description: `All colors in a palette should have a sufficient contrast ratio with the background color. This is because if they are not, then they will not be differentiable from each other in some contexts. Valid algorithms are "APCA", "WCAG21", "Michelson", "Weber", "Lstar", "DeltaPhi".`,
  failMessage: `These colors ({{blame}}) do not have a sufficient contrast ratio with the background and may be hard to discriminate in some contexts.`,
  id: "background-contrast-built-in",
  blameMode: "single" as const,
  subscribedFix: "fixBackgroundDifferentiability",
};
export default lint;

export const fixBackgroundDifferentiability: LintFixer = async (palette) => {
  const { colors, background, colorSpace } = palette;
  const backgroundL = background.toColorIO().to("lab").coords[0];
  const bgCloserToWhite = backgroundL > 50;
  const clamp = (x: number) => Math.max(0, Math.min(100, x));
  const newL = clamp(!bgCloserToWhite ? backgroundL * 1.5 : backgroundL * 0.5);
  const colorsCloseToBackground = getColorsCloseToBackground(
    colors,
    background
  );
  const newColors = colors.map((x, idx) => {
    if (!colorsCloseToBackground.includes(idx)) {
      return x;
    }
    const color = colors[idx];
    const newColor = Color.toColorSpace(color, "lab");
    const [_l, a, b] = newColor.toChannels();
    return Color.toColorSpace(
      newColor.fromChannels([newL, a, b]),
      colorSpace as any
    );
  });
  return [{ ...palette, colors: newColors }];
};
