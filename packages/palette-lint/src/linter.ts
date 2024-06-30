import { RunLint } from "./ColorLint";
import type { Palette } from "../../palette/src/types";
import type { LintProgram, LintResult } from "./ColorLint";

export default function linter(
  palette: Palette,
  lints: LintProgram[],
  options: Parameters<typeof RunLint>[2]
): LintResult[] {
  const ignoreList = palette.evalConfig;
  const globallyIgnoredLints = palette.evalConfig?.globallyIgnoredLints || [];
  return (
    lints
      .filter((x) => !globallyIgnoredLints.includes(x.id))
      // some undefine-s creeping in?
      .filter((x) => !!x.group)
      // task type
      .filter((x) => x.taskTypes.includes(palette.type))
      // tag type
      .filter((x) => {
        if (x.requiredTags.length === 0) return true;
        return x.requiredTags.some((a) => palette.tags.includes(a));
      })
      .map((x) => {
        if (ignoreList[x.name] && ignoreList[x.name].ignore) {
          return x;
        }
        try {
          return RunLint(x, palette, options);
        } catch (e) {
          console.error(e);
        }
      })
      .filter((x) => !!x) as LintResult[]
  );
}
