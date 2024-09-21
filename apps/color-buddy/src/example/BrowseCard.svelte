<script lang="ts">
  import type { Palette } from "color-buddy-palette";

  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
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
  export let targetBody: boolean = true;
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
  let renaming = false;
</script>

<div
  class="flex flex-col border-2 rounded w-min min-w-fit mr-4 mb-2 browse-card shrink self-start"
  style={`background: ${palette.background.toHex()}; min-height: ${minHeight}px;`}
  class:border-stone-700={markAsCurrent}
  class:border-t-8={markAsCurrent}
  class:mt-2={!markAsCurrent}
>
  <div class="bg-white w-full flex justify-between p-1">
    <!-- header -->
    <div class="flex">
      {#if titleClick}
        <button class="mr-1 title" on:click={titleClick}>
          {title}
        </button>
      {:else}
        <div class="mr-1 title">
          {title}
        </div>
      {/if}
    </div>

    <!-- controls -->
    <Tooltip positionAlongRightEdge={true} {targetBody} top={0} bg="bg-white">
      <button slot="target" let:toggle on:click={toggle}>
        <DownChev />
      </button>
      <div slot="content" class="flex flex-col items-start w-64" let:onClick>
        {#each operations as op}
          {#if op === "break"}
            <div class="border-b border-stone-300 w-full my-1"></div>
          {:else}
            <button
              class={`${simpleTooltipRowStyle} whitespace-nowrap`}
              on:click={() => {
                op.action();
                if (op.closeOnClick) onClick();
              }}
            >
              {op.name}
            </button>
          {/if}
        {/each}
        {#if onRename}
          <button
            class={`${simpleTooltipRowStyle} `}
            on:click={() => (renaming = true)}
          >
            Rename
          </button>
          {#if renaming}
            <input
              value={title}
              class={`${buttonStyle} w-full`}
              on:change={(e) => {
                onRename(e.currentTarget.value);
                renaming = false;
                onClick();
              }}
            />
          {/if}
        {/if}
      </div>
    </Tooltip>
  </div>
  <!-- body -->

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="flex shrink justify-center items-center p-4"
    class:cursor-pointer={titleClick}
    on:click={() => titleClick && titleClick()}
  >
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
