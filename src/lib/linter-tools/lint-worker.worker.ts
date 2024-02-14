import * as idb from "idb-keyval";
import { runLintChecks } from "../linter";
import type { CustomLint } from "../CustomLint";
import type { Palette } from "../../types";
import { Color } from "../Color";
import type { LintResult } from "../ColorLint";

type Command =
  | { type: "load-lints"; content: ""; id: string }
  | { type: "run-lint"; content: ""; id: string };

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
  const parsed = JSON.parse(pal);
  return {
    background: getColor(parsed.background, parsed.colorSpace),
    colors: parsed.colors.map((x: string) => getColor(x, parsed.colorSpace)),
    type: parsed.type,
    colorSpace: parsed.colorSpace,
    name: parsed.name,
    evalConfig: parsed.evalConfig,
    intendedAffects: parsed.intendedAffects,
    intendedContexts: parsed.intendedContexts,
  };
};

let lintStore: CustomLint[] = [];
let storeLoaded = false;
const storeName = "color-pal-lints";
let simpleLintCache = new Map<string, any>();
async function dispatch(cmd: Command) {
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
    case "run-lint":
      if (simpleLintCache.has(cmd.content)) {
        return simpleLintCache.get(cmd.content);
      }
      const pal = hydratePal(cmd.content);
      // if store not loaded, wait
      while (!storeLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const result: LintResult[] = runLintChecks(pal, lintStore).map((x) => {
        return {
          name: x.name,
          passes: x.passes,
          message: x.message,
          level: x.level,
          group: x.group,
          description: x.description,
          isCustom: x.isCustom,
          taskTypes: x.taskTypes as any,
          subscribedFix: x.subscribedFix,
        };
      });
      simpleLintCache.set(cmd.content, result);
      return result;
    default:
      return "no-op";
  }
}

self.onmessage = async (event: MessageEvent<Command>) => {
  const result = await dispatch(event.data);
  self.postMessage({ id: event.data.id, content: result });
};

export {}; // this is to make typescript happy
