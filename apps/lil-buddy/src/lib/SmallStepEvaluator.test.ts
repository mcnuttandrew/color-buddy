import { expect, test } from "vitest";
import { makePalFromString } from "color-buddy-palette";
import { GenerateAST, PREBUILT_LINTS } from "color-buddy-palette-lint";
import {
  generateEvaluations,
  rewriteQuantifiers,
} from "./small-step-evaluator";

const getAST = (node: any) => {
  const ast = (GenerateAST(node as any).value as any).children[0] as any;
  const rewrittenAST = rewriteQuantifiers(ast);
  return rewrittenAST;
};

const defaultPal = makePalFromString(["red", "green"]);
test("SmallStepEvaluator works", () => {
  const exampleNode = {
    ">": {
      left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },
      right: 10,
    },
  };
  const ast = getAST(exampleNode);
  const result = generateEvaluations(
    ast,
    { a: defaultPal.colors[0], b: defaultPal.colors[1] },
    defaultPal,
    true
  );
  expect(result).toMatchSnapshot();
});

test("SmallStepEvaluator works with smaller example", () => {
  const smallExampleNode = { ">": { left: 11, right: 10 } };
  const result = generateEvaluations(
    getAST(smallExampleNode),
    {},
    defaultPal,
    true
  );
  expect(result).toMatchSnapshot();
});

test("SmallStepEvaluator works with small not example", () => {
  const smallExampleNode = { not: { ">": { left: 11, right: 10 } } };
  const result = generateEvaluations(
    getAST(smallExampleNode),
    {},
    defaultPal,
    true
  );
  expect(result).toMatchSnapshot();
});

test("Agg Test", () => {
  const example = { "<": { left: { count: "colors" }, right: 11 } };
  const result = generateEvaluations(getAST(example), {}, defaultPal, true);
  expect(result).toMatchSnapshot();
});

test("Fair Test", () => {
  const fair = {
    "<": {
      left: { extent: { sort: "colors", varb: "x", func: { "lch.l": "x" } } },
      right: 50,
    },
  };
  const result = generateEvaluations(getAST(fair), {}, defaultPal, true);
  expect(result).toMatchSnapshot();
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
    },
  };
  const result = generateEvaluations(getAST(quantifier), {}, defaultPal, true);
  expect(result).toMatchSnapshot();
});

test("Nested Quantifiers Test", () => {
  const nested = {
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
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
  const result = generateEvaluations(getAST(nested), {}, defaultPal, true);
  expect(result).toMatchSnapshot();
});

test("Quantifier Rewrite Test 1", () => {
  const nested = {
    all: {
      in: "colors",
      varbs: ["a", "b"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
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
  const ast = (GenerateAST(nested as any).value as any).children[0] as any;
  const unnested = rewriteQuantifiers(ast);
  expect(unnested).toMatchSnapshot();
});

test("Quantifier Rewrite Test 2", () => {
  const anotherExample = {
    ">": {
      left: { deltaE: { left: "a", right: "b" }, algorithm: "2000" },
      right: 10,
    },
  };
  const ast = getAST(anotherExample);
  expect(rewriteQuantifiers(ast)).toStrictEqual(ast);
});

test("Quantifier Rewrite Test 3", () => {
  const nested = {
    all: {
      in: "colors",
      varbs: ["a", "b", "c"],
      where: { "!=": { left: "index(a)", right: "index(b)" } },
      predicate: true,
    },
  };
  const ast = (GenerateAST(nested as any).value as any).children[0] as any;
  const unnested = rewriteQuantifiers(ast);
  expect(unnested).toMatchSnapshot();
});

// test("All Test", () => {
//   for (const test in PREBUILT_LINTS) {
//     const lint = PREBUILT_LINTS[test as keyof typeof PREBUILT_LINTS];
//     console.log(lint.name);
//     const lintProgram = JSON.parse(lint.program);
//     const ast = (GenerateAST(lintProgram).value as any).children[0] as any;
//     const result = generateEvaluations(ast, {}, defaultPal, true);
//     expect(result).toMatchSnapshot();
//   }
// });
