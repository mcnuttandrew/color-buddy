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
      {
        popover: {
          title: "Welcome to Color Buddy",
          onCloseClick: closeClick,
          description:
            "Color buddy is an application that helps you build excellent color palettes. These are mainly for data visualization, however they work for any use case. Let's take a quick tour of the application to get you started.",
          onNextClick: () => {
            // configStore.setLeftPanelRoute("controls");
            configStore.setRoute("examples");
            focusStore.clearColors();
            configStore.setColorSim("none");
            configStore.setEvalDisplayMode("regular");
            driverObj.moveNext();
          },
        },
      },

      {
        element: "#scatterplot",
        popover: {
          title: "Edit plane",
          onCloseClick: closeClick,
          description:
            "The edit plane shows the colors in your palette in a 2D space as a scatterplot and a strip plot. You can drag the colors around to adjust their position. You can also drag a box around a group of colors and move it around, just like you would in a graphics editor.",
          onNextClick: () => {
            configStore.setColorSim("deuteranopia");
            driverObj.moveNext();
          },
        },
      },
      {
        element: "#scatterplot",
        popover: {
          title: "Color Vision Deficiency Simulation",
          onCloseClick: closeClick,
          description:
            "You can simulate color vision deficiencies using the controls at the top of the page. This will help you make sure that your palettes are accessible to everyone. Let's try simulating a color vision deficiency.",
        },
      },
      {
        element: "#adjust-controls",
        popover: {
          title: "Color Controls",
          onCloseClick: closeClick,
          description:
            "We include several different controls for altering your colors! With a color selected, you can adjust the color using sliders, or use some basic color commands to change its color.",
          onNextClick: () => {
            driverObj.moveNext();
            focusStore.setColors([1]);
          },
        },
      },
      {
        element: "#left-panel",
        popover: {
          title: "Palette Pane",
          onCloseClick: closeClick,
          description:
            "Here are the colors in your palette! You can click on a color to select it and edit it. Each color also shows any issues we've found with it. You can learn more by clicking on the issue icon",
          onNextClick: () => {
            driverObj.moveNext();
          },
        },
      },
      {
        element: "#top-controls",
        popover: {
          title: "Top Controls",
          onCloseClick: closeClick,
          description:
            "The top controls allow you to create a new palette, undo and redo changes, and select from other palettes. ",
        },
      },
      {
        element: "#right-col > div:nth-child(1)",
        popover: {
          title: "Examples",
          onCloseClick: closeClick,
          description: `The examples tab gives you a few examples of the current palette in use. You can see how it looks on visualizations or on some vector graphics. If you want you can upload your own examples. Vector graphics are uploaded in SVG while visualizations are uploaded using Vega or Vega-Lite programs.

            You can simulate color vision deficiencies on the example by clicking the 'use simulated colors' button.

            Click on a color you want to edit to select it!`,
          onNextClick: () => {
            configStore.setRoute("compare");
            configStore.setComparePal(1);
            driverObj.moveNext();
          },
        },
      },
      {
        element: "#right-col > div:nth-child(1)",
        popover: {
          title: "Compare",
          onCloseClick: closeClick,
          description:
            "The compare tab allows you to compare your palette to other palettes. You can see how your palette compares to other palettes using the scatterplot. Check out the diff mode to see a comparison!",
          onNextClick: () => {
            configStore.setRoute("eval");

            driverObj.moveNext();
          },
          onPrevClick: () => {
            configStore.setRoute("examples");
            driverObj.movePrevious();
          },
        },
      },
      {
        element: "#right-col > div:nth-child(1)",
        popover: {
          title: "Evaluate",
          onCloseClick: closeClick,
          description:
            "The evaluate tab allows you to evaluate your palette across lots of different terms and features. If one of these checks (referred to as lints) is failing then you click 'fixes' to see what is wrong and help you fix it!",
          onPrevClick: () => {
            configStore.setRoute("compare");
            driverObj.movePrevious();
          },
        },
      },
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
