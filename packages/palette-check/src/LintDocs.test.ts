import { BUILT_INS } from "./linter";
import { prettyPrintLL } from "./lint-language/lint-language";
import { expect, test } from "vitest";
import type { CustomLint } from "./ColorLint";
import fs from "fs/promises";

const testCaseToText = (
  tests:
    | CustomLint["expectedFailingTests"]
    | CustomLint["expectedPassingTests"],
  type: "pass" | "fail"
) => {
  if (tests.length === 0) {
    return "";
  }
  const testMsgs = tests
    .map(
      (x) =>
        `- ${x.colors
          .map((y) => {
            const hex = y.color.toHex();
            const tags = y.tags.length ? ` (${y.tags.join(", ")})` : "";
            return `${hex}${tags}`;
          })
          .join(", ")} with a ${x.background.toHex()} background`
    )
    .join("\n\n");

  return `
Palettes that will ${type} this test:

${testMsgs}

`;
};

function lintToText(lint: CustomLint) {
  return `
### ${lint.name} [${lint.taskTypes.join(", ")}] ${
    lint.requiredTags.length
      ? `tags required: (${lint.requiredTags.join(", ")})`
      : ""
  }

Description: ${lint.description}

Natural Language: ${prettyPrintLL(JSON.parse(lint.program))}
${testCaseToText(lint.expectedFailingTests || [], "fail")}
${testCaseToText(lint.expectedPassingTests || [], "pass")}
Program:

\`\`\`json
${lint.program}
\`\`\`

    `;
}

async function buildDocs() {
  const aiDocs = await fs.readFile("./src/ai-docs.md", "utf-8");

  const examples = BUILT_INS.map(lintToText).join("\n\n\n");
  const newDocs = `# Language Docs

These docs provide a high-level overview of the language and its built-in functions. The first section covers the syntax of the language in its concrete JSON syntax, with a particular set of notes meant to guide LLM usage of the language. The second section provides all of the built in lints as examples.

${aiDocs}

# Examples

${examples}

  `;

  await fs.writeFile("./docs/lang-docs.md", newDocs.trim());
}

test("Docs have not changed", async () => {
  await buildDocs();
  const docs = await fs.readFile("./docs/lang-docs.md", "utf-8");
  expect(docs).toMatchSnapshot();
});
