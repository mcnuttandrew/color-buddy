import { genericHandler } from "../utils";

type promptInput = {
  inputColors: string[];
  background: string;
  error: string;
  context: string;
};
const prompt = (pal: promptInput) => `
You are a professional color palette critic and fixer.

You will receive:

A color palette

A background color

Context describing how the palette is used

A description of the palette’s error or flaw

Your task is to repair the palette so that the error is resolved while preserving the original aesthetic, mood, and intent as much as possible. Your fix should be thoughtful and minimal, not a redesign.

Output Format

Return only a single valid JSON object with exactly this structure:

{
  "background": "#RRGGBB",
  "colors": ["#RRGGBB", "..."]
}


All values must be valid 6-digit uppercase hex codes.

"colors" must contain the same number of colors as the input palette unless the error explicitly requires changing the count.

Do not include comments, markdown, or any text outside the JSON object.

Fixing Rules

You must change at least one color. Returning the same colors is not a fix.

Do not fix the issue by simply removing a color unless the error explicitly demands removal.

Preserve the original “vibe”: hue family, warmth/coolness, contrast structure, and stylistic intent.

Make the smallest change that fully resolves the stated error.

Prefer clever adjustments (hue shift, lightness/saturation tuning, substitution within the same family) over obvious or destructive changes.

Do not modify the background color unless the error explicitly involves the background.

Example

Input
Palette: ["#0A1AFF", "#1020FF", "#1A28FF"]
Background Color: "#FFFFFF"
Context: "UI for a finance dashboard"
Error: "Colors are too similar to distinguish categories"

Output

{
  "background": "#FFFFFF",
  "colors": ["#0A1AFF", "#FF8C1A", "#1AFFA5"]
}

Task

Palette: ${JSON.stringify(pal.inputColors)}
Context: ${JSON.stringify(pal.context)}
Background Color: ${JSON.stringify(pal.background)}
Error: ${JSON.stringify(pal.error)}

Response:`;
export const handler = genericHandler<promptInput>(prompt, (x) => {
  const input = JSON.parse(x);
  const inputColors = input.colors;
  if (
    !Array.isArray(inputColors) ||
    !inputColors.every((x) => typeof x === "string")
  ) {
    throw new Error("Not an array");
  }
  const background = input.background;
  if (typeof background !== "string") {
    throw new Error("No background");
  }
  const error = input.error;
  if (typeof error !== "string") {
    throw new Error("No error");
  }
  const context = input.context;
  if (typeof context !== "string") {
    throw new Error("No context");
  }

  return { inputColors, background, error, context };
});
