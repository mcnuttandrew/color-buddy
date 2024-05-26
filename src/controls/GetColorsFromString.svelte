<script lang="ts">
  import { Color } from "../lib/Color";
  import type { ColorWrap } from "../types";
  import configStore from "../stores/config-store";
  import { wrapInBlankSemantics } from "../lib/utils";

  let state: "idle" | "error" = "idle";
  export let onChange: (colors: ColorWrap<Color>[]) => void;
  export let colors: ColorWrap<Color>[];
  export let colorSpace: string;

  function processBodyInput(body: string) {
    try {
      const newColors = body
        .split(",")
        .map((x) => x.replace(/"/g, "").trim())
        // remove all parens and brackets
        .map((x) => x.replace(/[\(\)\[\]]/g, ""))
        .filter((x) => x.length > 0)
        .map((x) => Color.colorFromString(x, colorSpace as any))
        .map((x, idx) => {
          if (colors[idx]) {
            return { ...colors[idx], color: x };
          } else {
            return wrapInBlankSemantics(x);
          }
        });
      onChange(newColors);
      state = "idle";
    } catch (e) {
      console.error(e);
      state = "error";
      return;
    }
  }
  $: includeQuotes = $configStore.includeQuotes;
</script>

<div class="w-full border-t-2 border-black my-2"></div>
<div class="mt-2">
  {#if state === "error"}
    <div class="text-red-500">Error parsing colors</div>
  {/if}
  <textarea
    id="current-colors"
    class="w-full p-2 rounded border-2 text-sm"
    value={colors
      .map((color) => color.color.toHex())
      .map((x) => (includeQuotes ? `"${x}"` : x))
      .join(", ")}
    on:keydown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        processBodyInput(e.currentTarget.value);
        e.currentTarget.blur();
      }
    }}
    on:change={(e) => processBodyInput(e.currentTarget.value)}
  />
  <div class="flex justify-between w-full text-sm">
    <label for="current-colors">Current Colors</label>
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
</div>

<style>
  #current-colors {
    height: 6rem;
    resize: vertical;
  }
</style>
