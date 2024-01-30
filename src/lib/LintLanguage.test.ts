import { expect, test } from "vitest";
import { LLEval, prettyPrintLL } from "./ugh";

test("LintLanguage basic eval ", () => {
  const colors = ["#005ebe", "#5260d1", "#005ebe"];
  // eval with no references
  const prog1 = { "<": { left: { count: colors }, right: 2 } };
  expect(LLEval(prog1, colors)).toBe(false);
  expect(prettyPrintLL(prog1)).toBe("count([#005ebe, #5260d1, #005ebe]) < 2");

  const prog2 = { "<": { left: { count: colors }, right: 10 } };
  expect(LLEval(prog2, colors)).toBe(true);
  expect(prettyPrintLL(prog2)).toBe("count([#005ebe, #5260d1, #005ebe]) < 10");

  // eval with main reference
  const prog3 = { "<": { left: { count: "colors" }, right: 2 } };
  expect(LLEval(prog3, colors)).toBe(false);
  expect(prettyPrintLL(prog3)).toBe("count(colors) < 2");

  const prog4 = { "<": { left: { count: "colors" }, right: 10 } };
  expect(LLEval(prog4, colors)).toBe(true);
  expect(prettyPrintLL(prog4)).toBe("count(colors) < 10");
});

test.only("LintLanguage Quantifiers", () => {
  const colorBlind = {
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
  // const colorBlind = {
  //   not: {
  //     exist: {
  //       input: "colors",
  //       value: "a",
  //       predicate: {
  //         exist: {
  //           input: "colors",
  //           value: "b",
  //           predicate: {
  //             not: {
  //               "!=": {
  //                 left: { cvd_sim: "a", type: "deuteranopia" },
  //                 right: { cvd_sim: "b", type: "deuteranopia" },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // };
  expect(LLEval(colorBlind, ["#005ebe", "#5260d1", "#005ebe"])).toBe(false);
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
