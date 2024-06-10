import { ColorLint } from "../ColorLint";
import type { PalType, ColorWrap } from "../types";
import { Color } from "../Color";
import type { LintFixer } from "../linter-tools/lint-fixer";

function isDiverging(colors: ColorWrap<Color>[]): boolean {
  const summarizedDirections = colors
    .slice(0, -1)
    .map((x, i) =>
      x.color.luminance() > colors[i + 1].color.luminance() ? 1 : -1
    )
    .reduce((acc, x) => {
      if (acc.length === 0) return [x];
      if (acc[acc.length - 1] === x) return acc;
      return [...acc, x];
    }, [] as number[]);
  return summarizedDirections.length === 2;
}
export default class DivergingOrder extends ColorLint<boolean> {
  name = "Diverging Palettes order";
  taskTypes = ["diverging"] as PalType[];
  group = "usability" as const;
  requiredTags = [];
  description: string = `Diverging palettes should have a middle color that is the lightest or darkest color. This is because if they are not, then they will not be differentiable from each other in some contexts.`;
  _runCheck() {
    if (this.palette.colors.length <= 2) {
      return { passCheck: true, data: false };
    }

    return { passCheck: isDiverging(this.palette.colors), data: false };
  }
  buildMessage(): string {
    return `This palette should have a middle color that is the lightest or darkest color, from which the other colors grow darker or lighter  respectively.`;
  }
  subscribedFix: string = "fixDivergingOrder";
}

// const sortByLum = (a: ColorWrap<Color>, b: ColorWrap<Color>) => {
//   const aL = a.color.luminance();
//   const bL = b.color.luminance();
//   if (aL === bL) return 0;
//   return aL > bL ? 1 : -1;
// };

// https://stackoverflow.com/questions/9960908/permutations-in-javascript
const permutator = <T>(inputArr: T[]): T[][] => {
  let result = [] as T[][];

  const permute = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(inputArr);

  return result;
};

export const fixDivergingOrder: LintFixer = async (palette) => {
  // dumb heuristic: try out all possible orders and see which ones pass the check, pick one
  const colors = [...palette.colors];
  const n = colors.length;
  const allOrders = permutator(Array.from({ length: n }, (_, j) => j)).map(
    (x) => x.map((i) => colors[i])
  );
  const passingOrders = allOrders.filter((order) => isDiverging(order));
  if (passingOrders.length === 0) {
    return [];
  }
  const newColors = passingOrders[0];
  return [{ ...palette, colors: newColors }];
};
// {
//     "exist": {
//         "in": "colors",
//         "varb": "c",
//         "predicate": {
//             "all": {
//                 "in": "colors",
//                 "varbs": ["a", "b"],
//                 "where": {
//                     "and": [
//                         { "<": {"left": "index(a)", "right": "index(c)"} },
//                         {
//                             "==": {
//                                 "left": "index(a)",
//                                 "right": { "-": {"left": "index(b)", "right": 1} }
//                             }
//                         }
//                     ]
//                 },
//                 "predicate": {
//                     "and": [
//                         {
//                             "<": { "left": {"lab.l": "a"}, "right": {"lab.l": "c"} }
//                         },
//                         {
//                             ">": { "left": {"lab.l": "b"}, "right": {"lab.l": "a"} }
//                         }
//                     ]
//                 }
//             }
//         }
//     }
// }

// // @ts-ignore
// const meanPoint2d = (points: Color[]) => {
//   const labPoints = points.map((x) => x.toColorIO().to("lab").coords);
//   const xs = labPoints.map((x) => x[1]);
//   const ys = labPoints.map((x) => x[2]);
//   const x = xs.reduce((a, b) => a + b, 0) / xs.length;
//   const y = ys.reduce((a, b) => a + b, 0) / ys.length;
//   return { x, y };
// };
// // @ts-ignore
// const findMinDistPoint = (points: Color[], pos: { x: number; y: number }) => {
//   const labPoints = points.map((x) => x.toColorIO().to("lab").coords);
//   const { x, y } = pos;
//   const distances = labPoints.map(([x1, y1]) => Math.hypot(x1 - x, y1 - y));
//   const minDist = Math.min(...distances);
//   return points[distances.indexOf(minDist)];
// };

// // figure out if its centered on a light color or a dark color?
// // a dumb heuristic is just look at what the center color is in lab space, and see if its darker or lighter than most colors

// let colors = [...palette.colors].sort(sortByLum);
// // const medianPoint = findMinDistPoint(colors, meanPoint2d(colors));
// // console.log(medianPoint.toHex());
// // let darkerThanMedian = colors.filter(
// //   (x) => x.luminance() < medianPoint.luminance()
// // ).length;

// // if (darkerThanMedian < colors.length / 2) {
// //   console.log("reversing");
// //   colors = colors.reverse();
// // }

// // const lightPoint = colors.at(-1)!;
// const leftColors = [colors.at(-1)!];
// const rightColors = [colors.at(-2)!];
// for (let i = 0; i < colors.length - 2; i++) {
//   const color = colors[i];
//   const leftColor = leftColors.at(-1)!;
//   const rightColor = rightColors.at(-1)!;
//   if (
//     color.color.deltaE(leftColor.color) < color.color.deltaE(rightColor.color)
//   ) {
//     leftColors.push(color);
//   } else {
//     rightColors.push(color);
//   }
// }
// colors = [
//   ...leftColors.sort(sortByLum),
//   ...rightColors.sort(sortByLum).reverse(),
// ];
// return [{ ...palette, colors }];
