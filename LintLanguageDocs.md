Conjunctions:
AND: {and: [EXPR, EXPR, ...]}
OR: {or: [EXPR, EXPR, EXPR]}
NOT: {not: EXPR}

Quantifiers:
FORALL: {all: {value: VARIABLE NAME, where?: PREDICATE, input: VARIABLE NAME | ARRAY}}
EXISTS: {exists: {value: VARIABLE NAME, where?: PREDICATE, input: VARIABLE NAME | ARRAY}}

Comparisons:
equal: {"==": [EXPR, EXPR]}
not equal: {"!=": [EXPR, EXPR]}
less than: {"<": [EXPR, EXPR]}
greater than: {">": [EXPR, EXPR]}

Operations:
sum: {sum: [number, number]} | CAN WE DO VARIABLES FOR THIS?
min: {min: [number, number]} | CAN WE DO VARIABLES FOR THIS?
max: {max: [number, number]} | CAN WE DO VARIABLES FOR THIS?
-- TODO MEAN
toColor: {toColor: variableName, space: 'lab' | 'hsl' | etc, channel: 'a' | 'b' | 'l' | etc}
cvd_sim: {cvd_sim: variableName, type: 'protanomaly' | 'deuteranomaly' | 'tritanopia' | 'grayscale'}
name: {name: variableName}
