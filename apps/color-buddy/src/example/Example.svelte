<script lang="ts">
  import { tick } from "svelte";

  import { Color, cvdSim } from "color-buddy-palette";
  import {} from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";

  import configStore from "../stores/config-store";
  import focusStore from "../stores/focus-store";
  import { idxToKey } from "../lib/charts";
  import InView from "../components/InView.svelte";

  export let example: string;
  export let size = 300;
  export let palette: Palette;
  export let allowInteraction = true;
  export let bgColor: string;
  $: bg = bgColor || currentPal.background.toHex();

  let focusedColor = false as false | number;
  function countNumberOfExamplesInUse(example: string): number {
    let inUse = 0;
    while (example.match(new RegExp(idxToKey(inUse), "g"))) {
      inUse++;
    }
    return inUse;
  }
  function insertColorsToExample(
    example: string,
    colors: string[],
    bg: string,
    size: number = 250
  ) {
    const numInUse = countNumberOfExamplesInUse(example);
    let svg = example.replace("rebekkablue", bg);
    if (!svg.match(/<svg[^>]*\sheight="([^"]*)"/)) {
      svg = svg.replace("<svg", `<svg height="300px" `);
    }
    if (!svg.match(/<svg[^>]*\width="([^"]*)"/)) {
      svg = svg.replace("<svg", `<svg width="300px" `);
    }
    // set the width and height
    svg = svg.replace(/\sheight="([^"]*)"/, `height="${size}px" `);
    svg = svg.replace(/\width="([^"]*)"/, `width="${size}px" `);

    for (let i = 0; i < numInUse; i++) {
      svg = svg.replace(
        new RegExp(idxToKey(i), "g"),
        colors[i % colors.length]
      );
    }
    return svg;
  }
  $: currentPal = palette;
  $: colors = currentPal.colors;
  $: {
    if (
      $configStore.colorSim !== "none" &&
      $configStore.useSimulatorOnExamples
    ) {
      colors = colors.map((x) => cvdSim($configStore.colorSim, x));
    } else {
      colors = currentPal.colors;
    }
  }

  $: colors, example, attachListeners();

  function onClick(e: any) {
    const computedFill = window.getComputedStyle(e.target)["fill"];
    const color = Color.colorFromString(computedFill, "lab")
      .toHex()
      .toLowerCase();
    const colorIdx = colors.findIndex((x) => x.toHex().toLowerCase() === color);
    if (colorIdx > -1) {
      focusedColor = colorIdx;
      focusStore.setColors([colorIdx]);
    }
  }

  const query = "path,circle,rect,line";
  async function attachListeners() {
    if (!allowInteraction) {
      return;
    }
    if (!container) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    if (!container) {
      return;
    }
    if (container) {
      container?.querySelectorAll(query).forEach((x) => {
        x.removeEventListener("click", onClick);
      });
    }

    await tick();

    container?.querySelectorAll(query).forEach((x) => {
      x.addEventListener("click", onClick);
    });
  }
  let container: HTMLDivElement;
  $: mappedColors = colors.map((x) => x.toHex());
</script>

<div class="relative">
  <div
    bind:this={container}
    class="flex justify-center items-center"
    class:example-container={allowInteraction}
  >
    <InView>
      {@html insertColorsToExample(example, mappedColors, bg, size)}
    </InView>
  </div>
</div>
