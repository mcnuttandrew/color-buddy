import chroma from "chroma-js";
export const insert = (arr: string[], newItem: string, index?: number) => {
  if (index === undefined) {
    return [...arr, newItem];
  }
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
};

export const replaceVal = (arr: string[], newItem: string, index: number) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];
};

export const deleteFrom = (arr: string[], index: number) => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const randChan = () => Math.floor(Math.random() * 255);
export const randColor = () =>
  chroma(`rgb(${randChan()},${randChan()},${randChan()})`).hex();

export const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export function avgColors(
  colors: string[],
  colorSpace: "rgb" | "hsl" | "lab" = "rgb"
) {
  if (colors.length === 0) {
    return "#000000";
  }
  const colorSpaceMap: Record<string, (color: string) => number[]> = {
    rgb: (x) => chroma(x).rgb(),
    hsl: (x) => chroma(x).hsl(),
    lab: (x) => chroma(x).lab(),
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
    return "#000000";
  }
  return colorSpaceFormatters[colorSpace](avgColor).hex();
}

export function opposingColor(color: string) {
  const c = chroma(color).hsl();
  const channels = c.map((x, i) => (i === 0 ? (x + 180) % 360 : x));
  return chroma.hsl(channels[0], channels[1], channels[2]).hex();
}
