<script lang="ts">
  import { flip } from "svelte/animate";
  import type { Palette } from "../stores/color-store";
  import { deDup } from "../lib/utils";
  export let pal: Palette;
</script>

<div
  class="flex flex-wrap rounded p-2 grow"
  style="background-color: {pal.background.toHex()};"
>
  {#each deDup(pal.colors) as color (color.toHex())}
    <div
      animate:flip={{ duration: 200 }}
      class={"w-6 h-6 mx-2 rounded-full"}
      style="background-color: {color.toHex()}"
    ></div>
  {/each}
</div>
