import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";

const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

const normalize = (arr: number[]) => {
  const total = sum(arr);
  return arr.map((val) => val / total + 1);
};

const shiftToZero = (arr: number[]) => {
  const min = Math.min(...arr);
  return arr.map((val) => val - min);
};

function klDivergence(p: number[], q: number[]): number {
  if (p.length !== q.length) {
    throw new Error("Input arrays must have the same length");
  }

  p = normalize(p);
  q = normalize(q);
  //   console.log(p, q);

  return p.reduce(
    (acc, val, index) => acc + val * Math.log2(val / q[index]),
    0
  );
}

function variance(arr: number[]): number {
  const mean = sum(arr) / arr.length;
  return sum(arr.map((val) => (val - mean) ** 2)) / arr.length;
}

const uniform = (n: number) => [...Array(n)].map((_, i) => (i / n) * 360);

function sequenceStandardDeviation(arr: number[]): number {
  const mean = sum(arr) / arr.length;
  return Math.sqrt(sum(arr.map((val) => (val - mean) ** 2)) / arr.length);
}

function stat(arrP: number[]) {
  const arr = arrP;
  //   const arr = shiftToZero(arrP);
  const diffs = [];
  for (let i = 0; i < arr.length - 1; i++) {
    diffs.push(Math.abs(arr[i + 1] - arr[i]));
  }
  diffs.push(Math.abs(arr[0] - arr[arr.length - 1]));
  const avgDiff = sum(diffs) / diffs.length;
  console.log(arr, diffs, avgDiff);
  const avgDistFromAvgDiff =
    sum(diffs.map((val) => Math.abs(val - avgDiff))) / diffs.length;
  return avgDistFromAvgDiff;
}
function circularMean(angles: number[]): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const sumCos = angles.reduce((acc, angle) => acc + Math.cos(toRad(angle)), 0);
  const sumSin = angles.reduce((acc, angle) => acc + Math.sin(toRad(angle)), 0);

  return Math.atan2(sumSin / angles.length, sumCos / angles.length);
}

function rayleighTest(angles: number[]): { z: number; criticalValue: number } {
  const n = angles.length;
  const circularMeanAngle = circularMean(angles);

  // Calculate the length of the mean vector (R)
  const R = Math.sqrt(
    Math.pow(Math.cos(circularMeanAngle), 2) +
      Math.pow(Math.sin(circularMeanAngle), 2)
  );

  // Calculate the Rayleigh test statistic (Z)
  const Z = n * Math.pow(R, 2);

  // Calculate the critical value based on the sample size
  const criticalValue = 1.96 / Math.sqrt(n);

  return { z: Z, criticalValue };
}

export default class EvenDistribution extends ColorLint<number, number> {
  name = "Even Distribution";
  taskTypes = ["categorical"] as TaskType[];
  hasParam = true;
  defaultParam = 1;
  group = "usability";
  description: string = `Categorical values should be distributed evenly to avoid bias.`;
  paramOptions: { type: "number"; min: number; max: number; step: 1 } = {
    type: "number",
    min: 2,
    max: 20,
    step: 1,
  };
  level: "error" | "warning" = "warning";

  _runCheck() {
    const { colors } = this.palette;
    const hues = colors.map((color) => {
      //   console.log(channels);
      const channels = color.toColorSpace("lch").toChannels();
      return channels[2];
      // return channels[2];
      //   const channels = color.toColorSpace("hsl").toChannels();
      // return channels[0];
    });
    //   .sort();
    const { z, criticalValue } = rayleighTest(hues);
    const passFail = z > criticalValue;
    // const uniformHues = uniform(hues.length);
    // // console.log(hues, uniformHues);
    // let kl = klDivergence(hues, uniformHues);
    // if (Number.isNaN(kl)) {
    //   console.log("asd", hues, uniformHues);
    //   kl = Infinity;
    // }
    // console.log(kl);
    console.log(z, criticalValue, { passFail });
    return {
      passCheck: false,
      data: 0,
    };
  }
  buildMessage(): string {
    return `The colors in this palette are not evenly distributed.`;
  }
}
