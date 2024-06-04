import type { Palette, StringPalette, ColorWrap } from "./types";
import { Formatter, FracturedJsonOptions, EolStyle } from "fracturedjsonjs";
import type { LintProgram } from "./lint-language/lint-type";
import { Color } from "./Color";
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
  tags: [],
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
  tags: [],
});

export const wrapInBlankStringSemantics = (x: string): ColorWrap<string> => ({
  color: x,
  tags: [],
});

export function createPalFromHexes(colors: string[]): StringPalette {
  return {
    ...defaultHexPal,
    colors: colors.map((x) => wrapInBlankStringSemantics(x)),
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
    colors: colors.map((x) =>
      wrapInBlankSemantics(Color.colorFromString(x, colorSpace))
    ),
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
