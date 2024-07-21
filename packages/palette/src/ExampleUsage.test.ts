import { expect, test } from "vitest";
// EXAMPLE START
import { makePalFromString, Color } from "color-buddy-palette";

const stringColors = [
  "lab(50% 0 0)",
  "lab(100.00000139649632% -0.000007807961277528364 0.000006766250648659877)",
  "oklab(1.000000009791752,-3.3637913787742946e-8,6.836016341882356e-8)",
  "rgb(86,17,229)",
  "red",
];
const background = "black";

const palette = makePalFromString(stringColors, background);
// convert to LCH space
const newPal = {
  ...palette,
  colors: palette.colors.map((color) => color.toColorSpace("lch")),
};

const newColor = Color.colorFromString("#ff0000").toColorSpace("lch");
newPal.colors.push(newColor);

// EXAMPLE END

test("Example Usage", () => {
  expect(palette.colors.map((x) => x.spaceName).every((x) => x === "lab")).toBe(
    true
  );
  expect(newPal.colors.map((x) => x.spaceName).every((x) => x === "lch")).toBe(
    true
  );
});
