<script lang="ts">
  import { Color } from "color-buddy-palette";
  import configStore from "../stores/config-store";
  import { processBodyTextToColors } from "../lib/utils";
  import Tooltip from "../components/Tooltip.svelte";
  import Export from "virtual:icons/fa6-solid/file-export";

  let state: "idle" | "error" = "idle";
  export let onChange: (colors: Color[]) => void;
  export let colors: Color[];
  export let colorSpace: string;
  let errorMsg = "";

  function processBodyInput(body: string) {
    try {
      const newColors = processBodyTextToColors(body, colorSpace).map(
        (x, idx) => {
          if (colors[idx]) {
            x.tags = colors[idx].tags;
          }
          return x;
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

<Tooltip bg="bg-white">
  <div slot="content" class="mt-2">
    <label for="current-colors" class="italic">Current Colors</label>
    <div class="flex justify-between w-full text-sm">
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
  </div>
  <button
    slot="target"
    class={"border border-stone-400 rounded mr-2 h-8 w-8 flex justify-center items-center"}
    let:toggle
    on:click={toggle}
  >
    <Export />
  </button>
</Tooltip>

<style>
  #current-colors {
    height: 6rem;
    resize: vertical;
  }
</style>
