<script lang="ts">
  import { tick } from "svelte";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { idxToKey } from "../lib/charts";
  export let example: string;
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
  $: colors, attachListeners();

  function onClick(e: any) {
    console.log("click");
    const colorIdx = colors.findIndex(
      (x) => x.toHex() === e.target.getAttribute("fill")
    );
    if (colorIdx !== -1) {
      if (e.shiftKey || e.metaKey) {
        focusStore.toggleColor(colorIdx);
      } else {
        focusStore.setColors([colorIdx]);
      }
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
</script>

<div bind:this={container} class="example-container">
  {@html insertColorsToExample(
    example,
    colors.map((x) => x.toHex()),
    bg.toHex()
  )}
</div>
