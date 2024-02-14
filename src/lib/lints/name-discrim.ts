import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";
import namer from "color-namer";
import { Color } from "../Color";
import type { Palette } from "../../stores/color-store";
import { titleCase } from "../utils";
import type { LintFixer } from "../linter-tools/lint-fixer";

function findSmallest<A>(arr: A[], accessor: (x: A) => number): A {
  let smallest = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (accessor(arr[i]) < accessor(smallest)) smallest = arr[i];
  }
  return smallest;
}

// Simpler version of the color name stuff
export function colorNameSimple(colors: Color[]) {
  return colors.map((x) => ({ word: getName(x), hex: x.toHex() }));
}

const nameCache = new Map<string, string>();
export const getName = (color: Color) => {
  const hex = color.toHex().toUpperCase();
  if (nameCache.has(hex)) {
    return nameCache.get(hex)!;
  }
  const name = namer(hex, { pick: ["html"] });
  const guess = findSmallest<any>(
    Object.values(name).map((x: any) => x[0]),
    (x) => x.distance
  );
  const result = titleCase(guess.name);
  nameCache.set(hex, result);
  return result;
};

function suggestFixForColorsWithCommonNames(colors: Color[]): Color[] {
  const hex = colors[0].toHex().toUpperCase();
  let guesses = { ...namer(hex, { pick: ["html"] }) };
  return [...colors].map((color, idx) => {
    const newColor = guesses.html[idx];
    return Color.colorFromHex(newColor.hex, color.spaceName);
  });
}

const lint: CustomLint = {
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
      predicate: { "!=": { left: { name: "a" }, right: { name: "b" } } },
    },
  }),
  name: "Color Name Discriminability",
  taskTypes: ["sequential"] as const,
  level: "error",
  group: "usability",
  description: `Being able to identify colors by name is important for usability and for memorability.`,
  failMessage: `The following pairs of colors have the same name: {{blame}}`,
  id: "color-name-discriminability-built-in",
  blameMode: "pair" as const,
  subscribedFix: "fixColorNameDiscriminability",
};
export default lint;

export const fixColorNameDiscriminability: LintFixer = async (
  palette: Palette
) => {
  const colors = palette.colors;
  const colorNamesByIndex = colors.reduce((acc, color, index) => {
    const name = getName(color);
    acc[name] = (acc[name] || []).concat(index);
    return acc;
  }, {} as Record<string, number[]>);
  const newColors = [...colors];
  Object.values(colorNamesByIndex)
    .filter((x) => x.length > 1)
    .forEach((indices) => {
      const localColors = indices.map((i) => newColors[i]);
      const updatedColors = suggestFixForColorsWithCommonNames(localColors);
      indices.forEach((i, j) => {
        newColors[i] = updatedColors[j];
      });
    });
  return [{ ...palette, colors: newColors }];
};
