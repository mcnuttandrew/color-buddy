# Language Examples

This page contains examples of the language used to define palettes and the expected behavior of the linter.

- [ Graphical objects contrast](#-graphical-objects-contrast)
- [AA text contrast (text-tagged colors only)](#aa-text-contrast--text-tagged-colors-only-)
- [AAA text contrast (text-tagged colors only)](#aaa-text-contrast--text-tagged-colors-only-)
- [AA text contrast (all colors)](#aa-text-contrast--all-colors-)
- [AAA text contrast (all colors)](#aaa-text-contrast--all-colors-)
- [Saturated not appropriate for serious affect](#saturated-not-appropriate-for-serious-affect)
- [Saturated not appropriate for trustworthy affect](#saturated-not-appropriate-for-trustworthy-affect)
- [Saturated not appropriate for calm affect](#saturated-not-appropriate-for-calm-affect)
- [Playful affects can have light blues, beiges, and grays](#playful-affects-can-have-light-blues--beiges--and-grays)
- [Dark reds and browns are not positive](#dark-reds-and-browns-are-not-positive)
- [Negative palettes should not have light colors, particularly greens](#negative-palettes-should-not-have-light-colors--particularly-greens)
- [Deuteranopia-friendly](#deuteranopia-friendly)
- [Protanopia-friendly](#protanopia-friendly)
- [Tritanopia-friendly](#tritanopia-friendly)
- [Right in black and white](#right-in-black-and-white)
- [Axes should have low contrast with background](#axes-should-have-low-contrast-with-background)
- [Blue should be high probability for the basic color term blue](#blue-should-be-high-probability-for-the-basic-color-term-blue)
- [Even distribution in hue](#even-distribution-in-hue)
- [Even distribution in lightness](#even-distribution-in-lightness)
- [Fair](#fair)
- [Fair](#fair)
- [Background desaturation sufficient](#background-desaturation-sufficient)
- [Avoid tetradic palettes](#avoid-tetradic-palettes)
- [Prefer yellowish or blueish greens](#prefer-yellowish-or-blueish-greens)
- [Avoid too much contrast with the background](#avoid-too-much-contrast-with-the-background)
- [Require color complements](#require-color-complements)
- [Color distinctness: thin-sized objects](#color-distinctness--thin-sized-objects)
- [Color distinctness: medium-sized objects](#color-distinctness--medium-sized-objects)
- [Color distinctness: wide-sized objects](#color-distinctness--wide-sized-objects)
- [Avoid extreme colors](#avoid-extreme-colors)
- [Colors distinguishable in order](#colors-distinguishable-in-order)
- [Diverging palettes order appropriate](#diverging-palettes-order-appropriate)
- [In gamut](#in-gamut)
- [Max colors](#max-colors)
- [Mutually distinct](#mutually-distinct)
- [Color name discriminability](#color-name-discriminability)
- [Sequential palette order appropriate](#sequential-palette-order-appropriate)
- [Palette does not have ugly colors](#palette-does-not-have-ugly-colors)


###  Graphical objects contrast
**Tasks**: sequential, diverging, categorical


**Description**: Colors used need to have sufficient contrast with the background to make them legible, as defined by WCAG21 contrast ratios. For this check (for graphical objects) there should be at least a 3:1 contrast ratio.

**Natural Language**: ALL a IN colors SUCH THAT contrast(a, background, WCAG21) > 3

Palettes that will fail this test:

- #feed72, #f8f4d2, #eb717b with a #fff background



Palettes that will pass this test:

- #cf5f67, #468bbc, #848475 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            ">": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                "right": 3
            }
        }
    }
}

```

    



### AA text contrast (text-tagged colors only)
**Tasks**: sequential, diverging, categorical


**Description**: Colors used need to have sufficient contrast with the background to make them legible, as defined by WCAG21 contrast ratios. For this check (for AA text) there should be at least a 4.5:1 contrast ratio. If this lint is not failing and you believe it should be, ensure that a color has been selected as having the "text" tag.

**Natural Language**: ALL a IN colors WHERE isTag(a, text) SUCH THAT contrast(a, background, WCAG21) > 4.5

Palettes that will fail this test:

- #feed72, #f8f4d2, #eb717b (text) with a #fff background



Palettes that will pass this test:

- #feed72, #f8f4d2, #af3b4b (text) with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "where": {"isTag": "a", "value": "text"}, 
        "predicate": {
            ">": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                "right": 4.5
            }
        }
    }
}

```

    



### AAA text contrast (text-tagged colors only)
**Tasks**: sequential, diverging, categorical


**Description**: Colors used need to have sufficient contrast with the background to make them legible, as defined by WCAG21 contrast ratios. For this check (for AAA text) there should be at least a 7:1 contrast ratio. If this lint is not failing and you believe it should be, ensure that a color has been selected as having the "text" tag.

**Natural Language**: ALL a IN colors WHERE isTag(a, text) SUCH THAT contrast(a, background, WCAG21) > 7

Palettes that will fail this test:

- #feed72, #f8f4d2, #af3b4b (text) with a #fff background



Palettes that will pass this test:

- #feed72, #f8f4d2, #6c001a (text) with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "where": {"isTag": "a", "value": "text"}, 
        "predicate": {
            ">": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                "right": 7
            }
        }
    }
}

```

    



### AA text contrast (all colors)
**Tasks**: sequential, diverging, categorical


**Description**: Colors used need to have sufficient contrast with the background to make them legible, as defined by WCAG21 contrast ratios. For this check (for AA text) there should be at least a 4.5:1 contrast ratio.

**Natural Language**: ALL a IN colors SUCH THAT contrast(a, background, WCAG21) > 4.5

Palettes that will fail this test:

- #feed72, #f8f4d2, #eb717b with a #fff background



Palettes that will pass this test:

- #feed72, #f8f4d2, #af3b4b with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            ">": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                "right": 4.5
            }
        }
    }
}

```

    



### AAA text contrast (all colors)
**Tasks**: sequential, diverging, categorical


**Description**: Colors used need to have sufficient contrast with the background to make them legible, as defined by WCAG21 contrast ratios. For this check (for AAA text) there should be at least a 7:1 contrast ratio.

**Natural Language**: ALL a IN colors SUCH THAT contrast(a, background, WCAG21) > 7

Palettes that will fail this test:

- #feed72, #f8f4d2, #eb717b with a #fff background



Palettes that will pass this test:

- #feed72, #f8f4d2, #af3b4b with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            ">": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "WCAG21" }, 
                "right": 7
            }
        }
    }
}

```

    



### Saturated not appropriate for serious affect
**Tasks**: sequential, diverging, categorical
**Tags Required**: (serious)

**Description**: Highly saturated light colors are not appropriate for palettes that seek to be serious.  See "Affective color in visualization" for more.

**Natural Language**: ALL c IN colors WHERE hsl.l(c) > 70 SUCH THAT NOT hsl.s(c) > 70


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical
**Tags Required**: (trustworthy)

**Description**: Highly saturated light colors are not appropriate for palettes that seek to be trustworthy.  See "Affective color in visualization" for more.

**Natural Language**: ALL c IN colors WHERE hsl.l(c) > 70 SUCH THAT NOT hsl.s(c) > 70


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical
**Tags Required**: (calm)

**Description**: Highly saturated light colors are not appropriate for palettes that seek to be calm.  See "Affective color in visualization" for more.

**Natural Language**: ALL c IN colors WHERE hsl.l(c) > 70 SUCH THAT NOT hsl.s(c) > 70


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Playful affects can have light blues, beiges, and grays
**Tasks**: sequential, diverging, categorical
**Tags Required**: (playful)

**Description**: Palettes that seek to be playful should have at least one light blue, beige, or gray.  See "Affective color in visualization" for more.

**Natural Language**: EXIST c IN colors SUCH THAT ((similar(c, lightblue, 20)) OR (similar(c, beige, 20)) OR (similar(c, gray, 20)))


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical
**Tags Required**: (positive)

**Description**: Palettes that seek to be positive should not have dark reds or browns.  See "Affective color in visualization" for more.

**Natural Language**: ALL c IN colors SUCH THAT NOT ((similar(c, darkred, 20)) OR (similar(c, brown, 20)))


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Negative palettes should not have light colors, particularly greens
**Tasks**: sequential, diverging, categorical
**Tags Required**: (negative)

**Description**: Palettes that seek to be negative should not have light colors, particularly greens.  See "Affective color in visualization" for more.

**Natural Language**: ALL c IN colors SUCH THAT NOT ((similar(c, green, 20)) OR (lab.l(c) > 70))


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Deuteranopia-friendly
**Tasks**: sequential, diverging, categorical


**Description**: All colors in a palette should be differentiable by people with deuteranopia (effects 0.56% of population). This is because if they are not, then they will not be differentiable from each other in some contexts.

**Natural Language**: ALL a, b IN colors WHERE index(a) != index(b) SUCH THAT NOT similar(cvdSim(a, deuteranopia), cvdSim(b, deuteranopia), 9)

Palettes that will fail this test:

- #0078b4, #ff7e0e, #3d9f2f, #da2827, #8c69bc, #8e564b, #e179c1, #7f7f7f, #c4bc27, #00becf with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Protanopia-friendly
**Tasks**: sequential, diverging, categorical


**Description**: All colors in a palette should be differentiable by people with protanopia (effects 0.59% of population). This is because if they are not, then they will not be differentiable from each other in some contexts.

**Natural Language**: ALL a, b IN colors WHERE index(a) != index(b) SUCH THAT NOT similar(cvdSim(a, protanopia), cvdSim(b, protanopia), 9)

Palettes that will fail this test:

- #0078b4, #ff7e0e, #3d9f2f, #da2827, #8c69bc, #8e564b, #e179c1, #7f7f7f, #c4bc27, #00becf with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Tritanopia-friendly
**Tasks**: sequential, diverging, categorical


**Description**: All colors in a palette should be differentiable by people with tritanopia . This is because if they are not, then they will not be differentiable from each other in some contexts.

**Natural Language**: ALL a, b IN colors WHERE index(a) != index(b) SUCH THAT NOT similar(cvdSim(a, tritanopia), cvdSim(b, tritanopia), 9)

Palettes that will fail this test:

- #0078b4, #ff7e0e, #3d9f2f, #da2827, #8c69bc, #8e564b, #e179c1, #7f7f7f, #c4bc27, #00becf with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical


**Description**: All colors in a palette should be differentiable by people with grayscale . This is because if they are not, then they will not be differentiable from each other in some contexts.

**Natural Language**: ALL a, b IN colors WHERE index(a) != index(b) SUCH THAT NOT similar(cvdSim(a, grayscale), cvdSim(b, grayscale), 9)

Palettes that will fail this test:

- #0078b4, #ff7e0e, #3d9f2f, #da2827, #8c69bc, #8e564b, #e179c1, #7f7f7f, #c4bc27, #00becf with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Axes should have low contrast with background
**Tasks**: sequential, diverging, categorical


**Description**: Axes should have low contrast with the background. Having it too high can make the axes too distracting. See "Whisper, Don't Scream: Grids and Transparency" for more.

**Natural Language**: ALL a IN colors WHERE isTag(a, axis) SUCH THAT contrast(a, background, Lstar) < 20

Palettes that will fail this test:

- #000 (axis) with a #fff background



Palettes that will pass this test:

- #eee (axis) with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "where": {"isTag": "a", "value": "axis"}, 
        "predicate": {
            "<": {
                "left": { "contrast": {"left": "a", "right": "background"}, "algorithm": "Lstar" }, 
                "right": 20
            }
        }
    }
}

```

    



### Blue should be high probability for the basic color term blue
**Tasks**: sequential, diverging, categorical


**Description**: Blue should be high probability for the basic color term blue. If it's not, it can be confusing to users.

**Natural Language**: ALL a IN colors WHERE isTag(a, blue) SUCH THAT name(a) == electricBlue

Palettes that will fail this test:

- #f00 (blue), #ffa500 with a #fff background



Palettes that will pass this test:

- #00f (electricBlue), #f00, #ffa500 with a #fff background

- #00f, #f00, #ffa500 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "where": {"isTag": "a", "value": "blue"}, 
        "predicate": {
            "==": { "left": {"name": "a"}, "right": "electricBlue" }
        }
    }
}

```

    



### Even distribution in hue
**Tasks**: categorical


**Description**: Categorical values should have an even distribution around the hue circle in LCH color space

**Natural Language**: ((std(speed(sort(colors, x => lch.h(x)))) < 10) OR (std(speed(sort(colors, x => (lch.h(x) + 180) % 360))) < 10))

Palettes that will fail this test:

- #ffb9ba, #67de25, #25d4c3, #724dd6, #6d0e44 with a #fff background



Palettes that will pass this test:

- #ffc5b8, #00dec1, #006095, #b7d119, #6e0074 with a #fff background

- #4682b4 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Even distribution in lightness
**Tasks**: categorical, diverging, sequential


**Description**: Values should be space evenly in lightness in LCH color space

**Natural Language**: std(speed(sort(colors, x => lch.l(x)))) < 5

Palettes that will fail this test:

- #ffb9ba, #67de25, #25d4c3, #724dd6, #6d0e44 with a #fff background

- #174c00, #166100, #267500, #78c12d, #b7ff6d with a #fff background



Palettes that will pass this test:

- #1a4400, #1f6e00, #4a9500, #74bd28, #9ee754 with a #fff background

- #4682b4 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "<": {
        "left": {
            "std": {
                "speed": { "sort": "colors", "func": {"lch.l": "x"}, "varb": "x" }
            }
        }, 
        "right": 5
    }
}

```

    



### Fair
**Tasks**: categorical


**Description**: Do the colors stand out equally? A color palette is described as fair if both chroma and luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold.

**Natural Language**: ((extent(sort(colors, x => lch.l(x))) < 50) AND (extent(sort(colors, x => lch.c(x))) < 80))

Palettes that will fail this test:

- #debdb5, #2a2a2a, #76fc00 with a #fff background



Palettes that will pass this test:

- #000 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging


**Description**: Do the colors stand out equally? A color palette is described as fair if the luminance ranges are below a certain threshold and unfair if one of them is above a certain threshold. 

**Natural Language**: extent(sort(colors, x => lch.l(x))) < 50

Palettes that will fail this test:

- #debdb5, #2a2a2a, #76fc00 with a #fff background



Palettes that will pass this test:

- #000 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "<": {
        "left": {
            "extent": { "sort": "colors", "varb": "x", "func": {"lch.l": "x"} }
        }, 
        "right": 50
    }
}

```

    



### Background desaturation sufficient
**Tasks**: sequential, diverging, categorical


**Description**: Background should be sufficiently desaturated. 

**Natural Language**: ((((((hsl.l(background) > 90) AND (hsv.s(background) < 8))) OR (hsl.l(background) > 99))) OR (((hsl.l(background) > 10) AND (hsl.l(background) < 26) AND (hsv.s(background) < 21))))

Palettes that will fail this test:

- #0084a9, #009de5, #5fb1ff, #ecddff with a #000 background



Palettes that will pass this test:

- #0084a9, #009de5, #5fb1ff, #bbc3ff with a #f4e3e3 background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Avoid tetradic palettes
**Tasks**: sequential, diverging, categorical


**Description**: Tetradic palettes are hard to work with and are not recommended.

**Natural Language**: NOT EXIST a IN colors SUCH THAT ((EXIST b IN colors SUCH THAT similar(hsl.h(a), (hsl.h(b) + 90) % 360, 5)) AND (EXIST b IN colors SUCH THAT similar(hsl.h(a), (hsl.h(b) + 180) % 360, 5)) AND (EXIST b IN colors SUCH THAT similar(hsl.h(a), (hsl.h(b) + 270) % 360, 5)))

Palettes that will fail this test:

- #d23bae, #3b6dd2, #d89a35, #36d745 with a #fff background



Palettes that will pass this test:

- #0084a9, #009de5, #5fb1ff, #bbc3ff with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
                                        "%": {
                                            "left": {
                                                "+": { "left": {"hsl.h": "b"}, "right": 90 }
                                            }, 
                                            "right": 360
                                        }
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
                                        "%": {
                                            "left": {
                                                "+": { "left": {"hsl.h": "b"}, "right": 180 }
                                            }, 
                                            "right": 360
                                        }
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
                                        "%": {
                                            "left": {
                                                "+": { "left": {"hsl.h": "b"}, "right": 270 }
                                            }, 
                                            "right": 360
                                        }
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
**Tasks**: sequential, diverging, categorical


**Description**: When using green, make it a yellow or blue one. This makes it easier to play nicely with other colors.

**Natural Language**: ALL a IN colors SUCH THAT ((hsl.h(a) < 90) OR (hsl.h(a) > 150))

Palettes that will fail this test:

- #0084a9, #93e789 with a #fff background



Palettes that will pass this test:

- #bee38d, #bbc3ff with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical


**Description**: Don't make your colors too dark and saturated when you're using a bright background. If in doubt, try it out. Make your colors lighter, pull some saturation out of them and see how it feels.

**Natural Language**: ((((hsl.l(background) > 50) AND (ALL a IN colors SUCH THAT contrast(a, background, WCAG21) < 10))) OR (hsl.l(background) < 50))

Palettes that will fail this test:

- #0e2d48, #3c828d, #b87930 with a #f9f9f9 background



Palettes that will pass this test:

- #f4b05d, #3c828d, #1c4b76 with a #f9f9f9 background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical


**Description**: Use color complements whenever possible

**Natural Language**: EXIST a, b IN colors SUCH THAT similar(hsl.h(a), hsl.h(b) + 180, 5)


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Color distinctness: thin-sized objects
**Tasks**: sequential, diverging, categorical


**Description**: Pairs of colors in a palette should be differentiable from each other in Thin marks. 

**Natural Language**: ALL x, y IN colors WHERE index(x) != index(y) SUCH THAT ((absDiff(lab.l(x), lab.l(y)) > 12.58) OR (absDiff(lab.a(x), lab.a(y)) > 20.740000000000002) OR (absDiff(lab.b(x), lab.b(y)) > 34.05))

Palettes that will fail this test:

- #0084a9, #009de5, #8ca9fa with a #fff background



Palettes that will pass this test:

- #0084a9, #bad, #008000 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Color distinctness: medium-sized objects
**Tasks**: sequential, diverging, categorical


**Description**: Pairs of colors in a palette should be differentiable from each other in Medium marks. 

**Natural Language**: ALL x, y IN colors WHERE index(x) != index(y) SUCH THAT ((absDiff(lab.l(x), lab.l(y)) > 6.58) OR (absDiff(lab.a(x), lab.a(y)) > 8.42) OR (absDiff(lab.b(x), lab.b(y)) > 11.09))

Palettes that will fail this test:

- #a77865, #468bbc, #bc6c6c, #a67873, #ff008c with a #fff background



Palettes that will pass this test:

- #cf5f67, #468bbc, #848475, #c55eab, #ff008c with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Color distinctness: wide-sized objects
**Tasks**: sequential, diverging, categorical


**Description**: Pairs of colors in a palette should be differentiable from each other in Wide marks. 

**Natural Language**: ALL x, y IN colors WHERE index(x) != index(y) SUCH THAT ((absDiff(lab.l(x), lab.l(y)) > 5.83) OR (absDiff(lab.a(x), lab.a(y)) > 6.88) OR (absDiff(lab.b(x), lab.b(y)) > 8.219999999999999))

Palettes that will fail this test:

- #a77865, #468bbc, #bc6c6c, #a67873, #ff008c with a #fff background



Palettes that will pass this test:

- #cf5f67, #468bbc, #848475, #c55eab, #ff008c with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: sequential, diverging, categorical


**Description**: Colors at either end of the lightness spectrum can be hard to discriminate in some contexts, and are sometimes advised against. See https://blog.datawrapper.de/beautifulcolors/#6 for more.

**Natural Language**: ALL a IN colors SUCH THAT ALL b IN ([#000000, #ffffff, #0000ff, #ff0000, #00ff00]) SUCH THAT NOT a == b

Palettes that will fail this test:

- #000, #fff, #ff7e0e, #0f0, #0084a9, #00f with a #fff background



Palettes that will pass this test:

- #ff7e0e with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            "all": {
                "in": ["#000000", "#ffffff", "#0000ff", "#ff0000", "#00ff00"], 
                "varb": "b", 
                "predicate": {
                    "not": { "==": {"left": "a", "right": "b"} }
                }
            }
        }
    }
}

```

    



### Colors distinguishable in order
**Tasks**: categorical


**Description**: Opt for colors that are perceptually distinguishable in a logical sequence when designing visual elements like charts or graphs. This ensures that viewers can easily recognize the order or progression of data points. For categorical this means that when only a small number of colors are used, they should be as different as possible. For sequential and diverging, this means that the colors should be as different as possible in order.

**Natural Language**: ALL a, b IN colors WHERE index(a) == index(b) - 1 SUCH THAT deltaE(a, b, 2000) > 10

Palettes that will fail this test:

- #0084a9, #009de5, #5fb1ff, #bbc3ff, #ecddff with a #fff background



Palettes that will pass this test:

- #0084a9, #009de5, #8ca9fa, #bbc3ff, #ecddff with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Diverging palettes order appropriate
**Tasks**: diverging


**Description**: Diverging palettes should have a middle color that is the lightest or darkest color. This is because if they are not, then they will not be differentiable from each other in some contexts.

**Natural Language**: CUSTOM JS

Palettes that will fail this test:

- #0084ae, #8db3c7, #e5e3e0, #e25c36, #eca288 with a #fff background



Palettes that will pass this test:

- #0084ae, #8db3c7, #e5e3e0, #eca288, #e25c36 with a #fff background

- #e25c36, #eca288, #e5e3e0, #8db3c7, #0084ae with a #fff background


**Program**:

```json

```

    



### In gamut
**Tasks**: sequential, diverging, categorical


**Description**: Checks if the colors are in the sRGB gamut. This is important to ensure that the colors are visible and can be displayed on most devices.

**Natural Language**: ALL a IN colors SUCH THAT inGamut(a) == TRUE

Palettes that will fail this test:

- #00808a with a #fff background



Palettes that will pass this test:

- #0084a9, #009de5, #8ca9fa, #f00 with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "all": {
        "in": "colors", 
        "varb": "a", 
        "predicate": {
            "==": { "left": {"inGamut": "a"}, "right": true }
        }
    }
}

```

    



### Max colors
**Tasks**: sequential, diverging, categorical


**Description**: Palettes should have a maximum number of colors. Higher numbers of colors can make it hard to identify specific values.

**Natural Language**: count(colors) < 11

Palettes that will fail this test:

- #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000, #000 with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #0f0, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
    "<": { "left": {"count": "colors"}, "right": 11 }
}

```

    



### Mutually distinct
**Tasks**: categorical


**Description**: All colors in a palette should be different from each other. This is because if they are not, then they will not be differentiable from each other in some contexts.

**Natural Language**: ALL a, b IN colors WHERE index(a) != index(b) SUCH THAT dist(a, b, lab) > 15

Palettes that will fail this test:

- #d2b48c, #f5f5dc, #d7fcef with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #0f0, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Color name discriminability
**Tasks**: categorical, diverging


**Description**: Being able to identify colors by name is important for usability and for memorability.

**Natural Language**: ALL a, b IN colors WHERE index(a) != index(b) SUCH THAT name(a) != name(b)

Palettes that will fail this test:

- #5866d3, #19437d with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #0f0, #00f with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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

    



### Sequential palette order appropriate
**Tasks**: sequential


**Description**: Sequential palettes should be ordered by lightness. This is a defining property of a sequential palette and ensures that values are understood as having an increase (or decreasing) value.

**Natural Language**: ((sort(colors, x => lch.l(x)) == map(colors, x => lch.l(x))) OR (sort(colors, x => lch.l(x)) == reverse(map(colors, x => lch.l(x)))))

Palettes that will fail this test:

- #0084a9, #009de5, #5fb1ff, #ecddff, #bbc3ff with a #fff background



Palettes that will pass this test:

- #0084a9, #009de5, #5fb1ff, #bbc3ff, #ecddff with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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
**Tasks**: categorical


**Description**: Colors that are close to what are known as ugly colors are sometimes advised against. See https://www.colourlovers.com/palette/1416250/The_Ugliest_Colors for more details.

**Natural Language**: ALL a IN colors SUCH THAT ALL b IN ([#56FF00, #0010FF, #6A7E25, #FF00EF, #806E28]) SUCH THAT deltaE(a, b, 2000) > 10

Palettes that will fail this test:

- #000, #56ff22 with a #fff background

- #000, #0010ff, #6a7e25, #0f0, #00f with a #fff background



Palettes that will pass this test:

- #000, #fff, #f00, #00c000, #9c70ff with a #fff background


**Program**:

```json
{
    "$schema": "https://color-buddy-docs.netlify.app/lint-schema.v0.json", 
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