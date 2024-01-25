import { expect, test } from "vitest";

import { Color } from "./Color";
import type { Palette } from "../stores/color-store";

import ColorNameDiscriminability, { getName } from "./lints/name-discrim";
import MaxColors from "./lints/max-colors";
import ColorBlind from "./lints/blind-check";
import BackgroundDifferentiability from "./lints/background-differentiability";

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
  const fix = await exampleLint.suggestFix();
  const oldColorNames = unique<string>(
    examplePal.colors.map((x) => getName(x))
  );
  expect(oldColorNames.length).toBe(1);
  const colorNames = unique<string>(fix[0].colors.map((x) => getName(x)));
  expect(colorNames.length).toBe(2);
});

test("ColorLint - MaxColors", async () => {
  const examplePal = makePalFromHexes([...new Array(15)].map(() => "#006cc6"));
  const exampleLint = new MaxColors(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "This palette has too many colors (15) and may be hard to discriminate in some contexts. Maximum: 10."
  );
  const fix = await exampleLint.suggestFix().then((x) => x[0]);
  expect(fix.colors.length).toBe(9);
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
  const exampleLint1 = new ColorBlind[0](examplePal).run();
  expect(exampleLint1.passes).toBe(false);
  expect(exampleLint1.message).toMatchSnapshot();

  const exampleLint2 = new ColorBlind[1](examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toMatchSnapshot();

  const exampleLint3 = new ColorBlind[2](examplePal).run();
  expect(exampleLint3.passes).toBe(false);
  expect(exampleLint3.message).toMatchSnapshot();
});

const ughWhat = ["#00ffff", "#00faff", "#00e4ff", "#fdfdfc", "#00ffff"];
test("ColorLint - BackgroundDifferentiability", async () => {
  const examplePal = makePalFromHexes(ughWhat);
  const exampleLint = new BackgroundDifferentiability(examplePal).run();
  expect(exampleLint.passes).toBe(false);
  expect(exampleLint.message).toBe(
    "This palette has some colors (#fdfdfc) that are close to the background color"
  );
  const fix = await exampleLint.suggestFix().then((x) => x[0]);
  expect(fix.colors.map((x) => x.toHex())).toMatchSnapshot();

  examplePal.background = Color.colorFromHex("#00e4ff", "lab");
  const exampleLint2 = new BackgroundDifferentiability(examplePal).run();
  expect(exampleLint2.passes).toBe(false);
  expect(exampleLint2.message).toBe(
    "This palette has some colors (#0ff, #00faff, #00e4ff, #0ff) that are close to the background color"
  );
  const fix2 = await exampleLint2.suggestFix().then((x) => x[0]);
  expect(fix2.colors.map((x) => x.toHex())).toMatchSnapshot();
});
