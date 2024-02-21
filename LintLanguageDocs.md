Expressions
Conjunction | Quantifier | Comparison | Boolean

Value = Variable | Number | Color | Boolean

Conjunctions:
{and: [EXPR, EXPR, ...]}
{or: [EXPR, EXPR, EXPR]}
{not: EXPR}

Quantifiers:
{all: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}
{exist: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}

Comparisons:
{"similar": {left: Value, right: Value, threshold: Number}}
{"==": {left: Value, right: Value}}
{"!=": {left: Value, right: Value}}
{"<": {left: Value, right: Value}}
{">": {left: Value, right: Value}}

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
{toColor: variableName, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
{cvdSim: variableName, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
{name: variableName}
{inGamut: variableName | Color}

Maps:
{map: Variable | Value[], func: Operation, varb: Variable}
{sort: Variable | Value[], func: Operation, varb: Variable}
{filter: Variable | Value[], func: EXPR, varb: Variable}
{reverse: Variable | Value[]}
{speed: Variable | Value[]}
