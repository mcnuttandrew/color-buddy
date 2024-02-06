# "Color IDE" or "Color Buddy"

## SETUP

Install: `yarn`

Run: `npx netlify dev`

Use: should point to localhost:8888 if all is well

First time you start it up you should also run `yarn prep data`

Macros story

- not similar
- sequences
- "where": { "!=": {"left": "index(a)", "right": "index(b)"} },

# Language todos

- [ ] Add background, roles, palette level semantics
- [ ] Categorical mutually distinct
- [x] Integration into main app
- [x] "Blame" for colors
- [x] JSON Schema (for validation) (if parser is not used), get a sustainable way to use it
- [x] Basic Language
- [x] Multi indexing (eg all colors a b c)
- [na] Parser?
- [na] Swap left/right for [a, b] for density

# Todo bankruptcy

- [ ] off by one persistance error in undo/redo
- [ ] Gamut algorithm broken again
- [ ] Add HCT/CAM, add explainers to each of the color spaces, blocked by colorjs release
- [ ] Allow no palettes, allows renaming of non-current palettes
- [ ] Colors from String should save on enter?
- [ ] Changing spaces is pretty bad on lab <-> oklab, cf ("#35ffbf", "#87b995", "#e84f82")
- [ ] "Easy on ramp" progressive disclosure
- [ ] per cols 4 all: color blindness metric should maybe be sensitive to task?
- [ ] Labels, tooltips, etc
- [ ] Bug: Color channel usage slightly cursed (doesn't update positions correctly)
- [ ] Bug: rotate in polar coordinates doesn't work right
- [ ] Directional subtlies for aligns, they do not work in polar also
- [ ] Sequential check fix is incorrect for things with equi-ligthness

# Nice to have

- [ ] Insert color theory options, eg insert opposing, inserting analogous color, etc, mine from the adobe picker
- [ ] Add clone color (and similar buttons) to the tooltip, mostly for making interacting with the examples simpler
- [ ] XYY is probaably now possible
- [ ] Nice to have: Rest of basic geometry manipulations: flip (horizontal, vertical), scale, Distribute radially
- [ ] Undo / redo stack size. Nice to have: summarize each action
- [ ] Minor: Make keyboard short cut (option+up/down) for the z-direction
