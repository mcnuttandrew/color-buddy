<script lang="ts">
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import Example from "./Example.svelte";
  import Vega from "./Vega.svelte";
  import Swatches from "./Swatches.svelte";

  export let exampleIdx: number;
  export let paletteIdx: number | "tempPal";
  export let allowModification: boolean = false;
  export let bgColor: string = "white";
  export let size: number = 400;

  $: example = { ...$exampleStore.examples[exampleIdx], size } as any;
  $: palette =
    paletteIdx === "tempPal"
      ? $configStore.tempPal!
      : $colorStore.palettes[paletteIdx];
</script>

<div
  class="h-full flex justify-center items-center"
  style={`background: ${bgColor}`}
>
  {#if exampleIdx === -1}
    <Swatches
      {paletteIdx}
      allowInteraction={allowModification}
      maxWidth={size}
    />
  {:else}
    {#if example.svg}
      <Example
        example={example.svg}
        size={example.size}
        {bgColor}
        {palette}
        allowInteraction={true}
      />
    {/if}
    {#if example.vega}
      <Vega
        spec={example.vega}
        size={example.size}
        {bgColor}
        {palette}
        allowInteraction={true}
      />
    {/if}
  {/if}
</div>
