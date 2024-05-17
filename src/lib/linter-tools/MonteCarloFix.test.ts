import { doMonteCarloFix } from "./monte-carlo-fix";
import { expect, test } from "vitest";
import { toPal } from "../test-utils";
import { CreateCustomLint } from "../ColorLint";

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
test("doMonteCarloFix", () => {
  const palette = toPal(colors);
  // should fail the CVD check
  const firstLint = CreateCustomLint(CVDCheck[0]);
  const firstLintRun = new firstLint(palette).run();
  expect(firstLintRun.passes).toBe(false);

  const newPalette = doMonteCarloFix(palette, [CVDCheck[0]]);
  expect(newPalette).toBeDefined();
  expect(newPalette.colors.length).toBe(colors.length);

  const newLint = CreateCustomLint(CVDCheck[0]);
  const newRun = new newLint(newPalette).run();
  expect(newRun.passes).toBe(true);
});
