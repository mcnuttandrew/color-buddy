import { expect, test } from "vitest";
import { GenerateAST } from "./lint-language";

const getAST = (node: any) => {
  const ast = (GenerateAST(node as any).value as any).children[0] as any;
  return ast;
};

test("Generating the eval paths works", () => {
  const exampleNode = {
    ">": {
      left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },
      right: 10,
    },
  };
  expect(getAST(exampleNode).generatePath([])).toMatchSnapshot();
});

test("Quantifier Test", () => {
  const quantifier = {
    all: {
      in: "colors",
      varb: "a",
      predicate: {
        ">": {
          left: {
            contrast: { left: "a", right: "background" },
            algorithm: "WCAG21",
          },
          right: 3,
        },
      },
      where: false,
    },
  };
  expect(getAST(quantifier).generatePath([])).toMatchSnapshot();
});
