<script lang="ts">
  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import { driver } from "driver.js";
  import "driver.js/dist/driver.css";

  function closeClick() {
    configStore.setTour(false);
    driverObj.destroy();
  }
  let driverObj = driver({
    showProgress: true,
    onCloseClick: closeClick,
    onDestroyed: closeClick,
    steps: [
      // {
      //   popover: {
      //     title: "Welcome to Color Buddy",
      //     onCloseClick: closeClick,
      //     description:
      //       "Color buddy is an application that helps you build excellent color palettes. These are mainly for data visualization, however they work for any use case. Let's take a quick tour of the application to get you started.",
      //     onNextClick: () => {
      //       configStore.setLeftPanelRoute("controls");
      //       configStore.setRoute("examples");
      //       focusStore.clearColors();
      //       configStore.setColorSim("none");
      //       driverObj.moveNext();
      //     },
      //   },
      // },

      // {
      //   element: "#scatterplot",
      //   popover: {
      //     title: "Edit plane",
      //     onCloseClick: closeClick,
      //     description:
      //       "The edit plane shows the colors in your palette in a 2D space as a scatterplot and a strip plot. You can drag the colors around to adjust their position. You can also drag a box around a group of colors and move it around, just like you would in a graphics editor.",
      //     onNextClick: () => {
      //       configStore.setColorSim("deuteranopia");
      //       driverObj.moveNext();
      //     },
      //   },
      // },
      // {
      //   element: "#scatterplot",
      //   popover: {
      //     title: "Color Vision Deficiency Simulation",
      //     onCloseClick: closeClick,
      //     description:
      //       "You can simulate color vision deficiencies using the controls at the top of the page. This will help you make sure that your palettes are accessible to everyone. Let's try simulating a color vision deficiency.",
      //   },
      // },
      // {
      //   element: "#scatterplot-controls",
      //   popover: {
      //     title: "Reordering Colors",
      //     onCloseClick: closeClick,
      //     description:
      //       "You can reorder the colors by clicking on one of them and clicking 'Move Left' or 'Move Right'. In addition you can add a color by clicking 'Add Color' and remove a color by clicking 'delete'.",
      //     onNextClick: () => {
      //       configStore.setLeftPanelRoute("controls");
      //       driverObj.moveNext();
      //     },
      //   },
      // },
      // {
      //   element: "#top-controls",
      //   popover: {
      //     title: "Top Controls",
      //     onCloseClick: closeClick,
      //     description:
      //       "The top controls allow you to create a new palette, undo and redo changes, and configure the application. You can also use the top controls to upload and download palettes.",
      //   },
      // },
      // {
      //   element: "#left-panel",
      //   popover: {
      //     title: "Controls: Nothing selected",
      //     onCloseClick: closeClick,
      //     description:
      //       "The controls panel allows you to add colors to your palette, remove colors from your palette, and adjust the order of your colors. When none are selected, it just gives you a way to add colors. Let's select a colors and see what happens.",
      //     onNextClick: () => {
      //       focusStore.setColors([0]);
      //       driverObj.moveNext();
      //     },
      //   },
      // },
      // {
      //   element: "#left-panel",
      //   popover: {
      //     title: "Controls: One color selected",
      //     onCloseClick: closeClick,
      //     description:
      //       "Now we can see that we have a few more options! We can change the color using sliders, or use some basic color commands to change its color. Let's see what happens when we have a couple of colors selected.",
      //     onPrevClick: () => {
      //       focusStore.clearColors();
      //       driverObj.movePrevious();
      //     },
      //     onNextClick: () => {
      //       focusStore.setColors([0, 1]);
      //       driverObj.moveNext();
      //     },
      //   },
      // },
      // {
      //   element: "#left-panel",
      //   popover: {
      //     title: "Controls: Multiple colors selected",
      //     onCloseClick: closeClick,
      //     description:
      //       "Now we have even more options! In addition to some color manipulation options, we also add some graphics manipulation style options, like being able to align or distribute colors. We can also interpolate those values to create sequential palettes if you like.",
      //     onPrevClick: () => {
      //       focusStore.setColors([0]);
      //       driverObj.movePrevious();
      //     },
      //     onNextClick: () => {
      //       configStore.setRoute("manage");
      //       driverObj.moveNext();
      //     },
      //   },
      // },
      // {
      //   element: "#right-col",
      //   popover: {
      //     title: "Manage Palettes",
      //     onCloseClick: closeClick,
      //     description:
      //       "The palettes view allows you to see all of the palettes you have created. You can click on a palette using the gear and then you can edit it using the controls panel. You can also delete or duplicate palettes (such as for versioning).",

      //     onNextClick: () => {
      //       configStore.setRoute("examples");
      //       driverObj.moveNext();
      //     },
      //   },
      // },
      // {
      //   element: "#right-col",
      //   popover: {
      //     title: "Examples",
      //     onCloseClick: closeClick,
      //     description: `The examples tab gives you a few examples of the current palette in use. You can see how it looks on visualizations or on some vector graphics. If you want you can upload your own examples. Vector graphics are uploaded in SVG while visualizations are uploaded using Vega or Vega-Lite programs.

      //       You can simulate color vision deficiencies on the example by clicking the 'use simulated colors' button.

      //       Click on a color you want to edit to select it!`,
      //     onNextClick: () => {
      //       configStore.setRoute("compare");
      //       configStore.setComparePal(1);
      //       driverObj.moveNext();
      //     },
      //     onPrevClick: () => {
      //       configStore.setRoute("manage");
      //       driverObj.movePrevious();
      //     },
      //   },
      // },
      // {
      //   element: "#right-col",
      //   popover: {
      //     title: "Compare",
      //     onCloseClick: closeClick,
      //     description:
      //       "The compare tab allows you to compare your palette to other palettes. You can see how your palette compares to other palettes using the scatterplot. Check out the diff mode to see a comparison!",
      //     onNextClick: () => {
      //       configStore.setRoute("eval");
      //       configStore.setEvalDisplayMode("regular");
      //       driverObj.moveNext();
      //     },
      //     onPrevClick: () => {
      //       configStore.setRoute("examples");
      //       driverObj.movePrevious();
      //     },
      //   },
      // },
      // {
      //   element: "#right-col",
      //   popover: {
      //     title: "Evaluate",
      //     onCloseClick: closeClick,
      //     description:
      //       "The evaluate tab allows you to evaluate your palette across lots of different terms and features. If one of these checks (referred to as lints) is failing then you click 'fixes' to see what is wrong and help you fix it!",
      //     onPrevClick: () => {
      //       configStore.setRoute("compare");
      //       driverObj.movePrevious();
      //     },
      //   },
      // },
      {
        popover: {
          title: "Enjoy using Color Buddy",
          onCloseClick: closeClick,
          description:
            "We hope you enjoy using Color Buddy. If you have any questions or comments, please feel free to reach out to us. We are always looking for ways to improve the application.",
          onNextClick: () => {
            configStore.setTour(false);
            driverObj.destroy();
          },
        },
      },
    ],
  });
  driverObj.drive();
</script>
