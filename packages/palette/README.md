# color-buddy-palette

This package is a collection of tools for working with color palettes. It is built on top of the [Color](https://colorjs.io) library. Palette lint's usage is centered around Color library, that, in turn wraps the extremely powerful [colorjs.io](https://colorjs.io/).

## Contents

This library contains the following functions:

### clipToGamut

**Function**: `clipToGamut(color: Color) => [number, number, number]`

**Description**: Clips a color to the gamut of its color space. Return the clipped color as an array of channels in the originating color space.

### cvdSim

**Function**: `cvdSim(deficiency: string, color: Color) => Color`

**Description**: Simulate the appearance of a color under a color vision deficiency.
Code adapted from libDaltonLens https://daltonlens.org
DLDeficiency = "normal" | "protanopia" | "protanomaly" | "deuteranopia" | "deuteranomaly" | "tritanopia" | "tritanomaly" | "achromatopsia" | "achromatomaly"

### distributePoints

**Function**: `distributePoints(dir: Object, focusedColors: number[], colors: Color[], colorSpace: "cam16-jmh" | "hct" | "hsl" | "hsv" | "jzazbz" | "lab" | "lch" | "oklch" | "rgb" | "srgb") => Color[]`

**Description**: Distributes colors in a palette along a direction in color space. The direction can be horizontal, vertical, or in z space.

### makePalFromString

**Function**: `makePalFromString(strings: string[], bg: string) => Palette`

**Description**: Creates a palette from an array of strings. The background color can be specified as a string.
Generates palette in CIE LAB space

### toPal

**Function**: `toPal(colors: string[], currentPal: Palette, colorSpace: any) => Palette`

**Description**: Converts an array of hex strings to a palette.

This library contains the following types:

### ColorSpace

**Type**: `ColorSpace: keyof typeof ColorSpaceDirectory`

**Description**: A collection of color space that are usable with this color library.

### PalType

**Type**: `PalType: "sequential" | "diverging" | "categorical"`

### Palette

**Type**: `Palette: Pal<Color, Color>`

**Description**: A palette where the colors are represented as Color objects. Good for programmatic use.

### StringPalette

**Type**: `StringPalette: Pal<Object, string>`

**Description**: A palette where the colors are represented as strings. Good for serialization or storage. Expects color to be represented as {color: string, tags: string[]} objects.

This library contains the following classes:

### Color

The base class for all color spaces

**Class**: `Color`

**Description**: The base class for all color spaces

Constructor:
**Constructor**: `constructor(ConstructorSignature new Color: Color)`

Properties:
**Property** channels: Record<string, number>
**Property** spaceName: "cam16-jmh" | "hct" | "hsl" | "hsv" | "jzazbz" | "lab" | "lch" | "oklch" | "rgb" | "srgb"
**Property** tags: string[]

Non-static:
**Method** copy: `copy() => Color`
**Method** deltaE: `deltaE(color: Color, algorithm: DistAlgorithm) => number`
**Method** distance: `distance(color: Color, space: string) => number`
**Method** fromChannels: `fromChannels(channels: Channels) => Color`
**Method** fromString: `fromString(colorString: string, allowError: boolean) => Color`
**Method** getChannel: `getChannel(channel: string) => number`
**Method** inGamut: `inGamut() => boolean`
**Method** luminance: `luminance() => number`
**Method** prettyChannels: `prettyChannels() => string[]`
**Method** setChannel: `setChannel(channel: string, value: number) => Color`
**Method** stringChannels: `stringChannels() => string[]`
**Method** symmetricDeltaE: `symmetricDeltaE(color: Color, algorithm: DistAlgorithm) => number`
**Method** toChannels: `toChannels() => Channels`
**Method** toColorIO: `toColorIO() => Color`
**Method** toColorSpace: `toColorSpace(colorSpace: "cam16-jmh" | "hct" | "hsl" | "hsv" | "jzazbz" | "lab" | "lch" | "oklch" | "rgb" | "srgb") => Color`
**Method** toDisplay: `toDisplay() => string`
**Method** toHex: `toHex() => string`
**Method** toPrettyString: `toPrettyString() => string`
**Method** toString: `toString() => string`

Static:
**Property** advancedSpace: boolean
**Property** axisLabel: Function
**Property** channelNames: string[]
**Property** colorFromChannels: Function
**Property** colorFromHex: Function
**Property** colorFromString: Function
**Property** description: string
**Property** dimensionToChannel: Record<"x" | "y" | "z", string>
**Property** domains: Domain
**Property** isPolar: boolean
**Property** name: string
**Property** stepSize: Channels
**Property** stringToChannels: Function
**Property** toColorSpace: Function
**Description**: Convert a color string to a color object

**Method** stringIsColor: `stringIsColor(str: string, spaceName: string) => boolean`

## Usage

Example usage of the library:

```ts
import { makePalFromString, Color } from "color-buddy-palette";

const stringColors = [
  "lab(50% 0 0)",
  "lab(100.00000139649632% -0.000007807961277528364 0.000006766250648659877)",
  "oklab(1.000000009791752,-3.3637913787742946e-8,6.836016341882356e-8)",
  "rgb(86,17,229)",
  "red",
];
const background = "black";

const palette = makePalFromString(stringColors, background);
// convert to LCH space
const newPal = {
  ...palette,
  colors: palette.colors.map((color) => color.toColorSpace("lch")),
};

const newColor = Color.colorFromString("#ff0000").toColorSpace("lch");
newPal.colors.push(newColor);
```
