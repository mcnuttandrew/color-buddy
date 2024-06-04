import { expect, test } from "vitest";

import { Color } from "./Color";

import { CreateCustomLint } from "./ColorLint";
import { suggestLintFix } from "./linter-tools/lint-fixer";
import { makePalFromString } from "./utils";

import type { CustomLint } from "./ColorLint";

// Lints
import AvoidExtremes from "./lints/avoid-extremes";
import BGContrast, {
  fixBackgroundDifferentiability,
} from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import CVDCheck from "./lints/cvd-check";
import ColorNameDiscriminability, { getName } from "./lints/name-discrim";
import ColorTags from "./lints/color-tags";
import EvenDistribution from "./lints/even-distribution";
import Fair from "./lints/fair";
import Gamut from "./lints/in-gamut";
import MaxColors from "./lints/max-colors";
import MuthGuidelines from "./lints/muth-guidelines";
import MutuallyDistinct from "./lints/mutually-distinct";
import SequentialOrder from "./lints/sequential-order";
import SizeDiscrims from "./lints/size-discrim";
import UglyColors from "./lints/ugly-colors";

const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

function autoTest(lint: CustomLint) {
  lint.expectedPassingTests.forEach((pal) => {
    const newLint = CreateCustomLint(lint);
    const exampleLint = new newLint(pal).run();
    expect(exampleLint.passes).toBe(true);
    expect(exampleLint.message).toMatchSnapshot();
  });
  lint.expectedFailingTests.forEach((pal) => {
    const newLint = CreateCustomLint(lint);
    const exampleLint = new newLint(pal).run();
    expect(exampleLint.passes).toBe(false);
    expect(exampleLint.message).toMatchSnapshot();
  });
  expect(lint.expectedFailingTests.length).toBeGreaterThan(0);
  expect(lint.expectedPassingTests.length).toBeGreaterThan(0);
}

test("ColorLint - AvoidExtremes", () => autoTest(AvoidExtremes));
test("ColorLint - MutuallyDistinct", () => autoTest(MutuallyDistinct));
test("ColorLint - MaxColors", () => autoTest(MaxColors));
test("ColorLint - UglyColors", () => autoTest(UglyColors));

test("ColorLint - EvenDistribution (1) Hue", () =>
  autoTest(EvenDistribution[0]));

test("ColorLint - EvenDistribution (2) Lightness", () =>
  autoTest(EvenDistribution[1]));

test("ColorLint - Fair Nominal", () => autoTest(Fair[0]));
test("ColorLint - Fair Sequential", () => autoTest(Fair[1]));
test("ColorLint - SequentialOrder", () => autoTest(SequentialOrder));
test("ColorLint - CatOrderSimilarity", () => autoTest(CatOrderSimilarity));

function addNumberSuffix(numb: number): string {
  const lastDigit = numb % 10;
  if (lastDigit === 1) return `${numb}st`;
  if (lastDigit === 2) return `${numb}nd`;
  if (lastDigit === 3) return `${numb}rd`;
  return `${numb}th`;
}

test("ColorLint - ColorNameDiscriminability", async () => {
  autoTest(ColorNameDiscriminability);
  const lint = CreateCustomLint(ColorNameDiscriminability);

  // tacit configuration: the first two in the set should have the same name
  const sets = [
    ["#5260d1", "#684ac0"],
    ["#001615", "#001a1a", "#002633"],
  ];
  for (let idx = 0; idx < sets.length; idx++) {
    const colors = sets[idx];
    const examplePal = makePalFromString(colors);
    const exampleLint = new lint(examplePal).run();
    expect(exampleLint.passes).toBe(false);
    expect(exampleLint.message).toBe(
      `The following pairs of colors have the same name: ${colors[0]} and ${colors[1]}`
    );
    const fix = await suggestLintFix(examplePal, exampleLint);
    const oldColorNames = unique<string>(
      examplePal.colors.map((x) => getName(x.color))
    );
    expect(oldColorNames.length).toBe(colors.length - 1);
    const colorNames = unique<string>(
      fix[0].colors.map((x) => getName(x.color))
    );
    expect(
      colorNames.length,
      `The ${addNumberSuffix(idx)} set of colors should be corrected properly`
    ).toBe(colors.length);
  }
});

test("ColorLint - SizeDiscrim (Thin)", () => autoTest(SizeDiscrims[0]));
test("ColorLint - SizeDiscrim (Medium)", () => autoTest(SizeDiscrims[1]));
test("ColorLint - SizeDiscrim (Wide)", () => autoTest(SizeDiscrims[2]));

test("ColorLint - Gamut", async () => {
  autoTest(Gamut);
  const examplePal = makePalFromString(["lab(50.625% -91.737 -88.303)"]);
  const newLint = CreateCustomLint(Gamut);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toMatchSnapshot();

  const fix = await suggestLintFix(examplePal, exampleLint);
  expect(fix[0].colors.map((x) => x.color.toString())).toStrictEqual([
    "lab(48.319% -27.81 -14.373)",
  ]);
});

test("ColorLint - CVD: Deuteranopia", () => autoTest(CVDCheck[0]));
test("ColorLint - CVD: Protanopia", () => autoTest(CVDCheck[1]));
test("ColorLint - CVD: Tritanopia", () => autoTest(CVDCheck[2]));
test("ColorLint - CVD: Grayscale", () => autoTest(CVDCheck[3]));

const ughWhat = ["#00ffff", "#00faff", "#00e4ff", "#fdfdfc", "#00ffff"];
test("ColorLint - Background Contrast", async () => {
  const examplePal = makePalFromString(ughWhat);
  const BackgroundContrastLint = CreateCustomLint(BGContrast[0]);
  const exampleLint = new BackgroundContrastLint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "These colors (#0ff, #00faff, #00e4ff, #fdfdfc, #0ff) do not have a sufficient contrast do not have sufficient contrast with the background to be easily readable."
  );
  const fix = await suggestLintFix(examplePal, exampleLint).then((x) => x[0]);
  expect(fix.colors.map((x) => x.color.toHex())).toMatchSnapshot();

  examplePal.background = Color.colorFromHex("#00e4ff", "lab");
  const exampleLint2 = new BackgroundContrastLint(examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toBe(
    "These colors (#0ff, #00faff, #00e4ff, #fdfdfc, #0ff) do not have a sufficient contrast do not have sufficient contrast with the background to be easily readable."
  );
  const fix2 = await suggestLintFix(examplePal, exampleLint2).then((x) => x[0]);
  expect(fix2.colors.map((x) => x.color.toHex())).toMatchSnapshot();
});

test("Background Contrast - Fix", async () => {
  const examplePal = makePalFromString([
    "#3b3b6d",
    "#a9a9a9",
    "#8b0000",
    "#f5f5dc",
    "#2e8b57",
  ]);
  examplePal.background = Color.colorFromHex("#00201d", "lab");
  const BackgroundContrastLint = CreateCustomLint(BGContrast[0]);
  const exampleLint = new BackgroundContrastLint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  const fix = await fixBackgroundDifferentiability(examplePal, exampleLint);
  expect(fix.length).toBe(1);

  expect(new BackgroundContrastLint(fix[0]).run().passes).toBe(true);
});

test("ColorLint - Contrast (1) GraphicalObjs", () => autoTest(BGContrast[0]));
test("ColorLint - Contrast (2) contrastTextAA", () => autoTest(BGContrast[1]));
test("ColorLint - Contrast (3) contrastTextAAA", () => autoTest(BGContrast[2]));

test("ColorLint - MuthGuidelines (1) Background desaturation sufficient", () =>
  autoTest(MuthGuidelines[0]));

test("ColorLint - MuthGuidelines (2) Avoid Tetradic Palettes", () =>
  autoTest(MuthGuidelines[1]));

test("ColorLint - MuthGuidelines (3) Prefer yellowish or blueish greens", () =>
  autoTest(MuthGuidelines[2]));

test("ColorLint - MuthGuidelines (4) Avoid too much contrast with the background", () =>
  autoTest(MuthGuidelines[3]));

test("ColorLnt - ColorTags (1) Whisper don't scream", () =>
  autoTest(ColorTags[0]));

test("ColorLnt - ColorTags (2) Blue should be high probability for the basic color term blue", () =>
  autoTest(ColorTags[1]));
