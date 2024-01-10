<script lang="ts">
  import { colorFromString } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import navStore from "../../stores/nav-store";
  $: colors = $colorStore.currentPal.colors;
  let state: "idle" | "error" = "idle";
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";

  function processBodyInput(body: string) {
    try {
      const newColors = body
        .split(",")
        .map((x) => x.replace(/"/g, "").trim())
        .filter((x) => x.length > 0)
        .map((x) => colorFromString(x, colorSpace));
      colorStore.setCurrentPalColors(newColors);
      state = "idle";
    } catch (e) {
      console.error(e);
      state = "error";
      return;
    }
  }
  $: includeQuotes = $navStore.includeQuotes;
</script>

<div class="">
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
        on:change={() => navStore.setIncludeQuotes(!includeQuotes)}
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
