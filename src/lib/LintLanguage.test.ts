import { expect, test } from "vitest";
import LLEval from "./lint-language";

test("LintLanguage basic eval ", async () => {
  const colors = [
    { nodeType: "Color", value: "#005ebe" },
    { nodeType: "Color", value: "#5260d1" },
    { nodeType: "Color", value: "#005ebe" },
  ];
  const exampleProgramWithAnnotations = {
    nodeType: "Predicate",
    type: "gt",
    left: {
      nodeType: "Reduce",
      type: "count",
      input: {
        nodeType: "Variable",
        value: "colors",
      },
      function: {
        nodeType: "ValueFunction",
        type: "channel",
        space: "string",
        input: {
          nodeType: "Color",
          value: "lab",
        },
      },
    },
    right: {
      nodeType: "LLNumber",
      value: 2,
    },
  };
  const result = LLEval(exampleProgramWithAnnotations, colors);
  expect(result).toBe(false);
});

// YAML VERSION
// <:
//     left:  {count: colors}
//     right: {value: 10}
// JSON VERSION
