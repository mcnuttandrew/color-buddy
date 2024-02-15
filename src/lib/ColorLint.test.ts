import { expect, test } from "vitest";

import { Color } from "./Color";

import { CreateCustomLint } from "./CustomLint";
import { suggestLintFix } from "./linter-tools/lint-fixer";
import { makePalFromString } from "./utils";

// Lints
import AvoidExtremes from "./lints/avoid-extremes";
import BackgroundContrast from "./lints/background-contrast";
import CatOrderSimilarity from "./lints/cat-order-similarity";
import ColorBlindness from "./lints/color-blindness";
import ColorNameDiscriminability, { getName } from "./lints/name-discrim";
import Fair from "./lints/fair";
import Gamut from "./lints/in-gamut";
import MaxColors from "./lints/max-colors";
import MutuallyDistinct from "./lints/mutually-distinct";
import SequentialOrder from "./lints/sequential-order";
import SizeDiscrims from "./lints/size-discrim";
import UglyColors from "./lints/ugly-colors";

const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

test("ColorLint - AvoidExtremes", () => {
  const examplePal = makePalFromString([
    "#000000",
    "#ffffff",
    "#ff7e0e",
    "#00ff00",
    "#0084a9",
    "#0000ff",
  ]);
  const newLint = CreateCustomLint(AvoidExtremes);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "Colors at either end of the lightness spectrum #000, #fff, #0f0, #00f are hard to discriminate in some contexts, and are sometimes advised against"
  );
});

test("ColorLint - MutuallyDistinct", () => {
  const examplePal = makePalFromString([
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
  ]);
  const newLint = CreateCustomLint(MutuallyDistinct);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  // TODO add a failing case
  const examplePal2 = makePalFromString(["#d2b48c", "#f5f5dc", "#d7fcef"]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - MaxColors", () => {
  const examplePal = makePalFromString(["#000000"]);
  const newLint = CreateCustomLint(MaxColors);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString(
    [...new Array(20)].map(() => "#000000")
  );
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - UglyColors", () => {
  const examplePal = makePalFromString(["#000000"]);
  const newLint = CreateCustomLint(UglyColors);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString(["#000000", "#56FF22"]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - Fair Nominal", () => {
  const examplePal = makePalFromString(["#000000"]);
  const newLint = CreateCustomLint(Fair[0]);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString(["#debdb5", "#2a2a2a", "#76fc00"]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - Fair Sequential", () => {
  const examplePal = makePalFromString(["#000000"]);
  const newLint = CreateCustomLint(Fair[1]);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString(["#debdb5", "#2a2a2a", "#76fc00"]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - SequentialOrder", () => {
  const examplePal = makePalFromString([
    "#0084a9",
    "#009de5",
    "#5fb1ff",
    "#bbc3ff",
    "#ecddff",
  ]);
  const newLint = CreateCustomLint(SequentialOrder);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString([
    "#0084a9",
    "#009de5",
    "#5fb1ff",
    "#ecddff",
    "#bbc3ff",
  ]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - CatOrderSimilarity", () => {
  const examplePal = makePalFromString([
    "#0084a9",
    "#009de5",
    "#8ca9fa",
    "#bbc3ff",
    "#ecddff",
  ]);
  const newLint = CreateCustomLint(CatOrderSimilarity);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString([
    "#0084a9",
    "#009de5",
    "#5fb1ff",
    "#bbc3ff",
    "#ecddff",
  ]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - ColorNameDiscriminability", async () => {
  const examplePal = makePalFromString(["#5260d1", "#005ebe"]);
  const lint = CreateCustomLint(ColorNameDiscriminability);
  const exampleLint = new lint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "The following pairs of colors have the same name: #5260d1 and #005ebe"
  );
  const fix = await suggestLintFix(examplePal, exampleLint);
  const oldColorNames = unique<string>(
    examplePal.colors.map((x) => getName(x))
  );
  expect(oldColorNames.length).toBe(1);
  const colorNames = unique<string>(fix[0].colors.map((x) => getName(x)));
  expect(colorNames.length).toBe(2);
});

test("ColorLint - SizeDiscrim (Thin)", () => {
  const examplePal = makePalFromString(["#0084a9", "#bad", "#008000"]);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(true);
  expect(exampleLint.message).toMatchSnapshot();

  const examplePal2 = makePalFromString(["#0084a9", "#009de5", "#8ca9fa"]);
  const exampleLint2 = new newLint(examplePal2).run();
  const newLint = CreateCustomLint(SizeDiscrims[0]);
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - Gamut", async () => {
  const examplePal = makePalFromString(["lab(50.625% -91.737 -88.303)"]);
  const newLint = CreateCustomLint(Gamut);
  const exampleLint = new newLint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toMatchSnapshot();

  const fix = await suggestLintFix(examplePal, exampleLint);
  expect(fix[0].colors.map((x) => x.toString())).toStrictEqual([
    "lab(51.296% -23.327 -25.373)",
  ]);

  const examplePal2 = makePalFromString([
    "#0084a9",
    "#009de5",
    "#8ca9fa",
    "#ff0000",
  ]);
  const exampleLint2 = new newLint(examplePal2).run();
  expect(exampleLint2.passes).toBe(true);
  expect(exampleLint2.message).toMatchSnapshot();
});

test("ColorLint - ColorBlind", async () => {
  const tableau10 = [
    "#0078b4",
    "#ff7e0e",
    "#3d9f2f",
    "#da2827",
    "#8c69bc",
    "#8e564b",
    "#e179c1",
    "#7f7f7f",
    "#c4bc27",
    "#00becf",
  ];
  const examplePal = makePalFromString(tableau10);
  const cbDeuteranopia = CreateCustomLint(ColorBlindness[0]);
  const exampleLint1 = new cbDeuteranopia(examplePal).run();
  expect(exampleLint1.passes).toBe(false);
  expect(exampleLint1.message).toMatchSnapshot();

  const cbProtanopia = CreateCustomLint(ColorBlindness[1]);
  const exampleLint2 = new cbProtanopia(examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();

  const cbTritanopia = CreateCustomLint(ColorBlindness[2]);
  const exampleLint3 = new cbTritanopia(examplePal).run();
  expect(exampleLint3.passes).toBe(false);
  expect(exampleLint3.message).toMatchSnapshot();

  const cbGrayscale = CreateCustomLint(ColorBlindness[3]);
  const exampleLint4 = new cbGrayscale(examplePal).run();
  expect(exampleLint4.passes).toBe(false);
  expect(exampleLint4.message).toMatchSnapshot();
});

const ughWhat = ["#00ffff", "#00faff", "#00e4ff", "#fdfdfc", "#00ffff"];
test("ColorLint - Background Contrast", async () => {
  const examplePal = makePalFromString(ughWhat);
  const BackgroundContrastLint = CreateCustomLint(BackgroundContrast);
  const exampleLint = new BackgroundContrastLint(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "These colors (#fdfdfc) do not have a sufficient contrast ratio with the background and may be hard to discriminate in some contexts."
  );
  const fix = await suggestLintFix(examplePal, exampleLint).then((x) => x[0]);
  expect(fix.colors.map((x) => x.toHex())).toMatchSnapshot();

  examplePal.background = Color.colorFromHex("#00e4ff", "lab");
  const exampleLint2 = new BackgroundContrastLint(examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toBe(
    "These colors (#00e4ff) do not have a sufficient contrast ratio with the background and may be hard to discriminate in some contexts."
  );
  const fix2 = await suggestLintFix(examplePal, exampleLint2).then((x) => x[0]);
  expect(fix2.colors.map((x) => x.toHex())).toMatchSnapshot();
});
