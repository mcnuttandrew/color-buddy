import { makePalFromString } from "@color-buddy/palette";
import type { Palette } from "@color-buddy/palette";
import { nameColor, nameToColor } from "@color-buddy/color-namer";

import { JSONToPrettyString } from "../utils";
import type { LintProgram } from "../ColorLint";
import type { LintFixer } from "../linter-tools/lint-fixer";
import { schema } from "../constants";

const lint: LintProgram = {
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
  expectedFailingTests: [makePalFromString(["#5866d3", "#19437d"])],
};
export default lint;

export const fixColorNameDiscriminability: LintFixer = async (
  palette: Palette
) => {
  const colors = palette.colors;
  const colorNames = colors.map((x) => nameColor(x)[0]);
  const colorNameByIndex = colors.reduce(
    (acc, color, index) => {
      const name = nameColor(color)[0];
      acc[name] = (acc[name] || []).concat(index);
      return acc;
    },
    {} as Record<string, number[]>
  );
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
      const color = colors[idx];
      const names = nameColor(color, { numResults: colors.length });
      const possibleNames = names.filter(
        (x) =>
          // don't try to take from the names that aren't conflicted
          !nonConflictedNames.has(x) &&
          // don't try to take from the names that have already been selected
          !selectedNames.has(x)
      );
      const name = possibleNames[0];
      selectedNames.add(name);
      const newColor = (nameToColor(name) || color).toColorSpace(
        color.spaceName
      );
      newColor.tags = color.tags;
      return [idx, newColor];
    })
  );

  return [
    { ...palette, colors: colors.map((x, idx) => updatedColors[idx] || x) },
  ];
};
