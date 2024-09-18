<script lang="ts">
  import type { Palette } from "color-buddy-palette";

  import { buttonStyle } from "../lib/styles";
  import exampleStore from "../stores/example-store";
  import Vega from "./Vega.svelte";
  import Example from "./Example.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import PalPreview from "../components/PalPreview.svelte";

  import ContentEditable from "../components/ContentEditable.svelte";

  export let allowResize: boolean;
  export let allowInteraction: boolean;
  export let onRename: false | ((name: string) => void) = false;
  export let operations: (
    | { name: string; action: () => void; closeOnClick: boolean }
    | "break"
  )[];
  export let usePortal: boolean = true;
  export let palette: Palette;
  export let previewIndex: number;
  export let titleClick: (() => void) | false;
  export let title: string;
  export let markAsCurrent: boolean;

  $: minHeight = previewIndex === -1 ? 50 : 270;
  $: example = { ...$exampleStore.examples[previewIndex] } as any;
  $: {
    if (example && !allowResize) {
      example.size = 250;
    }
  }
</script>

<div
  class="flex flex-col border-2 rounded w-min min-w-fit mr-4 mb-2 browse-card shrink self-start"
  style={`background: ${palette.background.toHex()}; min-height: ${minHeight}px;`}
>
  <div class="bg-white w-full flex justify-between p-1">
    <div class="flex">
      {#if markAsCurrent}
        <div class="mr-1 font-bold italic">Current:</div>
      {/if}
      {#if onRename}
        <ContentEditable
          value={title}
          onChange={onRename}
          limitWidth={true}
          useEditButton={true}
          onClick={() => titleClick && titleClick()}
        />
      {:else if titleClick}
        <button class="mr-1 title" on:click={titleClick}>
          {title}
        </button>
      {:else}
        <div class="mr-1 title">
          {title}
        </div>
      {/if}
    </div>

    <Tooltip positionAlongRightEdge={true} {usePortal}>
      <button slot="target" let:toggle on:click={toggle}>⌄</button>
      <div slot="content" class="flex flex-col items-start" let:onClick>
        {#each operations as op}
          {#if op === "break"}
            <div class="border-b border-stone-300 w-full my-1"></div>
          {:else}
            <button
              class={buttonStyle}
              on:click={() => {
                op.action();
                if (op.closeOnClick) onClick();
              }}
            >
              {op.name}
            </button>
          {/if}
        {/each}
      </div>
    </Tooltip>
  </div>
  <div class="flex shrink justify-center items-center p-4">
    {#if previewIndex === -1}
      <PalPreview pal={palette} allowModification={false} />
    {:else if !example}
      <div
        class="animate-spin h-8 w-8 border-t-2 border-b-2 border-stone-300"
      ></div>
    {:else}
      {#if example && example.svg}
        <Example
          example={example.svg}
          size={example.size}
          {palette}
          {allowInteraction}
        />
      {/if}
      {#if example && example.vega}
        <Vega
          spec={example.vega}
          size={example.size}
          {palette}
          {allowInteraction}
        />
      {/if}
    {/if}
  </div>
</div>

<style>
  .title {
    max-width: 205px;
    white-space: break-spaces;
    line-break: anywhere;
  }
  .browse-card {
    min-width: 280px;
  }
</style>
