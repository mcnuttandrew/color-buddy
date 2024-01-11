<script lang="ts">
  import colorStore from "../stores/color-store";
  import { colorPickerConfig } from "../lib/Color";
  $: colorSpace = $colorStore.currentPal.colorSpace;
  const notAllowed = new Set(["rgb", "hsv", "hsl"]);
</script>

<div class="w-full flex flex-col">
  <label for="color-space-select">Color Space</label>
  <select
    id="color-space-select"
    value={colorSpace}
    on:change={(e) => {
      // @ts-ignore
      colorStore.setColorSpace(e.target.value);
    }}
  >
    {#each Object.entries(colorPickerConfig).filter((x) => !notAllowed.has(x[0])) as [space, { title }]}
      <option value={space}>{title}</option>
    {/each}
  </select>
</div>
