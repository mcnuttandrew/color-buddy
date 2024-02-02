Expressions
EXPR = Conjunction | Quantifier | Comparison | Boolean

Conjunctions:
AND: {and: [EXPR, EXPR, ...]}
OR: {or: [EXPR, EXPR, EXPR]}
NOT: {not: EXPR}

Quantifiers:
FORALL: {all: {value: Variable, where?: EXPR, in: Variable | Value[]}}
EXISTS: {exists: {value: Variable, where?: EXPR, in: Variable | Value[]}}

Comparisons (value) => expression
similar: {"similar": {left: Value, right: Value, similarityThreshold: Number}}
equal: {"==": {left: Value, right: Value}}
not equal: {"!=": {left: Value, right: Value}}
less than: {"<": {left: Value, right: Value}}
greater than: {">": {left: Value, right: Value}}

Value = Variable | Number | Color | Boolean

Operations:
count: {count: Variable | Number[] | Color[]}
sum: {sum: Variable | Number[]}
min: {min: Variable | Number[]}
max: {max: Variable | Number[]}
mean: {mean: Variable | Number[]}
toColor: {toColor: variableName, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
cvd_sim: {cvd_sim: variableName, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
name: {name: variableName}