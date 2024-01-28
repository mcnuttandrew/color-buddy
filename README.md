# "Color IDE" or "Color Buddy"

## SETUP

Install: `yarn`

Run: `npx netlify dev`

Use: should point to localhost:8888 if all is well

First time you start it up you should also run `yarn prep data`

# Todo bankruptcy

- [ ] Gamut algorithm broken again
- [ ] Allow no palettes, allows renaming of non-current palettes
- [ ] MS didn't like the location of the new button
- [ ] Colors from String should save on enter
- [ ] Changing spaces is pretty bad on lab <-> oklab, cf ("#35ffbf", "#87b995", "#e84f82")
- [ ] "new from blank" "new from small generic palette" buttons in the new menu.
- [ ] "Easy on ramp" progressive disclosure
- [ ] per cols 4 all: color blindness metric should maybe be sensitive to task?
- [ ] Minor: Make keyboard short cut (option+up/down) for the z-direction
- [ ] Insert color theory options, eg insert opposing, inserting analogous color, etc, mine from the adobe picker
- [ ] Labels, tooltips, etc
- [ ] Nice to have: Rest of basic geometry manipulations: flip (horizontal, vertical), scale, Distribute radially
- [ ] Bug: Color channel usage slightly cursed (doesn't update positions correctly)
- [ ] Add clone color (and similar buttons) to the tooltip, mostly for making interacting with the examples simpler
- [ ] Undo / redo stack size. Nice to have: summarize each action
- [ ] XYY is probaably now possible
- [ ] Bug: rotate in polar coordinates doesn't work right
- [ ] Ad hoc lints seem possible, do a spike
- [ ] Directional subtlies for aligns, they do not work in polar also
- [x] Bug: if comparing the same palette in two spaces, make a change and the space reverts
- [x] Compare: should show the values a pal preview
- [x] Deselect: In the row of colors, clicking on a selected color should deselect it
- [x] Tool tip not staying put
- [x] Chore: Extract some common types into a top level location (like types.ts type thing)
- [x] For the palettes, there is a copy and delete bug. Try this: Copy Example 2, then immediately click delete (menu is still up). Surpise!
- [x] Direct manipulation new color add "puttin" mode on the scatterplot
- [x] For the palettes, a couple of ideas. Right now, feels like selecting a palette in the list reorders all the palettes, which is disorienting. I realize what you're doing in removing the palette I clicked on, adding the one I was editing. I think don't do this. Keep a fixed order (which I could change if I wanted to), and simply mark the palette that's being editing, don't remove it from the list. Similarly, if I copy a palette, put it right after the palette I copied, not up at the top. I also think adding a compact view of the palettes will eventually be necessary, so now might be the time to do it. Even as a default, would make the circles a bit smaller and pack them tighter. Or maybe make them tall rectangles that would pack even tighter.
- [x] Bug report. If I am comparing a palette with itself and select a color in the main view, the color is not selected in the xy plot of the comparison panel. It is selected in the vertical only plot
- [x] Similarly, would like to work through the various options for the examples. Delete, Edit, Hide (not Mute) seem good. If you're going to Hide, then ideally you provide a selective unhide (dropdown of names is the easiest) as well as the unhide all. Your Solo means "hide everything else" which I'm not convinced is worth a button. However, a "full screen" or "fit width" "fit height" options that scales it up and reduces the rest to thumbnails might be cool. And I'm sure there are a few more we'll discover as we work with it.
- [x] Albers color theory games style examples

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
- [x] **Bug** a single click in the 1D graph selects and immediately deselects the color.
- [x] **Bug** shift click doesn't do multi-select for me.
- [x] I would add a deselect when you click in the white space, either a single click or the start of a new area select (this may also be a bug)
- [ ] There needs to be feedback when you drag out of gamut
- [x] Undo for dragging is too granular. Undo should undo the entire drag.

## Color editing with sliders.

To raise the sliders, you need to click on one of the examples that are displayed below the graphs. You can then manipulate 2 colorspaces simultaneously.

- [x] I'd move the examples into the example pane, use the space to permanently display the sliders, make them longer
- [x] Always display the hex values of the state of the sliders.
- [x] Once this is done, it make sense to show a tooltip that displays a pair of values as you hover over the graph. (maybe also the hex?)
- [x] (na) There should be an add color button that adds the current state of the sliders.
- [?] A single selection sets the sliders. Multi-select does not
- [x] Might then make sense to move the graph colorspace, range and background color controls into this area.
- [x] As a short term improvement, raise the sliders when you click on a color in the graphs.

## TODOS

- [x] New "blank" button.
- [x] Too many menu options, refactor so that they have a logical and usable hierarchy
- [x] Chore: Rearrange some of the colors in the color area eg make rg on xy and b on z etc, blocking polar stuff
- [x] Polar stuff
- [x] Make lints have configurable parameters
- [x] Examples: A (default) example showing annotated math stuff
- [x] Examples: SVG Upload
- [x] Examples: Vega/Vega-Lite Specification
- [x] Examples: Examples held as assets somewhere that are downloaded rather than components (for consistency)
- [x] Examples: higher card. vis examples
- [x] Black and white simulation
- [x] Chore: clean up the color store, many unnecessary methods.
- [x] Bug: changing the color frame fucks everything up???? (particularly for HSV/HSL)
- [x] Eval response options
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
