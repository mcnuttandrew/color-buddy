import { makePalFromString } from "color-buddy-palette";
import { Formatter, FracturedJsonOptions, EolStyle } from "fracturedjsonjs";
import type { LintProgram } from "./lint-language/lint-type";

export function createPalWithTags(colors: string[], tags: [number, string][]) {
  const pal = makePalFromString(colors);
  tags.forEach(([index, tag]) => {
    pal.colors[index].tags.push(tag);
  });
  return pal;
}

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
