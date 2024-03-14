import { JSONToPrettyString, makePalFromString } from "../utils";
import type { CustomLint } from "../ColorLint";

// "Highly saturated light colors will not be appropriate for SERIOUS/TRUST/CALM": ALL (FILTER colors c, lab(c) > threshold) b, NOT hsl(b) > threshold
const lints: CustomLint[] = [];
const theseAffects = ["serious", "trustworthy", "calm"] as const;
theseAffects.forEach((affect) => {
  const lint: CustomLint = {
    name: `Saturated not appropriate for ${affect} affect`,
    program: JSONToPrettyString({
      // @ts-ignore
      $schema: `${location.href}lint-schema.json`,
      all: {
        in: "colors",
        varb: "c",
        where: { ">": { left: { "hsl.l": "c" }, right: 70 } },
        predicate: {
          not: { ">": { left: { "hsl.s": "c" }, right: 70 } },
        },
      },
    }),
    taskTypes: ["sequential", "diverging", "categorical"] as const,
    requiredTags: [affect],
    level: "warning",
    group: "design",
    description: `Highly saturated light colors are not appropriate for palettes that seek to be ${affect}.  See "Affective color in visualization" for more.`,
    failMessage: `This palette has colors which are highly saturated and light, which may not be appropriate for a ${affect} palette.`,
    id: `saturated-${affect}-built-in`,
    blameMode: "single",
    expectedPassingTests: [],
    expectedFailingTests: [],
  };
  lints.push(lint);
});

// "light blues, beiges, and grays are appropriate for PLAYFUL"
// reframed asn assertion: PLAYFUL should have at least one light blue, beige, or gray
const lint1: CustomLint = {
  name: `Playful affects can have light blues, beiges, and grays`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    exist: {
      in: "colors",
      varb: "c",
      predicate: {
        or: [
          { similar: { left: "c", right: "lightblue", threshold: 20 } },
          { similar: { left: "c", right: "beige", threshold: 20 } },
          { similar: { left: "c", right: "gray", threshold: 20 } },
        ],
      },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  requiredTags: ["playful"],
  level: "warning",
  group: "design",
  description: `Palettes that seek to be playful should have at least one light blue, beige, or gray.  See "Affective color in visualization" for more.`,
  failMessage: `This palette does not have at least one light blue, beige, or gray, which may not be appropriate for a playful palette. In particular {{blame}} may be problematic.`,
  id: `light-blues-beiges-grays-playful-built-in`,
  blameMode: "single",
  expectedPassingTests: [],
  expectedFailingTests: [],
};
lints.push(lint1);

// "dark reds and browns are not POSITIVE": ALL colors c, NOT (c similar to "DARK RED" OR c similar to "BROWN")
const lint2: CustomLint = {
  name: `Dark reds and browns are not positive`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "c",
      predicate: {
        not: {
          or: [
            { similar: { left: "c", right: "darkred", threshold: 20 } },
            { similar: { left: "c", right: "brown", threshold: 20 } },
          ],
        },
      },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"] as const,
  requiredTags: ["positive"],
  level: "warning",
  group: "design",
  description: `Palettes that seek to be positive should not have dark reds or browns.  See "Affective color in visualization" for more.`,
  failMessage: `This palette has dark reds or browns, which may not be appropriate for a positive palette. In particular {{blame}} may be problematic.`,
  id: `dark-reds-browns-positive-built-in`,
  blameMode: "single",
  expectedPassingTests: [],
  expectedFailingTests: [],
};
lints.push(lint2);

// "light colors, particularly greens, do not communicate NEGATIVE": ALL colors c, NOT (c similar to "GREEN" AND lab(l) > threshold) maybe more messaging that one?
const lint3: CustomLint = {
  name: `Negative palettes should not have light colors, particularly greens`,
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "c",
      predicate: {
        not: {
          or: [
            { similar: { left: "c", right: "green", threshold: 20 } },
            { ">": { left: { "lab.l": "c" }, right: 70 } },
          ],
        },
      },
    },
  }),
  taskTypes: ["sequential", "diverging", "categorical"],
  requiredTags: ["negative"],
  level: "warning",
  group: "design",
  description: `Palettes that seek to be negative should not have light colors, particularly greens.  See "Affective color in visualization" for more.`,
  failMessage: `This palette has light colors, particularly greens, which may not be appropriate for a negative palette. In particular {{blame}} may be problematic.`,
  id: `light-colors-greens-negative-built-in`,
  blameMode: "single",
  expectedPassingTests: [],
  expectedFailingTests: [],
};
lints.push(lint3);

// "trustworthy has two thematic strategies (blue-gray, green-gray) bridge by a common color (yellow)": AND (EXIST color a, a similar to yellow) .......
// const lint4: CustomLint = {
//   name: `Trustworthy palettes usually blue-gray or green-gray with a yellow`,
//   program: JSONToPrettyString({
//     // @ts-ignore
//     $schema: `${location.href}lint-schema.json`,
//     and: [
//       {
//         or: [
//             ex
//         ]
//       },
//       {
//         exist: {
//             varb: 'a',
//             in: 'colors',
//             predicate: { similar: { left: 'a', right: 'yellow', threshold: 20 } }
//         }
//       }
//     ],
//   }),
//   taskTypes: ["sequential", "diverging", "categorical"] as const,
//   requiredTags: ["trustworthy"],
//   level: "warning",
//   group: "design",
//   description: `Palettes that seek to be trustworthy should have two thematic strategies (blue-gray, green-gray) bridged by a common color (yellow). See "Affective color in visualization" for more.`,
//   failMessage: `This palette does not have two thematic strategies (blue-gray, green-gray) bridged by a common color (yellow), which may not be appropriate for a trustworthy palette.`,
//   id: `trustworthy-thematic-strategies-yellow-built-in`,
//   blameMode: "single",
// expectedPassingTests: [],
// expectedFailingTests: [],
// };
// lints.push(lint4);

export default lints;
