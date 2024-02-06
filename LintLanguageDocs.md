Expressions
EXPR = Conjunction | Quantifier | Comparison | Boolean

Conjunctions:
AND: {and: [EXPR, EXPR, ...]}
OR: {or: [EXPR, EXPR, EXPR]}
NOT: {not: EXPR}

Quantifiers:
FORALL: {all: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}
EXISTS: {exists: {varbs: Variable[], predicate: EXPR, where?: EXPR, in: Variable | Value[]}}

Comparisons (value) => expression
similar: {"similar": {left: Value, right: Value, threshold: Number}}
equal: {"==": {left: Value, right: Value}}
not equal: {"!=": {left: Value, right: Value}}
less than: {"<": {left: Value, right: Value}}
greater than: {">": {left: Value, right: Value}}

Value = Variable | Number | Color | Boolean

Operations:
*: {left: Number | Variable, right: Number | Variable}
+: {left: Number | Variable, right: Number | Variable}
/: {left: Number | Variable, right: Number | Variable}
-: {left: Number | Variable, right: Number | Variable}
dist: {left: Color | Variable, right: Color | Variable, space: COLOR_SPACE }
deltaE: {left: Color | Variable, right: Color | Variable, algorithm: '2000' | etc }
contrast: {left: Color | Variable, right: Color | Variable, algorithm: | "APCA" | "WCAG21" | "Michelson" | "Weber" | "Lstar" | "DeltaPhi"}
count: {count: Variable | Number[] | Color[]}
sum: {sum: Variable | Number[]}
min: {min: Variable | Number[]}
max: {max: Variable | Number[]}
mean: {mean: Variable | Number[]}
first: {first: Variable | Number[]}
last: {last: Variable | Number[]}
extent: {extent: Variable | Number[]}
toColor: {toColor: variableName, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
cvd_sim: {cvd_sim: variableName, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
name: {name: variableName}
map: {map: Variable | Value[], func: Operation}
sort: {sort: Variable | Value[], func: Operation}
filter: {filter: Variable | Value[], func: EXPR}
