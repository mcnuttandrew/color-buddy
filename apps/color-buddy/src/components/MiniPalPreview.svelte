<script lang="ts">
  import type { Palette } from "@color-buddy/palette-lint";
  export let pal: Palette;
  export let onClick: () => void;
  export let className = "";

  export let opacityClass = "opacity-30";
</script>

<div class="relative mr-2 mb-2 flex justify-center items-center {className}">
  <div class="w-full flex absolute top-0 {opacityClass} pointer-events-none">
    {#each pal.colors as color}
      <div
        class="h-6"
        style="background-color: {color.color.toHex()}; width: {100 /
          pal.colors.length}%"
      ></div>
    {/each}
  </div>
  <button on:click={onClick}>
    {pal.name}
  </button>
</div>
