# Bugs and improvements

## Browse/Manage

- [x] After clicking on a palette, the palette updates and the tab switches to samples. Leave the tab on the view of the palettes
- [x] In the manage pane, make the windows tight on the palettes, as in Browse

## Editing and color spaces

- [x] when you change the color space, dismiss the menu once you select one.
- [x] Selecting a new palette changes the color space back to LAB. It shouldn't
- [ ] The color space specific metrics in the lower left corner aren't tracking selection. Only the hex updates. AM: can't reproduce
- [ ] Update the color space descriptions (details TBD from Maureen)
- [ ] JZ values are all in the range 0-0.1, think you need to scale by 10. Comparing JAJBJZ to LAB, I think there's also a scaling problem in the A and B values as well. AM: nope that's how this space is
- [ ] No color space background for JAJBJZ. That's two issues in JAJBJZ. Do we really want to include it?. AM: can't reproduce.
- [x] I'd remove the SRGB editing space. Even if it's working correctly (which I think it isn't), it's going to be very confusing.

- [x] (#f00, #ff0, #0f0, #0ff, #00f, #f0f, #fff, #888, #000) is a useful palette for evaluating colorspaces. AM: added as "Color Test"
- [ ] HSL, #fff should be in the middle
- [ ] #0ff is displayed in LAB as out of gamut. It shouldn't be. Clip to gamut doesn't fix it, similar for LCH. Except sometimes it's fine (argh)
- [ ] when a color (nearly) matches the background, it would be nice to outline it so it doesn't vanish. Use a slightly darker/lighter version of the color, depending on whether it's a light or dark background. Most obvious in this palette for black and white.

# Possible additional color spaces

- [ ] XYZ If you do this one, put Y on the single axis. Could be useful for evaluating the simulations.
- [ ] xyY While not supported natively in the Color package, the conversion between this and XYZ is trivial: x = X/(X+Y+Z), y = Y/(X+Y+Z); Plot xy on the plane, Y on the lightness scale. This will show the colors on the CIE Chromaticity diagram.

## Comparison

- [x] The dotted line connections are useful if the colors are in the same order and have only changed slightly, but confusing if the palette order has changed (for example, Tableau 10 Classic and Tableau 10). Since small changes are easy to see with just the rings vs disks, I'd leave the lines out for now.
- [x] To get a palette to compare, it has to be in the Manage set. From the Change Compared Palette dropdown, I'd add a "browse for more palettes" affordance that switched you to the Browse pane.

## Eval

- [ ] When you ask for a fix and it displays the before and after palette, the vertical lines seem to connect the colors that didn't change. I would expect to have them on the colors that did change. Ideally, they'd be arrows pointing from/to.
- [x] These palettes are labeled Use and Reject. I think it would be useful if they included what algorithm was used. For example, Use(ColorBuddy), Reject(LLM)
- [x] In Gamut should be a Usability Check, not a Design Check.
- [x] Settings raises a long list of lints, which really needs a scroll bar or some other way of managing the list on a smaller screen. Also, it would be more conventional to make this a list of Selected lints rather than a List of Ignored lints.
- [ ] the New lint text box doesn't seem to do anything. I tried several types of requests, got nothing back.
- [ ] Being able to copy and modify an existing lint seems very powerful, but I see no way to do that. AM: click lint info / click customize / click clone
- [ ] I would like a way to test all colors for text legibility, no matter what their tags are. Maybe this is just a new lint?
- [ ] I would like to improve the appearance of the red X's on the colors. Ideally, we'd have some tasteful icons, one per major category (Usability, Accessibility, Design, Custom) that were legible on all colors.
- [ ] I'd like to see more metrics in the lint descriptions and errors. For example, what contrast do we need for text legibility, and what is the contrast for those colors that failed?

## Simulations

- [ ] As noted before, the simulated L* values are noticably different than the original, which is surprising. This is true even for grayscale, so I really wonder if there's some bug in the L* plotting pipeline, rather than in the algorithms.
