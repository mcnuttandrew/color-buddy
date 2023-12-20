import chroma from "chroma-js";
import { Color, colorFromString, colorFromChannels } from "./Color";
export const insert = (arr: Color[], newItem: Color, index?: number) => {
  if (index === undefined) {
    return [...arr, newItem];
  }
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
};

export const replaceVal = (arr: Color[], newItem: Color, index: number) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];
};

export const randChan = () => Math.floor(Math.random() * 255);
export const randColor = () =>
  colorFromString(`rgb(${randChan()},${randChan()},${randChan()})`, "lab");

// seeded random
export const seededPick = (seedInit: number) => {
  var seed = seedInit;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  return (arr: any[]) => arr[Math.floor(random() * arr.length)];
};
export const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export function avgColors(
  colors: Color[],
  colorSpace: "rgb" | "hsl" | "lab" = "rgb"
): Color {
  if (colors.length === 0) {
    return colorFromString("#000000", "lab");
  }

  type ColorChannels = [number, number, number];
  const sum = (a: ColorChannels, b: ColorChannels) =>
    a.map((x, i) => x + b[i]) as ColorChannels;
  const sumColor = colors.reduce((acc, x) => sum(acc, x.toChannels()), [
    0, 0, 0,
  ] as ColorChannels);
  const avgColor = sumColor.map((x) => x / colors.length) as ColorChannels;
  if (avgColor.some((x) => isNaN(x))) {
    return colorFromString("#000000", colorSpace);
  }
  return colorFromChannels(avgColor, colorSpace);
}

export function opposingColor(color: Color): Color {
  const c = color.toChroma().hsl();
  const channels = c.map((x, i) => (i === 0 ? (x + 180) % 360 : x));
  const chromaColor = chroma.hsl(channels[0], channels[1], channels[2]);
  return colorFromChannels(chromaColor.lab(), "lab");
}

export function deDup(arr: Color[]): Color[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item.toHex();
    return seen.has(k) ? false : seen.add(k);
  });
}
