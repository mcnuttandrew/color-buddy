import { PREBUILT_LINTS } from "./linter";
import { prettyPrintLL } from "./lint-language/lint-language";
import { expect, test } from "vitest";
import type { CustomLint } from "./ColorLint";
import fs from "fs/promises";

const DOC_LOCATION = "../../apps/docs/docs/lang-examples.md";

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
### ${lint.name}
**Tasks**: ${lint.taskTypes.join(", ")}
${
  lint.requiredTags.length
    ? `**Tags Required**: (${lint.requiredTags.join(", ")})`
    : ""
}

**Description**: ${lint.description}

**Natural Language**: ${prettyPrintLL(JSON.parse(lint.program))}
${testCaseToText(lint.expectedFailingTests || [], "fail")}
${testCaseToText(lint.expectedPassingTests || [], "pass")}
**Program**:

\`\`\`json
${lint.program}
\`\`\`

    `;
}

function prepName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}

async function buildDocs() {
  const examples = PREBUILT_LINTS.map(lintToText).join("\n\n\n");
  const exampleLinks = PREBUILT_LINTS.map(
    (x) => `- [${x.name}](#${prepName(x.name)})`
  ).join("\n");
  const newDocs = `
# Language Examples

This page contains examples of the language used to define palettes and the expected behavior of the linter.

${exampleLinks}

${examples}

  `;

  await fs.writeFile(DOC_LOCATION, newDocs.trim());
}

test("Docs have not changed", async () => {
  await buildDocs();
  const docs = await fs.readFile(DOC_LOCATION, "utf-8");
  expect(docs).toMatchSnapshot();
});
