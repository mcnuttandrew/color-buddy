Bugs and improvements

- In the github, the link to the docs is wrong. It's OK in the app

# Browse/Manage
- After clicking on a palette, the palette updates and the tab switches to samples. Leave the tab on the view of the palettes
- In the manage pane, make the windows tight on the palettes, as in Browse

# Color spaces
- when you change the color space, dismiss the menu once you select one.
- Selecting a new palette changes the color space back to LAB. It shouldn't
- Update the color space descriptions (details TBD from Maureen)
- JZ values are all in the range 0-0.1, think you need to scale by 10. Comparing JAJBJZ to LAB, I think there's also a scaling problem in the A and B values as well. 
- No color space background for JAJBJZ. That's two issues in JAJBJZ. Do we really want to include it?
- I'd remove the SRGB editing space. Even if it's working correctly (which I think it isn't), it's going to be very confusing. 
- Possible additional color spaces
    - XYZ If you do this one, put Y on the single axis. Could be useful for evaluation the simulations.
    - xyY While not supported natively in the Color package, the conversion between this and XYZ is trivial: x = X/(X+Y+Z), y = Y/(X+Y+Z);  Plot xy on the plane, Y on the lightness scale. This will show the colors on the CIE Chromaticity diagram.
- (#f00, #ff0, #0f0, #0ff, #00f, #f0f, #fff, #000) is a useful palette for evaluting colorspaces
    - HSL, #fff should be in the middle
    - #0ff is displayed in LAB as out of gamut. It shouldn't be. Clip to gamut doesn't fix it, similar for LCH. Except sometimes it's fine (argh)
    - when a color (nearly) matches the background, it would be nice to outline it so it doesn't vanish. Use a slightly darker/lighter version of the color, depending on whether it's a light or dark background. Most obvious in this palette for black and white.

# Comparison
- The dotted line connections are useful if the colors are in the same order and have only changed slightly, but confusing if the palette order has changed (for example, Tableau 10 Classic and Tableau 10). Since small changes are easy to see with just the rings vs disks, I'd leave the lines out for now.
- To get a palette to compare, it has to be in the Manage set. From the Change Compared Palette dropdown, I'd add a "browse for more palettes" affordance that switched you to the Browse pane. 
# Eval
- When you ask for a fix and it displays the before and after palette, the vertical lines seem to connect the colors that didn't change. I would expect to have them on the colors that did change. Ideally, they'd be arrows pointing from/to.
- These palettes are labeled Use and Reject. I think it would be useful if they included what algorithm was used. For example, Use (ColorBuddy), Reject (LLM) 
- In Gamut should be a Usability Check, not a Design Check.
- Settings raises a long list of lints, which really needs a scroll bar or some other way of managing the list on a smaller screen. Also, I was expecting to see the checks on the displayed lints, not the ignored ones. 
- the New lint text box doesn't seem to do anything. I tried several types of requests, got nothing back.
- Being able to copy and modify an existing lint seems very powerful, but there's no way to do that. 
- I would like a way to test all colors for text legibility, no matter what their tags are. Maybe this is just a new lint? 
- I would like to improve the appearance of the red X's on the colors. Ideally, we'd have some tasteful icons, one per major category (Usability, Accessibility, Design, Custom) that were legible on all colors.





# Simulations
- As noted before, the simulated L* values are noticably different than the original, which is surprising. This is true even for grayscale, so I really wonder if there's some bug in the L* plotting pipeline, rather than in the algorithms. 





