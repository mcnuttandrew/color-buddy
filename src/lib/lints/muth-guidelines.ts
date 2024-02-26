import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "../CustomLint";

const lints: CustomLint[] = [];

// Choose a background that's desaturated enough
// https://blog.datawrapper.de/beautifulcolors/#12
const bgDeSaturated: CustomLint = {
  name: `Background desaturation sufficient`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    or: [
      // light background
      {
        or: [
          {
            and: [
              // loosed the lighteness to 90 from 94, to make it fit her example
              { ">": { left: { "hsl.l": "background" }, right: 90 } },
              { "<": { left: { "hsv.s": "background" }, right: 8 } },
            ],
          },
          { ">": { left: { "hsl.l": "background" }, right: 99 } },
        ],
      },
      // dark background
      {
        and: [
          { ">": { left: { "hsl.l": "background" }, right: 10 } },
          { "<": { left: { "hsl.l": "background" }, right: 26 } },
          { "<": { left: { "hsv.s": "background" }, right: 21 } },
        ],
      },
    ],
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  affectTypes: [],
  level: "warning",
  group: "design",
  description: "Background should be sufficiently desaturated. ",
  failMessage: `Colorful backgrounds can seem like a good idea, but they can easily distract from your data and they limit your potential color palette. Desaturated colors are your best bet. Roughly, you want either HSL.L > 90 and HSV.S < 8 for light backgrounds, or you want 10 < HSL.L < 25 and HSV.S < 20 for dark backgrounds. See "https://blog.datawrapper.de/beautifulcolors/#12" for more`,
  id: `background-de-saturation-built-in`,
  blameMode: "none",
};
lints.push(bgDeSaturated);

const avoidTetradic: CustomLint = {
  name: `Avoid Tetradic Palettes`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    not: {
      exist: {
        varb: "a",
        in: "colors",
        predicate: {
          and: [
            ...[90, 180, 270].map((angle) => ({
              exist: {
                varb: "b",
                in: "colors",
                predicate: {
                  similar: {
                    left: { "hsl.h": "a" },
                    right: { "+": { left: { "hsl.h": "b" }, right: 90 } },
                    threshold: 5,
                  },
                },
              },
            })),
          ],
        },
      },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  affectTypes: [],
  level: "warning",
  group: "design",
  description: `Tetradic palettes are hard to work with and are not recommended.`,
  failMessage: `This palette is tetradic, which is not recommended.`,
  id: `avoid-tetradic-built-in`,
  blameMode: "pair",
};
lints.push(avoidTetradic);

// When using green, make it a yellow or blue one
// https://blog.datawrapper.de/beautifulcolors/#5
const avoidGreen: CustomLint = {
  name: `Prefer yellowish or blueish greens`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      varb: "a",
      in: "colors",
      predicate: {
        or: [
          // using the looser bands intentionally, tigher bands would be !(60 <= x <= 160)
          { "<": { left: { "hsl.h": "a" }, right: 90 } },
          { ">": { left: { "hsl.h": "a" }, right: 150 } },
        ],
      },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  affectTypes: [],
  level: "warning",
  group: "design",
  description: `When using green, make it a yellow or blue one. This makes it easier to play nicely with other colors.`,
  failMessage: `When using green, it is better to try to it a yellow or blue one (hue angle less than 60 or greater than 160). T See "https://blog.datawrapper.de/beautifulcolors/#5" for more.`,
  id: `avoid-green-built-in`,
  blameMode: "single",
};
lints.push(avoidGreen);

// The opposite is true, too: Don’t make your colors too dark and saturated when you’re using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels.
// https://blog.datawrapper.de/beautifulcolors/#11
const AvoidTooMuchContrastWithTheBackground: CustomLint = {
  name: `Avoid too much contrast with the background`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    or: [
      // bright background
      {
        and: [
          { ">": { left: { "hsl.l": "background" }, right: 50 } },
          {
            all: {
              varb: "a",
              in: "colors",
              predicate: {
                "<": {
                  left: {
                    contrast: { left: "a", right: "background" },
                    algorithm: "WCAG21",
                  },
                  right: 10,
                },
              },
            },
          },
        ],
      },
      // not bright background
      { "<": { left: { "hsl.l": "background" }, right: 50 } },
    ],
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  affectTypes: [],
  level: "warning",
  group: "design",
  description: `Don't make your colors too dark and saturated when you're using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels.`,
  failMessage: `Don't make your colors too dark and saturated when you're using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels. See "https://blog.datawrapper.de/beautifulcolors/#11" for more.`,
  id: `avoid-too-much-contrast-with-the-background-built-in`,
  blameMode: "single",
};
lints.push(AvoidTooMuchContrastWithTheBackground);

export default lints;