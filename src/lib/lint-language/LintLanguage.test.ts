import { expect, test } from "vitest";
import { LLEval, prettyPrintLL } from "./lint-language";
import { Color } from "../Color";
import type { Palette } from "../../stores/color-store";

const toPal = (colors: string[]): Palette => ({
  name: "test",
  type: "sequential",
  colorSpace: "lab",
  evalConfig: {},
  background: toColors(["#fff"])[0],
  colors: toColors(colors),
});
const toColors = (colors: string[]): Color[] =>
  colors.map((x) => Color.colorFromString(x, "lab"));
const exampleColors = toPal(["#d4a8ff", "#7bb9ff", "#008694"]);

test("LintLanguage basic eval - eval with no references ", () => {
  const prog1 = { "<": { left: { count: exampleColors.colors }, right: 2 } };
  expect(prettyPrintLL(prog1)).toBe("count([#d4a8ff, #7bb9ff, #008694]) < 2");
  expect(LLEval(prog1, exampleColors).result).toBe(false);
});

test("LintLanguage basic eval - eval with no references 2 ", () => {
  const prog2 = { "<": { left: { count: exampleColors.colors }, right: 10 } };
  const prog2Result = LLEval(prog2, exampleColors);
  expect(prog2Result.result).toBe(true);
  expect(prog2Result.blame).toStrictEqual([]);
  expect(prettyPrintLL(prog2)).toBe("count([#d4a8ff, #7bb9ff, #008694]) < 10");

  // eval with main reference
  const prog3 = { "<": { left: { count: "colors" }, right: 2 } };
  const prog3Eval = LLEval(prog3, exampleColors);
  expect(prog3Eval.result).toBe(false);
  expect(prog3Eval.blame).toStrictEqual([]);
  expect(prettyPrintLL(prog3)).toBe("count(colors) < 2");

  const prog4 = { "<": { left: { count: "colors" }, right: 10 } };
  expect(LLEval(prog4, exampleColors).result).toBe(true);
  expect(prettyPrintLL(prog4)).toBe("count(colors) < 10");
});

test("LintLanguage basic eval - eval with main reference 1", () => {
  const prog3 = { "<": { left: { count: "colors" }, right: 2 } };
  const prog3Eval = LLEval(prog3, exampleColors);
  expect(prog3Eval.result).toBe(false);
  expect(prog3Eval.blame).toStrictEqual([]);
  expect(prettyPrintLL(prog3)).toBe("count(colors) < 2");
});

test("LintLanguage basic eval - eval with main reference 2", () => {
  const prog4 = { "<": { left: { count: "colors" }, right: 10 } };
  expect(LLEval(prog4, exampleColors).result).toBe(true);
  expect(prettyPrintLL(prog4)).toBe("count(colors) < 10");
});

test("LintLanguage conjunctions", () => {
  const prog1 = {
    and: [
      { "<": { left: { count: "colors" }, right: 10 } },
      { ">": { left: { count: "colors" }, right: 2 } },
    ],
  };
  expect(LLEval(prog1, exampleColors).result).toBe(true);
  expect(prettyPrintLL(prog1)).toBe("count(colors) < 10 and count(colors) > 2");

  const prog2 = {
    or: [
      { "<": { left: { count: "colors" }, right: 2 } },
      { ">": { left: { count: "colors" }, right: 10 } },
    ],
  };
  expect(LLEval(prog2, exampleColors).result).toBe(false);
  expect(prettyPrintLL(prog2)).toBe("count(colors) < 2 or count(colors) > 10");
});

test("LintLanguage Quantifiers All - Simple", () => {
  const simpProg = (colors: string[]) => ({
    exist: {
      in: "colors",
      varb: "a",
      predicate: {
        exist: {
          in: toColors(colors),
          varb: "b",
          predicate: { "==": { left: "a", right: "b" } },
        },
      },
    },
  });
  expect(prettyPrintLL(simpProg(["red"]))).toBe(
    "EXIST a in colors, EXIST b in ([#f00]), a == b"
  );
  const redResult = LLEval(simpProg(["red"]), exampleColors);
  expect(redResult.result).toBe(false);
  expect(redResult.blame).toStrictEqual([0, 1, 2]);

  expect(prettyPrintLL(simpProg(["#7bb9ff"]))).toBe(
    "EXIST a in colors, EXIST b in ([#7bb9ff]), a == b"
  );
  expect(LLEval(simpProg(["#7bb9ff"]), exampleColors).result).toBe(true);
});

const expectedOutBlind = (type: string) =>
  `ALL a in colors, ALL b in colors WHERE index(a) != index(b), NOT similar(cvd_sim(a, ${type}), cvd_sim(b, ${type})) > 9`;
const allBlindProg = (type: string) => ({
  all: {
    in: "colors",
    varb: "a",
    predicate: {
      all: {
        in: "colors",
        varb: "b",
        where: { "!=": { left: "index(a)", right: "index(b)" } },
        predicate: {
          not: {
            similar: {
              left: { cvd_sim: "a", type },
              right: { cvd_sim: "b", type },
              threshold: 9,
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
  const cbResult = LLEval(allBlindProg("deuteranopia"), exampleColors);
  expect(cbResult.result).toBe(false);
  expect(cbResult.blame).toStrictEqual([0, 1]);
});
test("LintLanguage Quantifiers All - protanopia", () => {
  expect(prettyPrintLL(allBlindProg("protanopia"))).toBe(
    expectedOutBlind("protanopia")
  );
  const cbResult = LLEval(allBlindProg("protanopia"), exampleColors);
  expect(cbResult.result).toBe(false);
  expect(cbResult.blame).toStrictEqual([0, 1]);
});
test("LintLanguage Quantifiers All - tritanopia", () => {
  const cbResult = LLEval(allBlindProg("tritanopia"), exampleColors);
  expect(cbResult.result).toBe(true);
  expect(cbResult.blame).toStrictEqual([]);
});

test("LintLanguage Boolean values", () => {
  const program = { "!=": { left: true, right: false } };
  const options = { debugTypeCheck: false };
  expect(prettyPrintLL(program, options)).toBe("TRUE != FALSE");
  const { result, blame } = LLEval(program, [], options);
  expect(result).toBe(true);
  expect(blame).toStrictEqual([]);
});

test("LintLanguage Quantifiers Exist", () => {
  const colorBlindExists = {
    not: {
      exist: {
        in: "colors",
        varb: "a",
        predicate: {
          exist: {
            in: "colors",
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
  expect(LLEval(colorBlindExists, exampleColors).result).toBe(false);
});

test("LintLanguage Quantifiers Exist - DENSE", () => {
  const colorBlindExists = {
    not: {
      exist: {
        in: "colors",
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
  expect(LLEval(colorBlindExists, exampleColors).result).toBe(false);
});

test("LintLanguage Check exists", () => {
  const program = {
    exist: {
      in: "colors",
      varb: "a",
      predicate: { "==": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program)).toBe("EXIST a in colors, a == #1fbad6");
  expect(LLEval(program, exampleColors).result).toBe(false);

  const program2 = {
    exist: {
      in: "colors",
      varb: "a",
      predicate: { "!=": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program2)).toBe("EXIST a in colors, a != #1fbad6");
  expect(LLEval(program2, exampleColors).result).toBe(true);
});

test("LintLanguage Arithmetic Ops: =", () => {
  const program1 = { "==": { left: 2, right: 2 } };
  expect(prettyPrintLL(program1)).toBe("2 == 2");
  expect(LLEval(program1, []).result).toBe(true);
});
const opProg = (op: string) => ({
  "==": { left: { [op]: { left: 2, right: 10 } }, right: 2 },
});
test("LintLanguage Arithmetic Ops: + ", () => {
  expect(prettyPrintLL(opProg("+"))).toBe(`2 + 10 == 2`);
  expect(LLEval(opProg("+"), []).result).toBe(false);
});

test("LintLanguage Arithmetic Ops: -", () => {
  expect(prettyPrintLL(opProg("-"))).toBe(`2 - 10 == 2`);
  expect(LLEval(opProg("-"), []).result).toBe(false);
});

test("LintLanguage Arithmetic Ops: /", () => {
  expect(prettyPrintLL(opProg("/"))).toBe(`2 / 10 == 2`);
  expect(LLEval(opProg("/"), []).result).toBe(false);
});

test("LintLanguage Arithmetic Ops: *", () => {
  expect(prettyPrintLL(opProg("*"))).toBe(`2 * 10 == 2`);
  expect(LLEval(opProg("*"), []).result).toBe(false);
});

const aggProg = (op: string, right: number) => ({
  "==": { left: { [op]: [1, 2, 3, 4] }, right },
});
test("LintLanguage Agg Ops: sum", () => {
  expect(prettyPrintLL(aggProg("sum", 8))).toBe(`sum([1, 2, 3, 4]) == 8`);
  expect(LLEval(aggProg("sum", 8), []).result).toBe(false);
  expect(prettyPrintLL(aggProg("sum", 10))).toBe(`sum([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("sum", 10), []).result).toBe(true);
});
test("LintLanguage Agg Ops: min", () => {
  expect(prettyPrintLL(aggProg("min", 10))).toBe(`min([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("min", 10), []).result).toBe(false);
  expect(prettyPrintLL(aggProg("min", 1))).toBe(`min([1, 2, 3, 4]) == 1`);
  expect(LLEval(aggProg("min", 1), []).result).toBe(true);
});
test("LintLanguage Agg Ops: max", () => {
  expect(prettyPrintLL(aggProg("max", 10))).toBe(`max([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("max", 10), []).result).toBe(false);
  expect(prettyPrintLL(aggProg("max", 4))).toBe(`max([1, 2, 3, 4]) == 4`);
  expect(LLEval(aggProg("max", 4), []).result).toBe(true);
});
test("LintLanguage Agg Ops: mean", () => {
  expect(prettyPrintLL(aggProg("mean", 10))).toBe(`mean([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("mean", 10), []).result).toBe(false);
  expect(prettyPrintLL(aggProg("mean", 2.5))).toBe(`mean([1, 2, 3, 4]) == 2.5`);
  expect(LLEval(aggProg("mean", 2.5), []).result).toBe(true);
});
test("LintLanguage to color rotate", () => {
  const realisticProgram = {
    exist: {
      in: "colors",
      varb: "a",
      predicate: {
        exist: {
          in: "colors",
          varb: "b",
          predicate: {
            "==": {
              left: { "hsl.h": "a" },
              right: {
                "+": { left: { "hsl.h": "b" }, right: 180 },
              },
            },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(realisticProgram)).toBe(
    "EXIST a in colors, EXIST b in colors, hsl.h(a) == hsl.h(b) + 180"
  );
  expect(LLEval(realisticProgram, exampleColors).result).toBe(false);
});

const greens = toPal(["#008137", "#008000", "#008200"]);
const reds = toPal(["#c13f25", "#dd0048", "#a35a00"]);
test("LintLanguage Name discrimination", () => {
  // all names should be measured as different
  const program = {
    all: {
      in: "colors",
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
  const greenResult = LLEval(program, greens);
  expect(greenResult.result).toBe(false);
  expect(greenResult.blame).toStrictEqual([1, 2]);
  expect(LLEval(program, reds).result).toBe(true);
});

test("LintLanguage Name discrimination - dense notation", () => {
  // all names should be measured as different
  const program = {
    all: {
      in: "colors",
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
  expect(LLEval(program, greens).result).toBe(false);
  expect(LLEval(program, reds).result).toBe(true);
});

test("LintLanguage Name discrimination with a single color", () => {
  // all names should be measured as different
  const program = {
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        all: {
          in: "colors",
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
  const result = LLEval(program, toPal(["#008137"]));
  expect(result.result).toBe(true);
});

test("LintLanguage Measure Distance", () => {
  const colors = toColors(["#000000", "#fff"]);
  const program = {
    "==": {
      left: { dist: { left: colors[0], right: colors[1] }, space: "lab" },
      right: 100,
    },
  };
  const result = LLEval(program, []);
  expect(prettyPrintLL(program)).toBe("dist(#000, #fff, lab) == 100");
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Measure DeltaE", () => {
  const colors = toColors(["#000000", "#fff"]);
  const program = {
    "==": {
      left: {
        deltaE: { left: colors[0], right: colors[1] },
        algorithm: "2000",
      },
      right: 100,
    },
  };
  const result = LLEval(program, []);
  expect(prettyPrintLL(program)).toBe("deltaE(#000, #fff, 2000) == 100");
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Measure Contrast", () => {
  const colors = toColors(["#000000", "#fff"]);
  const program = {
    "==": {
      left: {
        contrast: { left: colors[0], right: colors[1] },
        algorithm: "APCA",
      },
      right: -107.88473522404158,
    },
  };
  const result = LLEval(program, []);
  expect(prettyPrintLL(program)).toBe(
    "contrast(#000, #fff, APCA) == -107.88473522404158"
  );
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Avoid Extreme Colors", () => {
  const program = {
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        all: {
          in: ["#000000", "#ffffff"],
          varb: "b",
          predicate: { "!=": { left: "a", right: "b" } },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL a in colors, ALL b in ([#000, #fff]), a != b"
  );
  const { result, blame } = LLEval(program, greens);
  expect(result).toBe(true);
  expect(blame).toStrictEqual([]);
  const failResult = LLEval(
    program,
    toPal(["#111", "#111", "#111", "#000000"])
  );
  expect(failResult.result).toBe(false);
  expect(failResult.blame).toStrictEqual([3]);
});

test("LintLanguage Avoid Extreme Colors Swapped Predicate Order (blame test)", () => {
  const program = {
    all: {
      in: ["#000000", "#ffffff"],
      varb: "a",
      predicate: {
        all: {
          in: "colors",
          varb: "b",
          predicate: { "!=": { left: "a", right: "b" } },
        },
      },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "ALL a in ([#000, #fff]), ALL b in colors, a != b"
  );
  const { result, blame } = LLEval(program, greens);
  expect(result).toBe(true);
  expect(blame).toStrictEqual([]);
  const failResult = LLEval(
    program,
    toPal(["#111", "#111", "#111", "#000000"])
  );
  expect(failResult.result).toBe(false);
  expect(failResult.blame).toStrictEqual([3]);
});

test("LintLanguage Sequential Colors", () => {
  const program = {
    or: [
      {
        all: {
          in: "colors",
          varbs: ["a", "b"],
          where: {
            "==": {
              left: { "-": { left: "index(a)", right: 1 } },
              right: "index(b)",
            },
          },
          predicate: {
            ">": { left: { "lab.l": "a" }, right: { "lab.l": "b" } },
          },
        },
      },
      {
        all: {
          in: "colors",
          varbs: ["a", "b"],
          where: {
            "==": {
              left: { "-": { left: "index(a)", right: 1 } },
              right: "index(b)",
            },
          },
          predicate: {
            "<": { left: { "lab.l": "a" }, right: { "lab.l": "b" } },
          },
        },
      },
    ],
  };

  const outOfOrder = toPal(["#d4a8ff", "#008694", "#7bb9ff"]);
  const ooResult = LLEval(program, outOfOrder);
  expect(ooResult.result).toBe(false);
  expect(ooResult.blame).toStrictEqual([0, 1, 2]);

  const inOrder = toPal(["#d4a8ff", "#7bb9ff", "#008694"]);
  expect(LLEval(program, inOrder).result).toBe(true);
  expect(prettyPrintLL(program)).toBe(
    "ALL (a, b) in colors WHERE index(a) - 1 == index(b), lab.l(a) > lab.l(b) or ALL (a, b) in colors WHERE index(a) - 1 == index(b), lab.l(a) < lab.l(b)"
  );
});

test("LintLanguage Sequential Colors", () => {
  const sequential = {
    "==": {
      left: { "-": { left: "index(a)", right: 1 } },
      right: "index(b)",
    },
  };
  const program = {
    or: [
      {
        all: {
          in: "colors",
          varbs: ["a", "b"],
          where: sequential,
          predicate: {
            ">": { left: { "lab.l": "a" }, right: { "lab.l": "b" } },
          },
        },
      },
      {
        all: {
          in: "colors",
          varbs: ["a", "b"],
          where: sequential,
          predicate: {
            "<": { left: { "lab.l": "a" }, right: { "lab.l": "b" } },
          },
        },
      },
    ],
  };

  const outOfOrder = toPal(["#d4a8ff", "#008694", "#7bb9ff"]);
  const ooResult = LLEval(program, outOfOrder);
  expect(ooResult.result).toBe(false);
  expect(ooResult.blame).toStrictEqual([0, 1, 2]);

  const inOrder = toPal(["#d4a8ff", "#7bb9ff", "#008694"]);
  expect(LLEval(program, inOrder).result).toBe(true);
  expect(prettyPrintLL(program)).toBe(
    "ALL (a, b) in colors WHERE index(a) - 1 == index(b), lab.l(a) > lab.l(b) or ALL (a, b) in colors WHERE index(a) - 1 == index(b), lab.l(a) < lab.l(b)"
  );
});

test.skip("LintLanguage Diverging Colors - dense notation", () => {
  const sequential = {
    and: [
      { "<": { left: "index(a)", right: "index(c)" } },
      {
        "==": {
          left: "index(a)",
          right: { "-": { left: "index(b)", right: 1 } },
        },
      },
    ],
  };
  const prog = {
    or: [
      {
        exist: {
          in: "colors",
          varb: "c",
          predicate: {
            all: {
              in: "colors",
              varbs: ["a", "b"],
              where: sequential,
              predicate: {
                and: [
                  { "<": { left: { "lab.l": "a" }, right: { "lab.l": "c" } } },
                  { ">": { left: { "lab.l": "b" }, right: { "lab.l": "a" } } },
                ],
              },
            },
          },
        },
      },
      {
        exist: {
          in: "colors",
          varb: "c",
          predicate: {
            all: {
              in: "colors",
              varbs: ["a", "b"],
              where: sequential,
              predicate: {
                and: [
                  { ">": { left: { "lab.l": "a" }, right: { "lab.l": "c" } } },
                  { "<": { left: { "lab.l": "b" }, right: { "lab.l": "a" } } },
                ],
              },
            },
          },
        },
      },
    ],
  };
  const divergingColors = toPal([
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#fff",
    "#e0e0e0",
    "#bababa",
    "#878787",
    "#4d4d4d",
    "#1a1a1a",
  ]);
  const result = LLEval(prog, divergingColors);
  expect(result.result).toBe(true);
  const result2 = LLEval(prog, toPal(["#be4704", "#008000", "#e00050"]));
  expect(result2.result).toBe(false);
});

test("Background differentiability", () => {
  const program = {
    all: {
      in: "colors",
      varbs: ["a"],
      predicate: {
        not: { similar: { left: "a", right: "background", threshold: 15 } },
      },
    },
  };
  const astString = prettyPrintLL(program);
  expect(astString).toBe("ALL a in colors, NOT similar(a, background) > 15");
  const result = LLEval(program, toPal(["#fff", "#eee", "#000", "#ddd"]));
  expect(result.result).toBe(false);
  expect(result.blame).toStrictEqual([0, 1, 3]);
});

// Text version
// OR
// EXIST c in colors,
//     ALL a, b where index(a) < index(c) AND index(a) == index(b) - 1, lab(a, l) < lab(c, l) AND lab(b, l) > lab(a, l)
//     AND
//     ALL a, b where index(a) > index(c) AND index(a) == index(b) - 1, lab(a, l) > lab(c, l) AND lab(b, l) < lab(a, l)
// EXIST c in colors,
//     ALL a, b where index(a) < index(c) AND index(a) == index(b) - 1, lab(a, l) > lab(c, l) AND lab(b, l) < lab(a, l)
//     AND
//     ALL a, b where index(a) > index(c) AND index(a) == index(b) - 1, lab(a, l) < lab(c, l) AND lab(b, l) > lab(a, l)

// // YAML VERSION
// or:
//

// JSON VERSION
