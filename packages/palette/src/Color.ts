import ColorIO from "colorjs.io";
import { colorCentersFromStoneHeer } from "color-buddy-color-lists";

type Domain = Record<string, [number, number]>;
type Channels = [number, number, number];
const hexCache = new Map<string, string>();
const stringChannelsCache = new Map<string, Channels>();
const stringIsColorCache = new Map<string, boolean>();
type DistAlgorithm = "76" | "CMC" | "2000" | "ITP" | "Jz" | "OK";

const ColorIOCaches = new Map<string, ColorIO>();
const InGamutCache = new Map<string, boolean>();
const colorStateCache = new Map<string, number>();
const distCache = new Map<string, number>();

/**
 * The base class for all color spaces
 *
 */
export class Color {
  static name: string = "";
  channels: Record<string, number> = {};
  spaceName: keyof typeof ColorSpaceDirectory = "rgb";
  tags: string[] = [];
  static domains: Domain;
  static stepSize: Channels = [1, 1, 1];
  static channelNames: string[] = [];
  static description: string = "";
  static spaceType: string = "rgb based";
  static dimensionToChannel: Record<"x" | "y" | "z", string> = {
    x: "",
    y: "",
    z: "",
  };
  static axisLabel: (num: number) => string = (x) => x.toFixed(1).toString();
  static isPolar = false;

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
      .map((x) => Number(x || 0))
      .map((x) => (x < 1e-5 ? 0 : x));
    return `${this.spaceName}(${channelsString.join(", ")})`;
  }
  prettyChannels(): string[] {
    // get axisLabel for class instance
    const label = (this.constructor as any).axisLabel;
    return Object.values(this.channels).map((x) => label(x));
  }
  toPrettyString(): string {
    return `${this.spaceName}(${this.prettyChannels().join(", ")})`;
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
  }
  toDisplay(): string {
    return this.toHex();
    // return this.toColorIO().display();
  }
  inGamut(): boolean {
    const key = this.toString();
    if (InGamutCache.has(key)) {
      return InGamutCache.get(key)!;
    }
    const result = this.toColorIO().to("p3", { inGamut: false }).inGamut();
    InGamutCache.set(key, result);
    return result;
  }
  toColorIO(): ColorIO {
    const key = this.toString();
    if (ColorIOCaches.has(key)) {
      return ColorIOCaches.get(key)!;
    }
    try {
      const val = new ColorIO(this.toString());
      ColorIOCaches.set(key, val);
      return val;
    } catch (e) {
      console.log("error", e, this.toString());
      return new ColorIO("black");
    }
  }

  fromString(colorString: string, allowError?: boolean): Color {
    let key = `${colorString}-${this.spaceName}`;
    if (stringChannelsCache.has(key)) {
      return this.fromChannels(stringChannelsCache.get(key)!);
    }
    // const isTargetSpace = colorString.startsWith(`${this.spaceName}(`);
    // const isHex = colorString.startsWith("#");
    // const channels =
    //   isTargetSpace || isHex
    //     ? new ColorIO(colorString).to(this.spaceName).coords
    //     : stringToChannels(this.spaceName, colorString);
    let channels: Channels;
    try {
      channels = new ColorIO(colorString).to(this.spaceName).coords as [
        number,
        number,
        number,
      ];
    } catch (e) {
      try {
        channels = new ColorIO(`#${colorString}`).to(this.spaceName).coords as [
          number,
          number,
          number,
        ];
      } catch (e) {
        if (allowError) {
          throw new Error("Invalid color string: " + colorString);
        }
        channels = [0, 0, 0];
      }
    }
    stringChannelsCache.set(key, channels.map((x) => Number(x)) as Channels);
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
  deltaE(color: Color, algorithm: DistAlgorithm = "2000"): number {
    const allowedAlgorithms = new Set(["76", "CMC", "2000", "ITP", "Jz", "OK"]);
    if (!allowedAlgorithms.has(algorithm)) {
      return 0;
    }
    const key = `${this.toString()}-${color.toString()}-${algorithm}`;

    const left = this.toColorIO().to("srgb");
    const right = color.toColorIO().to("srgb");
    const val = left.deltaE(right, algorithm);
    colorStateCache.set(key, val);
    return val;
  }
  contrast(
    color: Color,
    algorithm:
      | "76"
      | "CMC"
      | "2000"
      | "ITP"
      | "APCA"
      | "WCAG21"
      | "Michelson"
      | "Weber"
      | "Lstar"
      | "DeltaPhi"
      | "none"
  ): number {
    const key = `${this.toString()}-${color.toString()}-${algorithm}`;
    if (colorStateCache.has(key)) {
      return colorStateCache.get(key)!;
    }
    const left = this.toColorIO().to("srgb");
    const right = color.toColorIO().to("srgb");
    const val = left.contrast(right, algorithm as any);
    colorStateCache.set(key, val);
    return val;
  }
  distance(color: Color, space: string): number {
    const key = `distance-${this.toString()}-${color.toString()}-${space}`;
    if (distCache.has(key)) {
      return distCache.get(key)!;
    }
    const colorSpace = space || this.spaceName;
    const targetSpace = space === "rgb" ? "srgb" : colorSpace;
    const left = this.toColorIO().to(targetSpace);
    const right = color.toColorIO().to(targetSpace);
    const val = left.distance(right);
    distCache.set(key, val);
    return val;
  }
  symmetricDeltaE(color: Color, algorithm: DistAlgorithm = "2000"): number {
    const key = `${this.toString()}-${color.toString()}-${algorithm}`;
    if (distCache.has(key)) {
      return distCache.get(key)!;
    }
    const left = this.deltaE(color, algorithm);
    const right = color.deltaE(this, algorithm);
    const val = 0.5 * (left + right);
    distCache.set(key, val);
    return val;
  }
  copy(): Color {
    return this.fromChannels(this.toChannels());
  }
  toColorSpace(colorSpace: ColorSpace): Color {
    return toColorSpace(this, colorSpace);
  }
  stringChannels() {
    return Object.values(this.channels)
      .map((x) => (isNaN(x) ? 0 : x))
      .map((x) => (x || 0).toFixed(3).replace(/\.?0+$/, ""));
  }
  static stringIsColor = (str: string, spaceName: string) => {
    const key = `${str.toLowerCase()}-${spaceName}`;
    if (stringIsColorCache.has(key)) {
      return stringIsColorCache.get(key)!;
    }
    // todo add cache
    let result = true;
    try {
      new ColorIO(str).to(spaceName);
    } catch (ea) {
      try {
        new ColorIO(`#${str}`).to(spaceName);
      } catch (eb) {
        try {
          new ColorIO(colorCentersFromStoneHeer[str.toLowerCase()]).to(
            spaceName
          );
        } catch (ec) {
          result = false;
        }
      }
    }
    stringIsColorCache.set(key, result);
    return result;
  };
  /**
   * Convert a color string to a color object
   */
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
  static name = "CIELAB";
  static channelNames = ["L", "a", "b"];
  channels = { L: 0, a: 0, b: 0 };
  static domains = { L: [100, 0], a: [-125, 125], b: [125, -125] } as Domain;
  spaceName = "lab" as const;
  static stepSize: Channels = [1, 1, 1];
  static dimensionToChannel = { x: "a", y: "b", z: "L" };
  static description =
    "Lightness, Red-green (a), and Yellow-blue (b). International standard";
  static spaceType = "perceptually uniform";
  static axisLabel = (num: number) => `${Math.round(num)}`;

  toString(): string {
    const [L, a, b] = this.stringChannels();
    return `lab(${L}% ${a} ${b})`;
  }
  toPrettyString(): string {
    const [L, a, b] = this.prettyChannels();
    return `lab(${L} ${a} ${b})`;
  }
}
class HSV extends Color {
  static name = "HSV";
  static channelNames = ["h", "s", "v"];
  static isPolar = true;
  channels = { h: 0, s: 0, v: 0 };
  static domains = { h: [0, 360], s: [0, 100], v: [100, 0] } as Domain;
  spaceName = "hsv" as const;
  static dimensionToChannel = { x: "s", y: "h", z: "v" };
  static description = "Hue, Saturation, Value. Cylindrical";
  static spaceType = "rgb based";
  toString(): string {
    const [h, s, v] = this.stringChannels();
    return `color(hsv ${h} ${s} ${v})`;
  }
  toPrettyString(): string {
    const [h, s, v] = this.prettyChannels();
    return `hsv(${h} ${s}% ${v}%)`;
  }
}

class RGB extends Color {
  static name = "RGB";
  static channelNames = ["r", "g", "b"];
  channels = { r: 0, g: 0, b: 0 };
  spaceName = "srgb" as const;
  static domains = { r: [0, 255], g: [0, 255], b: [0, 255] } as Domain;
  static stepSize: Channels = [1, 1, 1];
  static dimensionToChannel = { x: "g", y: "b", z: "r" };
  static description = "Red, Green, Blue.";
  static spaceType = "rgb based";
  static axisLabel = (num: number) => `${Math.round(num)}`;
  toString(): string {
    const [r, g, b] = this.stringChannels();
    return `rgb(${r} ${g} ${b})`;
  }
  toPrettyString(): string {
    const [r, g, b] = this.prettyChannels();
    return `rgb(${r} ${g} ${b})`;
  }
}

class SRGB extends Color {
  static name = "sRGB";
  static channelNames = ["r", "g", "b"];
  channels = { r: 0, g: 0, b: 0 };
  spaceName = "srgb" as const;
  static domains = { r: [1, 0], g: [0, 1], b: [1, 0] } as Domain;
  static stepSize: Channels = [0.01, 0.01, 0.01];
  static dimensionToChannel = { x: "g", y: "b", z: "r" };
  static description =
    "Red, Green, Blue. Designed for display, but not palette design";
  static spaceType = "rgb based";
  static axisLabel = (num: number) => `${Math.round(num)}`;
  toString(): string {
    const [r, g, b] = this.stringChannels();
    return `rgb(${Number(r) * 255} ${Number(g) * 255} ${Number(b) * 255})`;
  }
  toPrettyString(): string {
    const [r, g, b] = this.prettyChannels();
    return `rgb(${Number(r) * 255} ${Number(g) * 255} ${Number(b) * 255})`;
  }
}

class HSL extends Color {
  static name = "HSL";
  static channelNames = ["h", "s", "l"];
  channels = { h: 0, s: 0, l: 0 };
  spaceName = "hsl" as const;
  static domains = { h: [0, 360], s: [0, 100], l: [100, 0] } as Domain;
  static stepSize: Channels = [1, 1, 1];
  static dimensionToChannel = { x: "s", y: "h", z: "l" };
  static description = "Hue, Saturation, Lightness. Cylindrical";
  static spaceType = "rgb based";
  static isPolar = true;

  toString(): string {
    const [h, s, l] = this.stringChannels();
    return `hsl(${h} ${s}% ${l}%)`;
  }
  toPrettyString(): string {
    const [h, s, l] = this.prettyChannels();
    return `hsl(${h} ${s}% ${l}%)`;
  }
}
class LCH extends Color {
  static name = "LCH";
  static channelNames = ["l", "c", "h"];
  channels = { l: 0, c: 0, h: 0 };
  spaceName = "lch" as const;
  static domains = { l: [100, 0], c: [0, 120], h: [360, 0] } as Domain;
  static stepSize: Channels = [1, 1, 1];
  static dimensionToChannel = { x: "c", y: "h", z: "l" };
  static description = "Lightness, Chroma, Hue. Cylindrical, refinement of LAB";
  static spaceType = "perceptually uniform";
  static isPolar = true;
  static axisLabel = (num: number) => `${Math.round(num)}`;
}

// OKLAB still cursed
// class OKLAB extends Color {
//   static name = "OKLAB";
//   static channelNames = ["l", "a", "b"];
//   channels = { l: 0, a: 0, b: 0 };
//   spaceName = "oklab" as const;
//   static domains = { l: [1, 0], a: [-0.4, 0.4], b: [0.4, -0.4] } as Domain;
//   static stepSize: Channels = [0.01, 0.01, 0.01];
//   static dimensionToChannel = { x: "a", y: "b", z: "l" };
//   static description =
//     "OKLAB is a perceptually uniform color space. It is a refinement of CIELAB. ";
//   toString(): string {
//     const [l, a, b] = Object.values(this.channels)
//       .map((x, idx) => (idx ? x : x * 100))
//       .map((x) => x.toLocaleString("fullwide", { useGrouping: false }));
//     console.log("oklab", l, a, b);
//     return `oklab(${l}% ${a} ${b})`;
//   }
//   toPrettyString(): string {
//     const [l, a, b] = this.prettyChannels();
//     return `oklab(${l}% ${a} ${b})`;
//   }
// }

class OKLCH extends Color {
  static name = "OKLCH";
  static channelNames = ["l", "c", "h"];
  channels = { l: 0, c: 0, h: 0 };
  spaceName = "oklch" as const;
  static domains = { l: [1, 0], c: [0, 0.4], h: [360, 0] } as Domain;
  static stepSize: Channels = [0.01, 0.01, 1];
  static dimensionToChannel = { x: "c", y: "h", z: "l" };
  static description = "Lightness, Chroma, Hue. Cylindrical";
  static spaceType = "perceptually uniform";
  static isPolar = true;
}

// class JZAZBZ extends Color {
//   static name = "JZAZBZ";
//   static channelNames = ["jz", "az", "bz"];
//   channels = { jz: 0, az: 0, bz: 0 };
//   spaceName = "jzazbz" as const;
//   static domains = { jz: [1, 0], az: [-0.5, 0.5], bz: [0.5, -0.5] } as Domain;
//   static stepSize: Channels = [0.01, 0.01, 0.01];
//   static dimensionToChannel = { x: "az", y: "bz", z: "jz" };
//   static description =
//     "Lightness (JZ), Red-green (az), Blue-yellow (bz). Designed for HD imagery";

//   static spaceType = "other interesting spaces";
//   toString(): string {
//     const [jz, az, bz] = Object.values(this.channels).map((x) =>
//       isNaN(x) ? 0 : x
//     );
//     return `color(jzazbz ${jz} ${az} ${bz})`;
//   }
//   toPrettyString(): string {
//     const [jz, az, bz] = this.prettyChannels();
//     return `jzazbz(${jz} ${az} ${bz})`;
//   }
// }

class XYZ extends Color {
  static name = "XYZ";
  static channelNames = ["x", "y", "z"];
  channels = { x: 0, y: 0, z: 0 };
  spaceName = "xyz-d65" as const;
  // static domains = { x: [0, 9504.7], y: [0, 10000], z: [0, 10888.3] } as Domain;
  // static domains = { x: [0, 100], y: [0, 100], z: [0, 100] } as Domain;
  static domains = { x: [0, 1.1], y: [1.1, 0], z: [1.1, 0] } as Domain;
  static stepSize: Channels = [0.01, 0.01, 0.01];
  static dimensionToChannel = { x: "x", y: "z", z: "y" };
  static description = "X, Y (Luminance), Z. International Standard";
  static spaceType = "other interesting spaces";
  toString(): string {
    const [x, y, z] = Object.values(this.channels).map((x) =>
      isNaN(x) ? 0 : x
    );
    return `color(--xyz-d65 ${x} ${y} ${z})`;
  }
  toPrettyString(): string {
    const [x, y, z] = this.prettyChannels();
    // return `xyz(${x} ${y} ${z})`;
    return `color(--xyz-d65 ${x} ${y} ${z})`;
  }
}

class HCT extends Color {
  static name = "HCT";
  static channelNames = ["h", "c", "t"];
  channels = { h: 0, c: 0, t: 0 };
  spaceName = "hct" as const;
  static domains = { h: [360, 0], c: [0, 145], t: [100, 0] } as Domain;
  static stepSize: Channels = [1, 1, 1];
  static dimensionToChannel = { x: "c", y: "h", z: "t" };
  static isPolar = true;
  static description = "Hue, Chroma, Tone. Perceptually uniform (from Google)";
  static spaceType = "other interesting spaces";

  toString(): string {
    const [h, c, t] = Object.values(this.channels).map((x) =>
      isNaN(x) ? 0 : x
    );
    return `color(--hct ${h} ${c} ${t})`;
  }
  toPrettyString(): string {
    const [h, c, t] = this.prettyChannels();
    return `color(--hct ${h} ${c} ${t})`;
  }
}
class CAM16 extends Color {
  static name = "CAM16";
  static channelNames = ["j", "m", "h"];
  channels = { j: 0, m: 0, h: 0 };
  spaceName = "cam16-jmh" as const;
  static domains = { j: [100, 0], m: [0, 105], h: [360, 0] } as Domain;
  static stepSize: Channels = [1, 1, 1];
  static dimensionToChannel = { x: "m", y: "h", z: "j" };
  static description =
    "J (lightness), M (colorfulness), H (hue). Designed for color management";
  static isPolar = true;
  static spaceType = "other interesting spaces";

  toString(): string {
    const [h, c, t] = Object.values(this.channels).map((x) =>
      isNaN(x) ? 0 : x
    );
    return `color(--cam16-jmh ${h} ${c} ${t})`;
  }
  toPrettyString(): string {
    const [h, c, t] = this.prettyChannels();
    return `color(--cam16-jmh ${h} ${c} ${t})`;
  }
}

function colorFromString(
  colorString: string,
  colorSpace: keyof typeof ColorSpaceDirectory = "lab",
  allowError?: boolean
): Color {
  const result = new (ColorSpaceDirectory[colorSpace] ||
    ColorSpaceDirectory.lab)().fromString(colorString, allowError);
  return result;
}

const colorHexCache = new Map<string, Color>();
function colorFromHex(
  hex: string,
  colorSpace: keyof typeof ColorSpaceDirectory
): Color {
  if (colorHexCache.has(hex)) {
    return colorHexCache.get(hex)!.copy() as Color;
  }
  const color = new ColorIO(hex).to(colorSpace);
  const outColor = new (ColorSpaceDirectory[colorSpace] ||
    ColorSpaceDirectory.lab)().fromChannels(
    color.coords as [number, number, number]
  );
  colorHexCache.set(hex, outColor);
  return outColor;
}

const colorChannelsCache = new Map<string, Color>();
function colorFromChannels(
  channels: Channels,
  colorSpace: keyof typeof ColorSpaceDirectory
): Color {
  const cacheKey = `${colorSpace}(${channels.join(",")})`;
  if (colorChannelsCache.has(cacheKey)) {
    return colorChannelsCache.get(cacheKey)!.copy() as Color;
  }
  const color = new (ColorSpaceDirectory[colorSpace] ||
    ColorSpaceDirectory.lab)().fromChannels(channels);
  colorChannelsCache.set(cacheKey, color);
  return color;
}

function toColorSpace(
  color: Color,
  colorSpace: keyof typeof ColorSpaceDirectory
): Color {
  if (color.spaceName === colorSpace) {
    return color;
  }
  const space = colorSpace === "rgb" ? "srgb" : colorSpace;
  const channels = color.toColorIO().to(space, { inGamut: true }).coords;

  const newColor = new (ColorSpaceDirectory[colorSpace] ||
    ColorSpaceDirectory.lab)().fromChannels(
    channels as [number, number, number]
  );
  newColor.tags = color.tags;
  return newColor;
}

export const ColorSpaceDirectory = {
  "cam16-jmh": CAM16,
  hct: HCT,
  hsl: HSL,
  hsv: HSV,
  // jzazbz: JZAZBZ,
  lab: CIELAB,
  lch: LCH,
  // oklab: OKLAB,
  oklch: OKLCH,
  rgb: RGB,
  // srgb: RGB,
  srgb: SRGB,
  "xyz-d65": XYZ,
};
type ColorSpace = keyof typeof ColorSpaceDirectory;
