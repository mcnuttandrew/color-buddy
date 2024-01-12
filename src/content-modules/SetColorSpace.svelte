<script lang="ts">
  import colorStore from "../stores/color-store";
  import { colorPickerConfig } from "../lib/Color";
  $: colorSpace = $colorStore.currentPal.colorSpace;
  const notAllowed = new Set(["rgb", "hsv", "hsl"]);
  const onChange = (e: any) => colorStore.setColorSpace(e.target.value);
</script>

<div class="w-full flex flex-col">
  <label for="color-space-select">Color Space</label>
  <select id="color-space-select" value={colorSpace} on:change={onChange}>
    {#each Object.entries(colorPickerConfig)
      .sort()
      .filter((x) => !notAllowed.has(x[0].toLowerCase())) as [space, { title }]}
      <option value={space}>{title}</option>
    {/each}
  </select>
</div>
