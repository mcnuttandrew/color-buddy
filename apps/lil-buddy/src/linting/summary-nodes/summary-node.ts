import type { Palette } from "color-buddy-palette";

export interface SummaryNodeProps {
  node: any;
  pal: Palette;
  inducedVariables: Record<string, any>;
  modifyLint: (path: (number | string)[], newValue: any) => void;
}
