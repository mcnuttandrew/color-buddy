import namer from "color-namer";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { Color } from "../Color";

function findSmallest<A>(arr: A[], accessor: (x: A) => number): A {
  let smallest = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (accessor(arr[i]) < accessor(smallest)) smallest = arr[i];
  }
  return smallest;
}

function titleCase(str: string) {
  return str
    .split(" ")
    .filter((x) => x.length > 0)
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(" ");
}

// Simpler version of the color name stuff
export function colorNameSimple(colors: Color[]) {
  return colors.map((x) => ({ word: getName(x), hex: x.toHex() }));
}

function simpleDiscrim(colors: Color[]) {
  const names = colorNameSimple(colors);
  const counts = names.reduce((acc, x) => {
    if (!acc[x.word]) {
      acc[x.word] = [];
    }
    acc[x.word].push(x);
    return acc;
  }, {} as Record<string, (typeof names)[0][]>);

  const remaining = Object.entries(counts)
    .filter((x) => x[1].length > 1)
    .map(([x, y]) => [x, y.map((el) => el.hex).join(", ")]);
  // .map((x) => x[0]);
  if (remaining.length === 0) {
    return false;
  }

  const countsStr = remaining
    .map(([word, vals]) => `${word} (${vals})`)
    .join(", ");
  return `Color Name discriminability check failed. The following color names are repeated: ${countsStr}`;
}

const nameCache = new Map<string, string>();
export const getName = (color: Color) => {
  const hex = color.toHex().toUpperCase();
  if (nameCache.has(hex)) {
    return nameCache.get(hex)!;
  }
  const name = namer(hex, { pick: ["html"] });
  const guess = findSmallest<any>(
    Object.values(name).map((x: any) => x[0]),
    (x) => x.distance
  );
  const result = titleCase(guess.name);
  nameCache.set(hex, result);
  return result;
};

function suggestFixForColorsWithCommonNames(colors: Color[]): Color[] {
  const hex = colors[0].toHex().toUpperCase();
  let guesses = { ...namer(hex, { pick: ["html"] }) };
  return [...colors].map((color, idx) => {
    const newColor = guesses.html[idx];
    return Color.colorFromHex(newColor.hex, color.spaceName);
  });
}

function buildFix(colors: Color[]): Color[] {
  const colorNamesByIndex = colors.reduce((acc, color, index) => {
    const name = getName(color);
    acc[name] = (acc[name] || []).concat(index);
    return acc;
  }, {} as Record<string, number[]>);
  const newColors = [...colors];
  Object.values(colorNamesByIndex)
    .filter((x) => x.length > 1)
    .forEach((indices) => {
      const localColors = indices.map((i) => newColors[i]);
      const updatedColors = suggestFixForColorsWithCommonNames(localColors);
      indices.forEach((i, j) => {
        newColors[i] = updatedColors[j];
      });
    });
  return newColors;
}

export default class ColorNameDiscriminability extends ColorLint<
  string,
  false
> {
  name = "Color Name Discriminability";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  group = "usability";
  description: string =
    "Being able to identify colors by name is important for usability and for memorability. ";
  _runCheck() {
    const { colors } = this.palette;
    const passCheck = simpleDiscrim(colors);
    return { passCheck: !passCheck, data: passCheck || "" };
  }
  buildMessage(): string {
    return this.checkData;
  }
  hasHeuristicFix = true;
  async suggestFix() {
    return { ...this.palette, colors: buildFix(this.palette.colors) };
  }
}
