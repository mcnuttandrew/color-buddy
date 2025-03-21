import { suggestMCFix } from "./monte-carlo-fix";
import { expect, test } from "vitest";
import { toPal } from "../test-utils";
import { RunLint } from "../ColorLint";

import CVDCheck from "../lints/cvd-check";

const colors = [
  "#4eb96e",
  "#daa7a7",
  "#c2e5ba",
  "#aafff2",
  "#7f3a65",
  "#cb8300",
  "#238b10",
  "#666",
];
test("suggestMCFix", async () => {
  const palette = toPal(colors);
  // should fail the CVD check
  const lintResult1 = RunLint(CVDCheck[0], palette, {});
  expect(lintResult1.kind).toBe("success");
  expect(lintResult1.kind === "success" && lintResult1.passes).toBe(false);

  const newPalette = await suggestMCFix(palette, [CVDCheck[0]]);
  expect(newPalette).toBeDefined();
  expect(newPalette.colors.length).toBe(colors.length);

  const lintResult2 = RunLint(CVDCheck[0], newPalette, {});
  expect(lintResult2.kind).toBe("success");
  expect(lintResult2.kind === "success" && lintResult2.passes).toBe(true);
});
