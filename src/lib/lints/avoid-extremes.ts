import { JSONToPrettyString } from "../utils";
import type { CustomLint } from "./CustomLint";

// https://www.sciencedirect.com/science/article/pii/S0167947308005549?casa_token=s8jmZqboaYgAAAAA:7lsAu7YUHVBTQA_eaKJ_3FFGv309684j_NTisGO9mIr3UZNIJ6hlAlxPQo04xzsowG7-dH0vzm4
const lint: CustomLint = {
  name: "Avoid extreme colors",
  program: JSONToPrettyString({
    // @ts-ignore
    $schema: `${location.href}lint-schema.json`,
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        all: {
          in: ["#000000", "#ffffff"],
          varb: "b",
          predicate: {
            not: { similar: { left: "a", right: "b", threshold: 12 } },
          },
        },
      },
    },
  }),

  taskTypes: ["sequential", "diverging", "categorical"] as const,
  level: "warning",
  group: "design",
  description: `Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.`,
  failMessage: `Colors at either end of the lightness spectrum {{blame}} are hard to discriminate in some contexts, and are sometimes advised against`,
  id: "extreme-colors-built-in",
  blameMode: "single",
};
export default lint;
