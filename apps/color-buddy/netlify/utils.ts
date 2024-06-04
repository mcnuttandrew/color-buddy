import OpenAI from "openai";
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
});

export function errorResponse(callback, err) {
  console.error(err);

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({ error: err }),
  });
}

const engines = {
  google: (prompt: string) => model.generateContent(prompt),
  openai: (prompt: string) =>
    openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      // model: "gpt-3.5-turbo",
      n: 1,
      temperature: 0,
      model: "gpt-4o",
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

export const genericHandler =
  <A>(prompt: (input: A) => string, bodyGetter: (string) => A) =>
  async (event, _context, callback) => {
    let promptInput;
    try {
      promptInput = bodyGetter(event.body);
    } catch (e) {
      console.log(e);
      errorResponse(callback, "Bad submit");
      return;
    }
    const engine = event.queryStringParameters.engine;
    if (!engine) {
      errorResponse(callback, "No engine");
      return;
    }
    if (typeof engine !== "string" || !engines[engine]) {
      errorResponse(callback, "Bad engine");
      return;
    }
    const content = prompt(promptInput);
    console.log(engine, content);
    const result = await engines[engine](content);
    console.log(result);
    callback(null, { statusCode: 200, body: JSON.stringify(result) });
  };
