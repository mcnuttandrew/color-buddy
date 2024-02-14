import { expect, test } from "vitest";

import { Color } from "./Color";
import type { Palette } from "../stores/color-store";

import ColorNameDiscriminability, { getName } from "./lints/name-discrim";
import BUILT_INS from "./lints/built-in-lints";
import { CreateCustomLint } from "./lints/CustomLint";
import { suggestLintFix } from "./linter-tools/lint-fixer";

function makePalFromHexes(hexes: string[]): Palette {
  return {
    colors: hexes.map((hex) => Color.colorFromHex(hex, "lab")),
    background: Color.colorFromHex("#ffffff", "lab"),
    name: "test",
    type: "categorical",
    evalConfig: {},
    colorSpace: "lab",
  };
}

const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

test("ColorLint - ColorNameDiscriminability", async () => {
  const examplePal = makePalFromHexes(["#5260d1", "#005ebe"]);
  const exampleLint = new ColorNameDiscriminability(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "Color Name discriminability check failed. The following color names are repeated: Royalblue (#5260d1, #005ebe)"
  );
  const fix = await suggestLintFix(examplePal, exampleLint);
  const oldColorNames = unique<string>(
    examplePal.colors.map((x) => getName(x))
  );
  expect(oldColorNames.length).toBe(1);
  const colorNames = unique<string>(fix[0].colors.map((x) => getName(x)));
  expect(colorNames.length).toBe(2);
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
  const examplePal = makePalFromHexes(tableau10);
  const cbDeuteranopia = CreateCustomLint(
    BUILT_INS.find((x) => x.id === "colorblind-friendly-deuteranopia-built-in")!
  );
  const exampleLint1 = new cbDeuteranopia(examplePal).run();
  expect(exampleLint1.passes).toBe(false);
  expect(exampleLint1.message).toMatchSnapshot();

  const cbProtanopia = CreateCustomLint(
    BUILT_INS.find((x) => x.id === "colorblind-friendly-protanopia-built-in")!
  );
  const exampleLint2 = new cbProtanopia(examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();

  const cbTritanopia = CreateCustomLint(
    BUILT_INS.find((x) => x.id === "colorblind-friendly-tritanopia-built-in")!
  );
  const exampleLint3 = new cbTritanopia(examplePal).run();
  expect(exampleLint3.passes).toBe(false);
  expect(exampleLint3.message).toMatchSnapshot();

  const cbGrayscale = CreateCustomLint(
    BUILT_INS.find((x) => x.id === "colorblind-friendly-grayscale-built-in")!
  );
  const exampleLint4 = new cbGrayscale(examplePal).run();
  expect(exampleLint4.passes).toBe(false);
  expect(exampleLint4.message).toMatchSnapshot();
});

const ughWhat = ["#00ffff", "#00faff", "#00e4ff", "#fdfdfc", "#00ffff"];
test("ColorLint - BackgroundDifferentiability", async () => {
  const examplePal = makePalFromHexes(ughWhat);
  const BackgroundDifferentiability = CreateCustomLint(
    BUILT_INS.find((x) => x.id === "background-contrast-built-in")!
  );
  const exampleLint = new BackgroundDifferentiability(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "This palette has some colors (#fdfdfc) that are close to the background color"
  );
  const fix = await suggestLintFix(examplePal, exampleLint).then((x) => x[0]);
  expect(fix.colors.map((x) => x.toHex())).toMatchSnapshot();

  examplePal.background = Color.colorFromHex("#00e4ff", "lab");
  const exampleLint2 = new BackgroundDifferentiability(examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toBe(
    "This palette has some colors (#0ff, #00faff, #00e4ff, #0ff) that are close to the background color"
  );
  const fix2 = await suggestLintFix(examplePal, exampleLint2).then((x) => x[0]);
  expect(fix2.colors.map((x) => x.toHex())).toMatchSnapshot();
});
