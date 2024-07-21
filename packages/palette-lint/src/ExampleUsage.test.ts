import { expect, test } from "vitest";

// @ts-ignore
// EXAMPLE START
import { LintProgram, linter } from "color-buddy-palette-lint";
import { makePalFromString } from "color-buddy-palette";
const exampleLint: LintProgram = {
  name: "Max Colors",
  program: `{
        "$schema": "https://color-buddy-docs.netlify.app/lint-schema.json",
        "<": { "left": { "count": "colors" }, "right": 11 },
      }`,
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description:
    "Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.",
  failMessage: `This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10.`,
  id: "too-many-colors-built-in",
  blameMode: "single",
  subscribedFix: "fixMaxColors",
  requiredTags: [],
  expectedPassingTests: [
    makePalFromString(["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"]),
  ],
  expectedFailingTests: [
    makePalFromString([...new Array(20)].map(() => "#000000")),
  ],
};

const exampleFailingPalette = exampleLint.expectedFailingTests[0];

const lintResult = linter(exampleFailingPalette, [exampleLint], {
  // computeBlame and computeMessage are optional and default to false
  computeBlame: true,
  computeMessage: true,
})[0];

// EXAMPLE END

test("ExampleUsage", () => {
  expect(lintResult.kind).toBe("success");
  if (lintResult.kind !== "success") return;
  expect(lintResult.passes).toBe(false);
  expect(lintResult.message).toBe(
    "This palette has too many colors and may be hard to discriminate in some contexts. Maximum: 10."
  );
});
