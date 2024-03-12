import { JSONToPrettyString, makePalFromString } from "../utils";
import type { CustomLint } from "../ColorLint";

function createPalWithTags(colors: string[], tags: [number, string][]) {
  const pal = makePalFromString(colors);
  tags.forEach(([index, tag]) => {
    pal.colors[index].tags.push(tag);
  });
  return pal;
}

// If Semantic Tag == Context then the color should be low contrast with the background (Whisper, Don't Scream work)

const lints: CustomLint[] = [];
const whisperScream: CustomLint = {
  name: "Axes should have low contrast with background",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "a",
      where: { isTag: "a", value: "axis" },
      //   paper says 0.2 opacity is acceptable, which works out to be a 16 L* contrast, rounded up to 20
      predicate: {
        "<": {
          left: {
            contrast: { left: "a", right: "background" },
            algorithm: "Lstar",
          },
          right: 20,
        },
      },
    },
  }),

  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description: `Axes should have low contrast with the background. Having it too high can make the axes too distracting. See "Whisper, Don't Scream: Grids and Transparency" for more.`,
  failMessage: `Axes should not have high contrast with the background. This can make the axes too distracting. {{blame}}`,
  id: "whisper-scream-built-in",
  blameMode: "single",
  expectedPassingTests: [createPalWithTags(["#eee"], [[0, "axis"]])],
  expectedFailingTests: [createPalWithTags(["#000"], [[0, "axis"]])],
  requiredTags: [],
};
lints.push(whisperScream);

// If Semantic Tag == Blue, then the color should be high probability for the basic color term blue
const colorNames = ["blue", "red", "orange"];
const blueBasicColor: CustomLint = {
  name: "Blue should be high probability for the basic color term blue",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "a",
      where: { isTag: "a", value: "blue" },
      predicate: { "==": { left: { name: "a" }, right: "blue" } },
    },
  }),

  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description: `Blue should be high probability for the basic color term blue. If it's not, it can be confusing to users.`,
  failMessage: `Blue should be high probability for the basic color term blue. If it's not, it can be confusing to users. {{blame}}`,
  id: "blue-basic-color-term-built-in",
  blameMode: "single",
  expectedPassingTests: [
    createPalWithTags(colorNames, [[0, "blue"]]),
    makePalFromString(colorNames),
  ],
  expectedFailingTests: [createPalWithTags(colorNames.slice(1), [[0, "blue"]])],
  requiredTags: [],
};
lints.push(blueBasicColor);
export default lints;
