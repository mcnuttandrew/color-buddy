<script lang="ts">
  import { tick } from "svelte";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { Color } from "../lib/Color";
  import focusStore from "../stores/focus-store";
  import { idxToKey } from "../lib/charts";
  import simulate_cvd from "../lib/blindness";
  export let example: string;
  export let size = 300;
  export let paletteIdx: number;
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
  $: currentPal = $colorStore.palettes[paletteIdx];
  $: colors = currentPal.colors;
  $: {
    if (
      $configStore.colorSim !== "none" &&
      $configStore.useSimulatorOnExamples
    ) {
      colors = colors.map((x) => simulate_cvd($configStore.colorSim, x));
    } else {
      colors = currentPal.colors;
    }
  }
  $: bg = currentPal.background;
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
  $: color = focusedColor !== false && colors[focusedColor];
  $: mappedColors = colors.map((x) => x.toHex());
</script>

<div class="relative">
  <div bind:this={container} class="example-container">
    {@html insertColorsToExample(example, mappedColors, bg.toHex(), size)}
  </div>
</div>

<style>
  .example-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
