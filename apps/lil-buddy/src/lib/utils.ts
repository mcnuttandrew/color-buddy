import {
  Color,
  ColorSpaceDirectory,
  makePalFromString,
} from "color-buddy-palette";
import type { Palette, StringPalette } from "color-buddy-palette";
import queryString from "query-string";

type ColorSpace = keyof typeof ColorSpaceDirectory;
export const colorPickerConfig = Object.fromEntries(
  (Object.keys(ColorSpaceDirectory) as ColorSpace[]).map((name: ColorSpace) => {
    const space = (ColorSpaceDirectory as any)[name] as typeof Color;
    const { x, y, z } = space.dimensionToChannel;
    return [
      name,
      {
        axisLabel: space.axisLabel,
        description: space.description,
        isPolar: space.isPolar,
        spaceType: space.spaceType,
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

export function deDup(arr: Color[]): Color[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item.toHex();
    return seen.has(k) ? false : seen.add(k);
  });
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

export function computeStroke(
  color: Color,
  idx: number,
  focusSet: Set<number>,
  bg?: Color
): string {
  if (focusSet.has(idx) && focusSet.size > 1) {
    return "none";
  }
  let localBg = bg || Color.colorFromString("#FFFFFF", "lab");
  const contrast = color.contrast(localBg, "WCAG21");
  const lum = color.luminance();
  if (contrast < 1.1 && lum > 0.5) {
    const darkerVersion = color.toColorSpace("lab");
    return darkerVersion
      .setChannel("L", Math.max(darkerVersion.getChannel("L") - 20))
      .toHex();
  }
  if (contrast < 1.1 && lum <= 0.5) {
    const darkerVersion = color.toColorSpace("lab");
    return darkerVersion
      .setChannel("L", Math.max(darkerVersion.getChannel("L") + 20))
      .toHex();
  }
  return "none";
}

export function serializePaletteForUrl(palette: Palette): string {
  const colors = palette.colors.map((color) => color.toString());
  const bg = palette.background.toString();
  const name = palette.name;
  const space = palette.colorSpace;
  const params = { colors, bg, name, space };
  console.log(params);
  const str = queryString.stringify(params);
  const prefix = window.location.origin + window.location.pathname;
  return `${prefix}?&${str}`;
}

export function deserializePaletteForUrl(url: string): Palette | undefined {
  const parsed = queryString.parse(url);
  console.log(parsed);
  const colorSpace = parsed.space as ColorSpace;
  const colors = parsed.colors as string[];
  const bg = parsed.bg as string;
  const name = parsed.name as string;
  console.log(name, bg, colors, colorSpace);
  if (!colorSpace || !colors || !bg || !name) {
    return undefined;
  }
  try {
    const newPal = makePalFromString(colors, bg);
    newPal.name = name;
    return convertPalToSpace(newPal, colorSpace);
  } catch (e) {
    console.log(e);
    return undefined;
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
