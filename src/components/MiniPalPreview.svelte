<script lang="ts">
  import type { Palette } from "../stores/color-store";
  export let pal: Palette;
  export let onClick: () => void;
</script>

<div class="relative mr-2 mb-2 flex justify-center items-center">
  <div class="w-full flex absolute top-0 opacity-50 pointer-events-none">
    {#each pal.colors as color}
      <div
        class="h-6"
        style="background-color: {color.toHex()}; width: {100 /
          pal.colors.length}%"
      ></div>
    {/each}
  </div>
  <button on:click={onClick}>
    {pal.name}
  </button>
</div>
