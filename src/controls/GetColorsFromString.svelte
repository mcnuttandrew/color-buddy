<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  let state: "idle" | "error" = "idle";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;

  function processBodyInput(body: string) {
    try {
      const newColors = body
        .split(",")
        .map((x) => x.replace(/"/g, "").trim())
        .filter((x) => x.length > 0)
        .map((x) => Color.colorFromString(x, colorSpace));
      colorStore.setCurrentPalColors(newColors);
      state = "idle";
    } catch (e) {
      console.error(e);
      state = "error";
      return;
    }
  }
  $: includeQuotes = $configStore.includeQuotes;
</script>

<div class="mt-2">
  <div class="flex justify-between w-full">
    <label for="current-colors">Current Colors</label>
    <!-- switch for including quotes -->
    <div class="flex items-center">
      <label for="include-quotes" class="mr-2">Include quotes</label>
      <input
        type="checkbox"
        id="include-quotes"
        class="mr-2"
        checked={includeQuotes}
        on:change={() => configStore.setIncludeQuotes(!includeQuotes)}
      />
    </div>
  </div>
  <textarea
    id="current-colors"
    class="w-full p-2 rounded"
    style="min-height: {2 * Math.ceil(colors.length / 3)}em;"
    value={colors
      .map((color) => color.toHex())
      .map((x) => (includeQuotes ? `"${x}"` : x))
      .join(", ")}
    on:change={(e) => {
      // @ts-ignore
      processBodyInput(e.target.value);
    }}
  />
  {#if state === "error"}
    <div class="text-red-500">Error parsing colors</div>
  {/if}
</div>
