# "Color IDE" or "Color Buddy"

## SETUP

Install: `yarn`

Run: `npx netlify dev`

Use: should point to localhost:8888 if all is well

First time you start it up you should also run `yarn prep data`

## TODOS

- [ ] Coat of paint
- [ ] add color analysis
- [ ] higher card. vis examples
- [ ] order as diverging
- [ ] Color correction
- [ ] Distribute radially
- [ ] Rearrange some of the colors in the color area eg make rg on xy and b on z etc
- [ ] "opposing color" to "Convert selection to opposing"
- [ ] Insert color theory options, eg insert opposing, inserting analogous color, etc, mine from the adobe picker
- [ ] NTH: Rest of basic geometry manipulations: flip (horizontal, vertical), scale
- [ ] Meta: figure out all the other features in maureen's setup
- [ ] Make clicking and moving points smoother
- [ ] Examples held as assets somewhere that are downloaded rather than components (for consistency)
- [ ] Touch events polish, drag box in z channel should work
- [ ] Labels, tooltips, etc
- [ ] Add color by name
- [x] Controls explainer
- [x] Color channel controller polish
- [x] Responsiveness
- [x] Step needs to be adapted to small spaces
- [x] Show select on eval
- [x] Minor: make axis numbers not too big
- [x] Copy/paste
- [x] Touch events, just pull the the touch event stuff from the double rangle slider, also refactor that out into something common
- [x] Plot operate over other color spaces
- [x] make old pals searchable
- [x] make charts be end user manipulable
- [x] kbd commands, up/down for moving selections, cmd+z for undo, etc
- [x] distribute horizontal / vertical
- [x] Plot zoom
- [x] Cursor selection range
- [x] color text input
- [x] make color sliders be shaded in the background
- [x] Add support for other color schemes (finish generalizing the chroma refactor)
- [x] Make colors actually work right (eg rip out chroma)
- [x] Minor: Make the aligns be a tool tip
- [x] Refactor file structure
- [x] Unbreak the color channel stuff, also the avging actions
- [x] add fancy cacheing to make the vega-charts not re-render constantly
- [x] add text commands
- [x] make text display deterministic
- [x] multi-select of colors?
- [x] undo / redo
