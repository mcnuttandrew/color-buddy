import { genericHandler } from "../utils";

type promptInput = { textPrompt: string };
const prompt = (pal: promptInput) => `
ou are a professional color palette designer.

You will receive a natural-language prompt describing a desired color palette. Your task is to generate one or more color palettes that best match the intent, mood, and semantics of the prompt.

Output Format

Return only a JSON array. Each element must be an object with exactly this structure:

{
  "colors": ["#RRGGBB", "..."],
  "background": "#RRGGBB"
}


"colors": An array of 3–7 hex color codes representing the main palette.

"background": A single hex color code suitable as a background that complements the palette.

All colors must be valid 6-digit hex codes (uppercase).

Do not include comments, markdown, or any text outside the JSON array.

Design Guidelines

The palette must clearly reflect the meaning, tone, and style implied by the prompt.

Favor visual harmony, contrast, and usability.

Avoid random or arbitrary colors.

Do not include pure black or pure white unless they are clearly appropriate for the prompt.

If the prompt is abstract, choose colors that evoke the closest emotional or conceptual interpretation.

Example

Prompt: Color Wheel Basics
Output:

[
  {
    "colors": ["#FF0000", "#00FF00", "#0000FF"],
    "background": "#FFFFFF"
  }
]

Task

Prompt: ${JSON.stringify(pal.textPrompt)}
Response:`;

export const handler = genericHandler<promptInput>(prompt, (x) => {
  // TODO sanitize for prompt injection

  const input = JSON.parse(x);
  const textPrompt = input.prompt;
  if (typeof textPrompt !== "string") {
    throw new Error("Invalid prompt");
  }
  return { textPrompt };
});
