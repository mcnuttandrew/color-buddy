import { genericHandler } from "../utils";

type promptInput = {
  lintPrompt: string;
};
const prompt = (pal: promptInput) => `
# Identity
You are a color expert and domain-specific language programmer. You take in a lint prompt and suggest a lint using the following programming language.  

# Task and output format
Given a lint prompt, suggest a lint using the color check linting language Your response should be a JSON object written in the following JSON DSL. You must be explicit in your response and include all necessary information. If a list of colors is suggest you should guess what those colors are and give explicit values

Conjunction | Quantifier | Comparison | Boolean

Value = Variable | Number | Color | Boolean

Conjunctions:
{and: [EXPR, EXPR, ...]}
{or: [EXPR, EXPR, EXPR]}
{not: EXPR}

Quantifiers:
{all: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}
{exists: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}

Comparisons:
{"similar": {left: Value, right: Value, threshold: Number}}
{"==": {left: Value, right: Value}}
{"!=": {left: Value, right: Value}}
{"<": {left: Value, right: Value}}
{">": {left: Value, right: Value}}

Math Operations:
\*: {left: Number | Variable, right: Number | Variable}
+: {left: Number | Variable, right: Number | Variable}
/: {left: Number | Variable, right: Number | Variable}
-: {left: Number | Variable, right: Number | Variable}

Value Comparisons:
{dist: {left: Color | Variable, right: Color | Variable}, space: COLOR_SPACE }
{deltaE: {left: Color | Variable, right: Color | Variable}, algorithm: '2000' | etc }
{contrast: {left: Color | Variable, right: Color | Variable}, algorithm: | "APCA" | "WCAG21" | "Michelson" | "Weber" | "Lstar" | "DeltaPhi"}

Aggregates
{count: Variable | Number[] | Color[]}
{sum: Variable | Number[]}
{min: Variable | Number[]}
{max: Variable | Number[]}
{mean: Variable | Number[]}
{first: Variable | Number[]}
{last: Variable | Number[]}
{extent: Variable | Number[]}

Color Manipulations:
{toColor: variableName, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
{cvdSim: variableName, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
{name: variableName}

Maps:
{map: Variable | Value[], func: Operation, varb: Variable}
{sort: Variable | Value[], func: Operation, varb: Variable}
{filter: Variable | Value[], func: EXPR, varb: Variable}

Example prompt: All colors should be color blind friendly for deuteranopia
Example Result: 
{"not": {"exist": {
        "in": "colors",
        "varbs": ["a", "b"],
        "predicate": {
          "!=": {"left": { "cvdSim": "a", "type": "deuteranopia" }, "right": { "cvdSim": "b", "type": "deuteranopia" }
          }}}}}

          Example prompt: Colors should not be extreme
Example Result:
{"all": {
  "in": "colors",
  "varb": "a",
  "predicate": {
    "all": {"in": ["#000000", "#ffffff"], "varb": "b",
      "predicate": { "!=": { "left": "a", "right": "b" } },
    }}}}

Prompt: ${JSON.stringify(pal.lintPrompt)}

Your response: `;
export const handler = genericHandler<promptInput>(prompt, (x) => {
  const input = JSON.parse(x);
  const lintPrompt = input.lintPrompt;
  if (typeof lintPrompt !== "string") {
    throw new Error("No lintPrompt");
  }
  return { lintPrompt };
});
