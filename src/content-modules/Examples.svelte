<script lang="ts">
  import colorStore from "../stores/color-store";
  import { charts } from "../lib/charts";
  import Vega from "../components/Vega.svelte";
  import TinyWebpage from "../content-modules/TinyWebpage.svelte";
  import TextBlock from "../content-modules/TextBlock.svelte";

  $: bg = $colorStore.currentPal.background;
  let chartGroups = Object.fromEntries(charts.map((x) => [x.group, true]));
  let options: Record<string, boolean> = {
    pages: true,
    ...chartGroups,
  };
</script>

<div
  class=" h-1/2 flex-col flex flex-wrap overflow-auto p-4 max-h-1/2"
  style={`background-color: ${bg.toHex()}`}
>
  <div class="flex">
    {#each Object.keys(options) as group}
      <label for={`${group}-checkbox`}>{group}</label>
      <input
        id={`${group}-checkbox`}
        type="checkbox"
        bind:checked={options[group]}
      />
    {/each}
  </div>
  {#if options.pages}
    <TinyWebpage />
  {/if}
  {#if options.text}
    <TextBlock />
  {/if}
  {#each charts as { chart, group }}
    {#if options[group]}
      <Vega spec={chart($colorStore.currentPal)} />
    {/if}
  {/each}
</div>
