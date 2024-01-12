import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import ColorIO from "colorjs.io";

type Domain = Record<string, [number, number]>;
type Channels = [number, number, number];
const hexCache = new Map<string, string>();
export class Color {
  name: string = "";
  channels: Record<string, number> = {};
  // todo finish removing chroma bind
  chromaBind: typeof chroma.lab = chroma.rgb;
  spaceName: keyof typeof colorDirectory = "rgb";
  domains: Domain;
  stepSize: Channels = [1, 1, 1];
  xyTitle: string = "";
  zTitle: string = "";
  dimensionToChannel: Record<"x" | "y" | "z", string> = { x: "", y: "", z: "" };
  axisLabel: (num: number) => string = (x) => x.toFixed(1).toString();

  constructor() {
    this.domains = {};
  }

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
  toChannels(): Channels {
    return Object.values(this.channels) as Channels;
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
    try {
      return new ColorIO(this.toString());
    } catch (e) {
      console.log("error", e);
      return new ColorIO("black");
    }
  }

  fromString(colorString: string): Color {
    if (!colorString.startsWith(`${this.spaceName}(`)) {
      const channels = new ColorIO(colorString).to(this.spaceName).coords;
      return this.fromChannels(channels);
    }
    return this.fromChannels(stringToChannels(this.spaceName, colorString));
  }
  fromChannels(channels: Channels): Color {
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

const colorStringCache = new Map<string, Channels>();
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
  const result = channels.map((x) => Number(x) * 1) as Channels;
  colorStringCache.set(key, result);
  return result;
}

export class CIELAB extends Color {
  name = "CIELAB";
  channels = { L: 0, a: 0, b: 0 };
  domains = { L: [100, 0], a: [-125, 125], b: [125, -125] } as Domain;
  chromaBind = chroma.lab;
  spaceName = "lab" as const;
  stepSize: Channels = [1, 1, 1];
  xyTitle: string = "CIELAB: a* b*";
  zTitle: string = "CIELAB: L*";
  dimensionToChannel = { x: "a", y: "b", z: "L" };
  axisLabel = (num: number) => `${Math.round(num)}`;

  toString(): string {
    const [L, a, b] = Object.values(this.channels).map((x) => x || 0);
    // .map((x) => x.toPrecision(1));
    return `lab(${L}% ${a} ${b})`;
  }
}
export class HSV extends Color {
  name = "HSV";
  channels = { h: 0, s: 0, v: 0 };
  domains = { h: [0, 360], s: [0, 1], v: [0, 1] } as Domain;
  chromaBind = chroma.hsv;
  spaceName = "hsv" as const;
  stepSize: Channels = [1, 0.01, 0.01];
  xyTitle: string = "HSV: Saturation Value";
  zTitle: string = "HSV: Hue";
  dimensionToChannel = { x: "s", y: "v", z: "h" };
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
  domains = { r: [0, 255], g: [0, 255], b: [0, 255] } as Domain;
  stepSize: Channels = [1, 1, 1];
  xyTitle: string = "RGB: Green Blue";
  zTitle: string = "RGB: Red";
  dimensionToChannel = { x: "g", y: "b", z: "r" };
  axisLabel = (num: number) => `${Math.round(num)}`;
}

export class HSL extends Color {
  name = "HSL";
  channels = { h: 0, s: 0, l: 0 };
  chromaBind = chroma.hsl;
  spaceName = "hsl" as const;
  domains = { h: [0, 360], s: [0, 1], l: [0, 1] } as Domain;
  stepSize: Channels = [1, 0.01, 0.01];
  xyTitle: string = "HSL: Saturation Lightness";
  zTitle: string = "HSL: Hue";
  dimensionToChannel = { x: "s", y: "l", z: "h" };

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
  domains = { l: [100, 0], c: [0, 150], h: [360, 0] } as Domain;
  stepSize: Channels = [1, 1, 1];
  xyTitle: string = "LCH: Chroma Hue";
  zTitle: string = "LCH: Lightness";
  dimensionToChannel = { x: "c", y: "h", z: "l" };
  axisLabel = (num: number) => `${Math.round(num)}`;
}

export class OKLAB extends Color {
  name = "OKLAB";
  channels = { l: 0, a: 0, b: 0 };
  chromaBind = chroma.oklab;
  spaceName = "oklab" as const;
  domains = { l: [1, 0], a: [-0.4, 0.4], b: [0.4, -0.4] } as Domain;
  stepSize: Channels = [0.01, 0.01, 0.01];
  xyTitle: string = "OKLAB: a* b*";
  zTitle: string = "OKLAB: L*";
  dimensionToChannel = { x: "a", y: "b", z: "l" };
}

export class OKLCH extends Color {
  name = "OKLCH";
  channels = { l: 0, c: 0, h: 0 };
  chromaBind = chroma.oklch;
  spaceName = "oklch" as const;
  domains = { l: [1, 0], c: [0, 0.4], h: [360, 0] } as Domain;
  stepSize: Channels = [0.01, 0.01, 1];
  xyTitle: string = "OKLCH: Chroma Hue";
  zTitle: string = "OKLCH: Lightness";
  dimensionToChannel = { x: "c", y: "h", z: "l" };
}

export class JZAZBZ extends Color {
  name = "JZAZBZ";
  channels = { jz: 0, az: 0, bz: 0 };
  spaceName = "jzazbz" as const;
  domains = { jz: [1, 0], az: [-0.5, 0.5], bz: [0.5, -0.5] } as Domain;
  stepSize: Channels = [0.01, 0.01, 0.01];
  xyTitle: string = "JzAzBz: Az Bz";
  zTitle: string = "JzAzBz: Jz";
  dimensionToChannel = { x: "az", y: "bz", z: "jz" };
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
  channels: Channels,
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
  const channels = color.toColorIO().to(colorSpace).coords;
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

export const colorPickerConfig = Object.fromEntries(
  (Object.keys(colorDirectory) as ColorSpace[]).map((name: ColorSpace) => {
    const exampleColor = new (colorDirectory as any)[name]() as Color;
    const dimensionToChannel = exampleColor.dimensionToChannel;
    return [
      name,
      {
        title: exampleColor.name,
        xyTitle: exampleColor.xyTitle,
        zTitle: exampleColor.zTitle,
        xDomain: exampleColor.domains[dimensionToChannel.x],
        yDomain: exampleColor.domains[dimensionToChannel.y],
        zDomain: exampleColor.domains[dimensionToChannel.z],
        xChannel: dimensionToChannel.x,
        yChannel: dimensionToChannel.y,
        zChannel: dimensionToChannel.z,
        xStep: exampleColor.stepSize[1],
        yStep: exampleColor.stepSize[2],
        zStep: exampleColor.stepSize[0],
        axisLabel: exampleColor.axisLabel,
      },
    ];
  })
);
