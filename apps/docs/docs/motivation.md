---
# https://vitepress.dev/reference/default-theme-home-page
layout: doc
---

# Motivation

Most color editing tools are designed for individual colors. Palette colors, however, need to be designed together, as the relationships between the colors are critical to their application. These relationships can be evaluated both visually and algorithmically. The Color Buddy provides fluid, graphical editing of palette colors plus both visual and algorithmic evaluation tools. Bringing these functions together in an integrated system is the primary motivation for the Color Buddy.

The Color Buddy is the result of a collaboration between Andrew McNutt and Maureen Stone, which started at the University of Washington in the fall of 2023. Andrew is the primary architect and implementor, Maureen contributes ideas, debugging and documentation. In addition, we have received UX design help from Jeff Pettiross, as well as feedback and advice from Jeff Heer.
## Background
The design of the Color Buddy has its roots in a color palette design tool created by Maureen at Tableau for her work designing the Tableau Palettes, which allowed the simulataneous editing of all the colors in the palette, visualized in the device-independent CIELAB colorspace. In addition, it displayed the colors on a set of swatches, chosen to mimic typical Tableau marks. It provided interpolation tools for generating sequential palettes plus a very basic form of palette management, along with some additional convenience features. 

Color Buddy offers the same basic editing and palette visualization model, much enhanced in a web-based implementation to include direct manipulation and other graphical editing tools operations like rotate and align. It supports a selection of different color models for editing, plus a library of visual examples that can be customized by the user as well as the swatches. It also offers the ability to compare two independent palette visualizations, either the same palette in different spaces or two different color palettes. 

The suite of evaluation algorithms grew out of Andrew's work in visualization linting. The Color Buddy advances this work by focusing specifically on palette design, then integrating the rules with the palette editor.  The current set of rules are designed to match those commonly used by professional designers. The Color Buddy not only indicates problems, but offers algorithmic solutions. Integrating such a checker with a GUI for palette design is an interesting research problem that has been partially addressed in the current implementation. We hope to evolve this further in the future.

