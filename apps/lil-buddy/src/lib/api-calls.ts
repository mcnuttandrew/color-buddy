import type { Palette } from "color-buddy-palette";
import * as Json from "jsonc-parser";
import { Color, makePalFromString } from "color-buddy-palette";
import LintWorker from "./lint-worker.worker?worker";
import { summarizePal } from "./utils";
import type { WorkerCommand } from "./worker-types";

export type Engine = "openai" | "google" | "anthropic" | "none";
type SimplePal = { background: string; colors: string[] };
const palToString = (pal: Palette) => ({
  background: pal.background.toHex(),
  colors: pal.colors.map((x) => x.toHex()),
});

const postCreds = {
  method: "POST",
  mode: "cors",
  cache: "no-cache",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  redirect: "follow",
  referrerPolicy: "no-referrer",
} as any;

function openAIScaffold<A>(
  api: string,
  body: string,
  parseAsJSON: boolean
): Promise<A[]> {
  return fetch(`/.netlify/functions/${api}?engine=openai`, {
    ...postCreds,
    body,
  })
    .then((response) => response.json())
    .then((x: any) => {
      console.log(x);
      return x.choices
        .map((x: any) => x?.message?.content)
        .filter((x: any) => x)
        .flatMap((x: any) => (parseAsJSON ? Json.parse(x) : x));
    });
}

function anthropicScaffold<A>(
  api: string,
  body: string,
  parseAsJSON: boolean
): Promise<A[]> {
  return fetch(`/.netlify/functions/${api}?engine=anthropic`, {
    ...postCreds,
    body,
  })
    .then((response) => response.json())
    .then((x: any) => {
      console.log(x);
      return x.content
        .map((x: any) => x?.text)
        .filter((x: any) => x)
        .flatMap((x: any) => (parseAsJSON ? Json.parse(x) : x));
    });
}

function googleScaffold<A>(
  api: string,
  body: string,
  parseAsJSON: boolean
): Promise<A[]> {
  return fetch(`/.netlify/functions/${api}?engine=google`, {
    ...postCreds,
    body,
  })
    .then((response) => response.json())
    .then((x: any) => {
      console.log(x);
      const result = x?.response?.candidates
        .flatMap((x: any) => x.content?.parts?.flatMap((x: any) => x.text))
        .map((x: any) =>
          x.replace(/\\n/g, "").replace(/\`/g, "").replace("json", "").trim()
        )
        .flatMap((x: any) => (parseAsJSON ? Json.parse(x) : x));
      return result;
    });
}

const engineToScaffold = {
  openai: openAIScaffold,
  google: googleScaffold,
  anthropic: anthropicScaffold,
  none: openAIScaffold,
};

async function genericCall(prompt: string, engine: Engine) {
  return engineToScaffold[engine]<string>(`ai-call`, prompt, true);
}

export function generateTest(
  lintProgram: string,
  engine: Engine,
  testResult: "passes" | "fails"
) {
  return genericCall(
    `
  You are an expert tester for a new color palette generator. You are given a lint program that checks for a property. Generate a test that ${testResult}. The test should consist of a new color palette. 
  The lint program is: ${lintProgram}.
  Give your answer with the following type {"colors": hexString[], "background": hexString}.
  Do not offer any preamble. Only given the json response.  You should be creative in your selection of colors.
  Your test palette that ${testResult} for this program as follows:`,
    engine
  ).then((x) => {
    if (x.length === 0) {
      throw new Error("No suggestions");
    }
    return x.map((el: any) => makePalFromString(el.colors, el.background))[0];
  });
}

export function suggestLint(lintPrompt: string, engine: Engine) {
  const prompt = `

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
You are a color expert and domain-specific language programmer. You take in a lint prompt and suggest a lint using the above programming language.  You are very good at your job you do not make mistakes. 

# Task and output format
Given a lint prompt, suggest a lint using the color check linting language. Your response should be a JSON object written in the above JSON DSL. You must be explicit in your response and include all necessary information. If a list of colors is suggested you should guess what those colors are and give explicit values.

You should include an extra field in your output called "comments" that explains your reasoning for the lint. This is a string.  
  
Prompt: ${JSON.stringify(lintPrompt)}

Your response: `;
  return engineToScaffold[engine]<string>(`suggest-lint`, prompt, true);
}
