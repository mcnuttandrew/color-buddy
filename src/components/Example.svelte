<script lang="ts">
  import { tick } from "svelte";
  import colorStore from "../stores/color-store";
  import { Color } from "../lib/Color";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "../content-modules/SwatchTooltipContent.svelte";
  import focusStore from "../stores/focus-store";
  import { idxToKey } from "../lib/charts";
  export let example: string;
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
    bg: string
  ) {
    const numInUse = countNumberOfExamplesInUse(example);
    let svg = example.replace("rebekkablue", bg);
    //   .replace("<svg", `<svg overflow="visible" `);
    if (!svg.match(/<svg[^>]*\sheight="([^"]*)"/)) {
      svg = svg.replace("<svg", `<svg height="300px" `);
    }
    if (!svg.match(/<svg[^>]*\width="([^"]*)"/)) {
      svg = svg.replace("<svg", `<svg width="300px" `);
    }
    for (let i = 0; i < numInUse; i++) {
      svg = svg.replace(
        new RegExp(idxToKey(i), "g"),
        colors[i % colors.length]
      );
    }
    return svg;
  }
  $: colors = $colorStore.currentPal.colors;
  $: bg = $colorStore.currentPal.background;
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
      container.querySelectorAll(query).forEach((x) => {
        x.removeEventListener("click", onClick);
      });
    }

    await tick();

    container.querySelectorAll(query).forEach((x) => {
      x.addEventListener("click", onClick);
    });
  }
  let container: HTMLDivElement;
  $: color = focusedColor !== false && colors[focusedColor];
  $: mappedColors = colors.map((x) => x.toHex());
</script>

<div class="relative">
  <div bind:this={container} class="example-container">
    {@html insertColorsToExample(example, mappedColors, bg.toHex())}
  </div>
  {#if color && focusedColor !== false}
    <Tooltip
      top={"-20px"}
      allowDrag={true}
      initiallyOpen={true}
      onClose={() => {
        focusStore.clearColors();
        focusedColor = false;
      }}
    >
      <div slot="content" class="flex flex-col" let:onClick>
        <SwatchTooltipContent
          {color}
          closeTooltip={onClick}
          idx={focusedColor}
        />
      </div>
    </Tooltip>
  {/if}
</div>

<style>
  .example-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
