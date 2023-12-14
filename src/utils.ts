import chroma from "chroma-js";
import type { Color } from "chroma-js";
export const insert = (arr: Color[], newItem: Color, index?: number) => {
  if (index === undefined) {
    return [...arr, newItem];
  }
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
};

export const replaceVal = (arr: Color[], newItem: Color, index: number) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];
};

export const deleteFrom = (arr: Color[], index: number) => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const randChan = () => Math.floor(Math.random() * 255);
export const randColor = () =>
  chroma(`rgb(${randChan()},${randChan()},${randChan()})`);

export const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const toLab = (color: Color) => `lab(${color.lab().join(",")})`;

export function avgColors(
  colors: Color[],
  colorSpace: "rgb" | "hsl" | "lab" = "rgb"
): Color {
  if (colors.length === 0) {
    return chroma("#000000");
  }
  const colorSpaceMap: Record<string, (color: Color) => number[]> = {
    rgb: (x) => x.rgb(),
    hsl: (x) => x.hsl(),
    lab: (x) => x.lab(),
  };
  const colorSpaceFormatters: any = {
    rgb: (x: number[]) => chroma.rgb(x[0], x[1], x[2]),
    hsl: (x: number[]) => chroma.hsl(x[0], x[1], x[2]),
    lab: (x: number[]) => chroma.lab(x[0], x[1], x[2]),
  };
  const sum = (a: any[], b: any[]) => a.map((x, i) => x + b[i]);
  const sumColor = colors.reduce(
    (acc, x) => sum(acc, colorSpaceMap[colorSpace](x)),
    [0, 0, 0]
  );
  const avgColor = sumColor.map((x) => x / colors.length);
  if (avgColor.some((x) => isNaN(x))) {
    return chroma("#000000");
  }
  return colorSpaceFormatters[colorSpace](avgColor);
}

export function opposingColor(color: Color): Color {
  const c = color.hsl();
  const channels = c.map((x, i) => (i === 0 ? (x + 180) % 360 : x));
  return chroma.hsl(channels[0], channels[1], channels[2]);
}
