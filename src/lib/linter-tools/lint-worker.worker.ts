import * as idb from "idb-keyval";
import { runLintChecks } from "../linter";
import type { CustomLint } from "../ColorLint";
import type { Palette, StringPalette } from "../../types";
import { Color } from "../Color";
import type { LintResult } from "../ColorLint";
import { doMonteCarloFix } from "./monte-carlo-fix";

type Command =
  | { type: "load-lints"; content: ""; id: string }
  | { type: "run-lint"; content: ""; id: string }
  | { type: "run-lint-no-message"; content: ""; id: string }
  | { type: "monte-carlo-fix"; content: ""; id: string };

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

let lintStore: CustomLint[] = [];
let storeLoaded = false;
const storeName = "color-pal-lints";
let simpleLintCache = new Map<string, any>();
async function dispatch(cmd: Command) {
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

      const result: LintResult[] = runLintChecks(
        pal,
        lintStore.map((x) => {
          if (!computeMessage) {
            x.blameMode = "none";
          }
          return x;
        })
      ).map((x) => {
        return {
          name: x.name,
          id: x.id,
          passes: x.passes,
          message: x.message,
          level: x.level,
          group: x.group,
          description: x.description,
          isCustom: x.isCustom,
          taskTypes: x.taskTypes as any,
          subscribedFix: x.subscribedFix,
          requiredTags: x.requiredTags,
          naturalLanguageProgram: x.naturalLanguageProgram,
        };
      });
      simpleLintCache.set(cmd.content, result);
      return result;
    case "monte-carlo-fix":
      // to do throw caching in front of this?
      const { palString, lintId } = JSON.parse(cmd.content);
      console.log(palString, lintId);
      const newPal = hydratePal(palString);
      const lint = lintStore.find((x) => x.id === lintId);
      if (!lint) {
        return [];
      }
      const fixedPalette = doMonteCarloFix(newPal, lint);
      return fixedPalette.colors.map((x) => x.color.toString());
    default:
      return "no-op";
  }
}

self.onmessage = async (event: MessageEvent<Command>) => {
  const result = await dispatch(event.data);
  self.postMessage({ id: event.data.id, content: result });
};

export {}; // this is to make typescript happy
