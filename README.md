# "Color IDE" or "Color Buddy"

## SETUP

Install: `yarn`

Run: `npx netlify dev`

Use: should point to localhost:8888 if all is well

First time you start it up you should also run `yarn prep data`

## Direct manipulation bugs/improvement

The basic UX for editing has the following components

## Two graphs, one 2D and one 1D.

The 2D graph displays hue/chroma graph and the 1D graph displays lightness. You can map any of a number of colorspaces onto this pair of graphs. (in the code, the lightness graph is "Z"). I propose the following changes

- [x] Reduce the visual impact of the axes and labels by making them transparent gray. Set the colors, made them adaptive, set the luminance flip to .3 (50% visually)
- [x] Flip the Y axis (zero at the bottom)
- [x] Make the labels integers for CIELAB
- [x] Make the axis scale sliders less visualy prominent.
- [x] Consider removing the axis sliders, replace them with zoom controls in the same panel as the background color selection. Changing these values is rare, they don't need to take up so much UX space.
- [x] The 2D graph should always be a centered hue/chroma graph. CIELAB and CIELCH would therefore use the same graph. Leave the LAB vs LCH distinction for slider based editing.
- [x] I'd consider creating an rectangle that enclosed both graphs and filling it with the background color. I might then also pull the axis labels outside bounding box for each graph.

## Single and multiple selection, drag and drop editing.

Click to select, drag or shift click to multi-select

- [x] Show the selection bounding box only on multi-select. Make it thinner and a lighter
- [ ] **Bug** a single click in the 1D graph selects and immediately deselects the color.
- [x] **Bug** shift click doesn't do multi-select for me.
- [ ] I would add a deselect when you click in the white space, either a single click or the start of a new area select (this may also be a bug)
- [ ] There needs to be feedback when you drag out of gamut
- [x] Undo for dragging is too granular. Undo should undo the entire drag.

## Color editing with sliders.

To raise the sliders, you need to click on one of the examples that are displayed below the graphs. You can then manipulate 2 colorspaces simultaneously.

- [x] I'd move the examples into the example pane, use the space to permanently display the sliders, make them longer
- [x] Always display the hex values of the state of the sliders.
- [ ] Once this is done, it make sense to show a tooltip that displays a pair of values as you hover over the graph. (maybe also the hex?)
- [ ] There should be an add color button that adds the current state of the sliders.
- [ ] A single selection sets the sliders. Multi-select does not
- [ ] Might then make sense to move the graph colorspace, range and background color controls into this area.
- [ ] As a short term improvement, raise the sliders when you click on a color in the graphs.

## TODOS

- [ ] Make keyboard short cut (option+up/down) for the z-direction
- [ ] Polar stuff
- [x] Chore: clean up the color store, many unnecessary methods.
- [ ] Chore: Extract some common types into a top level location (like types.ts type thing)
- [ ] A (default) example showing annotated math stuff
- [ ] SVG Upload
- [ ] Vega/Vega-Lite Specification
- [x] Bug: changing the color frame fucks everything up???? (particularly for HSV/HSL)
- [x] Eval response options
- [ ] higher card. vis examples
- [ ] Distribute radially
- [?] Rearrange some of the colors in the color area eg make rg on xy and b on z etc
- [ ] Insert color theory options, eg insert opposing, inserting analogous color, etc, mine from the adobe picker
- [ ] NTH: Rest of basic geometry manipulations: flip (horizontal, vertical), scale
- [ ] Examples held as assets somewhere that are downloaded rather than components (for consistency)
- [ ] Labels, tooltips, etc
- [x] "opposing color" to "Convert selection to opposing"
- [x] Meta: figure out all the other features in maureen's setup
- [x] order as diverging
- [x] Make it possible to ignore / dismiss lints
- [x] Touch events polish
- [x] drag box in z channel should work
- [x] Add color by name
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
