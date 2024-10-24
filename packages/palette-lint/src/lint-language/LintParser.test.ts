import { expect, test } from "vitest";
import { prettyPrintLL } from "./lint-language";
import compileToLL from "./parser";
import { PREBUILT_LINTS } from "../main";
import { schema } from "../constants";

test("parse", () => {
  [
    ...PREBUILT_LINTS,
    // ...PREBUILT_LINTS.slice(25, 28),
    // ...PREBUILT_LINTS.slice(18, 25),
    // PREBUILT_LINTS.at(30),
  ].forEach((ex) => {
    if (!ex || ex.customProgram) {
      return;
    }
    const prog = JSON.parse(ex.program);
    // delete prog.$schema;
    const nlEx = prettyPrintLL(prog);
    const compiledProgram = compileToLL(nlEx);
    expect(
      compiledProgram,
      `Program for ${ex.name} should compile back to the original program. \n\n(from "${nlEx}")\n\n`
    ).toStrictEqual(prog);
  });
});

test("parse2", () => {
  const compiledProgram = compileToLL(
    "ALL a IN ([#000000, #ffffff]) SUCH THAT ALL b IN colors SUCH THAT a != b"
  );
  expect(compiledProgram).toStrictEqual({
    $schema: schema,
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
  });
});
