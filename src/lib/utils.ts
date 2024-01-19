import {
  Color,
  colorFromString,
  colorFromChannels,
  colorPickerConfig,
} from "./Color";
import type { PalType } from "../stores/color-store";
export const insert = (arr: Color[], newItem: Color, index?: number) => {
  if (index === undefined) {
    return [...arr, newItem];
  }
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
};

export const replaceVal = (arr: Color[], newItem: Color, index: number) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];
};

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
    return colorFromString("#000000", colorSpace as any);
  }
  return colorFromChannels(avgColor, colorSpace as any);
}

export function deDup(arr: Color[]): Color[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item.toHex();
    return seen.has(k) ? false : seen.add(k);
  });
}

export function clipToGamut(color: Color): [number, number, number] {
  if (color.inGamut()) {
    console.log("branch a");
    const channels = Object.entries(color.domains).map(([key, domain]) => {
      const [min, max] = domain.sort();
      return clamp(color.channels[key], min, max);
    });
    return channels as [number, number, number];
  } else {
    const newChannels = color
      .toColorIO()
      .to("srgb")
      .toGamut()
      .to(color.spaceName).coords;
    return newChannels;
  }
}

export function draggable(node: any) {
  let x: number;
  let y: number;
  function handleMousedown(event: {
    type: string;
    touches: any[];
    clientX: any;
    clientY: any;
  }) {
    if (event.type === "touchstart") {
      event = event.touches[0];
    }
    x = event.clientX;
    y = event.clientY;
    node.dispatchEvent(new CustomEvent("dragstart", { detail: { x, y } }));
    // @ts-ignore
    window.addEventListener("mousemove", handleMousemove);
    // @ts-ignore
    window.addEventListener("mouseup", handleMouseup);
    // @ts-ignore
    window.addEventListener("touchmove", handleMousemove);
    // @ts-ignore
    window.addEventListener("touchend", handleMouseup);
  }
  function handleMousemove(event: {
    type: string;
    changedTouches: any[];
    clientX: number;
    clientY: number;
  }) {
    if (event.type === "touchmove") {
      event = event.changedTouches[0];
    }
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    x = event.clientX;
    y = event.clientY;
    node.dispatchEvent(
      new CustomEvent("dragmove", {
        detail: { x, y, dx, dy },
      })
    );
  }
  function handleMouseup(event: { clientX: any; clientY: any }) {
    x = event.clientX;
    y = event.clientY;
    node.dispatchEvent(
      new CustomEvent("dragend", {
        detail: { x, y },
      })
    );
    // @ts-ignore
    window.removeEventListener("mousemove", handleMousemove);
    // @ts-ignore
    window.removeEventListener("mouseup", handleMouseup);
    // @ts-ignore
    window.removeEventListener("touchmove", handleMousemove);
    // @ts-ignore
    window.removeEventListener("touchend", handleMouseup);
  }
  node.addEventListener("mousedown", handleMousedown);
  node.addEventListener("touchstart", handleMousedown);
  return {
    destroy() {
      node.removeEventListener("mousedown", handleMousedown);
      node.removeEventListener("touchstart", handleMousedown);
    },
  };
}

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export const toggleElement = (arr: number[], el: number) => {
  const arrSet = new Set(arr);
  return arrSet.has(el) ? arr.filter((x) => x !== el) : [...arr, el];
};

export const swap = (arr: any[], i: number, j: number) => {
  const newArr = [...arr];
  const temp = newArr[i];
  newArr[i] = newArr[j];
  newArr[j] = temp;
  return newArr;
};

const colorBrewerTypeMap = {
  diverging: [
    "Spectral",
    "RdYlGn",
    "RdBu",
    "PiYG",
    "PRGn",
    "RdYlBu",
    "BrBG",
    "RdGy",
    "PuOr",
  ],

  categorical: [
    "Set2",
    "Accent",
    "Set1",
    "Set3",
    "Dark2",
    "Paired",
    "Pastel2",
    "Pastel1",
  ],

  sequential: [
    "OrRd",
    "PuBu",
    "BuPu",
    "Oranges",
    "BuGn",
    "YlOrBr",
    "YlGn",
    "Reds",
    "RdPu",
    "Greens",
    "YlGnBu",
    "Purples",
    "GnBu",
    "Greys",
    "YlOrRd",
    "PuRd",
    "Blues",
    "PuBuGn",
    "viridis",
  ],
};
export const colorBrewerMapToType = Object.entries(colorBrewerTypeMap).reduce(
  (acc, [type, maps]) => {
    maps.forEach((map) => {
      acc[map.toLowerCase()] = type.toLowerCase();
    });
    return acc;
  },
  {} as any
) as Record<string, PalType>;

const extent = (arr: number[]) => [Math.min(...arr), Math.max(...arr)];
function makeExtents(arr: number[][]) {
  return Object.fromEntries(
    ["x", "y", "z"].map((key, idx) => [key, extent(arr.map((el) => el[idx]))])
  ) as { x: number[]; y: number[]; z: number[] };
}

// works over screen space coordinates
export function makePosAndSizes(pickedColors: number[][]) {
  const selectionExtents = makeExtents(pickedColors);
  const makePos = (key: keyof typeof selectionExtents) =>
    selectionExtents[key][0];
  const diff = (key: keyof typeof selectionExtents) => {
    const [a, b] = selectionExtents[key];
    return Math.abs(a - b);
  };

  let xPos = makePos("x") - 15;
  let yPos = makePos("y") - 15;
  let zPos = makePos("z");
  let selectionWidth = diff("x") + 30;
  let selectionHeight = diff("y") + 30;
  let selectionDepth = diff("z");
  return { xPos, yPos, zPos, selectionWidth, selectionHeight, selectionDepth };
}

export const clampToRange = (val: number, range: number[]) => {
  const min = Math.min(...range);
  const max = Math.max(...range);
  return Math.min(Math.max(val, min), max);
};
