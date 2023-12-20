<script lang="ts">
  import { flip } from "svelte/animate";
  import type { Palette } from "../stores/color-store";
  import { deDup } from "../lib/utils";
  const colorClass = "w-6 h-6 mx-2 rounded-full";
  export let pal: Palette;
  $: colors = deDup(pal.colors);
</script>

<div
  class="flex flex-wrap rounded p-2"
  style="background-color: {pal.background.toHex()};"
>
  {#each colors as color (color.toHex())}
    <div
      animate:flip={{ duration: 200 }}
      class={colorClass}
      class:text-white={color.toChroma().luminance() < 0.5}
      style="background-color: {color.toHex()}"
    ></div>
  {/each}
</div>
