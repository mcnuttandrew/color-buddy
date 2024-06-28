import { Color } from "@color-buddy/palette";
import namer from "color-namer";

import { colorCentersFromStoneHeer } from "@color-buddy/color-lists";

const namerCustomList = Object.entries(colorCentersFromStoneHeer).map(
  ([name, hex]) => ({ name, hex })
);
(namer as any).lists.heerStone = namerCustomList;

export const getNames = (hex: string): { heerStone: namer.Color[] } =>
  (namer as any)(hex, {
    pick: ["heerStone"],
  });

function findSmallest<A>(arr: A[], accessor: (x: A) => number): A {
  let smallest = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (accessor(arr[i]) < accessor(smallest)) smallest = arr[i];
  }
  return smallest;
}

//
/**
 * Simpler version of the color name stuff
 */
export function colorNameSimple(colors: Color[]): { word: string; hex: string }[]{
  return colors.map((x) => ({ word: getName(x), hex: x.toHex() }));
}

const nameCache = new Map<string, string>();
export const getName = (color: Color): string => {
  const hex = color.toHex().toUpperCase();
  if (nameCache.has(hex)) {
    return nameCache.get(hex)!;
  }
  // const name = namer(hex, { pick: ["html"] });
  const name = getNames(hex);
  const guess = findSmallest<any>(
    Object.values(name).map((x: any) => x[0]),
    (x) => x.distance
  );
  const result = guess.name.toLowerCase();
  nameCache.set(hex, result);
  return result;
};
