# @color-buddy/color-namer

This package provides a way to name colors. Give us a color (and optionally a list of colors to choose from) and we will give you a name for it. Simple as that.

It uses the color centers from Heer-Stone and the color names from the XKCD color survey. It relies on the @color-buddy/palette for colors. Strongly inspired by [color-namer](https://github.com/colorjs/color-namer). Names are identified via symmetric delta E 2000 distance.

## Installation

```bash
npm install @color-buddy/color-namer
```

## Contents

This library contains the following functions:

### nameColor
**Function**: `nameColor(color: Color, props: Object) => string[]`

**Description**: Name a color. This function will return the name of the color that is closest to the input color.
color The color to name
props.numResults The number of results to return. This can be useful if there are multiple colors being named and you need to differentiate them, lowest index is closer. Default is 1.
props.colors A list of colors to choose from. Default is the Heer Stone color list.
props.colorListName The name of the color list to use. Used for caching. You only need to use this if you are changing color centers a lot. Default is "heerStone".



### nameToColor
**Function**: `nameToColor(name: string, colors: ColorName[]) => Color | undefined`

**Description**: Get the color of a name.





## Usage


Example usage of the library:

```ts

import { nameColor } from "@color-buddy/color-namer";
import { Color } from "@color-buddy/palette";

// basic usage
const red = Color.colorFromString("#FF0000");
const name = nameColor(red, { numResults: 3 });
const expectedResult = ["brightred", "redorange", "orangered"];

// provide a custom list of colors
const colors = [
  { name: "black", hex: "#000000" },
  { name: "blue", hex: "#0000FF" },
  { name: "cyan", hex: "#00FFFF" },
  { name: "green", hex: "#008000" },
  { name: "teal", hex: "#008080" },
  { name: "turquoise", hex: "#40E0D0" },
  { name: "indigo", hex: "#4B0082" },
  { name: "gray", hex: "#808080" },
  { name: "purple", hex: "#800080" },
  { name: "brown", hex: "#A52A2A" },
  { name: "tan", hex: "#D2B48C" },
  { name: "violet", hex: "#EE82EE" },
  { name: "beige", hex: "#F5F5DC" },
  { name: "fuchsia", hex: "#FF00FF" },
  { name: "gold", hex: "#FFD700" },
  { name: "magenta", hex: "#FF00FF" },
  { name: "orange", hex: "#FFA500" },
  { name: "pink", hex: "#FFC0CB" },
  { name: "red", hex: "#FF0000" },
  { name: "white", hex: "#FFFFFF" },
  { name: "yellow", hex: "#FFFF00" },
].map(({ name, hex }) => ({ name, color: Color.colorFromString(hex) }));

const name2 = nameColor(red, { colors });
const expectedResult2 = ["red"];

```