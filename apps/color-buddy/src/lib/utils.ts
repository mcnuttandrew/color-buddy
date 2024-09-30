import {
  Color,
  ColorSpaceDirectory,
  makePalFromString,
} from "color-buddy-palette";
import type { Palette, StringPalette } from "color-buddy-palette";

import { Formatter, FracturedJsonOptions, EolStyle } from "fracturedjsonjs";
import fits from "../assets/outfits.json";

const options = new FracturedJsonOptions();
options.MaxTotalLineLength = 120;
options.MaxInlineComplexity = 2;
options.JsonEolStyle = EolStyle.Crlf;

const formatter = new Formatter();
formatter.Options = options;

export function JSONStringify(obj: string) {
  return formatter.Reformat(obj);
}
export function JSONToPrettyString(program: any) {
  return JSONStringify(JSON.stringify(program));
}

type ColorSpace = keyof typeof ColorSpaceDirectory;
export const colorPickerConfig = Object.fromEntries(
  (Object.keys(ColorSpaceDirectory) as ColorSpace[]).map((name: ColorSpace) => {
    const space = (ColorSpaceDirectory as any)[name] as typeof Color;
    const exampleColor = new (ColorSpaceDirectory as any)[name]() as Color;
    const { x, y, z } = space.dimensionToChannel;
    return [
      name,
      {
        advancedSpace: space.advancedSpace,
        axisLabel: space.axisLabel,
        description: space.description,
        isPolar: space.isPolar,
        title: space.name,
        xChannel: x,
        xChannelIndex: space.channelNames.indexOf(x),
        xDomain: space.domains[x],
        xStep: space.stepSize[1],
        yChannel: y,
        yChannelIndex: space.channelNames.indexOf(y),
        yDomain: space.domains[y],
        yStep: space.stepSize[2],
        zChannel: z,
        zChannelIndex: space.channelNames.indexOf(z),
        zDomain: space.domains[z],
        zStep: space.stepSize[0],
      },
    ];
  })
);

export const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export function avgColors(
  colors: Color[],
  colorSpace: "rgb" | "hsl" | "lab" = "rgb"
): Color {
  if (colors.length === 0) {
    return Color.colorFromString("#000000", "lab");
  }

  type ColorChannels = [number, number, number];
  const sum = (a: ColorChannels, b: ColorChannels) =>
    a.map((x, i) => x + b[i]) as ColorChannels;
  const sumColor = colors.reduce((acc, x) => sum(acc, x.toChannels()), [
    0, 0, 0,
  ] as ColorChannels);
  const avgColor = sumColor.map((x) => x / colors.length) as ColorChannels;
  if (avgColor.some((x) => isNaN(x))) {
    return Color.colorFromString("#000000", colorSpace as any);
  }
  return Color.colorFromChannels(avgColor, colorSpace as any);
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

export const extent = (arr: number[]) => [Math.min(...arr), Math.max(...arr)];
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

const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];
const outfits = fits.map((x) => outfitToPal(x));

export function newGenericPal(name: string): Palette {
  const newPal = makePalFromString(pick(outfits));
  newPal.name = name;
  return newPal;
}

const dragExtent = (
  dragBox: { x: number; y: number },
  dragging: { x: number; y: number },
  parentPos: { x: number; y: number }
) => {
  const xMin = Math.min(dragging.x, dragBox.x) - parentPos.x;
  const xMax = Math.max(dragging.x, dragBox.x) - parentPos.x;
  const yMin = Math.min(dragging.y, dragBox.y) - parentPos.y;
  const yMax = Math.max(dragging.y, dragBox.y) - parentPos.y;
  return { xMin, xMax, yMin, yMax };
};

type selectColorsFromDrag = (
  dragBox: { x: number; y: number },
  dragging: { x: number; y: number },
  parentPos: { x: number; y: number },
  colors: Color[],
  config: {
    isPolar: boolean;
    plotHeight: number;
    plotWidth: number;
    x: (color: Color) => number;
    y: (color: Color) => number;
    z: (color: Color) => number;
  }
) => number[];

const between = (x: number, a: number, b: number) => a <= x && x <= b;
export const selectColorsFromDragZ: selectColorsFromDrag = (
  dragBox,
  dragging,
  parentPos,
  colors,
  config
) => {
  const { yMin, yMax } = dragExtent(dragBox, dragging, parentPos);
  // magic offset required to make the selection box work
  // dunno why
  const magicOffset = 15;
  const newFocusedColors = colors
    .map((color, idx) =>
      between(config.z(color) + magicOffset, yMin, yMax) ? idx : -1
    )
    .filter((x) => x !== -1);
  return [...newFocusedColors];
};

export const selectColorsFromDrag: selectColorsFromDrag = (
  dragBox,
  dragging,
  parentPos,
  colors,
  config
) => {
  const { xMin, xMax, yMin, yMax } = dragExtent(dragBox, dragging, parentPos);

  // check if selected in screen space
  const newFocusedColors = colors
    .map((color, idx) => {
      let [xVal, yVal] = [config.x(color), config.y(color)];
      if (config.isPolar) {
        xVal += config.plotWidth / 2;
        yVal += config.plotHeight / 2;
      }
      const inXBound = between(xVal, xMin, xMax);
      const inYBound = between(yVal, yMin, yMax);
      return inXBound && inYBound ? idx : -1;
    })
    .filter((x) => x !== -1);
  return [...newFocusedColors];
};

export const toXY = (e: any) => {
  const touches = e?.touches?.length ? e.touches : e?.changedTouches || [];
  const x = [...touches].at(0)?.clientX || e.clientX;
  const y = [...touches].at(0)?.clientY || e.clientY;
  return { x, y };
};

type Channels = [number, number, number];
export function makeScales(
  scales: {
    rScale: any;
    angleScale: any;
    xScale: any;
    yScale: any;
    zScale: any;
  },
  config: (typeof colorPickerConfig)[string]
) {
  const { rScale, angleScale, xScale, yScale, zScale } = scales;
  const xPre = config.isPolar
    ? (coords: Channels) => {
        const r = rScale(coords[config.xChannelIndex]);
        const theta = angleScale(coords[config.yChannelIndex]);
        return r * Math.cos(theta);
      }
    : (coords: Channels) => xScale(coords[config.xChannelIndex]);
  const yPre = config.isPolar
    ? (coords: Channels) => {
        const r = rScale(coords[config.xChannelIndex]);
        const theta = angleScale(coords[config.yChannelIndex]);
        return r * Math.sin(theta);
      }
    : (coords: Channels) => yScale(coords[config.yChannelIndex]);
  const zPre = (coords: Channels) => zScale(coords[config.zChannelIndex]);
  const x = (color: Color) => xPre(color.toChannels());
  const y = (color: Color) => yPre(color.toChannels());
  const z = (color: Color) => zPre(color.toChannels());
  // screen -> color space
  const xInv = config.isPolar
    ? (x: number, y: number) => rScale.invert(Math.sqrt(x * x + y * y))
    : (x: number) => xScale.invert(x);
  const yInv = config.isPolar
    ? (x: number, y: number) => {
        const angle = angleScale.invert(Math.atan2(y, x)) % 360;
        return angle < 0 ? angle + 360 : angle;
      }
    : (x: number, y: number) => yScale.invert(y);
  const zInv = (z: number) => zScale.invert(z);
  return { x, y, z, xInv, yInv, zInv };
}

type dragEventToColor = (
  e: any,
  originalColor: Color,
  originalPos: { x: number; y: number },
  config: (typeof colorPickerConfig)[string],
  scales: ReturnType<typeof makeScales>,
  colorSpace: any,
  dragDelta: { x: number; y: number }
) => Color;
export const dragEventToColorZ: dragEventToColor = (
  e,
  originalColor,
  originalPos,
  config,
  scales,
  colorSpace,
  dragDelta
) => {
  const { zInv, z } = scales;
  const screenPosDelta = toXY(e).y - originalPos.y + dragDelta.y;
  const coords = originalColor.toChannels();
  const zClamp = (v: number) => clampToRange(v, config.zDomain);
  coords[config.zChannelIndex] = zClamp(
    zInv(z(originalColor) + screenPosDelta)
  );

  const newColor = Color.colorFromChannels(coords, colorSpace);
  newColor.tags = originalColor.tags;
  return newColor;
};

export const dragEventToColorXY: dragEventToColor = (
  e,
  originalColor,
  originalPos,
  config,
  scales,
  colorSpace,
  dragDelta
) => {
  const { x, y, xInv, yInv } = scales;
  const values = toXY(e);
  const screenPosDelta = {
    x: values.x - originalPos.x + dragDelta.x,
    y: values.y - originalPos.y + dragDelta.y,
  };

  const xClamp = (v: number) => clampToRange(v, config.xDomain);
  const yClamp = (v: number) => clampToRange(v, config.yDomain);
  // screen coordinates
  const newPos = [
    x(originalColor) + screenPosDelta.x,
    y(originalColor) + screenPosDelta.y,
  ];
  // color space coordinates
  const newVal = [
    xClamp(xInv(newPos[0], newPos[1])),
    yClamp(yInv(newPos[0], newPos[1])),
  ];
  const coords = originalColor.toChannels();
  coords[config.xChannelIndex] = newVal[0];
  coords[config.yChannelIndex] = newVal[1];
  const newColor = Color.colorFromChannels(coords, colorSpace);
  newColor.tags = originalColor.tags;
  return newColor;
};

export const screenSpaceAvg = (colors: { x: number; y: number }[]) => {
  const xAvg = colors.reduce((acc, x) => acc + x.x, 0) / colors.length;
  const yAvg = colors.reduce((acc, x) => acc + x.y, 0) / colors.length;
  return { x: xAvg, y: yAvg };
};

export const titleCase = (str: string) =>
  str
    .split(" ")
    .map((x) => (x.at(0) || "").toUpperCase() + x.slice(1))
    .join(" ");

export const oxfordJoin = (arr: string[]) => {
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr.join(" and ");
  return arr.slice(0, -1).join(", ") + ", and " + arr.slice(-1);
};

export function summarizePal(pal: Palette) {
  const tagsMsg = pal.tags.length
    ? ` It is has the following properties: ${oxfordJoin(pal.tags)}.`
    : "";
  return `This is a ${pal.type} palette called '${pal.name}'.${tagsMsg}`;
}

export function dealWithFocusEvent(
  e: any,
  clickedItem: number,
  focusedItems: number[]
) {
  const newFocusedItems = toggleElement(focusedItems, clickedItem);
  if (e.shiftKey || e.ctrlKey || e.metaKey) {
    return newFocusedItems;
  }
  const itemInFocus = newFocusedItems.includes(clickedItem);
  const numFocused = focusedItems.length;
  if (numFocused > 1) {
    return [clickedItem];
  }
  return itemInFocus ? [clickedItem] : [];
}

type ParseBlock = { content: string; type: "text" | "color" };
let parseBlockCache: Record<string, ParseBlock[]> = {};
export function splitMessageIntoTextAndColors(message: string): ParseBlock[] {
  if (parseBlockCache[message]) {
    return parseBlockCache[message];
  }
  const output = [] as ParseBlock[];
  let currentTextBlock = "";
  let idx = 0;
  while (idx < message.length) {
    if (message[idx] === "#") {
      const allowedChars = new Set("0123456789abcdefABCDEF");
      let hexLength = 0;
      while (allowedChars.has(message[idx + hexLength + 1]) && hexLength < 7) {
        hexLength++;
      }
      if (currentTextBlock.length > 0) {
        output.push({ content: currentTextBlock, type: "text" });
        currentTextBlock = "";
      }
      let color = message.slice(idx, idx + hexLength + 1);
      if (hexLength === 3 || hexLength === 6) {
        output.push({ content: color, type: "color" });
      } else {
        output.push({ content: color, type: "text" });
      }
      idx += hexLength;
    } else {
      currentTextBlock += message[idx];
    }
    idx++;
  }
  if (currentTextBlock.length > 0) {
    output.push({ content: currentTextBlock, type: "text" });
  }
  parseBlockCache[message] = output;

  return output;
}

export function processBodyTextToColors(body: string, colorSpace: string) {
  return body
    .split(",")
    .map((x) =>
      x
        // remove all quotes
        .replace(/"/g, "")
        .replace(/'/g, "")
        // remove all parens and brackets
        .replace(/[\(\)\[\]]/g, "")
        .trim()
    )
    .filter((x) => x.length > 0)
    .map((x) => Color.colorFromString(x, colorSpace as any, true));
}

export let convertPalToSpace = (
  pal: Palette,
  colorSpace: ColorSpace
): Palette => ({
  ...pal,
  colorSpace,
  background: Color.toColorSpace(pal.background, colorSpace),
  colors: pal.colors.map((x) => Color.toColorSpace(x, colorSpace)),
});

export function stringPalToColorPal(pal: StringPalette): Palette {
  const result = {
    ...pal,
    background: Color.colorFromString(pal.background, pal.colorSpace),
    colors: pal.colors.map((x) => {
      // catch old versions
      if (typeof x === "string") {
        const color = Color.colorFromString(x, pal.colorSpace);
        color.tags = [];
        return color;
      }
      const color = Color.colorFromString(x.color, pal.colorSpace);
      color.tags = x.tags;
      return color;
    }),
  };

  return result;
}

export function colorPalToStringPal(pal: Palette): StringPalette {
  return {
    ...pal,
    background: pal.background.toString(),
    colors: pal.colors.map((x) => {
      return { color: x.toString(), tags: x.tags };
    }),
  };
}

export function newVersionName(name: string, previousNames: string[]): string {
  let newName = name;
  let version = 2;
  while (previousNames.includes(newName)) {
    newName = `${name} v${version}`;
    version++;
  }
  return newName;
}
