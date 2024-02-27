import { BUILT_INS } from "./linter";
import { prettyPrintLL } from "./lint-language/lint-language";
import { expect, test } from "vitest";
import fs from "fs/promises";

async function buildDocs() {
  const aiDocs = await fs.readFile("./src/lib/ai-docs.md", "utf-8");

  const examples = BUILT_INS.map((lint) => {
    return `
### ${lint.name}

Description: ${lint.description}

Natural Language: ${prettyPrintLL(JSON.parse(lint.program))}

Program:

\`\`\`json
${lint.program}
\`\`\`

    `;
  }).join("\n\n\n");

  const newDocs = `# Language Docs

These docs provide a high-level overview of the language and its built-in functions. The first section covers the syntax of the language in its concrete JSON syntax, with a particular set of notes meant to guide LLM usage of the language. The second section provides all of the built in lints as examples.

${aiDocs}

# Examples

${examples}

  `;

  await fs.writeFile("./lang-docs.md", newDocs.trim());
}

test("Docs have not changed", async () => {
  await buildDocs();
  const docs = await fs.readFile("./lang-docs.md", "utf-8");
  expect(docs).toMatchSnapshot();
});
