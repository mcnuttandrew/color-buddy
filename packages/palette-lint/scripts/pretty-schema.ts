import fs from "fs/promises";
import { Formatter, FracturedJsonOptions, EolStyle } from "fracturedjsonjs";

const options = new FracturedJsonOptions();
options.MaxTotalLineLength = 120;
options.MaxInlineComplexity = 2;
options.JsonEolStyle = EolStyle.Crlf;

const formatter = new Formatter();
formatter.Options = options;

export function JSONStringify(obj: string) {
  return formatter.Reformat(obj);
}

async function main() {
  const schema = await fs.readFile("./lint-schema.v0.json", "utf-8");
  const prettySchema = JSONStringify(schema);
  await fs.writeFile("./lint-schema.v0.json", prettySchema);
}

main();
