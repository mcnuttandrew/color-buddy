<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import Vega from "./Vega.svelte";
  import Example from "./Example.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import ContentEditable from "../components/ContentEditable.svelte";
  export let example: any;
  export let idx: number;
  export let bg: string;
  export let clickExample: (example: any, idx: number) => void;
  $: size = example.size || 250;
  $: operations = [
    { name: "Edit", action: () => clickExample(example, idx), condition: true },
    {
      name: "Delete",
      action: () => exampleStore.deleteExample(idx),
      condition: true,
    },
    {
      name: "Hide",
      action: () => exampleStore.toggleHidden(idx),
      condition: true,
    },

    {
      name: "Focus (expand and hide others)",
      action: () => {
        exampleStore.hideAllExcept(idx);
        exampleStore.setExampleSize(idx, 600);
      },
      condition: true,
    },
    {
      name: "Expand",
      action: () => exampleStore.setExampleSize(idx, 600),
      condition: size !== 600,
    },
    {
      name: "Reset size",
      action: () => exampleStore.setExampleSize(idx, 250),
      condition: size !== 250,
    },
    {
      name: "Shrink",
      action: () => exampleStore.setExampleSize(idx, 50),
      condition: size !== 50,
    },
  ].filter((x) => x.condition);
</script>

<div
  class="flex flex-col border-2 rounded w-min mr-4 mb-2"
  style="background: {bg};"
>
  <div class="bg-stone-300 w-full flex justify-between p-1">
    <div class="flex">
      <div class="mr-1">Example</div>
      <ContentEditable
        value={example.name || idx}
        onChange={(e) => exampleStore.setExampleName(idx, e)}
      />
    </div>

    <Tooltip positionAlongRightEdge={true}>
      <button slot="target" class={buttonStyle} let:toggle on:click={toggle}>
        Options ⚙
      </button>
      <div slot="content" class="flex flex-col items-start">
        {#each operations as { name, action }}
          <button class={buttonStyle} on:click={action}>{name}</button>
        {/each}
      </div>
    </Tooltip>
  </div>
  <div class="h-full flex justify-center items-center p-4">
    {#if example.svg}
      <Example
        example={example.svg}
        size={example.size}
        paletteIdx={$colorStore.currentPal}
      />
    {/if}
    {#if example.vega}
      <Vega
        spec={example.vega}
        size={example.size}
        paletteIdx={$colorStore.currentPal}
      />
    {/if}
  </div>
</div>
