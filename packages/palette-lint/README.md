# color-buddy-palette-lint

Have you ever looked closely at a color palette and wondered if it was a good palette or just the one you had? Palette Lint is a tool that helps you evaluate the quality of a color palette. It operates analogously to a spell checker (or more closely, like a linter), but for color palettes. It will help you identify issues with your palette and suggest improvements.

It is design solely for use with the color-buddy-palette package and programmatically. There is not a CLI interface, but it can be used through the color-buddy GUI.

## Contents

This library contains the following functions:

### linter

**Function**: `linter(palette: Palette, lints: LintProgram[], options: RunLintOptions) => LintResult[]`

**Description**: The primary function for this package, it takes in a palette (defined by color-buddy-palette) and an array of lint programs and returns a list of LintResults.

### suggestLintFix

**Function**: `suggestLintFix(palette: Palette, lint: LintResult) => Promise<Palette[]>`

**Description**: Suggest a heuristic fix for a failing lint result if there is one available. Fixes are available for the following lints:

- background-contrast: fixBackgroundDifferentiability
- name-discrim: fixColorNameDiscriminability
- diverging-order: fixDivergingOrder
- in-gamut: fixGamut
- max-colors: fixMaxColors
- sequential-order: fixSequentialOrder
- even-distribution: fixHueDistribution, fixLightnessDistribution

### suggestMCFix

**Function**: `suggestMCFix(palette: Palette, lints: LintProgram[]) => Promise<Palette>`

**Description**: Suggest a fix using a monte-carlo inspired optimization algorithm. This function will take a palette and a list of lints and attempt to fix the palette by taking random steps in the color space until all lints pass.

This library contains the following types:

### LintProgram

interface LintProgram {
**blameMode**: Property blameMode: "none" | "single" | "pair"
**customProgram**: Property customProgram: Function
**description**: Property description: string
**expectedFailingTests**: Property expectedFailingTests: Palette[]
**expectedPassingTests**: Property expectedPassingTests: Palette[]
**failMessage**: Property failMessage: string
**group**: Property group: "design" | "accessibility" | "usability" | "custom"
**id**: Property id: string
**level**: Property level: "error" | "warning"
**name**: Property name: string
**program**: Property program: string
**requiredTags**: Property requiredTags: string[]
**subscribedFix**: Property subscribedFix: string
**taskTypes**: Property taskTypes: PalType[]
}

### LintResult

**Type**: `LintResult: SuccessLintResult | IgnoredLintResult | InvalidLintResult`

**Description**: The result of running a lint program on a palette. There are three possible outcomes:

- Success: The lint passed or failed as expected {kind: "success"}. It has properties
  -- blameData: The colors that caused the lint to fail
  -- message: A message explaining why the lint failed
  -- naturalLanguageProgram: A human-readable version of the lint program
  -- passes: Whether the lint passed or failed
- Ignored: The lint was ignored {kind: "ignored"}
- Invalid: The lint was invalid {kind: "invalid"}

All cases also have a lintProgram property that contains the lint program that was run.

## Usage

Example usage of the library:

```ts
import { makePalFromString } from "color-buddy-palette";
import { LintProgram, linter } from "color-buddy-palette-lint";
const exampleLint: LintProgram = {
  name: "Max Colors",
  program: `{
        "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json",
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
```
