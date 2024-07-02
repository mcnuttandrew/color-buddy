import { Color, ColorSpaceDirectory } from "./Color";
import type { Palette, StringPalette } from "./types";

const defaultHexPal: StringPalette = {
  name: "new palette",
  colors: [],
  background: "#ffffff",
  type: "categorical",
  evalConfig: {},
  colorSpace: "lab",
  tags: [],
};

/**
 * Creates a palette from an array of strings. The background color can be specified as a string.
 * Generates palette in CIE LAB space
 */
export function makePalFromString(
  strings: string[],
  bg: string = "#ffffff"
): Palette {
  return {
    ...defaultHexPal,
    colors: strings.map((str) => Color.colorFromString(str)),
    background: Color.colorFromString(bg, "lab"),
  };
}

/**
 * Converts an array of hex strings to a palette.
 */
export const toPal = (
  colors: string[],
  currentPal: Palette,
  colorSpace: any
): Palette => {
  return {
    ...defaultHexPal,
    colors: colors.map((x) => Color.colorFromString(x, colorSpace)),
    name: "mods",
    background: currentPal.background,
    type: currentPal.type,
  };
};

const clamp = (x: number, min: number, max: number) =>
  Math.min(Math.max(x, min), max);

/**
 * Clips a color to the gamut of its color space. Return the clipped color as an array of channels in the originating color space.
 */
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

/**
 * Distributes colors in a palette along a direction in color space. The direction can be horizontal, vertical, or in z space.
 */
export function distributePoints(
  dir: {
    direction: "horizontal" | "vertical" | "in z space";
    name: string;
  },
  focusedColors: number[],
  colors: Color[],
  colorSpace: keyof typeof ColorSpaceDirectory
): Color[] {
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
    const pointA = colors[a].toChannels()[idx];
    const pointB = colors[b].toChannels()[idx];
    return pointA - pointB;
  });
  type Channels = [number, number, number];
  const minPoint = colors[sortedIndexes[0]].toChannels() as Channels;
  const maxPoint = colors[
    sortedIndexes[sortedIndexes.length - 1]
  ].toChannels() as Channels;

  const numPoints = sortedIndexes.length - 1;
  let newPoints = sortedIndexes.map((colorIdx, arrIdx) => {
    const t = arrIdx / numPoints;
    const newPoint = colors.at(colorIdx)!.toChannels() as Channels;
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
    const newColor = point
      ? Color.colorFromChannels(point, colorSpace as any)
      : color;
    newColor.tags = color.tags;
    return newColor;
  });
  return newColors;
}
