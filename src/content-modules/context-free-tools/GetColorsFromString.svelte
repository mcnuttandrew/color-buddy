<script lang="ts">
  import { colorFromString } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  $: colors = $colorStore.currentPal.colors;
  let state: "idle" | "error" = "idle";
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";
  function processBodyInput(body: string) {
    try {
      const newColors = body
        .split(",")
        .map((x) => x.trim())
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
</script>

<div class="">
  <label for="current-colors">Current Colors</label>
  <textarea
    id="current-colors"
    class="w-full p-2 rounded"
    style="min-height: {2 * Math.ceil(colors.length / 3)}em;"
    value={colors.map((color) => color.toHex()).join(", ")}
    on:change={(e) => {
      processBodyInput(e.target.value);
    }}
  />
  {#if state === "error"}
    <div class="text-red-500">Error parsing colors</div>
  {/if}
</div>
