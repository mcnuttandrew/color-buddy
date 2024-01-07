import chroma from "chroma-js";
import { Color, colorFromString, colorFromChannels } from "./Color";
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

const extent = (arr: number[]) => [Math.min(...arr), Math.max(...arr)];
export function makeExtents(arr: number[][]) {
  return {
    x: extent(arr.map((x) => x[1])),
    y: extent(arr.map((x) => x[2])),
    z: extent(arr.map((x) => x[0])),
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
  {} as Record<string, PalType>
);
