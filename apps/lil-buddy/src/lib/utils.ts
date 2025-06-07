import { Color, ColorSpaceDirectory } from "color-buddy-palette";
import type { Palette, StringPalette } from "color-buddy-palette";
import type { LintProgram, LintResult } from "color-buddy-palette-lint";
import { linter } from "color-buddy-palette-lint";

import { Formatter, FracturedJsonOptions, EolStyle } from "fracturedjsonjs";

const options = new FracturedJsonOptions();
options.MaxTotalLineLength = 120;
options.MaxInlineComplexity = 2;
options.JsonEolStyle = EolStyle.Crlf;

const formatter = new Formatter();
formatter.Options = options;

export function JSONStringify(obj: string) {
  return formatter.Reformat(obj);
}

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

export type TestResult = {
  pal: Palette;
  result: LintResult;
  blame: any;
};

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

export function newId() {
  return Math.random().toString();
}

export function newLint(newLintFrag: Partial<LintProgram>): LintProgram {
  return {
    blameMode: "none",
    description: "v confusing",
    expectedFailingTests: [...(newLintFrag.expectedFailingTests || [])],
    expectedPassingTests: [...(newLintFrag.expectedPassingTests || [])],
    failMessage: "v confusing",
    group: "custom",
    id: newId(),
    level: "warning",
    name: "New lint",
    program: JSON.stringify("{}"),
    requiredTags: [],
    taskTypes: ["categorical", "sequential", "diverging"],
    ...newLintFrag,
  };
}

export function runLint(
  lint: LintProgram,
  options: Parameters<typeof linter>[2],
  pal: Palette
): { result: LintResult; errors: any } {
  if (!lint) {
    return {
      result: { kind: "ignored", lintProgram: lint } as LintResult,
      errors: null,
    };
  }
  try {
    const result = linter(pal, [lint], options);
    return { result: result[0], errors: null };
  } catch (e: any) {
    return {
      result: { kind: "error", message: e.message } as unknown as LintResult,
      errors: e,
    };
  }
}

// example path
// all.predicate.all.predicate.not.0.similar
// 0  .1        .2  .3        .4  .5.6
export function modifyLint(
  path: (number | string)[],
  newValue: any,
  lint: string
) {
  const lintObj = JSON.parse(lint);
  let current = lintObj;
  const currentSequence = [current];
  const usedPath = path.slice(0, -1);
  const quantifiers = new Set(["all", "exist"]) as Set<string | number>;
  const specialKeys = new Set([MODIFY_LINT_DELETE, MODIFY_LINT_TARGET_KEY]);
  for (
    let idx = 0;
    idx < usedPath.filter((x) => !specialKeys.has(x as any)).length;
    idx++
  ) {
    const key = usedPath[idx];
    current = current[key];
    currentSequence.push(current);

    const nextKey = usedPath[idx + 1];
    // this is a work around to deal with the unfolding of the quantifiers
    if (quantifiers.has(key) && nextKey === "predicate" && current.varbs) {
      // skip forward by the number of unfolded quantifiers
      idx = idx + (current.varbs.length - 1) * 2;
    }
    if (key === "not") {
      idx = idx + 1; // skip the next key since it's part of the not
    }
  }
  // for the case where the path is to a nested object, replace the key with the new key
  let last = path[path.length - 1];
  console.log(last, current[last]);
  if (typeof current[last] === "object") {
    const newKey = newValue;
    let oldKey = last;
    const newObj = {} as any;
    for (const key of Object.keys(current[oldKey])) {
      newObj[key] = current[oldKey][key];
    }
    delete current[oldKey];
    current[newKey] = newObj;
  } else if (last === MODIFY_LINT_TARGET_KEY) {
    const newKey = newValue;
    let oldKey = path[path.length - 2];
    const newObj = current as any;
    current = currentSequence[currentSequence.length - 2];
    delete current[oldKey];
    current[newKey] = newObj;
  } else if (newValue === MODIFY_LINT_DELETE) {
    let oldKey = path[path.length - 2];
    current = currentSequence[currentSequence.length - 2];
    delete current[oldKey];
  } else {
    current[last] = newValue;
  }
  return JSON.stringify(lintObj);
}
export const MODIFY_LINT_TARGET_KEY = "TARGET KEY !! KEY TARGET";
export const MODIFY_LINT_DELETE = "TARGET KEY !! DELETE TARGET";

export function getFocusedTestPal(
  lint: LintProgram | undefined,
  focusedTest: false | { type: string; index: number }
) {
  if (!lint || !focusedTest) return null;
  if (focusedTest.type === "passing") {
    return lint.expectedPassingTests[focusedTest.index];
  } else if (focusedTest.type === "failing") {
    return lint.expectedFailingTests[focusedTest.index];
  } else {
    return null;
  }
}

export function doLint(
  pal: LintProgram["expectedPassingTests"][0],
  lint: LintProgram
): TestResult {
  const result = runLint(lint, {}, pal).result;
  const blame = result.kind === "success" ? result?.blameData : [];
  return { result, pal, blame };
}

export function toThreeDigit(num: number): string {
  let str = (Math.round(num * 1000) / 1000).toString();
  const [left, right] = str.split(".");
  if (right && right.length < 3) {
    str += "0".repeat(3 - right.length);
  }
  if (left.length < 3) {
    str = " ".repeat(3 - left.length) + str;
  }
  return str;
}
