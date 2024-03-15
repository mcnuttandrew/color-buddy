import { expect, test } from "vitest";
import { LLEval, prettyPrintLL, permutativeBlame } from "./lint-language";
import { Color } from "../Color";
import type { Palette } from "../../types";
import type { LintProgram } from "./lint-type";

const toPal = (colors: string[]): Palette => ({
  name: "test",
  type: "sequential",
  colorSpace: "lab",
  evalConfig: {},
  background: toColors(["#fff"])[0],
  colors: toColorWithSemantics(colors),
  tags: [],
});
const wrapWithSemantics = (color: Color) => ({
  size: undefined,
  markType: undefined,
  tags: [],
  color,
});
const toColors = (colors: string[]) =>
  colors.map((x) => Color.colorFromString(x, "lab"));
const toColorWithSemantics = (colors: string[]) =>
  colors.map((x) => wrapWithSemantics(Color.colorFromString(x, "lab")));
const exampleColors = toPal(["#d4a8ff", "#7bb9ff", "#008694"]);

test("LintLanguage basic eval - eval with no references ", () => {
  const prog1: LintProgram = {
    "<": {
      left: { count: exampleColors.colors.map((x) => x.color) },
      right: 2,
    },
  };
  expect(prettyPrintLL(prog1)).toBe("count([#d4a8ff, #7bb9ff, #008694]) < 2");
  expect(LLEval(prog1, exampleColors).result).toBe(false);
});

test("LintLanguage basic eval - eval with no references 2 ", () => {
  const prog2 = {
    "<": {
      left: { count: exampleColors.colors.map((x) => x.color) },
      right: 10,
    },
  };
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
  expect(prettyPrintLL(prog1)).toBe(
    "(count(colors) < 10 AND count(colors) > 2)"
  );

  const prog2 = {
    or: [
      { "<": { left: { count: "colors" }, right: 2 } },
      { ">": { left: { count: "colors" }, right: 10 } },
    ],
  };
  expect(LLEval(prog2, exampleColors).result).toBe(false);
  expect(prettyPrintLL(prog2)).toBe(
    "(count(colors) < 2 OR count(colors) > 10)"
  );
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
    "EXIST a IN colors SUCH THAT EXIST b IN ([#f00]) SUCH THAT a == b"
  );
  const redResult = LLEval(simpProg(["red"]), exampleColors);
  expect(redResult.result).toBe(false);
  expect(redResult.blame).toStrictEqual([0, 1, 2]);

  expect(prettyPrintLL(simpProg(["#7bb9ff"]))).toBe(
    "EXIST a IN colors SUCH THAT EXIST b IN ([#7bb9ff]) SUCH THAT a == b"
  );
  expect(LLEval(simpProg(["#7bb9ff"]), exampleColors).result).toBe(true);
});

test("LintLanguage permutativeBlame - counts", () => {
  const prog1 = { "<": { left: { count: "colors" }, right: 2 } };
  expect(permutativeBlame(prog1, exampleColors, "single")).toStrictEqual([
    0, 1, 2,
  ]);
});

test("LintLanguage permutativeBlame - Quantifiers Simple", () => {
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
  expect(
    permutativeBlame(simpProg(["red"]), exampleColors, "single")
  ).toStrictEqual([0, 1, 2]);
  expect(
    permutativeBlame(simpProg(["#7bb9ff"]), exampleColors, "single")
  ).toStrictEqual([]);
});

test("LintLanguage permutativeBlame - Quantifiers deuteranopia", () => {
  const prog = allCVDProg("deuteranopia");
  const pal = toPal(["#d4a8ff", "#7bb9ff", "#008694", "black"]);
  expect(permutativeBlame(prog, pal, "single")).toStrictEqual([0, 1]);
  expect(permutativeBlame(prog, pal, "pair")).toStrictEqual([[0, 1]]);
});

test("LintLanguage permutativeBlame - Tableau 10", () => {
  const prog = allCVDProg("deuteranopia");
  const pal = toPal([
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ]);
  expect(permutativeBlame(prog, pal, "pair")).toStrictEqual([
    [0, 4],
    [1, 8],
    [2, 3],
    [6, 9],
  ]);
});

const expectedOutCVD = (type: string) =>
  `ALL a IN colors SUCH THAT ALL b IN colors WHERE index(a) != index(b) SUCH THAT NOT similar(cvdSim(a, ${type}), cvdSim(b, ${type})) < 9`;
const allCVDProg = (type: string) => ({
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
              left: { cvdSim: "a", type },
              right: { cvdSim: "b", type },
              threshold: 9,
            },
          },
        },
      },
    },
  },
});
test("LintLanguage Quantifiers All - deuteranopia", () => {
  expect(prettyPrintLL(allCVDProg("deuteranopia"))).toBe(
    expectedOutCVD("deuteranopia")
  );
  const cbResult = LLEval(allCVDProg("deuteranopia"), exampleColors);
  expect(cbResult.result).toBe(false);
  expect(cbResult.blame).toStrictEqual([0, 1]);
});
test("LintLanguage Quantifiers All - protanopia", () => {
  expect(prettyPrintLL(allCVDProg("protanopia"))).toBe(
    expectedOutCVD("protanopia")
  );
  const cbResult = LLEval(allCVDProg("protanopia"), exampleColors);
  expect(cbResult.result).toBe(false);
  expect(cbResult.blame).toStrictEqual([0, 1]);
});
test("LintLanguage Quantifiers All - tritanopia", () => {
  const cbResult = LLEval(allCVDProg("tritanopia"), exampleColors);
  expect(cbResult.result).toBe(true);
  expect(cbResult.blame).toStrictEqual([]);
});

test("LintLanguage Boolean values", () => {
  const program: LintProgram = { "!=": { left: true, right: false } };
  const options = { debugParse: false };
  expect(prettyPrintLL(program, options)).toBe("TRUE != FALSE");
  const { result, blame } = LLEval(program, toPal([]), options);
  expect(result).toBe(true);
  expect(blame).toStrictEqual([]);
});

test("LintLanguage Quantifiers Exist", () => {
  const cvdExists = {
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
                left: { cvdSim: "a", type: "deuteranopia" },
                right: { cvdSim: "b", type: "deuteranopia" },
              },
            },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(cvdExists)).toBe(
    "NOT EXIST a IN colors SUCH THAT EXIST b IN colors SUCH THAT cvdSim(a, deuteranopia) != cvdSim(b, deuteranopia)"
  );
  expect(LLEval(cvdExists, exampleColors).result).toBe(false);
});

test("LintLanguage Quantifiers Exist - DENSE", () => {
  const cvdExists = {
    not: {
      exist: {
        in: "colors",
        varbs: ["a", "b"],
        predicate: {
          "!=": {
            left: { cvdSim: "a", type: "deuteranopia" },
            right: { cvdSim: "b", type: "deuteranopia" },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(cvdExists)).toBe(
    "NOT EXIST (a, b) IN colors SUCH THAT cvdSim(a, deuteranopia) != cvdSim(b, deuteranopia)"
  );
  expect(LLEval(cvdExists, exampleColors).result).toBe(false);
});

test("LintLanguage Quantifiers All - DENSE", () => {
  const cvdExists = {
    all: {
      in: "colors",
      varbs: ["a", "b"],
      predicate: {
        not: {
          similar: {
            left: { cvdSim: "a", type: "deuteranopia" },
            right: { cvdSim: "b", type: "deuteranopia" },
            threshold: 9,
          },
        },
      },
    },
  };
  expect(prettyPrintLL(cvdExists)).toBe(
    "ALL (a, b) IN colors SUCH THAT NOT similar(cvdSim(a, deuteranopia), cvdSim(b, deuteranopia)) < 9"
  );
  expect(LLEval(cvdExists, exampleColors).result).toBe(false);
});

test("LintLanguage Check exists", () => {
  const program = {
    exist: {
      in: "colors",
      varb: "a",
      predicate: { "==": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program)).toBe(
    "EXIST a IN colors SUCH THAT a == #1fbad6"
  );
  expect(LLEval(program, exampleColors).result).toBe(false);

  const program2 = {
    exist: {
      in: "colors",
      varb: "a",
      predicate: { "!=": { left: "a", right: "#1fbad6" } },
    },
  };
  expect(prettyPrintLL(program2)).toBe(
    "EXIST a IN colors SUCH THAT a != #1fbad6"
  );
  expect(LLEval(program2, exampleColors).result).toBe(true);
});

test("LintLanguage Arithmetic Ops: =", () => {
  const program1 = { "==": { left: 2, right: 2 } };
  expect(prettyPrintLL(program1)).toBe("2 == 2");
  expect(LLEval(program1, toPal([])).result).toBe(true);
});
const opProg = (op: "+" | "-" | "/" | "*"): LintProgram =>
  ({
    "==": { left: { [op]: { left: 2, right: 10 } }, right: 2 },
  } as LintProgram);
test("LintLanguage Arithmetic Ops: + ", () => {
  expect(prettyPrintLL(opProg("+"))).toBe(`2 + 10 == 2`);
  expect(LLEval(opProg("+"), toPal([])).result).toBe(false);
});

test("LintLanguage Arithmetic Ops: -", () => {
  expect(prettyPrintLL(opProg("-"))).toBe(`2 - 10 == 2`);
  expect(LLEval(opProg("-"), toPal([])).result).toBe(false);
});

test("LintLanguage Arithmetic Ops: /", () => {
  expect(prettyPrintLL(opProg("/"))).toBe(`2 / 10 == 2`);
  expect(LLEval(opProg("/"), toPal([])).result).toBe(false);
});

test("LintLanguage Arithmetic Ops: *", () => {
  expect(prettyPrintLL(opProg("*"))).toBe(`2 * 10 == 2`);
  expect(LLEval(opProg("*"), toPal([])).result).toBe(false);
});

const aggProg = (op: string, right: number): LintProgram =>
  ({
    "==": { left: { [op]: [1, 2, 3, 4] }, right },
  } as LintProgram);
test("LintLanguage Agg Ops: sum", () => {
  expect(prettyPrintLL(aggProg("sum", 8))).toBe(`sum([1, 2, 3, 4]) == 8`);
  expect(LLEval(aggProg("sum", 8), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("sum", 10))).toBe(`sum([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("sum", 10), toPal([])).result).toBe(true);
});
test("LintLanguage Agg Ops: min", () => {
  expect(prettyPrintLL(aggProg("min", 10))).toBe(`min([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("min", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("min", 1))).toBe(`min([1, 2, 3, 4]) == 1`);
  expect(LLEval(aggProg("min", 1), toPal([])).result).toBe(true);
});
test("LintLanguage Agg Ops: max", () => {
  expect(prettyPrintLL(aggProg("max", 10))).toBe(`max([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("max", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("max", 4))).toBe(`max([1, 2, 3, 4]) == 4`);
  expect(LLEval(aggProg("max", 4), toPal([])).result).toBe(true);
});
test("LintLanguage Agg Ops: mean", () => {
  expect(prettyPrintLL(aggProg("mean", 10))).toBe(`mean([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("mean", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("mean", 2.5))).toBe(`mean([1, 2, 3, 4]) == 2.5`);
  expect(LLEval(aggProg("mean", 2.5), toPal([])).result).toBe(true);
});
test("LintLanguage Agg Ops: std", () => {
  expect(prettyPrintLL(aggProg("std", 10))).toBe(`std([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("std", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("std", 1.118033988749895))).toBe(
    `std([1, 2, 3, 4]) == 1.118033988749895`
  );
  expect(LLEval(aggProg("std", 1.118033988749895), toPal([])).result).toBe(
    true
  );
});

test("LintLanguage Agg Ops: count", () => {
  expect(prettyPrintLL(aggProg("count", 10))).toBe(`count([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("count", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("count", 4))).toBe(`count([1, 2, 3, 4]) == 4`);
  expect(LLEval(aggProg("count", 4), toPal([])).result).toBe(true);
});

test("LintLanguage Agg Ops: extent", () => {
  expect(prettyPrintLL(aggProg("extent", 10))).toBe(
    `extent([1, 2, 3, 4]) == 10`
  );
  expect(LLEval(aggProg("extent", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("extent", 3))).toBe(`extent([1, 2, 3, 4]) == 3`);
  expect(LLEval(aggProg("extent", 3), toPal([])).result).toBe(true);
});

test("LintLanguage Agg Ops: first", () => {
  expect(prettyPrintLL(aggProg("first", 10))).toBe(`first([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("first", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("first", 1))).toBe(`first([1, 2, 3, 4]) == 1`);
  expect(LLEval(aggProg("first", 1), toPal([])).result).toBe(true);
});

test("LintLanguage Agg Ops: last", () => {
  expect(prettyPrintLL(aggProg("last", 10))).toBe(`last([1, 2, 3, 4]) == 10`);
  expect(LLEval(aggProg("last", 10), toPal([])).result).toBe(false);
  expect(prettyPrintLL(aggProg("last", 4))).toBe(`last([1, 2, 3, 4]) == 4`);
  expect(LLEval(aggProg("last", 4), toPal([])).result).toBe(true);
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
            similar: {
              left: { "hsl.h": "a" },
              right: {
                "+": { left: { "hsl.h": "b" }, right: 180 },
              },
              threshold: 5,
            },
          },
        },
      },
    },
  };
  expect(prettyPrintLL(realisticProgram)).toBe(
    "EXIST a IN colors SUCH THAT EXIST b IN colors SUCH THAT similar(hsl.h(a), hsl.h(b) + 180) < 5"
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
    "ALL (a, b) IN colors WHERE index(a) != index(b) SUCH THAT name(a) != name(b)"
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
    "ALL (a, b) IN colors WHERE index(a) != index(b) SUCH THAT name(a) != name(b)"
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
    "ALL a IN colors SUCH THAT ALL b IN colors WHERE index(a) != index(b) SUCH THAT name(a) != name(b)"
  );
  const result = LLEval(program, toPal(["#008137"]));
  expect(result.result).toBe(true);
});

test("LintLanguage Measure Distance", () => {
  const colors = toColors(["#000000", "#fff"]);
  const program: LintProgram = {
    "==": {
      left: { dist: { left: colors[0], right: colors[1] }, space: "lab" },
      right: 100,
    },
  };
  const result = LLEval(program, toPal([]));
  expect(prettyPrintLL(program)).toBe("dist(#000, #fff, lab) == 100");
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Measure DeltaE", () => {
  const colors = toColors(["#000000", "#fff"]);
  const program: LintProgram = {
    "==": {
      left: {
        deltaE: { left: colors[0], right: colors[1] },
        algorithm: "2000",
      },
      right: 100,
    },
  };
  const result = LLEval(program, toPal([]), { debugCompare: false });
  expect(prettyPrintLL(program)).toBe("deltaE(#000, #fff, 2000) == 100");
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Measure Contrast", () => {
  const colors = toColors(["#000000", "#fff"]);
  const program: LintProgram = {
    "==": {
      left: {
        contrast: { left: colors[0], right: colors[1] },
        algorithm: "APCA",
      },
      right: 107.88473318309843,
    },
  };
  const result = LLEval(program, [] as any);
  expect(prettyPrintLL(program)).toBe(
    "contrast(#000, #fff, APCA) == 107.88473318309843"
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
    "ALL a IN colors SUCH THAT ALL b IN ([#000000, #ffffff]) SUCH THAT a != b"
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
    "ALL a IN ([#000000, #ffffff]) SUCH THAT ALL b IN colors SUCH THAT a != b"
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
    "(ALL (a, b) IN colors WHERE index(a) - 1 == index(b) SUCH THAT lab.l(a) > lab.l(b) OR ALL (a, b) IN colors WHERE index(a) - 1 == index(b) SUCH THAT lab.l(a) < lab.l(b))"
  );
});

test.only("LintLanguage Diverging Colors", () => {
  const middleIndex = { "//": { left: { count: "colors" }, right: 2 } };
  const leftFilter = {
    filter: "colors",
    varb: "x",
    func: { "<": { left: "index(x)", right: middleIndex } },
  };
  const rightFilter = {
    filter: "colors",
    varb: "x",
    func: { ">": { left: "index(x)", right: middleIndex } },
  };
  const middlePred = {
    left: { "lab.l": { middle: "colors" } },
    right: { "lab.l": "z" },
  };
  const allLighter = {
    all: {
      in: "colors",
      varb: "z",
      where: { "!=": { left: "index(z)", right: middleIndex } },
      predicate: { ">": middlePred },
    },
  };
  const allDarker = {
    all: {
      in: "colors",
      varb: "z",
      where: { "!=": { left: "index(z)", right: middleIndex } },
      predicate: { "<": middlePred },
    },
  };
  const prog: LintProgram = {
    and: [
      // order
      {
        "==": {
          left: { sort: leftFilter, varb: "y", func: { "lab.l": "y" } },
          right: { map: leftFilter, varb: "y", func: { "lab.l": "y" } },
        },
      },
      {
        "==": {
          left: { sort: rightFilter, varb: "y", func: { "lab.l": "y" } },
          right: {
            reverse: {
              map: rightFilter,
              varb: "y",
              func: { "lab.l": "y" },
            },
          },
        },
      },
      // darkest or lightest is in the middle

      { or: [allLighter, allDarker] },
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
  const result = LLEval(prog, divergingColors, { debugCompare: false });
  expect(result.result).toBe(true);
  const result2 = LLEval(prog, toPal(["#be4704", "#e00050", "#008000"]));
  expect(result2.result).toBe(false);
});

test("LintLanguage Background differentiability", () => {
  const program = {
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        not: { similar: { left: "a", right: "background", threshold: 15 } },
      },
    },
  };
  const astString = prettyPrintLL(program);
  expect(astString).toBe(
    "ALL a IN colors SUCH THAT NOT similar(a, background) < 15"
  );
  const result = LLEval(program, toPal(["#fff", "#eee", "#000", "#ddd"]));
  expect(result.result).toBe(false);
  expect(result.blame).toStrictEqual([0, 1, 3]);
});

test("LintLanguage Sequential Similarity", () => {
  const program = {
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
      predicate: {
        not: { similar: { left: "a", right: "b", threshold: 10 } },
      },
    },
  };
  const astString = prettyPrintLL(program);
  expect(astString).toBe(
    "ALL (a, b) IN colors WHERE index(a) != index(b) SUCH THAT NOT similar(a, b) < 10"
  );
  const result = LLEval(program, toPal(["#fff", "#eee", "#000", "#ddd"]));
  expect(result.result).toBe(false);
  expect(result.blame).toStrictEqual([0, 1, 3]);
});

test("LintLanguage Array Compare", () => {
  const program: LintProgram = {
    "==": {
      left: [1, 2, 3],
      right: [3, 2, 1],
    },
  };

  const printed = prettyPrintLL(program);
  expect(printed).toBe("[1, 2, 3] == [3, 2, 1]");

  const result = LLEval(program, toPal([]));
  expect(result.result).toBe(false);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Array Compare 2", () => {
  const program = {
    "==": {
      left: [1, 2, 3],
      right: [1, 2, 3],
    },
  };

  const printed = prettyPrintLL(program);
  expect(printed).toBe("[1, 2, 3] == [1, 2, 3]");

  const result = LLEval(program, toPal([]));
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Array Compare -- Sort", () => {
  const program: LintProgram = {
    "==": {
      left: [1, 2, 3],
      right: {
        sort: [3, 2, 1],
        func: { "+": { left: "x", right: 0 } },
        varb: "x",
      },
    },
  };

  const printed = prettyPrintLL(program);
  expect(printed).toBe("[1, 2, 3] == sort([3, 2, 1], x => x + 0)");

  const result = LLEval(program, toPal([]));
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Array Compare Color", () => {
  const program: LintProgram = {
    "==": {
      left: { sort: "colors", varb: "x", func: { "lab.l": "x" } },
      right: toColors(["#000", "#fff", "#111", "#222"]),
    },
  };

  const printed = prettyPrintLL(program);
  expect(printed).toBe(
    "sort(colors, x => lab.l(x)) == [#000, #fff, #111, #222]"
  );

  const result = LLEval(program, toPal(["#fff", "#eee", "#000", "#ddd"]));
  expect(result.result).toBe(false);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Array Filter", () => {
  const program: LintProgram = {
    "==": {
      left: {
        filter: "colors",
        varb: "x",
        func: { "<": { left: "index(x)", right: 3 } },
      },
      right: toColors(["#fff", "#000"]),
    },
  };

  const printed = prettyPrintLL(program);
  expect(printed).toBe("filter(colors, x => index(x) < 3) == [#fff, #000]");

  const result = LLEval(program, toPal(["#fff", "#000", "#eee", "#ddd"]), {
    debugCompare: false,
  });
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Fair Weighting", () => {
  const program: LintProgram = {
    "<": {
      left: { extent: { sort: "colors", varb: "x", func: { "lch.l": "x" } } },
      right: 50,
    },
  };

  const printed = prettyPrintLL(program);
  expect(printed).toBe("extent(sort(colors, x => lch.l(x))) < 50");
  const pal = toPal(["#350d00", "#00f300", "#55e1ff", "#f4bcff"]);
  const result = LLEval(program, pal, { debugCompare: false });
  expect(result.result).toBe(false);
  expect(result.blame).toStrictEqual([]);
});

test("LintLanguage Name Check", () => {
  const program = {
    "==": {
      left: { name: "#f00" },
      right: "red",
    },
  };
  const astString = prettyPrintLL(program);
  expect(astString).toBe("name(#f00) == red");
  const result = LLEval(program, toPal([]));
  expect(result.result).toBe(true);
  expect(result.blame).toStrictEqual([]);
});
