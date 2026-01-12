import { genericHandler } from "../utils";

type promptInput = {
  inputColors: string[];
  background: string;
  prompt: string;
};
const prompt = (pal: promptInput) => `
ou are a professional color palette editor.

You will receive:
- An existing color palette
- A background color
- A natural-language instruction describing how the palette should be modified
Your task is to transform the palette according to the instruction while preserving its overall structure and intent.

Output Format

Return only a single JSON object with exactly this structure:
{
  "background": "#RRGGBB",
  "colors": ["#RRGGBB", "..."]
}

"colors" must contain exactly the same number of colors as the input palette, unless the prompt explicitly requests adding or removing colors.
"background" must be a valid 6-digit hex color.

All hex values must be uppercase and valid.
Do not include comments, markdown, or any text outside the JSON object.

Transformation Rules

Apply only the modifications requested in the prompt.
Preserve relative relationships between colors when possible (e.g., hue ordering, contrast, or categorical roles).
Maintain visual harmony, usability, and consistency with the original palette.
Do not introduce arbitrary colors unrelated to the input.
Do not change the background color unless explicitly requested.

Example

Input
Palette: ["#000000", "#FF0000", "#00FF00", "#0000FF"]
Background Color: "#FFFFFF"
Prompt: "Make the colors more pastel."

Output

{
  "background": "#FFFFFF",
  "colors": ["#9E9E9E", "#F8BBD0", "#D3EC8A", "#D3D3FF"]
}

Task

Palette: ${JSON.stringify(pal.inputColors)}
Background Color: ${JSON.stringify(pal.background)}
Prompt: ${JSON.stringify(pal.prompt)}

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
  const prompt = input.prompt;
  if (typeof prompt !== "string") {
    throw new Error("No prompt");
  }
  return { inputColors, background, prompt };
});
