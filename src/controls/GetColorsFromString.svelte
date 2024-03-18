<script lang="ts">
  import { Color } from "../lib/Color";
  import type { ColorWrap } from "../types";
  import configStore from "../stores/config-store";
  import { wrapInBlankSemantics } from "../lib/utils";
  import Sort from "./Sort.svelte";
  let state: "idle" | "error" = "idle";
  export let onChange: (colors: ColorWrap<Color>[]) => void;
  export let colors: ColorWrap<Color>[];
  export let colorSpace: string;
  export let allowSort: boolean;

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

<div class="mt-2">
  <div class="flex justify-between w-full">
    {#if allowSort}
      <Sort />
    {:else}
      <div></div>
    {/if}
    <!-- <label for="current-colors">Current Colors</label> -->
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
    class="w-full p-2 rounded border-2"
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
  {#if state === "error"}
    <div class="text-red-500">Error parsing colors</div>
  {/if}
</div>
