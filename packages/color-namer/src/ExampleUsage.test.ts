import { test, expect } from "vitest";
// @ts-ignore
// EXAMPLE START
import { nameColor } from "color-buddy-color-namer";
import { Color } from "color-buddy-palette";

// basic usage
const red = Color.colorFromString("#FF0000");
const name = nameColor(red, { numResults: 3 });
const expectedResult = ["brightred", "redorange", "orangered"];

// provide a custom list of colors
const colors = [
  { name: "black", hex: "#000000" },
  { name: "blue", hex: "#0000FF" },
  { name: "cyan", hex: "#00FFFF" },
  { name: "green", hex: "#008000" },
  { name: "teal", hex: "#008080" },
  { name: "turquoise", hex: "#40E0D0" },
  { name: "indigo", hex: "#4B0082" },
  { name: "gray", hex: "#808080" },
  { name: "purple", hex: "#800080" },
  { name: "brown", hex: "#A52A2A" },
  { name: "tan", hex: "#D2B48C" },
  { name: "violet", hex: "#EE82EE" },
  { name: "beige", hex: "#F5F5DC" },
  { name: "fuchsia", hex: "#FF00FF" },
  { name: "gold", hex: "#FFD700" },
  { name: "magenta", hex: "#FF00FF" },
  { name: "orange", hex: "#FFA500" },
  { name: "pink", hex: "#FFC0CB" },
  { name: "red", hex: "#FF0000" },
  { name: "white", hex: "#FFFFFF" },
  { name: "yellow", hex: "#FFFF00" },
].map(({ name, hex }) => ({ name, color: Color.colorFromString(hex) }));

const name2 = nameColor(red, { colors });
const expectedResult2 = ["red"];

// EXAMPLE END

test("Example Usage", () => {
  expect(name).toStrictEqual(expectedResult);
  expect(name2).toStrictEqual(expectedResult2);
});
