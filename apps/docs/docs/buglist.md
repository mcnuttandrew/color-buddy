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

- (#f00, #ff0, #0f0, #0ff, #00f, #f0f, #fff, #000) is a useful palette for evaluting colorspaces
    - HSL, #fff should be in the middle
    - #0ff is displayed in LAB as out of gamut. It shouldn't be. Clip to gamut doesn't fix it, similar for LCH. Except sometimes it's fine (argh)
    - when a color (nearly) matches the background, it would be nice to outline it so it doesn't vanish. Use a slightly darker/lighter version of the color, depending on whether it's a light or dark background. Most obvious in this palette for black and white.

# Comparison
- The dotted line connections are useful if the colors are in the same order and have only changed slightly, but confusing if the palette order has changed (for example, Tableau 10 Classic and Tableau 10). Since small changes are easy to see with just the rings vs disks, I'd leave the lines out for now.





