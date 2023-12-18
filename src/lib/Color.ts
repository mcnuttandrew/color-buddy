import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
export class Color {
  name: string;
  channels: Record<string, number>;
  constructor() {
    this.name = "";
    this.channels = {};
  }

  toHex(): string {
    return "#000000";
  }
  toString(): string {
    return "#000000";
  }
  getChannel(channel: string): number {
    return 0;
  }
  toChroma(): ChromaColor {
    return chroma("#000000");
  }
  toChannels(): [number, number, number] {
    return [0, 0, 0];
  }
  static fromChroma(color: ChromaColor): Color {
    return new Color();
  }
  setChannel(channel: string, value: number) {
    this.channels[channel] = value;
  }
  static channelDimensions(channel: string): [number, number] {
    return [0, 0];
  }
  static fromString(colorString: string): Color {
    return new Color();
  }
  static fromChannels(channels: [number, number, number]): Color {
    return new Color();
  }
  static distance(color1: Color, color2: Color): number {
    return 0;
  }
}

export class CIELAB implements Color {
  name: "CIELAB";
  channels: { L: number; a: number; b: number };
  constructor() {
    this.name = "CIELAB";
    this.channels = { L: 0, a: 0, b: 0 };
  }
  toHex(): string {
    return chroma.lab(this.channels.L, this.channels.a, this.channels.b).hex();
  }
  toString(): string {
    return `lab(${this.channels.L},${this.channels.a},${this.channels.b})`;
  }
  toChroma(): ChromaColor {
    return chroma.lab(this.channels.L, this.channels.a, this.channels.b);
  }
  toChannels(): [number, number, number] {
    return [this.channels.L, this.channels.a, this.channels.b];
  }
  setChannel(channel: "L" | "a" | "b", value: number) {
    this.channels[channel] = value;
  }
  getChannel(channel: "L" | "a" | "b"): number {
    return this.channels[channel];
  }

  static channelDimensions(channel: "L" | "a" | "b"): [number, number] {
    switch (channel) {
      case "L":
        return [0, 100];
      case "a":
        return [-100, 100];
      case "b":
        return [-100, 100];
    }
  }
  static fromString(colorString: string): CIELAB {
    if (!colorString.startsWith("lab(")) {
      const chromaColor = chroma(colorString).lab();
      return CIELAB.fromChannels(chromaColor);
    }
    // extract the numbers from the string
    // lab(29.2345% 39.3825 20.0664) -> [29.2345, 39.3825, 20.0664];
    // lab(52.2345% 40.1645 59.9971) -> [52.2345, 40.1645, 59.9971];
    const regex = /lab\((.*)% (.*) (.*)\)/;
    const match = colorString.match(regex);
    if (!match) {
      throw new Error("Invalid color string");
    }
    const [_, L, a, b] = match;
    const lab = CIELAB.fromChannels([+L, +a, +b]);
    return lab;
  }
  static fromChannels(channels: [number, number, number]): CIELAB {
    const lab = new CIELAB();
    lab.channels.L = channels[0];
    lab.channels.a = channels[1];
    lab.channels.b = channels[2];
    return lab;
  }
  static distance(color1: CIELAB, color2: CIELAB): number {
    // todo rework
    return chroma.deltaE(color1.toChroma(), color2.toChroma());
  }
}
