import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
export class Color {
  name: string;
  channels: Record<string, number>;
  chromaBind: typeof chroma.lab;
  spaceName: string;
  channelDimensions: Record<keyof typeof this.channels, [number, number]>;
  constructor() {
    this.name = "";
    this.channels = {};
    this.chromaBind = chroma.rgb;
    this.spaceName = "";
    this.channelDimensions = {};
  }

  toHex(): string {
    return this.chromaBind(...this.toChannels()).hex();
  }
  toString(): string {
    const channelsString = Object.values(this.channels).join(",");
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
    return new Color();
  }
  setChannel(channel: keyof typeof this.channels, value: number) {
    this.channels[channel] = value;
  }

  fromString(colorString: string): Color {
    if (!colorString.startsWith(`${this.spaceName}(`)) {
      // @ts-ignore
      const chromaChannels = chroma(colorString)[this.spaceName]();
      return this.fromChannels(chromaChannels);
    }
    // extract the numbers from the string
    const regex = new RegExp(`${this.spaceName}\\((.*)% (.*) (.*)\\)`);
    const match = colorString.match(regex);
    if (!match) {
      throw new Error("Invalid color string");
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
    this.channelDimensions = {
      L: [0, 100],
      a: [-100, 100],
      b: [-100, 100],
    };
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
    this.channelDimensions = {
      h: [0, 360],
      s: [0, 1],
      v: [0, 1],
    };
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
    this.channelDimensions = {
      h: [0, 255],
      s: [0, 255],
      v: [0, 255],
    };
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
    // todo maybe wrong
    this.channelDimensions = {
      h: [0, 360],
      s: [0, 100],
      v: [0, 100],
    };
  }
}

export function colorFromString(
  colorString: string,
  colorSpace: keyof typeof colorDirectory
): Color {
  return new colorDirectory[colorSpace]().fromString(colorString);
}

export function colorFromChannels(
  channels: [number, number, number],
  colorSpace: keyof typeof colorDirectory
): Color {
  return new colorDirectory[colorSpace]().fromChannels(channels);
}

export const colorDirectory = {
  lab: CIELAB,
  hsv: HSV,
  hsl: HSL,
  rgb: RGB,
};
