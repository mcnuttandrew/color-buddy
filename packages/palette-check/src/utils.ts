import type { Palette, StringPalette, ColorWrap } from "./types";
import { Formatter, FracturedJsonOptions, EolStyle } from "fracturedjsonjs";
import type { LintProgram } from "./lint-language/lint-type";
import { Color, ColorSpaceDirectory } from "./Color";

const defaultHexPal: StringPalette = {
  name: "new palette",
  colors: [],
  background: "#ffffff",
  type: "categorical",
  evalConfig: {},
  colorSpace: "lab",
  tags: [],
};

export const wrapColor = (x: Color): ColorWrap<Color> => ({
  color: x,
  tags: [],
});

export const wrapInBlankStringSemantics = (x: string): ColorWrap<string> => ({
  color: x,
  tags: [],
});

export function makePalFromString(
  strings: string[],
  bg: string = "#ffffff"
): Palette {
  return {
    ...defaultHexPal,
    colors: strings.map((str) => wrapColor(Color.colorFromString(str))),
    background: Color.colorFromString(bg, "lab"),
  };
}

export function createPalWithTags(colors: string[], tags: [number, string][]) {
  const pal = makePalFromString(colors);
  tags.forEach(([index, tag]) => {
    pal.colors[index].tags.push(tag);
  });
  return pal;
}

export const toPal = (
  colors: string[],
  currentPal: Palette,
  colorSpace: any
): Palette => {
  return {
    ...defaultHexPal,
    colors: colors.map((x) => wrapColor(Color.colorFromString(x, colorSpace))),
    name: "mods",
    background: currentPal.background,
    type: currentPal.type,
  };
};

const options = new FracturedJsonOptions();
options.MaxTotalLineLength = 120;
options.MaxInlineComplexity = 2;
options.JsonEolStyle = EolStyle.Crlf;
const formatter = new Formatter();
formatter.Options = options;
export function JSONToPrettyString(program: LintProgram) {
  return JSONStringify(JSON.stringify(program));
}
export function JSONStringify(obj: string) {
  return formatter.Reformat(obj);
}

export function distributePoints(
  dir: {
    direction: "horizontal" | "vertical" | "in z space";
    name: string;
  },
  focusedColors: number[],
  colors: ColorWrap<Color>[],
  colorSpace: keyof typeof ColorSpaceDirectory
) {
  const space = ColorSpaceDirectory[colorSpace];
  const { x, y, z } = space.dimensionToChannel;
  const config = {
    xChannelIndex: space.channelNames.indexOf(x),
    yChannelIndex: space.channelNames.indexOf(y),
    zChannelIndex: space.channelNames.indexOf(z),
  };
  let sortedIndexes = focusedColors.sort((a, b) => {
    const modeToIdx = { horizontal: 1, vertical: 2, "in z space": 0 };
    const idx = modeToIdx[dir.direction] || 0;
    const pointA = colors[a].color.toChannels()[idx];
    const pointB = colors[b].color.toChannels()[idx];
    return pointA - pointB;
  });
  type Channels = [number, number, number];
  const minPoint = colors[sortedIndexes[0]].color.toChannels() as Channels;
  const maxPoint = colors[
    sortedIndexes[sortedIndexes.length - 1]
  ].color.toChannels() as Channels;

  const numPoints = sortedIndexes.length - 1;
  let newPoints = sortedIndexes.map((colorIdx, arrIdx) => {
    const t = arrIdx / numPoints;
    const newPoint = colors.at(colorIdx)!.color.toChannels() as Channels;
    const xIdx = config.xChannelIndex;
    const yIdx = config.yChannelIndex;
    const zIdx = config.zChannelIndex;
    if (dir.direction === "horizontal") {
      newPoint[xIdx] = minPoint[xIdx] * (1 - t) + maxPoint[xIdx] * t;
    } else if (dir.direction === "vertical") {
      newPoint[yIdx] = minPoint[yIdx] * (1 - t) + maxPoint[yIdx] * t;
    } else {
      newPoint[zIdx] = minPoint[zIdx] * (1 - t) + maxPoint[zIdx] * t;
    }
    return newPoint as Channels;
  });
  const zip = <T, U>(arr1: T[], arr2: U[]) =>
    arr1.map((k, i) => [k, arr2[i]] as [T, U]);
  const pointsByIndex = Object.fromEntries(zip(sortedIndexes, newPoints));

  const newColors = [...colors].map((color, idx) => {
    const point = pointsByIndex[idx];
    return point
      ? { ...color, color: Color.colorFromChannels(point, colorSpace as any) }
      : color;
  });
  return newColors;
  // colorStore.setCurrentPalColors(newColors);
}

const clamp = (x: number, min: number, max: number) =>
  Math.min(Math.max(x, min), max);

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
