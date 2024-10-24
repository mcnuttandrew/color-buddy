<script lang="ts">
  import { simpleTooltipRowStyle } from "../lib/styles";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import exampleStore from "../stores/example-store";
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  export let exampleName: string;
  $: examples = $exampleStore.examples as any[];
</script>

<Tooltip targetBody={false} bg="bg-white" top={0} positionAlongRightEdge={true}>
  <div
    slot="content"
    class="max-w-md bg-white flex flex-col justify-start w-52"
  >
    <button
      class={simpleTooltipRowStyle}
      on:click={() => configStore.setManageBrowsePreviewIdx(-1)}
    >
      Discs
    </button>
    <div class="w-full border border-stone-300 my-2" />
    {#each examples as example, idx}
      {#if example.svg}
        <button
          class={simpleTooltipRowStyle}
          on:click={() => configStore.setManageBrowsePreviewIdx(idx)}
        >
          {example.name}
        </button>
      {/if}
    {/each}
    <div class="w-full border border-stone-300 my-2" />
    {#each examples as example, idx}
      {#if example.vega}
        <button
          class={simpleTooltipRowStyle}
          on:click={() => configStore.setManageBrowsePreviewIdx(idx)}
        >
          {example.name}
        </button>
      {/if}
    {/each}
  </div>
  <button
    slot="target"
    let:toggle
    class={"p-2 whitespace-nowrap bg-white rounded w-44 flex justify-between border border-stone-300"}
    on:click={toggle}
  >
    <span>{exampleName || "Discs"}</span>
    <DownChev />
  </button>
</Tooltip>
