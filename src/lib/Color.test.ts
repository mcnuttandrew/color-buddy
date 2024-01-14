import { expect, test } from "vitest";
import { stringToChannels } from "./Color";

test("Color string extractor works", () => {
  expect(stringToChannels("lab", "lab(50% 0 0)")).toStrictEqual([50, 0, 0]);
  expect(
    stringToChannels(
      "lab",
      "lab(100.00000139649632% -0.000007807961277528364 0.000006766250648659877)"
    )
  ).toStrictEqual([
    100.00000139649632, -0.000007807961277528364, 0.000006766250648659877,
  ]);
  expect(
    stringToChannels(
      "oklab",
      "oklab(1.000000009791752,-3.3637913787742946e-8,6.836016341882356e-8)"
    )
  ).toStrictEqual([
    1.000000009791752, -3.3637913787742946e-8, 6.836016341882356e-8,
  ]);

  expect(stringToChannels("rgb", "rgb(86,17,229)")).toStrictEqual([
    86, 17, 229,
  ]);
});
