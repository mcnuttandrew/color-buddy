import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";
import { Color } from "../Color";

const meanPoint2d = (points: Color[]) => {
  const labPoints = points.map((x) => x.toColorIO().to("lab").coords);
  const xs = labPoints.map((x) => x[1]);
  const ys = labPoints.map((x) => x[2]);
  const x = xs.reduce((a, b) => a + b, 0) / xs.length;
  const y = ys.reduce((a, b) => a + b, 0) / ys.length;
  return { x, y };
};
const findMinDistPoint = (points: Color[], pos: { x: number; y: number }) => {
  const labPoints = points.map((x) => x.toColorIO().to("lab").coords);
  const { x, y } = pos;
  const distances = labPoints.map(([x1, y1]) => Math.hypot(x1 - x, y1 - y));
  const minDist = Math.min(...distances);
  return points[distances.indexOf(minDist)];
};
export default class SequentialOrder extends ColorLint<boolean, false> {
  name = "Diverging Palettes order";
  taskTypes = ["diverging"] as TaskType[];
  group = "usability";
  description: string = `Diverging palettes should have a middle color that is the lightest or darkest color. This is because if they are not, then they will not be differentiable from each other in some contexts.`;
  _runCheck() {
    const { colors } = this.palette;
    if (colors.length <= 2) {
      return { passCheck: true, data: false };
    }

    const summarizedDirections = colors
      .slice(0, -1)
      .map((x, i) => (x.luminance() > colors[i + 1].luminance() ? 1 : -1))
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
  hasHeuristicFix = true;
  async suggestFix() {
    // figure out if its centered on a light color or a dark color?
    // a dumb hueristic is just look at what the center color is in lab space, and see if its darker or lighter than most colors

    let colors = [...this.palette.colors];
    // const medianPoint = findMinDistPoint(colors, meanPoint2d(colors));
    // console.log(medianPoint.toHex());
    // let darkerThanMedian = colors.filter(
    //   (x) => x.luminance() < medianPoint.luminance()
    // ).length;

    const sortByLum = (a: Color, b: Color) => {
      const aL = a.luminance();
      const bL = b.luminance();
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
      if (color.deltaE(leftColor) < color.deltaE(rightColor)) {
        leftColors.push(color);
      } else {
        rightColors.push(color);
      }
    }
    colors = [
      ...leftColors.sort(sortByLum),
      ...rightColors.sort(sortByLum).reverse(),
    ];
    return [{ ...this.palette, colors }];
  }
}
