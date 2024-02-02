import { expect, test } from "vitest";
import { parseAST } from "./lint-ast-converter";

test.skip("lint parser", () => {
  const program1 = parseAST("(true AND false) OR (NOT true)");
  const program2 = parseAST("COUNT(colors) < 10");
  const program3 = parseAST(
    "ALL colors a, ALL colors b WHERE index(a) - 1 == index(b), lab(a, l) > lab(b, l)"
  );
  expect(program1).toMatchSnapshot();
  // expect(program.toString()).toBe("(true AND false) OR (NOT true)");

  expect(program2).toMatchSnapshot();
  expect(program2.toString()).toBe("count(colors) < 10");

  // const program = parser.parse("count(colors) < 10");
  // expect(program).toStrictEqual({
  //   "<": { left: { count: "colors" }, right: 10 },
  // });
});
