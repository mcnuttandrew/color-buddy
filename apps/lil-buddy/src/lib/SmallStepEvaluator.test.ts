import { expect, test } from "vitest";
import { makePalFromString } from "color-buddy-palette";
import { GenerateAST } from "color-buddy-palette-lint";
import { generateEvaluations } from "./small-step-evaluator";

test("SmallStepEvaluator works", () => {
  const exampleNode = {
    ">": {
      left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },
      right: 10,
    },
  };
  const ast = (GenerateAST(exampleNode as any).value as any).children[0] as any;
  const pal = makePalFromString(["red", "green"]);
  const result = generateEvaluations(
    ast,
    { a: pal.colors[0], b: pal.colors[1] },
    pal
  );
  expect(result).toMatchSnapshot();
});

test("SmallStepEvaluator works with smaller example", () => {
  const smallExampleNode = { ">": { left: 11, right: 10 } };
  const ast = (GenerateAST(smallExampleNode as any).value as any)
    .children[0] as any;
  const result = generateEvaluations(
    ast,
    {},
    makePalFromString(["red", "green"])
  );
  expect(result).toMatchSnapshot();
});

test.only("SmallStepEvaluator works with small not example", () => {
  const smallExampleNode = { not: { ">": { left: 11, right: 10 } } };
  const ast = (GenerateAST(smallExampleNode as any).value as any)
    .children[0] as any;
  const result = generateEvaluations(
    ast,
    {},
    makePalFromString(["red", "green"])
  );
  expect(result).toMatchSnapshot();
});
