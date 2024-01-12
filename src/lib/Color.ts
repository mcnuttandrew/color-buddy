import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import ColorIO from "colorjs.io";

const hexCache = new Map<string, string>();
export class Color {
  name: string = "";
  channels: Record<string, number> = {};
  chromaBind: typeof chroma.lab = chroma.rgb;
  spaceName: keyof typeof colorDirectory = "rgb";

  toHex(): string {
    const str = this.toString();
    if (hexCache.has(str)) {
      return hexCache.get(str) as string;
    }
    const newHex = this.toColorIO().to("srgb").toString({ format: "hex" });
    // const oldHex = this.chromaBind(...this.toChannels()).hex();
    // return this.chromaBind(...this.toChannels()).hex();
    hexCache.set(str, newHex);
    return newHex;
  }
  toString(): string {
    const channelsString = Object.values(this.channels)
      .map((x) => x || 0)
      .map((x) => (x < 1e-7 ? 0 : x))
      .join(", ");
    return `${this.spaceName}(${channelsString})`;
  }
  getChannel(channel: keyof typeof this.channels): number {
    return this.channels[channel];
  }
  toChroma(): ChromaColor {
    return this.chromaBind(...this.toChannels());
  }
  toChannels(): [number, number, number] {
    return Object.values(this.channels) as [number, number, number];
  }
  setChannel(channel: keyof typeof this.channels, value: number) {
    this.channels[channel] = value;
  }
  inGamut(): boolean {
    // return new ColorIO(this.spaceName, this.toChannels()).inGamut();
    const x = this.toHex();
    const y = colorFromHex(x, "srgb").toHex();
    // if (x !== y) {
    //   console.log("x", x, "y", y);
    // }
    return x === y;
  }
  toColorIO(): ColorIO {
    return new ColorIO(this.toString());
  }

  fromString(colorString: string): Color {
    if (!colorString.startsWith(`${this.spaceName}(`)) {
      const channels = new ColorIO(colorString).to(this.spaceName).coords;
      return this.fromChannels(channels);
    }
    return this.fromChannels(stringToChannels(this.spaceName, colorString));
  }
  fromChannels(channels: [number, number, number]): Color {
    const newColor = new (this.constructor as typeof Color)();
    Object.keys(this.channels).forEach((channel, i) => {
      newColor.setChannel(channel, channels[i]);
    });
    return newColor;
  }
  luminance(): number {
    return chroma(this.toHex()).luminance();
  }
  deltaE(color: Color): number {
    return chroma.deltaE(this.toChroma(), color.toChroma());
  }
  symmetricDeltaE(color: Color): number {
    return 0.5 * (this.deltaE(color) + color.deltaE(this));
  }
  copy(): Color {
    return this.fromChannels(this.toChannels());
  }
}

const colorStringCache = new Map<string, [number, number, number]>();
export function stringToChannels(spaceName: string, str: string) {
  const key = `${spaceName}(${str})`;
  if (colorStringCache.has(key)) {
    return colorStringCache.get(key)!;
  }
  let channels = str
    .replace(`${spaceName}(`, "")
    .replace(")", "")
    .replace(/%/g, "")
    .replace(/,/g, " ")
    .trim()
    .split(" ")
    .filter((x) => x.length);
  const allNumbers = channels.every((x) => !isNaN(+x));

  if (!(channels.length === 3 && allNumbers)) {
    throw new Error(`Invalid color string: ${str}`);
  }
  const result = channels.map((x) => Number(x) * 1) as [number, number, number];
  colorStringCache.set(key, result);
  return result;
}

export class CIELAB extends Color {
  name = "CIELAB";
  channels = { L: 0, a: 0, b: 0 };
  chromaBind = chroma.lab;
  spaceName = "lab" as const;

  toString(): string {
    const [L, a, b] = Object.values(this.channels).map((x) => x || 0);
    // .map((x) => x.toPrecision(1));
    return `lab(${L}% ${a} ${b})`;
  }
}
export class HSV extends Color {
  name = "HSV";
  channels = { h: 0, s: 0, v: 0 };
  chromaBind = chroma.hsv;
  spaceName = "hsv" as const;
  toString(): string {
    const [h, s, v] = Object.values(this.channels);
    return `color(hsv ${h} ${s} ${v})`;
  }
}

export class RGB extends Color {
  name = "RGB";
  channels = { r: 0, g: 0, b: 0 };
  chromaBind = chroma.rgb;
  spaceName = "rgb" as const;
}

export class HSL extends Color {
  name = "HSL";
  channels = { h: 0, s: 0, l: 0 };
  chromaBind = chroma.hsl;
  spaceName = "hsl" as const;

  toString(): string {
    const [h, s, l] = Object.values(this.channels).map((x) => x || 0);
    return `hsl(${h} ${s}% ${l}%)`;
  }
}
export class LCH extends Color {
  name = "LCH";
  channels = { l: 0, c: 0, h: 0 };
  chromaBind = chroma.lch;
  spaceName = "lch" as const;
}

export class OKLAB extends Color {
  name = "OKLAB";
  channels = { l: 0, a: 0, b: 0 };
  chromaBind = chroma.oklab;
  spaceName = "oklab" as const;
}

export class OKLCH extends Color {
  name = "OKLCH";
  channels = { l: 0, c: 0, h: 0 };
  chromaBind = chroma.oklch;
  spaceName = "oklch" as const;
}

export class JZAZBZ extends Color {
  name = "JZAZBZ";
  channels = { jz: 0, az: 0, bz: 0 };
  spaceName = "jzazbz" as const;
  constructor() {
    super();
    this.chromaBind = (jz, az, bz) => {
      const [l, a, b] = new ColorIO(this.toString()).to("lab").coords;
      return chroma.lab(l, a, b);
    };
  }
  toString(): string {
    const [jz, az, bz] = Object.values(this.channels);
    return `color(jzazbz ${jz} ${az} ${bz})`;
  }
}

export function colorFromString(
  colorString: string,
  colorSpace: keyof typeof colorDirectory = "lab"
): Color {
  return new colorDirectory[colorSpace]().fromString(colorString);
}

const colorHexCache = new Map<string, Color>();
export function colorFromHex(
  hex: string,
  colorSpace: keyof typeof colorDirectory
): Color {
  if (colorHexCache.has(hex)) {
    return colorHexCache.get(hex)!.copy() as Color;
  }
  const color = new ColorIO(hex).to(colorSpace);
  const outColor = new colorDirectory[colorSpace]().fromChannels(color.coords);
  colorHexCache.set(hex, outColor);
  return outColor;
}

export function colorFromChannels(
  channels: [number, number, number],
  colorSpace: keyof typeof colorDirectory
): Color {
  return new colorDirectory[colorSpace]().fromChannels(channels);
}

export function toColorSpace(
  color: Color,
  colorSpace: keyof typeof colorDirectory
): Color {
  if (color.spaceName === colorSpace) {
    return color;
  }
  const channels = new ColorIO(color.toString()).to(colorSpace).coords;
  return new colorDirectory[colorSpace]().fromChannels(channels);
}

export const colorDirectory = {
  hsl: HSL,
  hsv: HSV,
  jzazbz: JZAZBZ,
  lab: CIELAB,
  lch: LCH,
  oklab: OKLAB,
  oklch: OKLCH,
  rgb: RGB,
  srgb: RGB,
};

type ColorSpace = keyof typeof colorDirectory | string;
const domains = {
  lab: { a: [-125, 125], b: [-125, 125], l: [0, 100] },
  oklab: { a: [-0.4, 0.4], b: [-0.4, 0.4], l: [0, 1] },
  rgb: { r: [0, 255], g: [0, 255], b: [0, 255] },
  // srgb: { r: [0, 255], g: [255, 0], b: [0, 255] },
  hsv: { h: [0, 360], s: [0, 1], v: [0, 1] },
  hsl: { h: [0, 360], s: [0, 1], l: [0, 1] },
  lch: { l: [0, 100], c: [0, 150], h: [0, 360] },
  oklch: { l: [0, 1], c: [0, 0.4], h: [0, 360] },
  jzazbz: { jz: [0, 1], az: [-0.5, 0.5], bz: [-0.5, 0.5] },
} as Record<ColorSpace, Record<string, [number, number]>>;
export const stepSize = {
  lab: [1, 1, 1],
  oklab: [0.01, 0.01, 0.01],
  rgb: [1, 1, 1],
  // srgb: [1, 1, 1],
  hsv: [1, 0.01, 0.01],
  hsl: [1, 0.01, 0.01],
  lch: [1, 1, 1],
  oklch: [0.01, 0.01, 1],
  jzazbz: [0.01, 0.01, 0.01],
} as Record<ColorSpace, [number, number, number]>;

const dimensionToChannel = {
  lab: { x: "a", y: "b", z: "l" },
  oklab: { x: "a", y: "b", z: "l" },
  rgb: { x: "g", y: "b", z: "r" },
  // srgb: { x: "g", y: "b", z: "r" },
  hsv: { x: "s", y: "v", z: "h" },
  hsl: { x: "s", y: "l", z: "h" },
  lch: { x: "c", y: "h", z: "l" },
  oklch: { x: "c", y: "h", z: "l" },
  jzazbz: { x: "az", y: "bz", z: "jz" },
} as Record<ColorSpace, Record<string, string>>;
const xyTitles = {
  lab: "CIELAB: a* b*",
  oklab: "OKLAB: a* b*",
  rgb: "RGB: Green Blue",
  // srgb: "sRGB: Green Blue",
  hsv: "HSV: Saturation Value",
  hsl: "HSL: Saturation Lightness",
  lch: "LCH: Chroma Hue",
  oklch: "OKLCH: Chroma Hue",
  jzazbz: "JzAzBz: Az Bz",
} as Record<ColorSpace, string>;
const zTitles = {
  lab: "CIELAB: L*",
  oklab: "OKLAB: L*",
  rgb: "RGB: Red",
  // srgb: "sRGB: Red",
  hsv: "HSV: Hue",
  hsl: "HSL: Hue",
  lch: "LCH: Lightness",
  oklch: "OKLCH: Lightness",
  jzazbz: "JzAzBz: Jz",
} as Record<ColorSpace, string>;
const titleMap = {
  lab: "CIELAB",
  oklab: "OKLAB",
  rgb: "RGB",
  // srgb: "sRGB",
  hsv: "HSV",
  hsl: "HSL",
  lch: "LCH",
  oklch: "OKLCH",
  jzazbz: "JzAzBz",
} as Record<ColorSpace, string>;

export const colorPickerConfig = Object.fromEntries(
  (Object.keys(domains) as ColorSpace[]).map((name) => {
    return [
      name,
      {
        title: titleMap[name],
        xyTitle: xyTitles[name],
        zTitle: zTitles[name],
        xDomain: domains[name][dimensionToChannel[name].x],
        yDomain: domains[name][dimensionToChannel[name].y],
        zDomain: domains[name][dimensionToChannel[name].z],
        xChannel: dimensionToChannel[name].x,
        yChannel: dimensionToChannel[name].y,
        zChannel: dimensionToChannel[name].z,
        xStep: stepSize[name][1],
        yStep: stepSize[name][2],
        zStep: stepSize[name][0],
      },
    ];
  })
);
