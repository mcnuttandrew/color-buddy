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
- To slice you might do something like {...where: {"<" : {left: "index(a), right: 3}}}. This is important! There is no other way to subset or filter for quantifiers. THE IN CLAUSE MUST ONLY HAVE A VARIABLE AND THING ELSE.

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
{toColor: Variable, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
{cvdSim: Variable, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
{name: Variable}
{inGamut: Variable | Color}
Notes

- toColor has a shorthand like {"rgb.b": Variable}
- When comparing colors, it can be helpful to switch color spaces. For instance, to check if a value is blue you might switch it to HSL and check if the hue is in a certain range.

Maps:
{map: Variable | Value[], func: Operation, varb: Variable}
{sort: Variable | Value[], func: Operation, varb: Variable}
{filter: Variable | Value[], func: EXPR, varb: Variable}
{reverse: Variable | Value[]}
{speed: Variable | Value[]}