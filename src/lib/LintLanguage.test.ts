import { expect, test } from "vitest";
import { LLEval, prettyPrintLL } from "./lint-language";
import { Color } from "./Color";

const exampleColors = ["#d4a8ff", "#7bb9ff", "#008694"].map((x) =>
  Color.colorFromString(x, "lab")
);
test("LintLanguage basic eval ", () => {
  // eval with no references
  const prog1 = { "<": { left: { count: exampleColors }, right: 2 } };
  expect(LLEval(prog1, exampleColors)).toBe(false);
  expect(prettyPrintLL(prog1)).toBe("count([#d4a8ff, #7bb9ff, #008694]) < 2");

  const prog2 = { "<": { left: { count: exampleColors }, right: 10 } };
  expect(LLEval(prog2, exampleColors)).toBe(true);
  expect(prettyPrintLL(prog2)).toBe("count([#d4a8ff, #7bb9ff, #008694]) < 10");

  // eval with main reference
  const prog3 = { "<": { left: { count: "colors" }, right: 2 } };
  expect(LLEval(prog3, exampleColors)).toBe(false);
  expect(prettyPrintLL(prog3)).toBe("count(colors) < 2");

  const prog4 = { "<": { left: { count: "colors" }, right: 10 } };
  expect(LLEval(prog4, exampleColors)).toBe(true);
  expect(prettyPrintLL(prog4)).toBe("count(colors) < 10");
});

test("LintLanguage Quantifiers", () => {
  const colorBlindAll = {
    all: {
      input: "colors",
      value: "a",
      predicate: {
        all: {
          input: "colors",
          value: "b",
          predicate: {
            not: {
              "==": {
                left: { cvd_sim: "a", type: "deuteranopia" },
                right: { cvd_sim: "b", type: "deuteranopia" },
              },
            },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(colorBlindAll)).toBe(
    "all a in (colors), all b in (colors), NOT cvd_sim(a, deuteranopia) == cvd_sim(b, deuteranopia)"
  );
  expect(LLEval(colorBlindAll, exampleColors)).toBe(false);
  const colorBlindExists = {
    not: {
      exist: {
        input: "colors",
        value: "a",
        predicate: {
          exist: {
            input: "colors",
            value: "b",
            predicate: {
              "!=": {
                left: { cvd_sim: "a", type: "deuteranopia" },
                right: { cvd_sim: "b", type: "deuteranopia" },
              },
            },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(colorBlindExists)).toBe(
    "NOT exist a in (colors), exist b in (colors), cvd_sim(a, deuteranopia) != cvd_sim(b, deuteranopia)"
  );
  expect(LLEval(colorBlindExists, exampleColors)).toBe(false);
});

// YAML VERSION
// all:
//     input: colors,
//     value: 'a',
//     predicate:
//         all:
//             colors,
//             value: 'b',
//             predicate:
//                 not:
//                     equal:
//                         left:  {cvd_sim: 'a', type: 'deuteranopia'}
//                         right: {cvd_sim: 'b', type: 'deuteranopia'}
// JSON VERSION
