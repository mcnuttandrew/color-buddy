import { genericHandler } from "../utils";

type promptInput = {
  lintPrompt: string;
};
const prompt = (pal: promptInput) => `

# Color check language documentation

A valid program starts with an expression, as described below. The only allowed syntax is listed here.

Expressions
Conjunction | Quantifier | Comparison | Boolean

Value = Variable | Number | Boolean | ColorString
Notes:

- ColorString: strings defined using web valid hex colors, such as #ff00ff
- Variable is a string that is a variable name

Predefined variables: colors, background

Conjunctions:
{and: [EXPR, EXPR, ...]}
{or: [EXPR, EXPR, EXPR]}
{not: EXPR}

Quantifiers
{all: {varbs: Variable, predicate: EXPR, where?: EXPR, in: Variable | Map}}
{exist: {varbs: Variable, predicate: EXPR, where?: EXPR, in: Variable | Map}}
Notes:

- varbs each listed variable into the scope, as well as variables like index(a) for a variable a
- To slice you might do something like {...where: {"<" : {"left": "index(a)", "right": 3}}}. This is important! There is no other way to subset or filter for quantifiers. THE IN CLAUSE MUST ONLY HAVE A VARIABLE AND THING ELSE.

Comparisons:
{"==": {left: Value, right: Value}}
{"!=": {left: Value, right: Value}}
{"<": {left: Value, right: Value}}
{">": {left: Value, right: Value}}
{"similar": {left: Value, right: Value, threshold: Number}}
Notes

- Threshold has units of dE2000s, so 10 would be glance-ably different.

Math Operations:
{"\*": {left: Number | Variable, right: Number | Variable}}
{"+": {left: Number | Variable, right: Number | Variable}}
{"/": {left: Number | Variable, right: Number | Variable}}
{"-": {left: Number | Variable, right: Number | Variable}}
{absDiff: {left: Number | Variable, right: Number | Variable}}
{"%": {left: Number | Variable, right: Number | Variable}}

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
{std: Variable | Number[]}
{first: Variable | Number[]}
{last: Variable | Number[]}
{extent: Variable | Number[]}

Color Manipulations:
{toSpace: Variable, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
{cvdSim: Variable, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
{name: Variable}
{inGamut: Variable | Color}
{isTag: Variable | Color, value: string}
Notes

- toSpace has a shorthand like {"rgb.b": Variable}
- When comparing colors, it can be helpful to switch color spaces. For instance, to check if a value is blue you might switch it to HSL and check if the hue is in a certain range.

Maps:
{map: Variable | Value[], func: Operation, varb: Variable}
{sort: Variable | Value[], func: Operation, varb: Variable}
{filter: Variable | Value[], func: EXPR, varb: Variable}
{reverse: Variable | Value[]}
{speed: Variable | Value[]}


# LintProgram Examples

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


# Identity
You are a color expert and domain-specific language programmer. You take in a lint prompt and suggest a lint using the following programming language.  You are very good at your job you do not make mistakes. 

# Task and output format
Given a lint prompt, suggest a lint using the color check linting language Your response should be a JSON object written in the following JSON DSL. You must be explicit in your response and include all necessary information. If a list of colors is suggest you should guess what those colors are and give explicit values.

You should include an extra field in your output called "comments" that explains your reasoning for the lint. This is a string.  
  
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
