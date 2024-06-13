import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import * as Json from "jsonc-parser";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_KEY,
});

const engines = {
  openai: (prompt: string) =>
    openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      //   model: "gpt-3.5-turbo",
      n: 1,
      temperature: 0,
      // model: "gpt-4",
      // model: "gpt-4-turbo-preview",
    }),
  anthropic: (prompt: string) =>
    anthropic.messages.create({
      // model: "claude-3-opus-20240229",
      model: "claude-3-haiku-20240307",
      // model: "claude-3-sonnet-20240229",
      max_tokens: 256,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
};

type promptInput = {
  inputColors: string[];
  background: string;
  error: string;
  context: string;
};
const prompt = (pal: promptInput) => `
You are a color expert. You take in a color palette and an error it has and fix it. Your fixes should be clever but respect the original vibe of the palette. Present your fixes as a single JSON object that describes the color palette. It should have a type like {"background": string; "colors": string[]}. 
Additional criteria:
- As much as possible, do not provide fixes by simply removing a color from the palette. 
- DO NOT JUST RETURN THE SAME COLORS. That is not a fix. You must change at least one color.

Do not offer any other response. YOU MUST GIVE A VALID JSON OBJECT. If you do not, you will be banned.

Palette: ${JSON.stringify(pal.inputColors)}
Context: ${JSON.stringify(pal.context)}
Background Color: ${JSON.stringify(pal.background)}
Error: ${JSON.stringify(pal.error)}

Your response: `;

export default function (
  colors: string[],
  background: string,
  error: string,
  context: string,
  engine: string
) {
  const input = { inputColors: colors, background, error, context };
  const content = prompt(input);
  if (engine === "openai") {
    return engines.openai(content).then((x: any) => {
      return x.choices
        .map((x: any) => x?.message?.content)
        .filter((x: any) => x)
        .flatMap((x: any) => Json.parse(x));
    });
  }
  if (engine === "anthropic") {
    return engines.anthropic(content).then((x: any) => {
      return x.content
        .map((x: any) => x?.text)
        .filter((x: any) => x)
        .flatMap((x: any) => Json.parse(x));
    });
  }
  return Promise.resolve([]);
}
