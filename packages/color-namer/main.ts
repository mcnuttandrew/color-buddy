import { Color } from "color-buddy-palette";

import { colorCentersFromStoneHeer } from "color-buddy-color-lists";

type ColorName = { color: Color; name: string };
function closestColors(color: Color, colors: ColorName[]): ColorName[] {
  console.log("here i am");
  return colors
    .map((x) => ({ ...x, dist: color.symmetricDeltaE(x.color) }))
    .sort((a, b) => a.dist - b.dist);
}

const heerStoneColors = Object.entries(colorCentersFromStoneHeer).map(
  ([name, hex]) => ({ color: Color.colorFromString(hex), name })
);

const nameCache = new Map<string, string[]>();

/**
 * Name a color. This function will return the name of the color that is closest to the input color.
 * color The color to name
 * props.numResults The number of results to return. This can be useful if there are multiple colors being named and you need to differentiate them, lowest index is closer. Default is 1.
 * props.colors A list of colors to choose from. Default is the Heer Stone color list.
 * props.colorListName The name of the color list to use. Used for caching. You only need to use this if you are changing color centers a lot. Default is "heerStone".
 */
export function nameColor(
  color: Color,
  props?: {
    numResults?: number;
    colors?: ColorName[];
    colorListName?: string;
  }
): string[] {
  const numResults = props?.numResults ?? 1;
  const colors = props?.colors ?? heerStoneColors;
  const listName = props?.colorListName ?? "heerStone";
  const str = `${color.toString().toUpperCase()}-${numResults}-${listName}`;
  if (nameCache.has(str)) {
    return nameCache.get(str)!;
  }
  const result = closestColors(color, colors)
    .slice(0, numResults)
    .map((x) => x.name);
  nameCache.set(str, result);
  return result;
}

/**
 * Get the color of a name.
 * @param name The name of the color
 * @param colors The list of colors to choose from. Default is the Heer Stone color list.
 */
export function nameToColor(
  name: string,
  colors: ColorName[] = heerStoneColors
): Color | undefined {
  const color = colors.find((x) => x.name === name);
  return color?.color;
}
