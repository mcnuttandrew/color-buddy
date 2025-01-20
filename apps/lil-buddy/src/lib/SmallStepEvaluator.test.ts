import { expect, test } from "vitest";
import { makePalFromString } from "color-buddy-palette";
import { GenerateAST, PREBUILT_LINTS } from "color-buddy-palette-lint";
import { generateEvaluations } from "./small-step-evaluator";

const defaultPal = makePalFromString(["red", "green"]);
test("SmallStepEvaluator works", () => {
  const exampleNode = {
    ">": {
      left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },
      right: 10,
    },
  };
  const ast = (GenerateAST(exampleNode as any).value as any).children[0] as any;
  const result = generateEvaluations(
    ast,
    { a: defaultPal.colors[0], b: defaultPal.colors[1] },
    defaultPal
  );
  expect(result).toMatchSnapshot();
});

test("SmallStepEvaluator works with smaller example", () => {
  const smallExampleNode = { ">": { left: 11, right: 10 } };
  const ast = (GenerateAST(smallExampleNode as any).value as any)
    .children[0] as any;
  const result = generateEvaluations(ast, {}, defaultPal);
  expect(result).toMatchSnapshot();
});

test("SmallStepEvaluator works with small not example", () => {
  const smallExampleNode = { not: { ">": { left: 11, right: 10 } } };
  const ast = (GenerateAST(smallExampleNode as any).value as any)
    .children[0] as any;
  const result = generateEvaluations(ast, {}, defaultPal);
  expect(result).toMatchSnapshot();
});

test("Agg Test", () => {
  const example = { "<": { left: { count: "colors" }, right: 11 } };
  const ast = (GenerateAST(example as any).value as any).children[0] as any;
  const result = generateEvaluations(ast, {}, defaultPal);
  expect(result).toMatchSnapshot();
});

test("Fair Test", () => {
  const fair = {
    "<": {
      left: { extent: { sort: "colors", varb: "x", func: { "lch.l": "x" } } },
      right: 50,
    },
  };
  const ast = (GenerateAST(fair as any).value as any).children[0] as any;
  const result = generateEvaluations(ast, {}, defaultPal);
  expect(result).toMatchSnapshot();
});

// test("All Test", () => {
//   for (const test in PREBUILT_LINTS) {
//     const lint = PREBUILT_LINTS[test as keyof typeof PREBUILT_LINTS];
//     console.log(lint);
//     const lintProgram = JSON.parse(lint.program);
//     const ast = (GenerateAST(lintProgram).value as any).children[0] as any;
//     const result = generateEvaluations(ast, {}, defaultPal);
//     expect(result).toMatchSnapshot();
//   }
// });
