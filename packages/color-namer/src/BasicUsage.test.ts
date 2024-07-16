import { test, expect } from "vitest";
import { nameColor } from "color-buddy-color-namer";
import { Color } from "color-buddy-palette";

test("Simple Usage", () => {
  [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#00FFFF",
    "#FF00FF",
    "#FFFFFF",
    "#000000",
    "#efebe8",
    "#f5f1f0",
    "#f9f8f7",
    "#f0eae8",
    "#f5f0ef",
    "#faf5f4",
    "#f5eddc",
    "#faf4e7",
    "#fefaf1",
    "#e9ebe0",
    "#f0f1e8",
    "#f7f7f0",
    "#ebebeb",
    "#f2f2f2",
    "#f9f9f9",
    "#dfe7e8",
    "#e9f0f1",
    "#f2f9f9",
    "#f3ebf3",
    "#f7f1f6",
    "#fbf7fb",
    "#e2e6f0",
    "#e9edf5",
    "#f0f3fa",
    "#e6ecf0",
    "#eef1f3",
    "#f2f6f7",
    "#ddebf0",
    "#e7f1f5",
    "#f0f7fa",
    "#dfedeb",
    "#e9f3f2",
    "#f3faf9",
    "#e8edda",
    "#eff3e3",
    "#f7faf0",
    "#f5ead7",
    "#f6eee3",
    "#faf5f0",
    "#f9e9e0",
    "#f9eee8",
    "#f9f3ef",
  ].forEach((hex) => {
    const color = Color.colorFromString(hex);
    const name = nameColor(color, { numResults: 1 })[0];
    expect(name, `${color} named correctly`).toMatchSnapshot();
  });
});
