import { expect, test } from "vitest";
import {
  Color,
  ColorSpaceDirectory,
  distributePoints,
} from "color-buddy-palette";

test("Color string extractor works", () => {
  expect(Color.stringToChannels("lab", "lab(50% 0 0)")).toStrictEqual([
    50, 0, 0,
  ]);
  expect(
    Color.stringToChannels(
      "lab",
      "lab(100.00000139649632% -0.000007807961277528364 0.000006766250648659877)"
    )
  ).toStrictEqual([
    100.00000139649632, -0.000007807961277528364, 0.000006766250648659877,
  ]);
  expect(
    Color.stringToChannels(
      "oklab",
      "oklab(1.000000009791752,-3.3637913787742946e-8,6.836016341882356e-8)"
    )
  ).toStrictEqual([
    1.000000009791752, -3.3637913787742946e-8, 6.836016341882356e-8,
  ]);

  expect(Color.stringToChannels("rgb", "rgb(86,17,229)")).toStrictEqual([
    86, 17, 229,
  ]);
});

test("All color spaces do round trip to each other correctly", () => {
  const colors = [
    "#d390b6",
    "#30421e",
    "#ce7985",
    "#0086ac",
    "#ffeae0",
    "#fff",
    "#000",
    "#f00",
    "#0f0",
    "#00f",
    "#9bc0b8",
    "#dad668",
    "#668757",
    "#546a3b",
    "#346859",
    "#949934",
    "#ff3681",
  ];
  const skipped = new Set(["rgb"]);
  const spaces = Object.keys(ColorSpaceDirectory).filter(
    (x) => !skipped.has(x)
  );
  colors.forEach((color) => {
    spaces.forEach((spaceA) =>
      spaces.forEach((spaceB) => {
        const oldColor = Color.colorFromHex(color, spaceA as any);
        const newColor = oldColor.toColorSpace(spaceB as any);
        expect(
          newColor.toHex(),
          `One Way: Translating ${spaceA} to ${spaceB}`
        ).toBe(oldColor.toHex());
        expect(newColor.toDisplay()).toBe(oldColor.toHex());
        const finalColor = newColor.toColorSpace(spaceA as any);
        expect(
          finalColor.toHex(),
          `Round trip: translating ${spaceA} to ${spaceB} to ${spaceA}`
        ).toBe(oldColor.toHex());

        const altColor = Color.colorFromHex(color, spaceB as any);
        expect(
          altColor.toHex(),
          `Alt color: ${color} in ${spaceB} should be ${color}`
        ).toBe(color);
      })
    );
  });
});

test("In gamut tests", () => {
  const colors = [
    "#f00",
    "#ff0",
    "#0f0",
    "#0ff",
    "#00f",
    "#f0f",
    "#fff",
    "#888",
    "#000",
  ];
  const spaces = ["lab"];
  colors.forEach((color) => {
    spaces.forEach((space) => {
      const colorObj = Color.colorFromHex(color, space as any);
      expect(colorObj.inGamut(), `${color} from ${space} to be in gamut`).toBe(
        true
      );
    });
  });
});

test("Distribute colors", () => {
  const exampleColors = ["#072536", "#144327", "#dea1db", "#c6338f", "#822b21"];
  const colors = exampleColors.map((hex) => Color.colorFromHex(hex, "hsl"));

  const result = distributePoints(
    { direction: "in z space", name: "L" },
    exampleColors.map((_, idx) => idx),
    colors,
    "hsl"
  );
  expect(result.map((x) => x.toHex())).toMatchSnapshot();
});
