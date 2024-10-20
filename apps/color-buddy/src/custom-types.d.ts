declare module "color-blind" {
  // make this be of any type
  const blinder: any;
  export default blinder;
}

// https://github.com/lokesh/color-thief/issues/188
declare module "colorthief" {
  export type RGBColor = [number, number, number];
  export default class ColorThief {
    getColor: (
      img: HTMLImageElement | null,
      quality: number = 10
    ) => RGBColor | null;

    getPalette: (
      img: HTMLImageElement | null,
      colorCount: number = 10,
      quality: number = 10
    ) => RGBColor[] | null;
  }
}
