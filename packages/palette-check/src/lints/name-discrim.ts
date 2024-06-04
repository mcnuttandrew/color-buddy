import {
  JSONToPrettyString,
  makePalFromString,
  wrapInBlankSemantics,
} from "../utils";
import type { CustomLint } from "../ColorLint";
import namer from "color-namer";
import { Color } from "../Color";
import type { Palette } from "../../types";
import { titleCase } from "../utils";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { colorCentersFromStoneHeer } from "@color-buddy/color-lists";
import { schema } from "../constants";

const namerCustomList = Object.entries(colorCentersFromStoneHeer).map(
  ([name, hex]) => ({ name, hex })
);
(namer as any).lists.heerStone = namerCustomList;

const getNames = (hex: string): { heerStone: namer.Color[] } =>
  (namer as any)(hex, {
    pick: ["heerStone"],
  });

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
  // const name = namer(hex, { pick: ["html"] });
  const name = getNames(hex);
  const guess = findSmallest<any>(
    Object.values(name).map((x: any) => x[0]),
    (x) => x.distance
  );
  const result = guess.name.toLowerCase();
  nameCache.set(hex, result);
  return result;
};

const lint: CustomLint = {
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
      predicate: { "!=": { left: { name: "a" }, right: { name: "b" } } },
    },
  }),
  name: "Color Name Discriminability",
  taskTypes: ["sequential", "categorical", "diverging"] as const,
  level: "error",
  group: "usability",
  description: `Being able to identify colors by name is important for usability and for memorability.`,
  failMessage: `The following pairs of colors have the same name: {{blame}}`,
  id: "color-name-discriminability-built-in",
  blameMode: "pair" as const,
  subscribedFix: "fixColorNameDiscriminability",
  requiredTags: [],
  expectedPassingTests: [
    makePalFromString(["#000", "#fff", "#f00", "#0f0", "#00f"]),
  ],
  expectedFailingTests: [makePalFromString(["#5260d1", "#684ac0"])],
};
export default lint;

export const fixColorNameDiscriminability: LintFixer = async (
  palette: Palette
) => {
  const colors = palette.colors;
  const colorNames = colors.map((x) => getName(x.color));
  const colorNameByIndex = colors.reduce((acc, color, index) => {
    const name = getName(color.color);
    acc[name] = (acc[name] || []).concat(index);
    return acc;
  }, {} as Record<string, number[]>);
  const conflictedIndices = Object.values(colorNameByIndex)
    .filter((x) => x.length > 1)
    .flatMap((x) => x);
  const nonConflictedNames = new Set<string>(
    colorNames
      .filter((_, x) => !conflictedIndices.includes(x))
      .map((x) => x.toLowerCase())
  );
  const selectedNames = new Set<string>();

  const updatedColors = Object.fromEntries(
    conflictedIndices.map((idx) => {
      const color = colors[idx].color;
      const hex = color.toHex().toUpperCase();
      const names = getNames(hex).heerStone;
      const possibleNames = names.filter(
        (x) =>
          // don't try to take from the names that aren't conflicted
          !nonConflictedNames.has(x.name) &&
          // don't try to take from the names that have already been selected
          !selectedNames.has(x.name)
      );
      const name = possibleNames[0];
      selectedNames.add(name.name);
      return [
        idx,
        wrapInBlankSemantics(Color.colorFromHex(name.hex, color.spaceName)),
      ];
    })
  );

  return [
    { ...palette, colors: colors.map((x, idx) => updatedColors[idx] || x) },
  ];
};
