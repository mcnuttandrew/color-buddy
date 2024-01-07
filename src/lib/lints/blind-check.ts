import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";

import blinder from "color-blind";

// drawn from
// https://github.dev/gka/palettes

const blindnessTypes = ["deuteranopia", "protanopia", "tritanopia"];
const blindnessLabels: Record<string, string> = {
  deuteranopia: "(ie can't see green)",
  protanopia: "(ie can't see red)",
  tritanopia: "(ie can't see blue)",
};

type BlindnessTypes = (typeof blindnessTypes)[number];
export function colorBlindCheck(colors: ChromaColor[]): string[] {
  const invalid = [];
  for (let i = 0; i < blindnessTypes.length; i++) {
    if (!checkType(colors, blindnessTypes[i])) invalid.push(blindnessTypes[i]);
  }
  return invalid;
}

export function colorBlindSim(color: string, type: BlindnessTypes) {
  return blinder[type](chroma(color).hex());
}

function checkType(colors: ChromaColor[], type: BlindnessTypes) {
  let notOK = 0;
  let notOKColorIndexes: [number, number][] = [];
  let ratioThreshold = 5;
  let smallestPerceivableDistance = 9;
  let k = colors.length;
  if (!k) {
    return { pass: true, notOKColorIndexes };
  }
  // compute distances between colors
  for (let a = 0; a < k; a++) {
    for (let b = a + 1; b < k; b++) {
      let colorA = chroma(colors[a]);
      let colorB = chroma(colors[b]);
      let distanceNorm = difference(colorA, colorB);
      if (distanceNorm < smallestPerceivableDistance) continue;
      let aSim = blinder[type](colorA.hex());
      let bSim = blinder[type](colorB.hex());
      let distanceSim = difference(aSim, bSim);
      let isNotOk =
        distanceNorm / distanceSim > ratioThreshold &&
        distanceSim < smallestPerceivableDistance;
      // count combinations that are problematic
      if (isNotOk) {
        notOK++;
        notOKColorIndexes.push([a, b]);
      }
    }
  }
  // compute share of problematic colors
  return { pass: notOK === 0, notOKColorIndexes };
}

function difference(colorA: ChromaColor, colorB: ChromaColor) {
  return 0.5 * (chroma.deltaE(colorA, colorB) + chroma.deltaE(colorB, colorA));
}

const checks = ["deuteranopia", "protanopia", "tritanopia"].map((key) => {
  return class ColorBlindCheck extends ColorLint<[number, number][], false> {
    name = `Colorblind Friendly for ${key}`;
    taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
    _runCheck() {
      const colors = this.palette.colors.map((x) => x.toChroma());
      const { pass, notOKColorIndexes } = checkType(colors, key);
      return { passCheck: pass, data: notOKColorIndexes };
    }
    buildMessage(): string {
      const colors = this.palette.colors.map((x) => x.toHex());
      const pairs = this.checkData
        .map(([a, b]) => `(${colors[a]} and ${colors[b]})`)
        .join(", ");
      return `This palette is not colorblind friendly for ${key} color blindness ${blindnessLabels[key]}. The following pairs are undifferentiable: ${pairs}`;
    }
  };
});

export default checks;
