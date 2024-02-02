import ColorIO from "colorjs.io";

type Domain = Record<string, [number, number]>;
type Channels = [number, number, number];
const hexCache = new Map<string, string>();
const stringChannelsCache = new Map<string, Channels>();
export class Color {
  name: string = "";
  channels: Record<string, number> = {};
  spaceName: keyof typeof colorDirectory = "rgb";
  domains: Domain;
  stepSize: Channels = [1, 1, 1];
  channelNames: string[] = [];
  dimensionToChannel: Record<"x" | "y" | "z", string> = { x: "", y: "", z: "" };
  axisLabel: (num: number) => string = (x) => x.toFixed(1).toString();
  isPolar = false;
  cachedColorIO: ColorIO | null = null;
  cachedInGamut: boolean | null = null;

  constructor() {
    this.domains = {};
  }

  toHex(): string {
    const str = this.toString();
    if (hexCache.has(str)) {
      return hexCache.get(str) as string;
    }
    const newHex = this.toColorIO().to("srgb").toString({ format: "hex" });
    hexCache.set(str, newHex);
    return newHex;
  }
  toString(): string {
    const channelsString = Object.values(this.channels)
      .map((x) => x || 0)
      .map((x) => (x < 1e-5 ? 0 : x))
      .join(", ");
    return `${this.spaceName}(${channelsString})`;
  }
  getChannel(channel: keyof typeof this.channels): number {
    let channelStr = channel.toLowerCase() as string;
    if (!(channelStr in this.channels)) {
      channelStr = channelStr.toUpperCase();
      return this.channels[channelStr];
    }
    return this.channels[channel];
  }
  toChannels(): Channels {
    return Object.values(this.channels) as Channels;
  }
  setChannel(channel: keyof typeof this.channels, value: number) {
    const newColor = this.copy();
    newColor.channels[channel] = value;
    return newColor;
    // this.channels[channel] = value;
  }
  toDisplay(): string {
    return this.toHex();
    // return this.toColorIO().display();
  }
  inGamut(): boolean {
    if (this.cachedInGamut !== null) {
      return this.cachedInGamut;
    }
    // return this.toColorIO().inGamut("srgb");
    // // return new ColorIO(this.spaceName, this.toChannels()).inGamut();
    // let clr = this.toColorIO().to("srgb", { inGamut: false });
    // let cssColor = clr.display();
    // // cssColor.color.inGamut();
    // return cssColor.color.inGamut();

    const x = this.toHex();
    const y = this.toColorIO().to("srgb").toString({ format: "hex" });
    if (x !== y) {
      console.log("x", x, "y", y);
    }
    const result = x === y;
    this.cachedInGamut = result;
    return result;
  }
  toColorIO(): ColorIO {
    if (this.cachedColorIO) {
      return this.cachedColorIO;
    }
    try {
      const val = new ColorIO(this.toString());
      this.cachedColorIO = val;
      return val;
    } catch (e) {
      console.log("error", e, this.toString());
      return new ColorIO("black");
    }
  }

  fromString(colorString: string): Color {
    if (stringChannelsCache.has(colorString)) {
      return this.fromChannels(stringChannelsCache.get(colorString)!);
    }
    // const isTargetSpace = colorString.startsWith(`${this.spaceName}(`);
    // const isHex = colorString.startsWith("#");
    // const channels =
    //   isTargetSpace || isHex
    //     ? new ColorIO(colorString).to(this.spaceName).coords
    //     : stringToChannels(this.spaceName, colorString);
    let channels: Channels;
    try {
      channels = new ColorIO(colorString).to(this.spaceName).coords;
    } catch (e) {
      try {
        channels = new ColorIO(`#${colorString}`).to(this.spaceName).coords;
      } catch (e) {
        console.log("error", e, colorString);
        channels = [0, 0, 0];
      }
    }
    stringChannelsCache.set(colorString, channels);
    return this.fromChannels(channels);
  }
  fromChannels(channels: Channels): Color {
    const newColor = new (this.constructor as typeof Color)();
    Object.keys(this.channels).forEach((channel, i) => {
      newColor.channels[channel] = channels[i];
      return newColor;
    });
    return newColor;
  }
  luminance(): number {
    return this.toColorIO().luminance;
  }
  deltaE(color: Color): number {
    return this.toColorIO().deltaE(color.toColorIO(), "2000");
  }
  symmetricDeltaE(color: Color): number {
    return 0.5 * (this.deltaE(color) + color.deltaE(this));
  }
  copy(): Color {
    return this.fromChannels(this.toChannels());
  }
  toColorSpace(colorSpace: keyof typeof colorDirectory): Color {
    return toColorSpace(this, colorSpace);
  }
  stringChannels() {
    return Object.values(this.channels)
      .map((x) => x || 0)
      .map((x) => x.toLocaleString("fullwide", { useGrouping: false }));
  }
  static stringIsColor = (str: string, spaceName: string) => {
    // todo add cache
    try {
      new ColorIO(str).to(spaceName).coords;
    } catch (ea) {
      try {
        new ColorIO(`#${str}`).to(spaceName).coords;
      } catch (eb) {
        return false;
      }
    }
    return true;
  };
  static toColorSpace = toColorSpace;
  static stringToChannels = stringToChannels;
  static colorFromString = colorFromString;
  static colorFromHex = colorFromHex;
  static colorFromChannels = colorFromChannels;
}

const colorStringCache = new Map<string, Channels>();
function stringToChannels(spaceName: string, str: string) {
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
    .filter((x) => x.length)
    .map((x) => (isNaN(+x) ? 0 : Number(x)));
  const allNumbers = channels.every((x) => !isNaN(+x));

  if (!(channels.length === 3 && allNumbers)) {
    const chans = channels.map((x) => Number(x)).join(",");
    throw new Error(
      `Invalid color string: ${str} ([${chans}] - ${spaceName}) `
    );
  }
  const result = channels.map((x) => Number(x) * 1) as Channels;
  colorStringCache.set(key, result);
  return result;
}

class CIELAB extends Color {
  name = "CIELAB";
  channelNames = ["L", "a", "b"];
  channels = { L: 0, a: 0, b: 0 };
  domains = { L: [100, 0], a: [-125, 125], b: [125, -125] } as Domain;
  spaceName = "lab" as const;
  stepSize: Channels = [1, 1, 1];
  dimensionToChannel = { x: "a", y: "b", z: "L" };
  axisLabel = (num: number) => `${Math.round(num)}`;

  toString(): string {
    const [L, a, b] = this.stringChannels();
    return `lab(${L}% ${a} ${b})`;
  }
}
class HSV extends Color {
  name = "HSV";
  channelNames = ["h", "s", "v"];
  isPolar = true;
  channels = { h: 0, s: 0, v: 0 };
  domains = { h: [0, 360], s: [0, 100], v: [100, 0] } as Domain;
  spaceName = "hsv" as const;
  dimensionToChannel = { x: "s", y: "h", z: "v" };
  toString(): string {
    const [h, s, v] = this.stringChannels();
    return `color(hsv ${h} ${s} ${v})`;
  }
}

class RGB extends Color {
  name = "RGB";
  channelNames = ["r", "g", "b"];
  channels = { r: 0, g: 0, b: 0 };
  spaceName = "srgb" as const;
  domains = { r: [0, 255], g: [0, 255], b: [0, 255] } as Domain;
  stepSize: Channels = [1, 1, 1];
  dimensionToChannel = { x: "g", y: "b", z: "r" };
  axisLabel = (num: number) => `${Math.round(num)}`;
  toString(): string {
    const [r, g, b] = this.stringChannels();
    return `rgb(${r} ${g} ${b})`;
  }
}

class HSL extends Color {
  name = "HSL";
  channelNames = ["h", "s", "l"];
  channels = { h: 0, s: 0, l: 0 };
  spaceName = "hsl" as const;
  domains = { h: [0, 360], s: [0, 100], l: [100, 0] } as Domain;
  stepSize: Channels = [1, 1, 1];
  dimensionToChannel = { x: "s", y: "h", z: "l" };
  isPolar = true;

  toString(): string {
    const [h, s, l] = this.stringChannels();
    return `hsl(${h} ${s}% ${l}%)`;
  }
}
class LCH extends Color {
  name = "LCH";
  channelNames = ["l", "c", "h"];
  channels = { l: 0, c: 0, h: 0 };
  spaceName = "lch" as const;
  domains = { l: [100, 0], c: [0, 150], h: [360, 0] } as Domain;
  stepSize: Channels = [1, 1, 1];
  dimensionToChannel = { x: "c", y: "h", z: "l" };
  axisLabel = (num: number) => `${Math.round(num)}`;
}

class OKLAB extends Color {
  name = "OKLAB";
  channelNames = ["l", "a", "b"];
  channels = { l: 0, a: 0, b: 0 };
  spaceName = "oklab" as const;
  domains = { l: [1, 0], a: [-0.4, 0.4], b: [0.4, -0.4] } as Domain;
  stepSize: Channels = [0.01, 0.01, 0.01];
  dimensionToChannel = { x: "a", y: "b", z: "l" };
}

class OKLCH extends Color {
  name = "OKLCH";
  channelNames = ["l", "c", "h"];
  channels = { l: 0, c: 0, h: 0 };
  spaceName = "oklch" as const;
  domains = { l: [1, 0], c: [0, 0.4], h: [360, 0] } as Domain;
  stepSize: Channels = [0.01, 0.01, 1];
  dimensionToChannel = { x: "c", y: "h", z: "l" };
}

class JZAZBZ extends Color {
  name = "JZAZBZ";
  channelNames = ["jz", "az", "bz"];
  channels = { jz: 0, az: 0, bz: 0 };
  spaceName = "jzazbz" as const;
  domains = { jz: [1, 0], az: [-0.5, 0.5], bz: [0.5, -0.5] } as Domain;
  stepSize: Channels = [0.01, 0.01, 0.01];
  dimensionToChannel = { x: "az", y: "bz", z: "jz" };

  toString(): string {
    const [jz, az, bz] = Object.values(this.channels);
    return `color(jzazbz ${jz} ${az} ${bz})`;
  }
}

function colorFromString(
  colorString: string,
  colorSpace: keyof typeof colorDirectory = "lab"
): Color {
  const result = new colorDirectory[colorSpace]().fromString(colorString);
  return result;
}

const colorHexCache = new Map<string, Color>();
function colorFromHex(
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

function colorFromChannels(
  channels: Channels,
  colorSpace: keyof typeof colorDirectory
): Color {
  return new colorDirectory[colorSpace]().fromChannels(channels);
}

function toColorSpace(
  color: Color,
  colorSpace: keyof typeof colorDirectory
): Color {
  if (color.spaceName === colorSpace) {
    return color;
  }
  const channels = color.toColorIO().to(colorSpace, { inGamut: true }).coords;
  // const channels = color.toColorIO().to(colorSpace).coords;

  return new colorDirectory[colorSpace]().fromChannels(channels);
}

const colorDirectory = {
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
    const { x, y, z } = exampleColor.dimensionToChannel;
    return [
      name,
      {
        axisLabel: exampleColor.axisLabel,
        isPolar: exampleColor.isPolar,
        title: exampleColor.name,
        xChannel: x,
        xChannelIndex: exampleColor.channelNames.indexOf(x),
        xDomain: exampleColor.domains[x],
        xStep: exampleColor.stepSize[1],
        yChannel: y,
        yChannelIndex: exampleColor.channelNames.indexOf(y),
        yDomain: exampleColor.domains[y],
        yStep: exampleColor.stepSize[2],
        zChannel: z,
        zChannelIndex: exampleColor.channelNames.indexOf(z),
        zDomain: exampleColor.domains[z],
        zStep: exampleColor.stepSize[0],
      },
    ];
  })
);
