import { Color, toColorSpace } from "../Color";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";

// based on
// https://github.com/connorgr/d3-jnd/blob/master/src/jnd.js

const A = { l: 10.16, a: 10.68, b: 10.7 };
const B = { l: 1.5, a: 3.08, b: 5.74 };
const nd = (p: number, s: number) => ({
  l: p * (A.l + B.l / s),
  a: p * (A.a + B.a / s),
  b: p * (A.b + B.b / s),
});

const sMap = {
  thin: 0.1,
  medium: 0.5,
  wide: 1.0,
  default: 0.1,
};
const pMap = {
  conservative: 0.8,
  default: 0.5,
};
type pType = keyof typeof pMap | number;
type sType = keyof typeof sMap | number;
function jndLabInterval(p: pType, s: sType) {
  const pVal = typeof p === "number" ? p : pMap[p] || pMap["default"];
  const sVal = typeof s === "number" ? s : sMap[s] || sMap["default"];
  return nd(pVal, sVal);
}

function noticeablyDifferent(
  c1: Color,
  c2: Color,
  s: sType = 0.1,
  p: pType = 0.5
) {
  var jnd = jndLabInterval(p, s);
  const [l1, a1, b1] = toColorSpace(c1, "lab").toChannels();
  const [l2, a2, b2] = toColorSpace(c2, "lab").toChannels();

  return (
    Math.abs(l1 - l2) >= jnd.l ||
    Math.abs(a1 - a2) >= jnd.a ||
    Math.abs(b1 - b2) >= jnd.b
  );
}

export function checkJNDs(
  colors: Color[]
): [keyof typeof sMap, Color, Color][] {
  const invalid = [] as any[];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      Object.keys(sMap).forEach((s) => {
        if (!noticeablyDifferent(colors[i], colors[j], s, "default")) {
          invalid.push([s, colors[i], colors[j]]);
        }
      });
    }
  }
  return invalid;
}

function uniqueJNDColors(key: string, jnds: ReturnType<typeof checkJNDs>) {
  const uniqueColors = new Set<string>();
  jnds
    .filter((x) => x[0] === key)
    .forEach(([_key, A, B]) => {
      uniqueColors.add(A.toHex());
      uniqueColors.add(B.toHex());
    });
  return [...uniqueColors].join(", ");
}

const Discrims = ["thin", "medium", "wide"].map((key) => {
  return class SizeDiscrim extends ColorLint<
    ReturnType<typeof checkJNDs>,
    false
  > {
    name = `${key} Discriminability`;
    taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
    _runCheck() {
      const jnds = checkJNDs(this.palette.colors);
      const passCheck = jnds.filter((x) => x[0] === key).length === 0;
      return { passCheck, data: jnds };
    }
    buildMessage() {
      const jnds = this.checkData;
      const invalid = uniqueJNDColors(key, jnds);
      return `This palette has some colors (${invalid}) that are close  to each other in perceptual space and will not be resolvable for ${key} areas`;
    }
  };
});

export default Discrims;
