import type { Palette } from "color-buddy-palette";
import * as Json from "jsonc-parser";
import { makePalFromString } from "color-buddy-palette";

export type Engine = "openai" | "google" | "anthropic" | "none";

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
  You are making a palette that ${testResult} for this test. YOU MUST make a palette that ${testResult} for this test
  Your newly created palette that ${testResult} for this program as follows:`,
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
${langDoc}

# Identity
You are a color expert and domain-specific language programmer. You take in a lint prompt and suggest a lint using the above programming language.  You are very good at your job you do not make mistakes. 

# Task and output format
Given a lint prompt, suggest a lint using the color check linting language. Your response should be a JSON object written in the above JSON DSL. You must be explicit in your response and include all necessary information. If a list of colors is suggested you should guess what those colors are and give explicit values.

You should include an extra field in your output called "comments" that explains your reasoning for the lint. This is a string.  
  
Prompt: ${JSON.stringify(lintPrompt)}

Your response: `;
  return engineToScaffold[engine]<string>(`ai-call`, prompt, true);
}

export function modifyLintProgram(
  inputPrompt: string,
  program: string,
  palette: Palette,
  engine: Engine
) {
  const prompt = `
${langDoc}

# Task and output format
Given a lint prompt, suggest a lint using the color check linting language. Your response should be a JSON object written in the above JSON DSL. You must be explicit in your response and include all necessary information. If a list of colors is suggested you should guess what those colors are and give explicit values.

ONLY RETURN THE JSON AND NOTHING ELSE. DO NOT MAKE ANY COMMENTS.
  


Program Context: ${program}

Palette: ${JSON.stringify(
    palette.colors.map((x) => x.toHex())
  )} Background Color: ${JSON.stringify(palette.background.toHex())}
Do not consider the palette unless the prompt specifically asks for it. 

Prompt: ${JSON.stringify(inputPrompt)}

Your response: `;
  return engineToScaffold[engine]<string>(`ai-call`, prompt, true);
}

export function modifyPalette(
  inputPrompt: string,
  palette: Palette,
  engine: Engine
) {
  const prompt = `
You are a color expert. You take in a color palette and make requested modifications to it. 

For example:
Palette: ["#000000", "#FF0000", "#00FF00", "#0000FF"]
Background Color: "#FFFFFF" 
Prompt: "Make the colors more pastel."
Output: {"background": "#FFFFFF", "colors": ["#9E9E9E", "#F8BBD0", "#D3EC8A", "#D3D3FF"]}

Present your names a single JSON object. It should have a type like {"background: string; colors: string[]}. 
Unless specified otherwise, it should have EXACTLY the same number of colors as the input. 
Do not offer any other response.

Palette: ${JSON.stringify(palette.colors.map((x) => x.toHex()))}
Background Color: ${JSON.stringify(palette.background.toHex())}
Prompt: ${inputPrompt}
Your response:`;
  return engineToScaffold[engine]<string>(`ai-call`, prompt, true);
}

const langDoc = `

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

`;
