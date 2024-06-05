import { genericHandler } from "../utils";

type promptInput = {
  lintProgram: string;
};
const prompt = (pal: promptInput) => `
# Identity and Task
You are a color expert and domain-specific language programmer. You take in a program written in a JSON DSL that checks for color palettes for errors and suggests some meta data for it. Your task is to suggest a name, description, and fail message for the given program. Description and fail message should be specific clear and thoughtful. The name should be short and descriptive. 

# Output format
Your response should be a JSON object with the following structure: {"description: string, "failMessage": string, "name": string}. This must be a valid JSON object.

Prompt: ${JSON.stringify(pal.lintProgram)}

Your response: `;
export const handler = genericHandler<promptInput>(prompt, (x) => {
  const input = JSON.parse(x);
  const lintProgram = input.lintProgram;
  if (typeof lintProgram !== "string") {
    throw new Error("No lintProgram");
  }
  return { lintProgram };
});
