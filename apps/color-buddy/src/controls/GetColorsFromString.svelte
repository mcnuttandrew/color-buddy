<script lang="ts">
  import { Color } from "@color-buddy/palette-check";
  import type { ColorWrap } from "../types";
  import configStore from "../stores/config-store";
  import { wrapInBlankSemantics, processBodyTextToColors } from "../lib/utils";

  let state: "idle" | "error" = "idle";
  export let onChange: (colors: ColorWrap<Color>[]) => void;
  export let colors: ColorWrap<Color>[];
  export let colorSpace: string;
  let errorMsg = "";

  function processBodyInput(body: string) {
    try {
      const newColors = processBodyTextToColors(body, colorSpace).map(
        (x, idx) => {
          if (colors[idx]) {
            return { ...colors[idx], color: x };
          } else {
            return wrapInBlankSemantics(x);
          }
        }
      );
      onChange(newColors);
      state = "idle";
    } catch (e) {
      console.error(e);
      errorMsg = (e as any)?.message;
      state = "error";
      return;
    }
  }
  $: includeQuotes = $configStore.includeQuotes;
</script>

<div class="w-full border-t-2 border-black my-2"></div>
<div class="mt-2">
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
  {#if state === "error"}
    <div class="text-red-500">Error parsing colors. {errorMsg}</div>
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
</div>

<style>
  #current-colors {
    height: 6rem;
    resize: vertical;
  }
</style>
