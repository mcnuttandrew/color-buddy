import { expect, test } from "vitest";
import { processBodyTextToColors } from "./utils";

const reactVisColors = `
   '#19CDD7',
  '#DDB27C',
  '#88572C',
  '#FF991F',
  '#F15C17',
  '#223F9A',
  '#DA70BF',
  '#125C77',
  '#4DC19C',
  '#776E57',
  '#12939A',
  '#17B8BE',
  '#F6D18A',
  '#B7885E',
  '#FFCB99',
  '#F89570',
  '#829AE3',
  '#E79FD5',
  '#1E96BE',
  '#89DAC1',
  '#B3AD9E'
`;
const resultColors = [
  "#19CDD7",
  "#DDB27C",
  "#88572C",
  "#FF991F",
  "#F15C17",
  "#223F9A",
  "#DA70BF",
  "#125C77",
  "#4DC19C",
  "#776E57",
  "#12939A",
  "#17B8BE",
  "#F6D18A",
  "#B7885E",
  "#FFCB99",
  "#F89570",
  "#829AE3",
  "#E79FD5",
  "#1E96BE",
  "#89DAC1",
  "#B3AD9E",
];
const rvColorsShort = `
[
  '#12939A',
  '#79C7E3',
  '#1A3177',
  '#FF9833',
  '#EF5D28'
]
`;
// color spaces
const spaces = [
  "lab",
  "hsl",
  //
  "lch",
  "hsv",
];
test("processBodyTextToColors", async () => {
  spaces.forEach((space) => {
    const result1 = processBodyTextToColors(reactVisColors, space);
    expect(
      result1.map((x) => x.toHex().toUpperCase()),
      `Large rv colors in ${space} space should match`
    ).toEqual(resultColors);

    const result2 = processBodyTextToColors(rvColorsShort, space);
    expect(
      result2.map((x) => x.toHex().toUpperCase()),
      `Short rv colors in ${space} space should match`
    ).toEqual(["#12939A", "#79C7E3", "#1A3177", "#FF9833", "#EF5D28"]);
  });
});

test("processBodyTextToColors: zoom in", async () => {
  spaces.forEach((space) => {
    resultColors.forEach((color) => {
      expect(
        processBodyTextToColors(`   '${color}'`, space).map((x) =>
          x.toHex().toUpperCase()
        ),
        `Single color (${color}) in ${space} space should match`
      ).toEqual([color]);
    });
  });
});
