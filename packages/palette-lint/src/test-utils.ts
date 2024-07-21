import { Color } from "color-buddy-palette";
import type { Palette } from "color-buddy-palette";

export const toPal = (colors: string[]): Palette => ({
  name: "test",
  type: "sequential",
  colorSpace: "lab",
  evalConfig: {},
  background: toColors(["#fff"])[0],
  colors: toColors(colors),
  tags: [],
});

export const toColors = (colors: string[]) =>
  colors.map((x) => Color.colorFromString(x, "lab"));
