# "Color IDE" or "Color Buddy"

## SETUP

Install: `yarn`

Run: `npx netlify dev`

Use: should point to localhost:8888 if all is well

First time you start it up you should also run `yarn prep data`

# User study burn down

- [ ] Make deactivation story make sense in new context
- [ ] Get most of the lints converted
- [ ] Tour?
- [ ] roles, palette level semantics
- [ ] Design adjustments for smaller screens
- [ ] Language Docs??
- [x] Make lints fast / non blocking as much as possible

# Language todos

- [ ] Clone Rule
- [ ] "No out of gamut"
- [ ] Affect rules
- [ ] Add more blame robustness, may pay to try to reason across all of the operator families (insight: keep a list of the blamable variables in the environment to support tracing)
- [ ] per cols 4 all: color blindness metric should maybe be sensitive to task?
- [ ] Sequential check fix is incorrect for things with equi-ligthness
- [ ] Macros story: "not similar", "sequences", "where": { "!=": {"left": "index(a)", "right": "index(b)"} },

# General Todos

- [ ] Merge the info and fixes tooltips in the lints
- [ ] Color Space selections should persist
- [ ] Make name discrim hueristc fix more resilient, see switching to basic colors
- [ ] Search palettes-by-lint screen
- [ ] Drag to re-order points?
- [ ] off by one persistance error in undo/redo
- [ ] Changing spaces is pretty bad on lab <-> oklab, cf ("#35ffbf", "#87b995", "#e84f82")
- [ ] "Easy on ramp" progressive disclosure
- [ ] Labels, tooltips, etc
- [ ] Handles get stuck on channel picker again, ugh
- [ ] Bug: Color channel usage slightly cursed (doesn't update positions correctly)
- [ ] Bug: rotate in polar coordinates doesn't work right
- [ ] Performance stuff for linter (separate message generation into something very throttled, maybe move to web workers? Cache as hard as possible)
- [ ] LCH colors upside down god damn it

Parameterization epic:

- [ ] Allow no palettes, allows renaming of non-current palettes, which would be enable by:
- [ ] Parameterize the scatter column completely, allow edits to the compare stuff
- [ ] Hover broken on compare, also make sure it takes the right stringify (same as the color channel)
- [ ] Select compare from palettes drop down menu

# Nice to have

- [ ] Add HCT/CAM, add explainers to each of the color spaces, blocked by colorjs release
- [ ] Directional subtile for aligns, they do not work in polar also
- [ ] Colors from String should save on enter?
- [ ] Insert color theory options, eg insert opposing, inserting analogous color, etc, mine from the adobe picker
- [ ] Add clone color (and similar buttons) to the tooltip, mostly for making interacting with the examples simpler
- [ ] XYY is probaably now possible
- [ ] Nice to have: Rest of basic geometry manipulations: flip (horizontal, vertical), scale, Distribute radially
- [ ] Undo / redo stack size. Nice to have: summarize each action
- [ ] Minor: Make keyboard short cut (option+up/down) for the z-direction
