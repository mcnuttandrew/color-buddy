<script lang="ts">
  import colorStore from "../stores/color-store";
  import { colorPickerConfig, toColorSpace } from "../lib/Color";
  $: colors = $colorStore.currentPal.colors;
  const notAllowed = new Set(["rgb", "hsv", "hsl"]);
</script>

<div class="w-full flex flex-col">
  <label for="color-space-select">Color Space</label>
  <select
    id="color-space-select"
    value={colors[0] && colors[0].spaceName}
    on:change={(e) => {
      const newColors = colors.map((color) =>
        // @ts-ignore
        toColorSpace(color, e.target.value)
      );
      colorStore.setCurrentPalColors(newColors);
    }}
  >
    {#each Object.entries(colorPickerConfig).filter((x) => !notAllowed.has(x[0])) as [space, { title }]}
      <option value={space}>{title}</option>
    {/each}
  </select>
</div>
