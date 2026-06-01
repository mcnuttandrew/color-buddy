import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
import Anthropic from "@anthropic-ai/sdk";
import type { Context } from "@netlify/functions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
});

export function errorResponse(err: string) {
  console.error(err);
  return Response.json({ error: err }, { status: 500 });
}

const engines: Record<string, (prompt: string) => Promise<any>> = {
  google: (prompt: string) =>
    genAI
      .getGenerativeModel({ model: "gemini-2.5-flash" })
      .generateContent(prompt),
  openai: (prompt: string) =>
    openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      n: 1,
      temperature: 0,
      model: "gpt-4o",
      // model: "gpt-4",
    }),
  anthropic: (prompt: string) =>
    anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
};

export const genericHandler =
  <A>(prompt: (input: A) => string, bodyGetter: (string: string) => A) =>
  async (req: Request, context: Context) => {
    let promptInput;
    try {
      const body: string = await req.text();
      promptInput = bodyGetter(body || "");
    } catch (e) {
      console.log(e);
      return errorResponse("Bad submit");
    }
    const queryString = new URL(req.url).searchParams;
    const engine = queryString.get("engine");
    if (!engine) {
      return errorResponse("No engine");
    }
    if (typeof engine !== "string" || !engines[engine]) {
      return errorResponse("Bad engine");
    }
    const content = prompt(promptInput);
    console.log(engine, content);
    const result = await engines[engine](content);
    console.log(result);
    return Response.json(result, { status: 200 });
  };
