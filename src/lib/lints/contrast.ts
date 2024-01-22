import { Color } from "../Color";
import { ColorLint } from "./ColorLint";
import type { TaskType } from "./ColorLint";

type Algorithm =
  | "APCA"
  | "WCAG21"
  | "Michelson"
  | "Weber"
  | "Lstar"
  | "DeltaPhi";

export default class BackgroundContrast extends ColorLint<Color[], Algorithm> {
  name = "Background Contrast";
  taskTypes = ["sequential", "diverging", "categorical"] as TaskType[];
  hasParam = true;
  defaultParam = "APCA" as Algorithm;
  paramOptions: { type: "enum"; options: string[] } = {
    type: "enum",
    options: ["APCA", "WCAG21", "Michelson", "Weber", "Lstar", "DeltaPhi"],
  };
  level: "error" | "warning" = "error";

  async _runCheck() {
    const { background } = this.palette;
    const bg = background.toColorIO();
    const failingColors = this.palette.colors.filter((x) => {
      const contrast = Math.abs(x.toColorIO().contrast(bg, this.config.val!));
      return contrast < 4.5;
    });
    return {
      passCheck: failingColors.length === 0,
      data: failingColors,
    };
  }
  buildMessage(): string {
    const colors = this.checkData?.map((x) => x.toHex());
    return `These colors (${colors}) do not have a sufficient contrast ratio with the background and may be hard to discriminate in some contexts`;
  }
  getOptions() {
    return this.paramOptions.options;
  }
}
