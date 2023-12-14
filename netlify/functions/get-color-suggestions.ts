import { genericHandler } from "../utils";

const prompt = (pal: { inputColors: string[]; background: string }) => {
  const result = `
You are a color expert. You make great suggestions on colors to add to color palettes. You take in a list of colors presented as hex code and return an array of colors that could be added. Your suggestions should enhance the palette.

Present your names a list of JSON strings. They should have a type like string[]. Only respond with one array. Do not offer any other response

Palette: ${JSON.stringify(pal.inputColors)}
Background Color: ${pal.background}
Your response: \`\`\`json`;
  return result;
};

export const handler = genericHandler("openai")(prompt, (x) => {
  const input = JSON.parse(x);
  const inputColors = input.palette;
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

  return { inputColors, background };
});
