import * as idb from "idb-keyval";
import { linter, generateMCFix } from "@color-buddy/palette-lint";
import type { LintProgram, LintResult } from "@color-buddy/palette-lint";
import type { Palette, StringPalette } from "@color-buddy/palette";
import { Color } from "@color-buddy/palette";

import type { WorkerCommand } from "./worker-types";

const cache: Record<string, Color> = {};
const getColor = (hex: string, space: string): Color => {
  const key = `${hex}-${space}`;
  if (cache[key]) {
    return cache[key];
  }
  const result = Color.colorFromString(hex, space as any);
  cache[key] = result;
  return result;
};

const hydratePal = (pal: string): Palette => {
  const parsed = JSON.parse(pal) as StringPalette;
  return {
    background: getColor(parsed.background, parsed.colorSpace),
    colors: parsed.colors.map((x) => ({
      ...x,
      color: getColor(x.color, parsed.colorSpace),
    })),
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

      const result: LintResult[] = linter(
        pal,
        lintStore.map((x) => {
          if (!computeMessage) {
            x.blameMode = "none";
          }
          return x;
        }),
        { computeMessage }
      );
      // .map((x) => {
      //   return {
      //     name: x.name,
      //     id: x.id,
      //     passes: x.passes,
      //     message: x.message,
      //     level: x.level,
      //     group: x.group,
      //     description: x.description,
      //     isCustom: x.isCustom,
      //     taskTypes: x.taskTypes as any,
      //     subscribedFix: x.subscribedFix,
      //     requiredTags: x.requiredTags,
      //     naturalLanguageProgram: x.naturalLanguageProgram,
      //   };
      // });
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
      const fixedPalette = generateMCFix(newPal, lints);
      return fixedPalette.colors.map((x) => x.color.toString());
    default:
      return "no-op";
  }
}

self.onmessage = async (event: MessageEvent<WorkerCommand>) => {
  const result = await dispatch(event.data);
  self.postMessage({ id: event.data.id, content: result });
};

export {}; // this is to make typescript happy
