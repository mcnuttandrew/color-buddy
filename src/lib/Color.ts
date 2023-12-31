import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import ColorIO from "colorjs.io";
export class Color {
  name: string;
  channels: Record<string, number>;
  chromaBind: typeof chroma.lab;
  spaceName: keyof typeof colorDirectory;
  constructor() {
    this.name = "";
    this.channels = {};
    this.chromaBind = chroma.rgb;
    this.spaceName = "rgb";
  }

  toHex(): string {
    return this.chromaBind(...this.toChannels()).hex();
  }
  toString(): string {
    const channelsString = Object.values(this.channels)
      // .map((x) => x.toPrecision(4))
      .join(",");
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
  fromChroma(color: ChromaColor): Color {
    // @ts-ignore
    const channels = color[this.spaceName]();
    return this.fromChannels(channels);
  }
  setChannel(channel: keyof typeof this.channels, value: number) {
    this.channels[channel] = value;
  }

  fromString(colorString: string): Color {
    if (!colorString.startsWith(`${this.spaceName}(`)) {
      const channels = new ColorIO(colorString).to(this.spaceName).coords;
      return this.fromChannels(channels);
    }
    // extract the numbers from the string
    const regex = new RegExp(`${this.spaceName}\\((.*)% (.*) (.*)\\)`);
    const match = colorString.match(regex);
    if (!match) {
      throw new Error(`Invalid color string: ${colorString}`);
    }
    const [_, ...channels] = match;
    return this.fromChannels([+channels[0], +channels[1], +channels[2]]);
  }
  fromChannels(channels: [number, number, number]): Color {
    const newColor = new (this.constructor as typeof Color)();
    Object.keys(this.channels).forEach((channel, i) => {
      newColor.setChannel(channel, channels[i]);
    });
    return newColor;
  }
}

export class CIELAB extends Color {
  name: "CIELAB";
  channels: { L: number; a: number; b: number };
  constructor() {
    super();
    this.name = "CIELAB";
    this.channels = { L: 0, a: 0, b: 0 };
    this.chromaBind = chroma.lab;
    this.spaceName = "lab";
  }
  toString(): string {
    const [L, a, b] = Object.values(this.channels);
    // .map((x) => x.toPrecision(1));
    return `lab(${L}% ${a} ${b})`;
  }
}
export class HSV extends Color {
  name: "HSV";
  channels: { h: number; s: number; v: number };
  constructor() {
    super();
    this.name = "HSV";
    this.channels = { h: 0, s: 0, v: 0 };
    this.chromaBind = chroma.hsv;
    this.spaceName = "hsv";
  }
  toString(): string {
    const [h, s, v] = Object.values(this.channels);
    return `color(hsv ${h} ${s} ${v})`;
  }
}

export class RGB extends Color {
  name: "RGB";
  channels: { r: number; g: number; b: number };
  constructor() {
    super();
    this.name = "RGB";
    this.channels = { r: 0, g: 0, b: 0 };
    this.chromaBind = chroma.rgb;
    this.spaceName = "rgb";
  }
}

export class HSL extends Color {
  name: "HSL";
  channels: { h: number; s: number; l: number };
  constructor() {
    super();
    this.name = "HSL";
    this.channels = { h: 0, s: 0, l: 0 };
    this.chromaBind = chroma.hsl;
    this.spaceName = "hsl";
  }
  toString(): string {
    const [h, s, l] = Object.values(this.channels);
    return `hsl(${h} ${s}% ${l}%)`;
  }
}
export class LCH extends Color {
  name: "LCH";
  channels: { l: number; c: number; h: number };
  constructor() {
    super();
    this.name = "LCH";
    this.channels = { l: 0, c: 0, h: 0 };
    this.chromaBind = chroma.lch;
    this.spaceName = "lch";
  }
}

export class OKLAB extends Color {
  name: "OKLAB";
  channels: { l: number; a: number; b: number };
  constructor() {
    super();
    this.name = "OKLAB";
    this.channels = { l: 0, a: 0, b: 0 };
    this.chromaBind = chroma.oklab;
    this.spaceName = "oklab";
  }
}

export class OKLCH extends Color {
  name: "OKLCH";
  channels: { l: number; c: number; h: number };
  constructor() {
    super();
    this.name = "OKLCH";
    this.channels = { l: 0, c: 0, h: 0 };
    this.chromaBind = chroma.oklch;
    this.spaceName = "oklch";
  }
}

export function colorFromString(
  colorString: string,
  colorSpace: keyof typeof colorDirectory = "lab"
): Color {
  return new colorDirectory[colorSpace]().fromString(colorString);
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
  lab: CIELAB,
  lch: LCH,
  oklab: OKLAB,
  rgb: RGB,
  srgb: RGB,
  oklch: OKLCH,
};

type ColorSpace = keyof typeof colorDirectory | string;
const domains = {
  lab: { a: [-100, 100], b: [-100, 100], l: [0, 100] },
  oklab: { a: [-0.4, 0.4], b: [-0.4, 0.4], l: [0, 1] },
  rgb: { r: [0, 255], g: [0, 255], b: [0, 255] },
  // srgb: { r: [0, 255], g: [255, 0], b: [0, 255] },
  hsv: { h: [0, 360], s: [0, 1], v: [0, 1] },
  hsl: { h: [0, 360], s: [0, 1], l: [0, 1] },
  lch: { l: [0, 100], c: [0, 150], h: [0, 360] },
  oklch: { l: [0, 1], c: [0, 0.4], h: [0, 360] },
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
      },
    ];
  })
);
