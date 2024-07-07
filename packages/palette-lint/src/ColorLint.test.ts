import { expect, test } from "vitest";

import { Color, makePalFromString } from "@color-buddy/palette";
import { nameColor } from "@color-buddy/color-namer";

import { suggestLintFix } from "./linter-tools/lint-fixer";
import { RunLint } from "./ColorLint";
import type { LintProgram } from "./ColorLint";
import compileToLL from "./lint-language/parser";

// Lints
import AvoidExtremes from "./lints/avoid-extremes";
import BGContrast, {
  fixBackgroundDifferentiability,
} from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import CVDCheck from "./lints/cvd-check";
import ColorNameDiscriminability from "./lints/name-discrim";

import ColorTags from "./lints/color-tags";
import DivergingOrder, { fixDivergingOrder } from "./lints/diverging-order";
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

function autoTest(lint: LintProgram) {
  expect(lint.failMessage.length).toBeGreaterThan(0);
  lint.expectedPassingTests.forEach((pal) => {
    const exampleLint = RunLint(lint, pal, { computeMessage: true });
    expect(exampleLint.kind).toBe("success");
    if (exampleLint.kind !== "success") return;
    expect(exampleLint.passes).toBe(true);
    expect(exampleLint.message).toMatchSnapshot();
  });
  lint.expectedFailingTests.forEach((pal) => {
    const exampleLint = RunLint(lint, pal, { computeMessage: true });
    expect(exampleLint.kind).toBe("success");
    if (exampleLint.kind !== "success") return;
    expect(exampleLint.passes).toBe(false);
    expect(exampleLint.message).toMatchSnapshot();
  });
  expect(lint.expectedFailingTests.length).toBeGreaterThan(0);
  expect(lint.expectedPassingTests.length).toBeGreaterThan(0);

  const ranLint = RunLint(lint, lint.expectedFailingTests[0], {
    computeMessage: false,
  });
  const nlProgram =
    (ranLint.kind === "success" && ranLint.naturalLanguageProgram) || "";
  const compiledProgram = compileToLL(nlProgram);
  expect(compiledProgram).toStrictEqual(JSON.parse(lint.program));
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

  // tacit configuration: the first two in the set should have the same name
  const sets = [
    ["#5866d3", "#19437d"],
    ["#001615", "#001a1a", "#002633"],
  ];
  for (let idx = 0; idx < sets.length; idx++) {
    const colors = sets[idx];
    const examplePal = makePalFromString(colors);
    const lintResult = RunLint(ColorNameDiscriminability, examplePal, {
      computeMessage: true,
    });
    expect(lintResult.kind).toBe("success");
    if (lintResult.kind !== "success") return;
    expect(lintResult.passes).toBe(false);
    expect(lintResult.message).toBe(
      `The following pairs of colors have the same name: ${colors[0]} and ${colors[1]}`
    );
    const fix = await suggestLintFix(examplePal, lintResult);
    const oldColorNames = unique<string>(
      examplePal.colors.map((x) => nameColor(x)[0])
    );
    expect(oldColorNames.length).toBe(colors.length - 1);
    const colorNames = unique<string>(
      fix[0].colors.map((x) => nameColor(x)[0])
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
  const lintResult = RunLint(Gamut, examplePal, { computeMessage: true });
  expect(lintResult.kind).toBe("success");
  if (lintResult.kind !== "success") return;
  expect(lintResult.passes).toBe(false);
  expect(lintResult.message).toMatchSnapshot();

  const fix = await suggestLintFix(examplePal, lintResult);
  expect(fix[0].colors.map((x) => x.toString())).toStrictEqual([
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
  const lintResult = RunLint(BGContrast[0], examplePal, {
    computeMessage: true,
  });
  expect(lintResult.kind).toBe("success");
  if (lintResult.kind !== "success") return;
  expect(lintResult.passes).toBe(false);
  expect(lintResult.message).toBe(
    "These colors (#0ff, #00faff, #00e4ff, #fdfdfc, #0ff) do not have a sufficient contrast do not have sufficient contrast with the background to be easily readable."
  );
  const fix = await suggestLintFix(examplePal, lintResult).then((x) => x[0]);
  expect(fix.colors.map((x) => x.toHex())).toMatchSnapshot();

  examplePal.background = Color.colorFromHex("#00e4ff", "lab");
  const lintResult2 = RunLint(BGContrast[0], examplePal, {
    computeMessage: true,
  });
  expect(lintResult2.kind).toBe("success");
  if (lintResult2.kind !== "success") return;
  expect(lintResult2.passes).toBe(false);
  expect(lintResult2.message).toBe(
    "These colors (#0ff, #00faff, #00e4ff, #fdfdfc, #0ff) do not have a sufficient contrast do not have sufficient contrast with the background to be easily readable."
  );
  const fix2 = await suggestLintFix(examplePal, lintResult2).then((x) => x[0]);
  expect(fix2.colors.map((x) => x.toHex())).toMatchSnapshot();
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
  const lintResult = RunLint(BGContrast[0], examplePal, {
    computeMessage: true,
  });
  expect(lintResult.kind).toBe("success");
  if (lintResult.kind !== "success") return;
  expect(lintResult.passes).toBe(false);
  const fix = await fixBackgroundDifferentiability(examplePal, lintResult);
  expect(fix.length).toBe(1);

  const result = RunLint(BGContrast[0], fix[0], { computeMessage: true });
  expect(result.kind).toBe("success");
  if (result.kind !== "success") return;
  expect(result.passes).toBe(true);
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

test("ColorLint - Diverging Order", async () => {
  autoTest(DivergingOrder);

  async function divTestHelper(
    pal: string[],
    adjustment: (pal: string[]) => string[],
    name: string
  ) {
    const divPal = makePalFromString(pal);

    const lintResult1 = RunLint(DivergingOrder, divPal, {
      computeMessage: true,
    });
    expect(lintResult1.kind).toBe("success");
    expect(
      lintResult1.kind === "success" && lintResult1.passes,
      `${name} initial pal order`
    ).toBe(true);
    expect(
      lintResult1.kind === "success" && lintResult1.message,
      `${name} initial pal order msg`
    ).toBe("");

    const adjustedPal = adjustment(pal);
    const divPal2 = makePalFromString(adjustedPal);

    const lintResult2 = RunLint(DivergingOrder, divPal2, {
      computeMessage: true,
    });
    expect(lintResult2.kind).toBe("success");
    expect(
      lintResult2.kind === "success" && lintResult2.passes,
      `${name} alteration correctly fails`
    ).toBe(false);
    expect(
      lintResult2.kind === "success" && lintResult2.message,
      `${name} alteration correctly generates failure message`
    ).toMatchSnapshot();

    const fixedExample2 = await fixDivergingOrder(divPal2, lintResult2);
    expect(fixedExample2.length).toBeGreaterThan(0);
    const result = RunLint(DivergingOrder, fixedExample2[0], {});
    expect(
      result.kind === "success" && result.passes,
      `${name} fix fixes alteration`
    ).toBe(true);
    expect(
      fixedExample2[0].colors.map((x) => x.toHex()),
      `${name} fix restores original order`
    ).toEqual(divPal.colors.map((x) => x.toHex()));
  }

  await divTestHelper(
    ["#0084ae", "#8db3c7", "#e5e3e0", "#eca288", "#e25c36"],
    (pal) => {
      const newPal = [...pal];
      newPal[3] = pal[4];
      newPal[4] = pal[3];
      return newPal;
    },
    "Diverging Order (1)"
  );
  // await divTestHelper(
  //   ["#0084ae", "#8db3c7", "#e5e3e0", "#eca288", "#e25c36"],
  //   (pal) => {
  //     const newPal = [...pal];
  //     newPal[2] = pal[3];
  //     newPal[3] = pal[2];
  //     return newPal;
  //   },
  //   "Diverging Order (2)"
  // );
});
