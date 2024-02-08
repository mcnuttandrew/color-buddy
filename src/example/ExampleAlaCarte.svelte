<script lang="ts">
  import exampleStore from "../stores/example-store";
  import Example from "./Example.svelte";
  import Vega from "./Vega.svelte";
  import Swatches from "./Swatches.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let exampleIdx: number;
  export let setExampleIdx: (idx: number) => void;
  export let paletteIdx: number;
  export let allowModification: boolean = false;
  $: example = {
    ...$exampleStore.examples[exampleIdx],
    size: 400,
  } as any;
</script>

<div class="flex flex-col">
  <Tooltip>
    <div slot="content">
      <button
        class={buttonStyle}
        on:click={() => {
          setExampleIdx(-1);
        }}
      >
        Swatches
      </button>
      {#each $exampleStore.examples as example, idx}
        <button
          class={buttonStyle}
          on:click={() => {
            setExampleIdx(idx);
          }}
        >
          {example.name}
        </button>
      {/each}
    </div>
    <button slot="target" let:toggle class={buttonStyle} on:click={toggle}>
      Change example: {example?.name || "Swatches"}
    </button>
  </Tooltip>
</div>
<div class="h-full flex justify-center items-center p-4">
  {#if exampleIdx === -1}
    <Swatches
      {paletteIdx}
      hideHeader={true}
      allowInteraction={allowModification}
    />
  {:else}
    {#if example.svg}
      <Example example={example.svg} size={example.size} {paletteIdx} />
    {/if}
    {#if example.vega}
      <Vega spec={example.vega} size={example.size} {paletteIdx} />
    {/if}
  {/if}
</div>
