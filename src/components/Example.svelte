<script lang="ts">
  import { tick } from "svelte";
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "../content-modules/SwatchTooltipContent.svelte";
  import focusStore from "../stores/focus-store";
  import { idxToKey } from "../lib/charts";
  export let example: string;
  let focusedColor = false as false | number;
  function insertColorsToExample(
    example: string,
    colors: string[],
    bg: string
  ) {
    let svg = example.replace("SaLmOn", bg);
    //   .replace("<svg", `<svg overflow="visible" `);
    if (!svg.match(/<svg[^>]*\sheight="([^"]*)"/)) {
      svg = svg.replace("<svg", `<svg height="300px" `);
    }
    if (!svg.match(/<svg[^>]*\width="([^"]*)"/)) {
      svg = svg.replace("<svg", `<svg width="300px" `);
    }
    return colors.reduce(
      (acc, color, idx) => acc.replace(new RegExp(idxToKey(idx), "g"), color),
      svg
    );
  }
  $: colors = $colorStore.currentPal.colors;
  $: bg = $colorStore.currentPal.background;
  $: colors, example, attachListeners();
  function onClick(e: any) {
    const colorIdx = colors.findIndex(
      (x) => x.toHex() === e.target.getAttribute("fill")
    );
    if (colorIdx > -1) {
      focusedColor = colorIdx;
    }
  }

  async function attachListeners() {
    if (container) {
      container.querySelectorAll("path").forEach((x) => {
        x.removeEventListener("click", onClick);
      });
    }

    await tick();

    container.querySelectorAll("path").forEach((x) => {
      x.addEventListener("click", onClick);
    });
  }
  let container: HTMLDivElement;
  $: color = focusedColor !== false && colors[focusedColor];
</script>

<div class="">
  <div bind:this={container} class="example-container">
    {@html insertColorsToExample(
      example,
      colors.map((x) => x.toHex()),
      bg.toHex()
    )}
  </div>
  {#if color && focusedColor !== false}
    <Tooltip
      top={"0"}
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
    width: 250px;
    height: 250px;
    /* overflow: visible; */
  }
</style>
