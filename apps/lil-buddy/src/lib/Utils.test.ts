import { expect, test } from "vitest";
import {
  modifyLint,
  MODIFY_LINT_TARGET_KEY,
  MODIFY_LINT_DELETE,
} from "./utils";

const exampleLintStr = `{
    "all": {
        "predicate": {
            "==": { "right": true, "left": {"inGamut": "a"} }
        }
    }
}
`;
test("modifyLint", () => {
  expect(modifyLint([], "asd", exampleLintStr)).toMatchSnapshot();
  expect(modifyLint(["1"], "asd", exampleLintStr)).toMatchSnapshot();
  expect(modifyLint(["all"], "asd", exampleLintStr)).toMatchSnapshot();
  expect(
    modifyLint(["all", "predicate"], "asd", exampleLintStr)
  ).toMatchSnapshot();
  expect(
    modifyLint(["all", "predicate", "=="], "asd", exampleLintStr)
  ).toMatchSnapshot();
  expect(
    modifyLint(["all", "predicate", "==", "left"], "asd", exampleLintStr)
  ).toMatchSnapshot();
});

test("modifyLint.non obj swap key case", () => {
  expect(
    modifyLint(
      ["all", "predicate", "==", "left", "inGamut", MODIFY_LINT_TARGET_KEY],
      "asd",
      exampleLintStr
    )
  ).toMatchSnapshot();
});

test.only("modifyLint delete", () => {
  expect(
    modifyLint(
      ["all", "predicate", "==", "left", "inGamut"],
      MODIFY_LINT_DELETE,
      exampleLintStr
    )
  ).toMatchSnapshot();
});
