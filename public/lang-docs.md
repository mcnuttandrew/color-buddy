# Language Docs

These docs provide a high-level overview of the language and its built-in functions. The first section covers the syntax of the language in its concrete JSON syntax, with a particular set of notes meant to guide LLM usage of the language. The second section provides all of the built in lints as examples.

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


# Examples


### Saturated not appropriate for serious affect

Description: Highly saturated light colors are not appropriate for palettes that seek to be serious.  See "Affective color in visualization" for more.

Natural Language: ALL c in colors WHERE hsl.l(c) > 70, NOT hsl.s(c) > 70

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "c", 
        "where": {
            ">": { "left": {"hsl.l": "c"}, "right": 70 }
        }, 
        "predicate": {
            "not": {
                ">": { "left": {"hsl.s": "c"}, "right": 70 }
            }
        }
    }
}

```

    



### Saturated not appropriate for trustworthy affect

Description: Highly saturated light colors are not appropriate for palettes that seek to be trustworthy.  See "Affective color in visualization" for more.

Natural Language: ALL c in colors WHERE hsl.l(c) > 70, NOT hsl.s(c) > 70

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "c", 
        "where": {
            ">": { "left": {"hsl.l": "c"}, "right": 70 }
        }, 
        "predicate": {
            "not": {
                ">": { "left": {"hsl.s": "c"}, "right": 70 }
            }
        }
    }
}

```

    



### Saturated not appropriate for calm affect

Description: Highly saturated light colors are not appropriate for palettes that seek to be calm.  See "Affective color in visualization" for more.

Natural Language: ALL c in colors WHERE hsl.l(c) > 70, NOT hsl.s(c) > 70

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "c", 
        "where": {
            ">": { "left": {"hsl.l": "c"}, "right": 70 }
        }, 
        "predicate": {
            "not": {
                ">": { "left": {"hsl.s": "c"}, "right": 70 }
            }
        }
    }
}

```

    



### Playful affect issues

Description: Palettes that seek to be playful should have at least one light blue, beige, or gray.  See "Affective color in visualization" for more.

Natural Language: EXIST c in colors, (similar(c, #add8e6) < 20 or similar(c, #f5f5dc) < 20 or similar(c, #808080) < 20)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "exist": {
        "in": "colors", 
        "varb": "c", 
        "predicate": {
            "or": [
                { "similar": {"left": "c", "right": "lightblue", "threshold": 20} }, 
                { "similar": {"left": "c", "right": "beige"    , "threshold": 20} }, 
                { "similar": {"left": "c", "right": "gray"     , "threshold": 20} }  
            ]
        }
    }
}

```

    



### Dark reds and browns are not positive

Description: Palettes that seek to be positive should not have dark reds or browns.  See "Affective color in visualization" for more.

Natural Language: ALL c in colors, NOT (similar(c, #8b0000) < 20 or similar(c, #a52a2a) < 20)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "c", 
        "predicate": {
            "not": {
                "or": [
                    { "similar": {"left": "c", "right": "darkred", "threshold": 20} }, 
                    { "similar": {"left": "c", "right": "brown"  , "threshold": 20} }  
                ]
            }
        }
    }
}

```

    



### Negative palette affect issues

Description: Palettes that seek to be negative should not have light colors, particularly greens.  See "Affective color in visualization" for more.

Natural Language: ALL c in colors, NOT (similar(c, #008000) < 20 or lab.l(c) > 70)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "c", 
        "predicate": {
            "not": {
                "or": [
                    { "similar": {"left": "c", "right": "green", "threshold": 20} }, 
                    {
                        ">": { "left": {"lab.l": "c"}, "right": 70 }
                    }
                ]
            }
        }
    }
}

```

    



### Colorblind Friendly for deuteranopia

Description: All colors in a palette should be differentiable by people with deuteranopia (ie can't see green). This is because if they are not, then they will not be differentiable from each other in some contexts.

Natural Language: ALL (a, b) in colors WHERE index(a) != index(b), NOT similar(cvdSim(a, deuteranopia), cvdSim(b, deuteranopia)) < 9

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": { "!=": {"left": "index(a)", "right": "index(b)"} }, 
        "predicate": {
            "not": {
                "similar": {
                    "left": {"cvdSim": "a", "type": "deuteranopia"}, 
                    "right": {"cvdSim": "b", "type": "deuteranopia"}, 
                    "threshold": 9
                }
            }
        }
    }
}

```

    



### Colorblind Friendly for protanopia

Description: All colors in a palette should be differentiable by people with protanopia (ie can't see red). This is because if they are not, then they will not be differentiable from each other in some contexts.

Natural Language: ALL (a, b) in colors WHERE index(a) != index(b), NOT similar(cvdSim(a, protanopia), cvdSim(b, protanopia)) < 9

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": { "!=": {"left": "index(a)", "right": "index(b)"} }, 
        "predicate": {
            "not": {
                "similar": {
                    "left": {"cvdSim": "a", "type": "protanopia"}, 
                    "right": {"cvdSim": "b", "type": "protanopia"}, 
                    "threshold": 9
                }
            }
        }
    }
}

```

    



### Colorblind Friendly for tritanopia

Description: All colors in a palette should be differentiable by people with tritanopia (ie can't see blue). This is because if they are not, then they will not be differentiable from each other in some contexts.

Natural Language: ALL (a, b) in colors WHERE index(a) != index(b), NOT similar(cvdSim(a, tritanopia), cvdSim(b, tritanopia)) < 9

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": { "!=": {"left": "index(a)", "right": "index(b)"} }, 
        "predicate": {
            "not": {
                "similar": {
                    "left": {"cvdSim": "a", "type": "tritanopia"}, 
                    "right": {"cvdSim": "b", "type": "tritanopia"}, 
                    "threshold": 9
                }
            }
        }
    }
}

```

    



### Right in black and white

Description: All colors in a palette should be differentiable by people with grayscale . This is because if they are not, then they will not be differentiable from each other in some contexts.

Natural Language: ALL (a, b) in colors WHERE index(a) != index(b), NOT similar(cvdSim(a, grayscale), cvdSim(b, grayscale)) < 9

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": { "!=": {"left": "index(a)", "right": "index(b)"} }, 
        "predicate": {
            "not": {
                "similar": {
                    "left": {"cvdSim": "a", "type": "grayscale"}, 
                    "right": {"cvdSim": "b", "type": "grayscale"}, 
                    "threshold": 9
                }
            }
        }
    }
}

```

    



### Fair

Description: Do the colors stand out equally? A color palette is described as fair if both chroma and luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold.

Natural Language: (extent(sort(colors, x => lch.l(x))) < 50 and extent(sort(colors, x => lch.c(x))) < 80)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "and": [
        {
            "<": {
                "left": {
                    "extent": { "sort": "colors", "varb": "x", "func": {"lch.l": "x"} }
                }, 
                "right": 50
            }
        }, 
        {
            "<": {
                "left": {
                    "extent": { "sort": "colors", "varb": "x", "func": {"lch.c": "x"} }
                }, 
                "right": 80
            }
        }
    ]
}

```

    



### Fair

Description: Do the colors stand out equally? A color palette is described as fair if the luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold. 

Natural Language: (extent(sort(colors, x => lch.l(x))) < 50)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "and": [
        {
            "<": {
                "left": {
                    "extent": { "sort": "colors", "varb": "x", "func": {"lch.l": "x"} }
                }, 
                "right": 50
            }
        }
    ]
}

```

    



### Background desaturation sufficient

Description: Background should be sufficiently desaturated. 

Natural Language: (((hsl.l(background) > 90 and hsv.s(background) < 8) or hsl.l(background) > 99) or (hsl.l(background) > 10 and hsl.l(background) < 26 and hsv.s(background) < 21))

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "or": [
        {
            "or": [
                {
                    "and": [
                        {
                            ">": { "left": {"hsl.l": "background"}, "right": 90 }
                        }, 
                        {
                            "<": { "left": {"hsv.s": "background"}, "right": 8 }
                        }
                    ]
                }, 
                {
                    ">": { "left": {"hsl.l": "background"}, "right": 99 }
                }
            ]
        }, 
        {
            "and": [
                {
                    ">": { "left": {"hsl.l": "background"}, "right": 10 }
                }, 
                {
                    "<": { "left": {"hsl.l": "background"}, "right": 26 }
                }, 
                {
                    "<": { "left": {"hsv.s": "background"}, "right": 21 }
                }
            ]
        }
    ]
}

```

    



### Avoid Tetradic Palettes

Description: Tetradic palettes are hard to work with and are not recommended.

Natural Language: NOT EXIST a in colors, (EXIST b in colors, similar(hsl.h(a), hsl.h(b) + 90) < 5 and EXIST b in colors, similar(hsl.h(a), hsl.h(b) + 90) < 5 and EXIST b in colors, similar(hsl.h(a), hsl.h(b) + 90) < 5)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "not": {
        "exist": {
            "varb": "a", 
            "in": "colors", 
            "predicate": {
                "and": [
                    {
                        "exist": {
                            "varb": "b", 
                            "in": "colors", 
                            "predicate": {
                                "similar": {
                                    "left": {"hsl.h": "a"}, 
                                    "right": {
                                        "+": { "left": {"hsl.h": "b"}, "right": 90 }
                                    }, 
                                    "threshold": 5
                                }
                            }
                        }
                    }, 
                    {
                        "exist": {
                            "varb": "b", 
                            "in": "colors", 
                            "predicate": {
                                "similar": {
                                    "left": {"hsl.h": "a"}, 
                                    "right": {
                                        "+": { "left": {"hsl.h": "b"}, "right": 90 }
                                    }, 
                                    "threshold": 5
                                }
                            }
                        }
                    }, 
                    {
                        "exist": {
                            "varb": "b", 
                            "in": "colors", 
                            "predicate": {
                                "similar": {
                                    "left": {"hsl.h": "a"}, 
                                    "right": {
                                        "+": { "left": {"hsl.h": "b"}, "right": 90 }
                                    }, 
                                    "threshold": 5
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
}

```

    



### Prefer yellowish or blueish greens

Description: When using green, make it a yellow or blue one. This makes it easier to play nicely with other colors.

Natural Language: ALL a in colors, (hsl.h(a) < 90 or hsl.h(a) > 150)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "varb": "a", 
        "in": "colors", 
        "predicate": {
            "or": [
                {
                    "<": { "left": {"hsl.h": "a"}, "right": 90 }
                }, 
                {
                    ">": { "left": {"hsl.h": "a"}, "right": 150 }
                }
            ]
        }
    }
}

```

    



### Avoid too much contrast with the background

Description: Don't make your colors too dark and saturated when you're using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels.

Natural Language: ((hsl.l(background) > 50 and ALL a in colors, contrast(a, background, WCAG21) < 10) or hsl.l(background) < 50)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "or": [
        {
            "and": [
                {
                    ">": { "left": {"hsl.l": "background"}, "right": 50 }
                }, 
                {
                    "all": {
                        "varb": "a", 
                        "in": "colors", 
                        "predicate": {
                            "<": {
                                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                                "right": 10
                            }
                        }
                    }
                }
            ]
        }, 
        {
            "<": { "left": {"hsl.l": "background"}, "right": 50 }
        }
    ]
}

```

    



### Require color complements

Description: Use color complements whenever possible

Natural Language: EXIST (a, b) in colors, similar(hsl.h(a), hsl.h(b) + 180) < 5

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "exist": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "predicate": {
            "similar": {
                "left": {"hsl.h": "a"}, 
                "right": {
                    "+": { "left": {"hsl.h": "b"}, "right": 180 }
                }, 
                "threshold": 5
            }
        }
    }
}

```

    



### Mark size legibility: Thin

Description: Pairs of colors in a palette should be differentiable from each other in Thin marks. 

Natural Language: ALL (x, y) in colors WHERE index(x) != index(y), (lab.l(x) absDiff lab.l(y) > 12.58 or lab.a(x) absDiff lab.a(y) > 20.740000000000002 or lab.b(x) absDiff lab.b(y) > 34.05)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["x", "y"], 
        "where": { "!=": {"left": "index(x)", "right": "index(y)"} }, 
        "predicate": {
            "or": [
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.l": "x"}, "right": {"lab.l": "y"} }
                        }, 
                        "right": 12.58
                    }
                }, 
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.a": "x"}, "right": {"lab.a": "y"} }
                        }, 
                        "right": 20.740000000000002
                    }
                }, 
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.b": "x"}, "right": {"lab.b": "y"} }
                        }, 
                        "right": 34.05
                    }
                }
            ]
        }
    }
}

```

    



### Mark size legibility: Medium

Description: Pairs of colors in a palette should be differentiable from each other in Medium marks. 

Natural Language: ALL (x, y) in colors WHERE index(x) != index(y), (lab.l(x) absDiff lab.l(y) > 6.58 or lab.a(x) absDiff lab.a(y) > 8.42 or lab.b(x) absDiff lab.b(y) > 11.09)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["x", "y"], 
        "where": { "!=": {"left": "index(x)", "right": "index(y)"} }, 
        "predicate": {
            "or": [
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.l": "x"}, "right": {"lab.l": "y"} }
                        }, 
                        "right": 6.58
                    }
                }, 
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.a": "x"}, "right": {"lab.a": "y"} }
                        }, 
                        "right": 8.42
                    }
                }, 
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.b": "x"}, "right": {"lab.b": "y"} }
                        }, 
                        "right": 11.09
                    }
                }
            ]
        }
    }
}

```

    



### Mark size legibility: Wide

Description: Pairs of colors in a palette should be differentiable from each other in Wide marks. 

Natural Language: ALL (x, y) in colors WHERE index(x) != index(y), (lab.l(x) absDiff lab.l(y) > 5.83 or lab.a(x) absDiff lab.a(y) > 6.88 or lab.b(x) absDiff lab.b(y) > 8.219999999999999)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["x", "y"], 
        "where": { "!=": {"left": "index(x)", "right": "index(y)"} }, 
        "predicate": {
            "or": [
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.l": "x"}, "right": {"lab.l": "y"} }
                        }, 
                        "right": 5.83
                    }
                }, 
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.a": "x"}, "right": {"lab.a": "y"} }
                        }, 
                        "right": 6.88
                    }
                }, 
                {
                    ">": {
                        "left": {
                            "absDiff": { "left": {"lab.b": "x"}, "right": {"lab.b": "y"} }
                        }, 
                        "right": 8.219999999999999
                    }
                }
            ]
        }
    }
}

```

    



### Avoid extreme colors

Description: Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against.

Natural Language: ALL a in colors, ALL b in ([#000, #fff, #00f, #f00, #0f0]), NOT similar(a, b) < 12

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            "all": {
                "in": ["#000000", "#ffffff", "#0000ff", "#ff0000", "#00ff00"], 
                "varb": "b", 
                "predicate": {
                    "not": { "similar": {"left": "a", "right": "b", "threshold": 12} }
                }
            }
        }
    }
}

```

    



### Background Contrast

Description: All colors in a palette should have a sufficient contrast ratio with the background color. This is because if they are not, then they will not be differentiable from each other in some contexts. Valid algorithms are "APCA", "WCAG21", "Michelson", "Weber", "Lstar", "DeltaPhi".

Natural Language: ALL a in colors, contrast(a, background, WCAG21) > 1.1

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            ">": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                "right": 1.1
            }
        }
    }
}

```

    



### Colors distinguishable in order

Description: Opt for colors that are perceptually distinguishable in a logical sequence when designing visual elements like charts or graphs. This ensures that viewers can easily recognize the order or progression of data points. For categorical this means that when only a small number of colors are used, they should be as different as possible. For sequential and diverging, this means that the colors should be as different as possible in order.

Natural Language: ALL (a, b) in colors WHERE index(a) == index(b) - 1, deltaE(a, b, 2000) > 10

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": {
            "==": {
                "left": "index(a)", 
                "right": { "-": {"left": "index(b)", "right": 1} }
            }
        }, 
        "predicate": {
            ">": {
                "left": { "deltaE": {"left": "a", "right": "b"}, "algorithm": "2000" }, 
                "right": 10
            }
        }
    }
}

```

    



### Even Distribution

Description: Categorical values should have an even distribution around the hue circle in LCH color space

Natural Language: (std(speed(sort(colors, x => lch.h(x)),   =>  )) < 10 or std(speed(sort(colors, x => lch.h(x) + 180 % 360),   =>  )) < 10)

Program:

```json
{
    "$schema": "http://localhost:8888/lint-schema.json", 
    "or": [
        {
            "<": {
                "left": {
                    "std": {
                        "speed": { "sort": "colors", "func": {"lch.h": "x"}, "varb": "x" }
                    }
                }, 
                "right": 10
            }
        }, 
        {
            "<": {
                "left": {
                    "std": {
                        "speed": {
                            "sort": "colors", 
                            "varb": "x", 
                            "func": {
                                "%": {
                                    "left": {
                                        "+": { "left": {"lch.h": "x"}, "right": 180 }
                                    }, 
                                    "right": 360
                                }
                            }
                        }
                    }
                }, 
                "right": 10
            }
        }
    ]
}

```

    



### In Gamut

Description: Checks if the colors are in the sRGB gamut. This is important to ensure that the colors are visible and can be displayed on most devices.

Natural Language: ALL a in colors, inGamut(a) == TRUE

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            "==": { "left": {"inGamut": "a"}, "right": true }
        }
    }
}

```

    



### Max Colors

Description: Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.

Natural Language: count(colors) < 11

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "<": { "left": {"count": "colors"}, "right": 11 }
}

```

    



### Mutually Distinct

Description: All colors in a palette should be different from each other. This is because if they are not, then they will not be differentiable from each other in some contexts.

Natural Language: ALL (a, b) in colors WHERE index(a) != index(b), dist(a, b, lab) > 15

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": { "!=": {"left": "index(a)", "right": "index(b)"} }, 
        "predicate": {
            ">": {
                "left": { "dist": {"left": "a", "right": "b"}, "space": "lab" }, 
                "right": 15
            }
        }
    }
}

```

    



### Color Name Discriminability

Description: Being able to identify colors by name is important for usability and for memorability.

Natural Language: ALL (a, b) in colors WHERE index(a) != index(b), name(a) != name(b)

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varbs": ["a", "b"], 
        "where": { "!=": {"left": "index(a)", "right": "index(b)"} }, 
        "predicate": {
            "!=": { "left": {"name": "a"}, "right": {"name": "b"} }
        }
    }
}

```

    



### Sequential Pal Order

Description: Sequential palettes should be ordered by lightness. This is a defining property of a sequential palette and ensures that values are understood as having an increase (or decreasing) value.

Natural Language: (sort(colors, x => lch.l(x)) == map(colors, x => lch.l(x)) or sort(colors, x => lch.l(x)) == reverse(map(colors, x => lch.l(x)),   =>  ))

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "or": [
        {
            "==": {
                "left" : { "sort": "colors", "varb": "x", "func": {"lch.l": "x"}                  }, 
                "right": {                   "varb": "x", "func": {"lch.l": "x"}, "map": "colors" }  
            }
        }, 
        {
            "==": {
                "left": { "sort": "colors", "varb": "x", "func": {"lch.l": "x"} }, 
                "right": {
                    "reverse": { "map": "colors", "varb": "x", "func": {"lch.l": "x"} }
                }
            }
        }
    ]
}

```

    



### Palette does not have ugly colors

Description: Colors that are close to what are known as ugly colors are sometimes advised against. See https://www.colourlovers.com/palette/1416250/The_Ugliest_Colors for more details.

Natural Language: ALL a in colors, ALL b in ([#56ff00, #0010ff, #6a7e25, #ff00ef, #806e28]), deltaE(a, b, 2000) > 10

Program:

```json
{
    "$schema": "http://localhost:3000/lint-schema.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            "all": {
                "in": ["#56FF00", "#0010FF", "#6A7E25", "#FF00EF", "#806E28"], 
                "varb": "b", 
                "predicate": {
                    ">": {
                        "left": { "deltaE": {"left": "a", "right": "b"}, "algorithm": "2000" }, 
                        "right": 10
                    }
                }
            }
        }
    }
}

```