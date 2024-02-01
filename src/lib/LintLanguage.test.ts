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
  expect(prettyPrintLL(prog1)).toBe("count(colors) < 10 and count(colors) > 2");

  const prog2 = {
    or: [
      { "<": { left: { count: "colors" }, right: 2 } },
      { ">": { left: { count: "colors" }, right: 10 } },
    ],
  };
  expect(LLEval(prog2, exampleColors)).toBe(false);
  expect(prettyPrintLL(prog2)).toBe("count(colors) < 2 or count(colors) > 10");
});

test("LintLanguage Quantifiers All - Simple", () => {
  const simpProg = (colors: string[]) => ({
    exist: {
      input: "colors",
      varb: "a",
      predicate: {
        exist: {
          input: colors.map((x) => Color.colorFromString(x, "lab")),
          varb: "b",
          predicate: { "==": { left: "a", right: "b" } },
        },
      },
    },
  });
  expect(prettyPrintLL(simpProg(["red"]))).toBe(
    "EXIST a in colors, EXIST b in ([#f00]), a == b"
  );
  expect(LLEval(simpProg(["red"]), exampleColors)).toBe(false);

  expect(prettyPrintLL(simpProg(["#7bb9ff"]))).toBe(
    "EXIST a in colors, EXIST b in ([#7bb9ff]), a == b"
  );
  expect(LLEval(simpProg(["#7bb9ff"]), exampleColors)).toBe(true);
});

const expectedOutBlind = (type: string) =>
  `ALL a in colors, ALL b in colors WHERE index(a) != index(b), NOT cvd_sim(a, ${type}) similar(9) cvd_sim(b, ${type})`;
const allBlindProg = (type: string) => ({
  all: {
    input: "colors",
    varb: "a",
    predicate: {
      all: {
        input: "colors",
        varb: "b",
        where: { "!=": { left: "index(a)", right: "index(b)" } },
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
test("LintLanguage Quantifiers All - deuteranopia", () => {
  expect(prettyPrintLL(allBlindProg("deuteranopia"))).toBe(
    expectedOutBlind("deuteranopia")
  );
  expect(LLEval(allBlindProg("deuteranopia"), exampleColors)).toBe(false);
});
test("LintLanguage Quantifiers All - protanopia", () => {
  expect(prettyPrintLL(allBlindProg("protanopia"))).toBe(
    expectedOutBlind("protanopia")
  );
  expect(LLEval(allBlindProg("protanopia"), exampleColors)).toBe(false);
});
test("LintLanguage Quantifiers All - tritanopia", () => {
  // expect(prettyPrintLL(allBlindProg("tritanopia"))).toBe(
  //   expectedOutBlind("tritanopia")
  // );
  expect(LLEval(allBlindProg("tritanopia"), exampleColors)).toBe(true);
});

test("LintLanguage Quantifiers Exist", () => {
  const colorBlindExists = {
    not: {
      exist: {
        input: "colors",
        varb: "a",
        predicate: {
          exist: {
            input: "colors",
            varb: "b",
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
    "NOT EXIST a in colors, EXIST b in colors, cvd_sim(a, deuteranopia) != cvd_sim(b, deuteranopia)"
  );
  expect(LLEval(colorBlindExists, exampleColors)).toBe(false);
});

test("LintLanguage Quantifiers Exist - DENSE", () => {
  const colorBlindExists = {
    not: {
      exist: {
        input: "colors",
        varbs: ["a", "b"],
        predicate: {
          "!=": {
            left: { cvd_sim: "a", type: "deuteranopia" },
            right: { cvd_sim: "b", type: "deuteranopia" },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(colorBlindExists)).toBe(
    "NOT EXIST (a, b) in colors, cvd_sim(a, deuteranopia) != cvd_sim(b, deuteranopia)"
  );
  expect(LLEval(colorBlindExists, exampleColors)).toBe(false);
});

test("LintLanguage Check exists", () => {
  const program = {
    exist: {
      input: "colors",
      varb: "a",
      predicate: { "==": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program)).toBe("EXIST a in colors, a == #1fbad6");
  expect(LLEval(program, exampleColors)).toBe(false);

  const program2 = {
    exist: {
      input: "colors",
      varb: "a",
      predicate: { "!=": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program2)).toBe("EXIST a in colors, a != #1fbad6");
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
test("LintLanguage Agg Ops: mean", () => {
  expect(prettyPrintLL(aggProg("mean", 10))).toBe(`mean([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("mean", 10), [])).toBe(false);
  expect(prettyPrintLL(aggProg("mean", 2.5))).toBe(`mean([1, 2, 3, 4]) == 2.5`);
  expect(LLEval(aggProg("mean", 2.5), [])).toBe(true);
});
test("LintLanguage to color rotate", () => {
  const realisticProgram = {
    exist: {
      input: "colors",
      varb: "a",
      predicate: {
        exist: {
          input: "colors",
          varb: "b",
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
    "EXIST a in colors, EXIST b in colors, toColor(a, hsl, h) == toColor(b, hsl, h) + 180"
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
      varb: "a",
      predicate: {
        all: {
          input: "colors",
          varb: "b",
          where: { "!=": { left: "index(a)", right: "index(b)" } },
          predicate: {
            "!=": { left: { name: "a" }, right: { name: "b" } },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL a in colors, ALL b in colors WHERE index(a) != index(b), name(a) != name(b)"
  );
  expect(LLEval(program, greens)).toBe(false);
  expect(LLEval(program, reds)).toBe(true);
});

test("LintLanguage Name discrimination - dense notation", () => {
  // all names should be measured as different
  const program = {
    all: {
      input: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
      predicate: {
        "!=": { left: { name: "a" }, right: { name: "b" } },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL (a, b) in colors WHERE index(a) != index(b), name(a) != name(b)"
  );
  expect(LLEval(program, greens)).toBe(false);
  expect(LLEval(program, reds)).toBe(true);
});

test("LintLanguage Name discrimination with a single color", () => {
  // all names should be measured as different
  const program = {
    all: {
      input: "colors",
      varb: "a",
      predicate: {
        all: {
          input: "colors",
          varb: "b",
          where: { "!=": { left: "index(a)", right: "index(b)" } },
          predicate: {
            "!=": { left: { name: "a" }, right: { name: "b" } },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL a in colors, ALL b in colors WHERE index(a) != index(b), name(a) != name(b)"
  );
  expect(LLEval(program, [Color.colorFromString("#008137", "lab")])).toBe(true);
});

test("LintLanguage Avoid Extreme Colors", () => {
  const program = {
    all: {
      input: "colors",
      varb: "a",
      predicate: {
        all: {
          input: ["#000000", "#ffffff"],
          varb: "b",
          predicate: { "!=": { left: "a", right: "b" } },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL a in colors, ALL b in ([#000, #fff]), a != b"
  );
  expect(LLEval(program, greens)).toBe(true);
  expect(LLEval(program, [Color.colorFromString("black", "lab")])).toBe(false);
});

test.skip("LintLanguage Sequential Colors", () => {
  const program = {
    or: [
      {
        all: {
          input: "colors",
          varb: "a",
          predicate: {
            all: {
              input: "colors",
              varb: "b",
              where: {
                "==": {
                  left: { "-": { left: "index(a)", right: 1 } },
                  right: "index(b)",
                },
              },
              predicate: {
                ">": {
                  left: { space: "lab", channel: "l", toColor: "a" },
                  right: { space: "lab", channel: "l", toColor: "b" },
                },
              },
            },
          },
        },
      },
      {
        all: {
          input: "colors",
          varb: "a",
          predicate: {
            all: {
              input: "colors",
              varb: "b",
              where: {
                "==": {
                  left: { "-": { left: "index(a)", right: 1 } },
                  right: "index(b)",
                },
              },
              predicate: {
                ">": {
                  left: { space: "lab", channel: "l", toColor: "a" },
                  right: { space: "lab", channel: "l", toColor: "b" },
                },
              },
            },
          },
        },
      },
    ],
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL a in colors, ALL b in colors, toColor(a, lab, l) > toColor(b, lab, l) or ALL a in colors, ALL b in colors, toColor(a, lab, l) > toColor(b, lab, l)"
  );
  expect(
    LLEval(
      program,
      ["#d4a8ff", "#008694", "#7bb9ff"].map((x) =>
        Color.colorFromString(x, "lab")
      )
    )
  ).toBe(false);
  expect(
    LLEval(
      program,
      ["#d4a8ff", "#7bb9ff", "#008694"].map((x) =>
        Color.colorFromString(x, "lab")
      )
    )
  ).toBe(true);
});

// Text version
// or
// (all colors a, all colors b where index(a) - 1 == index(b), lab(a, l) > lab(b, l))
// (all colors a, all colors b where index(a) - 1 == index(b), lab(a, l) < lab(b, l))

// // YAML VERSION
// - or:
//     - all:
//         input: colors
//         value: a
//         predicate:
//             all:
//                 input: colors
//                 value: b
//                 where:
//                     ==:
//                         left:  {-: {left: index(a), right: 1}}
//                         right: index(b)
//                 predicate:
//                     >:
//                         left:  {space: 'lab', channel: 'l', color: a}
//                         right: {space: 'lab', channel: 'l', color: a}

// JSON VERSION
