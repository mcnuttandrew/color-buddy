import { ColorLint } from "../ColorLint";
import type { PalType, ColorWrap } from "../types";
import { Color } from "../Color";
import type { LintFixer } from "../linter-tools/lint-fixer";

// @ts-ignore
const meanPoint2d = (points: Color[]) => {
  const labPoints = points.map((x) => x.toColorIO().to("lab").coords);
  const xs = labPoints.map((x) => x[1]);
  const ys = labPoints.map((x) => x[2]);
  const x = xs.reduce((a, b) => a + b, 0) / xs.length;
  const y = ys.reduce((a, b) => a + b, 0) / ys.length;
  return { x, y };
};
// @ts-ignore
const findMinDistPoint = (points: Color[], pos: { x: number; y: number }) => {
  const labPoints = points.map((x) => x.toColorIO().to("lab").coords);
  const { x, y } = pos;
  const distances = labPoints.map(([x1, y1]) => Math.hypot(x1 - x, y1 - y));
  const minDist = Math.min(...distances);
  return points[distances.indexOf(minDist)];
};
export default class DivergingOrder extends ColorLint<boolean> {
  name = "Diverging Palettes order";
  taskTypes = ["diverging"] as PalType[];
  group = "usability" as const;
  requiredTags = [];
  description: string = `Diverging palettes should have a middle color that is the lightest or darkest color. This is because if they are not, then they will not be differentiable from each other in some contexts.`;
  _runCheck() {
    const { colors } = this.palette;
    if (colors.length <= 2) {
      return { passCheck: true, data: false };
    }

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

    return { passCheck: summarizedDirections.length === 2, data: false };
  }
  buildMessage(): string {
    return `This palette should have a middle color that is the lightest or darkest color, from which the other colors grow darker or lighter  respectively.`;
  }
  subscribedFix: string = "fixDivergingOrder";
}

export const fixDivergingOrder: LintFixer = async (palette) => {
  // figure out if its centered on a light color or a dark color?
  // a dumb hueristic is just look at what the center color is in lab space, and see if its darker or lighter than most colors

  let colors = [...palette.colors];
  // const medianPoint = findMinDistPoint(colors, meanPoint2d(colors));
  // console.log(medianPoint.toHex());
  // let darkerThanMedian = colors.filter(
  //   (x) => x.luminance() < medianPoint.luminance()
  // ).length;

  const sortByLum = (a: ColorWrap<Color>, b: ColorWrap<Color>) => {
    const aL = a.color.luminance();
    const bL = b.color.luminance();
    if (aL === bL) return 0;
    return aL > bL ? 1 : -1;
  };
  // if (darkerThanMedian < colors.length / 2) {
  //   console.log("reversing");
  //   colors = colors.reverse();
  // }

  // const lightPoint = colors.at(-1)!;
  const leftColors = [colors.at(-1)!];
  const rightColors = [colors.at(-2)!];
  for (let i = 0; i < colors.length - 2; i++) {
    const color = colors[i];
    const leftColor = leftColors.at(-1)!;
    const rightColor = rightColors.at(-1)!;
    if (
      color.color.deltaE(leftColor.color) < color.color.deltaE(rightColor.color)
    ) {
      leftColors.push(color);
    } else {
      rightColors.push(color);
    }
  }
  colors = [
    ...leftColors.sort(sortByLum),
    ...rightColors.sort(sortByLum).reverse(),
  ];
  return [{ ...palette, colors }];
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
