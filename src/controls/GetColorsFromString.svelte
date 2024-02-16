<script lang="ts">
  import { Color } from "../lib/Color";
  import configStore from "../stores/config-store";
  import Sort from "./Sort.svelte";
  let state: "idle" | "error" = "idle";
  export let onChange: (colors: Color[]) => void;
  export let colors: Color[];
  export let colorSpace: string;
  export let allowSort: boolean;

  function processBodyInput(body: string) {
    try {
      const newColors = body
        .split(",")
        .map((x) => x.replace(/"/g, "").trim())
        .filter((x) => x.length > 0)
        .map((x) => Color.colorFromString(x, colorSpace as any));
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
    class="w-full p-2 rounded"
    style="min-height: {2 * Math.ceil(colors.length / 3)}em;"
    value={colors
      .map((color) => color.toHex())
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
