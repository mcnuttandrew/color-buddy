import { Color } from "./Color";
import type { Palette } from "../types";

export const toPal = (colors: string[]): Palette => ({
  name: "test",
  type: "sequential",
  colorSpace: "lab",
  evalConfig: {},
  background: toColors(["#fff"])[0],
  colors: toColorWithSemantics(colors),
  tags: [],
});
const wrapWithSemantics = (color: Color) => ({
  size: undefined,
  markType: undefined,
  tags: [],
  color,
});
export const toColors = (colors: string[]) =>
  colors.map((x) => Color.colorFromString(x, "lab"));
export const toColorWithSemantics = (colors: string[]) =>
  colors.map((x) => wrapWithSemantics(Color.colorFromString(x, "lab")));
