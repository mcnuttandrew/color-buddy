import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import ColorIO from "colorjs.io";
import { Color, colorFromHex } from "../Color";
import simulate_cvd from "../blindness";
import blind from "color-blind";

const blindnessTypes = ["deuteranopia", "protanopia", "tritanopia"] as const;
const blindnessLabels: Record<(typeof blindnessTypes)[number], string> = {
  deuteranopia: "(ie can't see green)",
  protanopia: "(ie can't see red)",
  tritanopia: "(ie can't see blue)",
};

type BlindnessTypes = (typeof blindnessTypes)[number];

function indexesWithSmallDeltaE(colors: Color[]) {
  let indexes: [number, number][] = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const deltaE = difference(colors[i].toColorIO(), colors[j].toColorIO());
      if (deltaE < 9) {
        indexes.push([i, j]);
      }
    }
  }
  return indexes;
}

function checkType(colors: Color[], type: BlindnessTypes) {
  const blindColors = colors.map((x) => simulate_cvd(type, x));
  let notOKColorIndexes: [number, number][] =
    indexesWithSmallDeltaE(blindColors);
  return { pass: notOKColorIndexes.length === 0, notOKColorIndexes };
}

// adapted from https://github.dev/gka/palettes
function checkTypeA(colors: Color[], type: BlindnessTypes) {
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
      let [colorA, colorB] = [a, b].map((x) => colors[x]);
      let distanceNorm = difference(colorA.toColorIO(), colorB.toColorIO());
      if (distanceNorm < smallestPerceivableDistance) continue;
      let aSim = colorFromHex(blind[type](colorA.toHex()), "lab").toColorIO();
      let bSim = colorFromHex(blind[type](colorB.toHex()), "lab").toColorIO();
      let distanceSim = difference(aSim, bSim);
      let isNotOk =
        distanceNorm / distanceSim > ratioThreshold &&
        distanceSim < smallestPerceivableDistance;
      // count combinations that are problematic
      if (isNotOk) {
        notOKColorIndexes.push([a, b]);
      }
    }
  }
  // compute share of problematic colors
  return { pass: notOKColorIndexes.length === 0, notOKColorIndexes };
}

function difference(colorA: ColorIO, colorB: ColorIO) {
  return 0.5 * (colorA.deltaE(colorB, "2000") + colorB.deltaE(colorA, "2000"));
}

const checks = blindnessTypes.map((key) => {
  return class ColorBlindCheck extends ColorLint<[number, number][], false> {
    name = `Colorblind Friendly for ${key}`;
    taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
    _runCheck() {
      const colors = this.palette.colors;
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
