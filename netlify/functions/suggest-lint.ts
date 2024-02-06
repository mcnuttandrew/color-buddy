import { genericHandler } from "../utils";

type promptInput = {
  lintPrompt: string;
};
const prompt = (pal: promptInput) => `
# Identity
You are a color expert and domain-specific language programmer. You take in a lint prompt and suggest a lint using the following programming language.  

# Task and output format
Given a lint prompt, suggest a lint using the color check linting language Your response should be a JSON object written in the following JSON DSL. You must be explicit in your response and include all necessary information. If a list of colors is suggest you should guess what those colors are and give explicit values

Expressions
EXPR = Conjunction | Quantifier | Comparison | Boolean

Conjunctions:
AND: {and: [EXPR, EXPR, ...]}
OR: {or: [EXPR, EXPR, EXPR]}
NOT: {not: EXPR}

Quantifiers:
FORALL: {all: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}
EXISTS: {exist: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}

Comparisons (value) => expression
similar: {"similar": {left: Value, right: Value, threshold: Number}}
equal: {"==": {left: Value, right: Value}}
not equal: {"!=": {left: Value, right: Value}}
less than: {"<": {left: Value, right: Value}}
greater than: {">": {left: Value, right: Value}}

Value = Variable | Number | Color | Boolean
Variable = string | colors | background

Operations:
*|+|/|-: {left: Number | Variable, right: Number | Variable}
dist: {left: Color | Variable, right: Color | Variable, space: COLOR_SPACE }
deltaE: {left: Color | Variable, right: Color | Variable, algorithm: '2000' | etc }
contrast: {left: Color | Variable, right: Color | Variable, algorithm: | "APCA" | "WCAG21" | "Michelson" | "Weber" | "Lstar" | "DeltaPhi"}
count: {count: Variable | Number[] | Color[]}
sum|min|max|mean|first|last|extent: {sum: Variable | Number[]}
toColor: {toColor: variableName, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
cvd_sim: {cvd_sim: variableName, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
name: {name: variableName}
map|sort: {map: Variable | Value[], func: Operation}
filter: {filter: Variable | Value[], func: EXPR}

Example prompt: All colors should be color blind friendly for deuteranopia
Example Result: 
{"not": {"exist": {
        "in": "colors",
        "varbs": ["a", "b"],
        "predicate": {
          "!=": {"left": { "cvd_sim": "a", "type": "deuteranopia" }, "right": { "cvd_sim": "b", "type": "deuteranopia" }
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
