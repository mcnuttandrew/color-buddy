import chroma from "chroma-js";
export const insert = (arr: string[], newItem: string, index?: number) => {
  if (index === undefined) {
    return [...arr, newItem];
  }
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
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
  const colorSpaceFormatters: Record<string, (color: number[]) => string> = {
    rgb: (x) => `rgb(${x.map((x) => Math.round(x)).join(",")})`,
    hsl: ([h, s, l]) => `hsl(${h}, ${s}%, ${l}%)`,
    lab: (x) => `lab(${x.map((x) => Math.round(x)).join(",")})`,
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
  return chroma(colorSpaceFormatters[colorSpace](avgColor)).hex();
}
