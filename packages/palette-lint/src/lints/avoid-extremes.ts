import { JSONToPrettyString } from "../utils";
import { makePalFromString } from "color-buddy-palette";
import type { LintProgram } from "../ColorLint";
import { schema } from "../constants";

// https://www.sciencedirect.com/science/article/pii/S0167947308005549?casa_token=s8jmZqboaYgAAAAA:7lsAu7YUHVBTQA_eaKJ_3FFGv309684j_NTisGO9mIr3UZNIJ6hlAlxPQo04xzsowG7-dH0vzm4
const lint: LintProgram = {
  name: "Avoid extreme colors",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: schema,
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        all: {
          in: ["#000000", "#ffffff", "#0000ff", "#ff0000", "#00ff00"],
          varb: "b",
          predicate: {
            not: { "==": { left: "a", right: "b" } },
          },
        },
      },
    },
  }),

  taskTypes: ["sequential", "diverging", "categorical"] as const,
  requiredTags: [],
  level: "warning",
  group: "design",
  description: `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against. See https://blog.datawrapper.de/beautifulcolors/#6 for more.`,
  failMessage: `Colors at either end of the lightness spectrum {{blame}} are hard to discriminate in some contexts, and are sometimes advised against`,
  id: "extreme-colors-built-in",
  blameMode: "single",
  expectedPassingTests: [makePalFromString(["#ff7e0e"])],
  expectedFailingTests: [
    makePalFromString([
      "#000000",
      "#ffffff",
      "#ff7e0e",
      "#00ff00",
      "#0084a9",
      "#0000ff",
    ]),
  ],
};
export default lint;
