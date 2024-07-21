import * as idb from "idb-keyval";
import { linter, suggestMCFix } from "color-buddy-palette-lint";
import type { LintProgram, LintResult } from "color-buddy-palette-lint";
import type { Palette, StringPalette } from "color-buddy-palette";
import { Color } from "color-buddy-palette";

import type { WorkerCommand } from "./worker-types";

const cache: Record<string, Color> = {};
const getColor = (hex: string, space: string, tags: string[]): Color => {
  const key = `${hex}-${space}`;
  if (cache[key]) {
    return cache[key];
  }
  const result = Color.colorFromString(hex, space as any);
  result.tags = tags;
  cache[key] = result;
  return result;
};

const hydratePal = (pal: string): Palette => {
  const parsed = JSON.parse(pal) as StringPalette;
  return {
    background: getColor(parsed.background, parsed.colorSpace, []),
    colors: parsed.colors.map((x) =>
      getColor(x.color, parsed.colorSpace, x.tags)
    ),
    type: parsed.type,
    colorSpace: parsed.colorSpace,
    name: parsed.name,
    evalConfig: parsed.evalConfig,
    tags: parsed.tags,
  };
};

let lintStore: LintProgram[] = [];
let storeLoaded = false;
const storeName = "color-pal-lints";
let simpleLintCache = new Map<string, any>();
async function dispatch(cmd: WorkerCommand) {
  let computeMessage = true;
  switch (cmd.type) {
    case "load-lints":
      idb.get(storeName).then((x) => {
        lintStore = x.lints;
        storeLoaded = true;
        // gotta dump the cache when new lints are loaded
        simpleLintCache = new Map<string, any>();
        return "";
      });
      return "";
    case "run-lint-no-message":
      computeMessage = false;
    case "run-lint":
      if (simpleLintCache.has(cmd.content)) {
        return simpleLintCache.get(cmd.content);
      }
      const pal = hydratePal(cmd.content);
      // if store not loaded, wait
      while (!storeLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const result: LintResult[] = linter(pal, lintStore, { computeMessage });

      simpleLintCache.set(cmd.content, result);
      return result;
    case "monte-carlo-fix":
      const { palString, lintIds } = JSON.parse(cmd.content);
      const newPal = hydratePal(palString);
      const lintIdSet = new Set(lintIds);
      const lints = lintStore.filter((x) => lintIdSet.has(x.id));
      if (lints.length === 0) {
        return [];
      }
      const fixedPalette = await suggestMCFix(newPal, lints);
      return fixedPalette.colors.map((x) => x.toString());
    default:
      return "no-op";
  }
}

self.onmessage = async (event: MessageEvent<WorkerCommand>) => {
  const result = await dispatch(event.data);
  self.postMessage({ id: event.data.id, content: result });
};

export {}; // this is to make typescript happy
