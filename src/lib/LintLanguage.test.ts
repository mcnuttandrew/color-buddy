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

test("LintLanguage conjunctions", () => {
  const prog1 = {
    and: [
      { "<": { left: { count: "colors" }, right: 10 } },
      { ">": { left: { count: "colors" }, right: 2 } },
    ],
  };
  expect(LLEval(prog1, exampleColors)).toBe(true);
  expect(prettyPrintLL(prog1)).toBe("count(colors) < 10 AND count(colors) > 2");

  const prog2 = {
    or: [
      { "<": { left: { count: "colors" }, right: 2 } },
      { ">": { left: { count: "colors" }, right: 10 } },
    ],
  };
  expect(LLEval(prog2, exampleColors)).toBe(false);
  expect(prettyPrintLL(prog2)).toBe("count(colors) < 2 OR count(colors) > 10");
});

test("LintLanguage Quantifiers All - Simple", () => {
  const simpProg = (colors: string[]) => ({
    exist: {
      input: "colors",
      value: "a",
      predicate: {
        exist: {
          input: colors.map((x) => Color.colorFromString(x, "lab")),
          value: "b",
          predicate: { "==": { left: "a", right: "b" } },
        },
      },
    },
  });
  expect(prettyPrintLL(simpProg(["red"]))).toBe(
    "exist a in (colors), exist b in ([#f00]), a == b"
  );
  expect(LLEval(simpProg(["red"]), exampleColors)).toBe(false);

  expect(prettyPrintLL(simpProg(["#7bb9ff"]))).toBe(
    "exist a in (colors), exist b in ([#7bb9ff]), a == b"
  );
  expect(LLEval(simpProg(["#7bb9ff"]), exampleColors)).toBe(true);
});

test("LintLanguage Quantifiers All - CB", () => {
  const expectedOut = (type: string) =>
    `all a in (colors), all b in (colors), NOT cvd_sim(a, ${type}) similar(9) cvd_sim(b, ${type})`;
  const allBlindProg = (type: string) => ({
    all: {
      input: "colors",
      value: "a",
      predicate: {
        all: {
          input: "colors",
          value: "b",
          where: { "!=": { left: "a", right: "b" } },
          predicate: {
            not: {
              similar: {
                left: { cvd_sim: "a", type },
                right: { cvd_sim: "b", type },
                similarityThreshold: 9,
              },
            },
          },
        },
      },
    },
  });

  // deuteranopia
  expect(prettyPrintLL(allBlindProg("deuteranopia"))).toBe(
    expectedOut("deuteranopia")
  );
  expect(LLEval(allBlindProg("deuteranopia"), exampleColors)).toBe(false);
  // protanopia
  expect(prettyPrintLL(allBlindProg("protanopia"))).toBe(
    expectedOut("protanopia")
  );
  expect(LLEval(allBlindProg("protanopia"), exampleColors)).toBe(false);
  // tritanopia
  expect(prettyPrintLL(allBlindProg("tritanopia"))).toBe(
    expectedOut("tritanopia")
  );
  expect(LLEval(allBlindProg("tritanopia"), exampleColors)).toBe(true);
});

test("LintLanguage Quantifiers Exist", () => {
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

test("LintLanguage Check exists", () => {
  const program = {
    exist: {
      input: "colors",
      value: "a",
      predicate: { "==": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program)).toBe("exist a in (colors), a == #1fbad6");
  expect(LLEval(program, exampleColors)).toBe(false);

  const program2 = {
    exist: {
      input: "colors",
      value: "a",
      predicate: { "!=": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program2)).toBe("exist a in (colors), a != #1fbad6");
  expect(LLEval(program2, exampleColors)).toBe(true);
});

test("LintLanguage Arithmetic Ops: =", () => {
  const program1 = { "==": { left: 2, right: 2 } };
  expect(prettyPrintLL(program1)).toBe("2 == 2");
  expect(LLEval(program1, [])).toBe(true);
});
const opProg = (op: string) => ({
  "==": { left: { [op]: { left: 2, right: 10 } }, right: 2 },
});
test("LintLanguage Arithmetic Ops: + ", () => {
  expect(prettyPrintLL(opProg("+"))).toBe(`2 + 10 == 2`);
  expect(LLEval(opProg("+"), [])).toBe(false);
});

test("LintLanguage Arithmetic Ops: -", () => {
  expect(prettyPrintLL(opProg("-"))).toBe(`2 - 10 == 2`);
  expect(LLEval(opProg("-"), [])).toBe(false);
});

test("LintLanguage Arithmetic Ops: /", () => {
  expect(prettyPrintLL(opProg("/"))).toBe(`2 / 10 == 2`);
  expect(LLEval(opProg("/"), [])).toBe(false);
});

test("LintLanguage Arithmetic Ops: *", () => {
  expect(prettyPrintLL(opProg("*"))).toBe(`2 * 10 == 2`);
  expect(LLEval(opProg("*"), [])).toBe(false);
});

const aggProg = (op: string, right: number) => ({
  "==": { left: { [op]: [1, 2, 3, 4] }, right },
});
test("LintLanguage Agg Ops: sum", () => {
  expect(prettyPrintLL(aggProg("sum", 8))).toBe(`sum([1, 2, 3, 4]) == 8`);
  expect(LLEval(aggProg("sum", 8), [])).toBe(false);
  expect(prettyPrintLL(aggProg("sum", 10))).toBe(`sum([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("sum", 10), [])).toBe(true);
});
test("LintLanguage Agg Ops: min", () => {
  expect(prettyPrintLL(aggProg("min", 10))).toBe(`min([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("min", 10), [])).toBe(false);
  expect(prettyPrintLL(aggProg("min", 1))).toBe(`min([1, 2, 3, 4]) == 1`);
  expect(LLEval(aggProg("min", 1), [])).toBe(true);
});
test("LintLanguage Agg Ops: max", () => {
  expect(prettyPrintLL(aggProg("max", 10))).toBe(`max([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("max", 10), [])).toBe(false);
  expect(prettyPrintLL(aggProg("max", 4))).toBe(`max([1, 2, 3, 4]) == 4`);
  expect(LLEval(aggProg("max", 4), [])).toBe(true);
});
test("LintLanguage to color rotate", () => {
  const realisticProgram = {
    exist: {
      input: "colors",
      value: "a",
      predicate: {
        exist: {
          input: "colors",
          value: "b",
          predicate: {
            "==": {
              left: { toColor: "a", space: "hsl", channel: "h" },
              right: {
                "+": {
                  left: { toColor: "b", space: "hsl", channel: "h" },
                  right: 180,
                },
              },
            },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(realisticProgram)).toBe(
    "exist a in (colors), exist b in (colors), toColor(a, hsl, h) == toColor(b, hsl, h) + 180"
  );
  expect(LLEval(realisticProgram, exampleColors)).toBe(false);
});

const greens = ["#008137", "#008000", "#008200"].map((x) =>
  Color.colorFromString(x, "lab")
);
const reds = ["#c13f25", "#dd0048", "#a35a00"].map((x) =>
  Color.colorFromString(x, "lab")
);
test("LintLanguage Name discrimination", () => {
  // all names should be measured as different
  const program = {
    all: {
      input: "colors",
      value: "a",
      predicate: {
        all: {
          input: "colors",
          value: "b",
          where: { "!=": { left: "a", right: "b" } },
          predicate: {
            "!=": { left: { name: "a" }, right: { name: "b" } },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "all a in (colors), all b in (colors), name(a) != name(b)"
  );
  expect(LLEval(program, greens)).toBe(false);
  expect(LLEval(program, reds)).toBe(true);
});

test("LintLanguage Name discrimination with a single color", () => {
  // all names should be measured as different
  const program = {
    all: {
      input: "colors",
      value: "a",
      predicate: {
        all: {
          input: "colors",
          value: "b",
          where: { "!=": { left: "a", right: "b" } },
          predicate: {
            "!=": { left: { name: "a" }, right: { name: "b" } },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "all a in (colors), all b in (colors), name(a) != name(b)"
  );
  expect(LLEval(program, [Color.colorFromString("#008137", "lab")])).toBe(true);
});

test.only("LintLanguage Avoid Extreme Colors", () => {
  const program = {
    all: {
      input: "colors",
      value: "a",
      predicate: {
        all: {
          input: ["#000000", "#ffffff"],
          value: "b",
          where: { "!=": { left: "index(a)", right: "index(b)" } },
          predicate: { "!=": { left: "a", right: "b" } },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "all a in (colors), all b in ([#000, #fff]), a != b"
  );
  expect(LLEval(program, greens)).toBe(true);
  expect(LLEval(program, [Color.colorFromString("black", "lab")])).toBe(false);
});

// // YAML VERSION
// const yamlVersion = `
// exist:
//     input: colors,
//     value: 'a',
//     predicate:
//         exist:
//             colors,
//             value: 'b',
//             predicate:
//                 equal:
//                     left:  {toColor: 'a', space: 'hsl', channel: 'h'}
//                     right: {+: {toColor: 'b', space: 'hsl', channel: 'h'}, value: 180}
//                     `;
// // JSON VERSION
// const jsonVersion = {
//   exist: {
//     input: "colors",
//     value: "a",
//     predicate: {
//       exist: {
//         input: "colors",
//         value: "b",
//         predicate: {
//           equal: {
//             left: { toColor: "a", space: "hsl", channel: "h" },
//             right: {
//               "+": { toColor: "b", space: "hsl", channel: "h" },
//               value: 180,
//             },
//           },
//         },
//       },
//     },
//   },
// };
