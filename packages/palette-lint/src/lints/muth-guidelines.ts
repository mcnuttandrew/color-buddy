import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "@color-buddy/palette";
import type { CustomLint } from "../ColorLint";
import { schema } from "../constants";

const lints: CustomLint[] = [];

// Choose a background that's desaturated enough
// https://blog.datawrapper.de/beautifulcolors/#12
const bgDeSaturated: CustomLint = {
  name: `Background desaturation sufficient`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  requiredTags: [],
  level: "warning",
  group: "design",
  description: "Background should be sufficiently desaturated. ",
  failMessage: `Colorful backgrounds can seem like a good idea, but they can easily distract from your data and they limit your potential color palette. Desaturated colors are your best bet. Roughly, you want either HSL.L > 90 and HSV.S < 8 for light backgrounds, or you want 10 < HSL.L < 25 and HSV.S < 20 for dark backgrounds. See "https://blog.datawrapper.de/beautifulcolors/#12" for more`,
  id: `background-de-saturation-built-in`,
  blameMode: "none",
  expectedPassingTests: [
    makePalFromString(["#0084a9", "#009de5", "#5fb1ff", "#bbc3ff"], "#f4e3e3"),
  ],
  expectedFailingTests: [
    makePalFromString(["#0084a9", "#009de5", "#5fb1ff", "#ecddff"], "#000"),
  ],
};
lints.push(bgDeSaturated);

const avoidTetradic: CustomLint = {
  name: `Avoid Tetradic Palettes`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
                    right: {
                      "%": {
                        left: { "+": { left: { "hsl.h": "b" }, right: angle } },
                        right: 360,
                      },
                    },
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
  requiredTags: [],
  level: "warning",
  group: "design",
  description: `Tetradic palettes are hard to work with and are not recommended.`,
  failMessage: `This palette is tetradic, which is not recommended.`,
  id: `avoid-tetradic-built-in`,
  blameMode: "pair",
  expectedPassingTests: [
    makePalFromString(["#0084a9", "#009de5", "#5fb1ff", "#bbc3ff"]),
  ],
  expectedFailingTests: [
    makePalFromString(["#d23bae", "#3b6dd2", "#d89a35", "#36d745"]),
  ],
};
lints.push(avoidTetradic);

// When using green, make it a yellow or blue one
// https://blog.datawrapper.de/beautifulcolors/#5
const avoidGreen: CustomLint = {
  name: `Prefer yellowish or blueish greens`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  requiredTags: [],
  level: "warning",
  group: "design",
  description: `When using green, make it a yellow or blue one. This makes it easier to play nicely with other colors.`,
  failMessage: `When using green, it is better to try to it a yellow or blue one (hue angle less than 60 or greater than 160). T See "https://blog.datawrapper.de/beautifulcolors/#5" for more.`,
  id: `avoid-green-built-in`,
  blameMode: "single",
  expectedPassingTests: [makePalFromString(["#bee38d", "#bbc3ff"])],
  expectedFailingTests: [makePalFromString(["#0084a9", "#93e789"])],
};
lints.push(avoidGreen);

// The opposite is true, too: Don’t make your colors too dark and saturated when you’re using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels.
// https://blog.datawrapper.de/beautifulcolors/#11
const AvoidTooMuchContrastWithTheBackground: CustomLint = {
  name: `Avoid too much contrast with the background`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
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
  requiredTags: [],
  level: "warning",
  group: "design",
  description: `Don't make your colors too dark and saturated when you're using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels.`,
  failMessage: `Don't make your colors too dark and saturated when you're using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels. See "https://blog.datawrapper.de/beautifulcolors/#11" for more.`,
  id: `avoid-too-much-contrast-with-the-background-built-in`,
  blameMode: "single",
  expectedPassingTests: [
    makePalFromString(["#f4b05d", "#3c828d", "#1c4b76"], "#f9f9f9"),
  ],
  expectedFailingTests: [
    makePalFromString(["#0e2d48", "#3c828d", "#b87930"], "#f9f9f9"),
  ],
};
lints.push(AvoidTooMuchContrastWithTheBackground);

// use pairs of colors
// this isnt a muth its just sort of implied
const requireColorComplements: CustomLint = {
  name: `Require color complements`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    exist: {
      in: "colors",
      varbs: ["a", "b"],
      predicate: {
        similar: {
          left: { "hsl.h": "a" },
          right: { "+": { left: { "hsl.h": "b" }, right: 180 } },
          threshold: 5,
        },
      },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  requiredTags: [],
  level: "warning",
  group: "design",
  description: `Use color complements whenever possible`,
  failMessage: `Color complements are a great way to make your colors pop. Try to use them whenever possible.`,
  id: `require-color-complements-built-in`,
  blameMode: "pair",
  expectedPassingTests: [],
  expectedFailingTests: [],
};
lints.push(requireColorComplements);

export default lints;
