<script lang="ts">
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import Example from "./Example.svelte";
  import Vega from "./Vega.svelte";
  import Swatches from "./Swatches.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let exampleIdx: number;
  export let setExampleIdx: (idx: number) => void;
  export let paletteIdx: number;
  export let allowModification: boolean = false;
  export let bgColor: string = "white";
  export let size: number = 400;
  $: example = { ...$exampleStore.examples[exampleIdx], size } as any;
  $: palette = $colorStore.palettes[paletteIdx];
</script>

<div class="flex flex-col">
  <Tooltip>
    <div slot="content" class="max-w-md">
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
    <button
      slot="target"
      let:toggle
      class={`${buttonStyle} pl-0`}
      on:click={toggle}
    >
      Change example: {example?.name || "Swatches"}
    </button>
  </Tooltip>
</div>
<div
  class="h-full flex justify-center items-center"
  style={`background: ${bgColor}`}
>
  {#if exampleIdx === -1}
    <Swatches
      {paletteIdx}
      hideHeader={true}
      allowInteraction={allowModification}
      maxWidth={size}
    />
  {:else}
    {#if example.svg}
      <Example
        example={example.svg}
        size={example.size}
        {palette}
        allowInteraction={true}
      />
    {/if}
    {#if example.vega}
      <Vega
        spec={example.vega}
        size={example.size}
        {palette}
        allowInteraction={true}
      />
    {/if}
  {/if}
</div>
