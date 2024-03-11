import { Color, colorPickerConfig } from "./Color";
import type { Palette, StringPalette, ColorWrap } from "../types";
import type { LintProgram } from "./lint-language/lint-type";
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
export function JSONToPrettyString(program: LintProgram) {
  return JSONStringify(JSON.stringify(program));
}

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

export function deDup(arr: ColorWrap<Color>[]): ColorWrap<Color>[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item.color.toHex();
    return seen.has(k) ? false : seen.add(k);
  });
}

export function clipToGamut(color: Color): [number, number, number] {
  if (color.inGamut()) {
    const space = color.constructor as typeof Color;
    const channels = Object.entries(space.domains).map(([key, domain]) => {
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

export const toHex = (x: string) => {
  let idx = 0;
  const colors = [];
  while (idx < x.length) {
    colors.push(`#${x.slice(idx, idx + 6)}`);
    idx += 6;
  }
  return colors;
};

const defaultHexPal: StringPalette = {
  name: "new palette",
  colors: [],
  background: "#ffffff",
  type: "categorical",
  evalConfig: {},
  colorSpace: "lab",
  intendedAffects: [],
  intendedContexts: [],
};
export const makePal = (
  name: string,
  colors: string[],
  colorSpace: any,
  type: any = "categorical"
) => {
  return {
    ...defaultHexPal,
    name,
    colors: colors.map((x) =>
      wrapInBlankSemantics(Color.colorFromString(x, colorSpace))
    ),
    background: Color.colorFromString("#ffffff", colorSpace),
    type,
  };
};

export const wrapInBlankSemantics = (x: Color): ColorWrap<Color> => ({
  color: x,
  markType: undefined,
  size: undefined,
  tags: [],
});

export const wrapInBlankStringSemantics = (x: string): ColorWrap<string> => ({
  color: x,
  markType: undefined,
  size: undefined,
  tags: [],
});

export function createPalFromHexes(colors: string[]): StringPalette {
  return {
    ...defaultHexPal,
    colors: colors.map((x) => wrapInBlankStringSemantics(x)),
  };
}
const outfitToPal = (x: any) => [x.fill1, x.fill2, x.fill3];
const outfits = fits.map((x) => outfitToPal(x));
export function newGenericPal(name: string): StringPalette {
  return {
    ...defaultHexPal,
    name,
    colors: pick(outfits).map((x: string) => wrapInBlankStringSemantics(x)),
  };
}
export function makePalFromString(
  strings: string[],
  bg: string = "#ffffff"
): Palette {
  return {
    ...defaultHexPal,
    colors: strings.map((str) =>
      wrapInBlankSemantics(Color.colorFromString(str))
    ),
    background: Color.colorFromString(bg, "lab"),
  };
}

export const toPal = (
  colors: string[],
  currentPal: Palette,
  colorSpace: any
): Palette => {
  return {
    ...defaultHexPal,
    colors: colors.map((x) =>
      wrapInBlankSemantics(Color.colorFromString(x, colorSpace))
    ),
    name: "mods",
    background: currentPal.background,
    type: currentPal.type,
  };
};

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
  colors: ColorWrap<Color>[],
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
      between(config.z(color.color) + magicOffset, yMin, yMax) ? idx : -1
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
      let [xVal, yVal] = [config.x(color.color), config.y(color.color)];
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
  originalColor: ColorWrap<Color>,
  originalPos: { x: number; y: number },
  config: (typeof colorPickerConfig)[string],
  scales: ReturnType<typeof makeScales>,
  colorSpace: any,
  dragDelta: { x: number; y: number }
) => ColorWrap<Color>;
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
  const coords = originalColor.color.toChannels();
  const zClamp = (v: number) => clampToRange(v, config.zDomain);
  coords[config.zChannelIndex] = zClamp(
    zInv(z(originalColor.color) + screenPosDelta)
  );

  return {
    ...originalColor,
    color: Color.colorFromChannels(coords, colorSpace),
  };
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
    x(originalColor.color) + screenPosDelta.x,
    y(originalColor.color) + screenPosDelta.y,
  ];
  // color space coordinates
  const newVal = [
    xClamp(xInv(newPos[0], newPos[1])),
    yClamp(yInv(newPos[0], newPos[1])),
  ];
  const coords = originalColor.color.toChannels();
  coords[config.xChannelIndex] = newVal[0];
  coords[config.yChannelIndex] = newVal[1];
  return {
    ...originalColor,
    color: Color.colorFromChannels(coords, colorSpace),
  };
};

export const screenSpaceAvg = (colors: { x: number; y: number }[]) => {
  const xAvg = colors.reduce((acc, x) => acc + x.x, 0) / colors.length;
  const yAvg = colors.reduce((acc, x) => acc + x.y, 0) / colors.length;
  return { x: xAvg, y: yAvg };
};

export const checkLevelToSymbol = {
  error: "❌",
  warning: "⚠️",
} as any;

export const webColors = [
  "INDIANRED",
  "LIGHTCORAL",
  "SALMON",
  "DARKSALMON",
  "LIGHTSALMON",
  "CRIMSON",
  "RED",
  "DARKRED",
  "PINK",
  "LIGHTPINK",
  "HOTPINK",
  "DEEPPINK",
  "MEDIUMVIOLETRED",
  "PALEVIOLETRED",
  "CORAL",
  "TOMATO",
  "ORANGERED",
  "DARKORANGE",
  "ORANGE",
  "GOLD",
  "YELLOW",
  "LIGHTYELLOW",
  "LEMONCHIFFON",
  "LIGHTGOLDENRODYELLOW",
  "PAPAYAWHIP",
  "MOCCASIN",
  "PEACHPUFF",
  "PALEGOLDENROD",
  "KHAKI",
  "DARKKHAKI",
  "LAVENDER",
  "THISTLE",
  "PLUM",
  "VIOLET",
  "ORCHID",
  "FUCHSIA",
  "MAGENTA",
  "MEDIUMORCHID",
  "MEDIUMPURPLE",
  "REBECCAPURPLE",
  "BLUEVIOLET",
  "DARKVIOLET",
  "DARKORCHID",
  "DARKMAGENTA",
  "PURPLE",
  "INDIGO",
  "SLATEBLUE",
  "DARKSLATEBLUE",
  "MEDIUMSLATEBLUE",
  "GREENYELLOW",
  "CHARTREUSE",
  "LAWNGREEN",
  "LIME",
  "LIMEGREEN",
  "PALEGREEN",
  "LIGHTGREEN",
  "MEDIUMSPRINGGREEN",
  "SPRINGGREEN",
  "MEDIUMSEAGREEN",
  "SEAGREEN",
  "FORESTGREEN",
  "GREEN",
  "DARKGREEN",
  "YELLOWGREEN",
  "OLIVEDRAB",
  "OLIVE",
  "DARKOLIVEGREEN",
  "MEDIUMAQUAMARINE",
  "DARKSEAGREEN",
  "LIGHTSEAGREEN",
  "DARKCYAN",
  "TEAL",
  "AQUA",
  "CYAN",
  "LIGHTCYAN",
  "PALETURQUOISE",
  "AQUAMARINE",
  "TURQUOISE",
  "MEDIUMTURQUOISE",
  "DARKTURQUOISE",
  "CADETBLUE",
  "STEELBLUE",
  "LIGHTSTEELBLUE",
  "POWDERBLUE",
  "LIGHTBLUE",
  "SKYBLUE",
  "LIGHTSKYBLUE",
  "DEEPSKYBLUE",
  "DODGERBLUE",
  "CORNFLOWERBLUE",
  "ROYALBLUE",
  "BLUE",
  "MEDIUMBLUE",
  "DARKBLUE",
  "NAVY",
  "MIDNIGHTBLUE",
  "CORNSILK",
  "BLANCHEDALMOND",
  "BISQUE",
  "NAVAJOWHITE",
  "WHEAT",
  "BURLYWOOD",
  "TAN",
  "ROSYBROWN",
  "SANDYBROWN",
  "GOLDENROD",
  "DARKGOLDENROD",
  "PERU",
  "CHOCOLATE",
  "SADDLEBROWN",
  "SIENNA",
  "BROWN",
  "MAROON",
  "WHITE",
  "SNOW",
  "HONEYDEW",
  "MINTCREAM",
  "AZURE",
  "ALICEBLUE",
  "GHOSTWHITE",
  "WHITESMOKE",
  "SEASHELL",
  "BEIGE",
  "OLDLACE",
  "FLORALWHITE",
  "IVORY",
  "ANTIQUEWHITE",
  "LINEN",
  "LAVENDERBLUSH",
  "MISTYROSE",
  "GAINSBORO",
  "LIGHTGRAY",
  "SILVER",
  "DARKGRAY",
  "GRAY",
  "DIMGRAY",
  "LIGHTSLATEGRAY",
  "SLATEGRAY",
  "DARKSLATEGRAY",
  "BLACK",
].map((x) => `"${x}"`.toLowerCase());

export const titleCase = (str: string) =>
  str
    .split(" ")
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(" ");

const oxfordJoin = (arr: string[]) => {
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr.join(" and ");
  return arr.slice(0, -1).join(", ") + ", and " + arr.slice(-1);
};

export function summarizePal(pal: Palette) {
  const affects = pal.intendedAffects;
  const affectMsg = affects.length
    ? ` It is intended to convey ${oxfordJoin(pal.intendedAffects)} affects.`
    : "";
  const contexts = pal.intendedContexts.map((x) => `${x}s`);
  const contextMsg = contexts.length
    ? ` It is intended to be used ${oxfordJoin(contexts)}.`
    : "";
  return `This is a ${pal.type} palette called '${pal.name}'.${affectMsg}${contextMsg}`;
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
