<script lang="ts">
  import focusStore from "../stores/focus-store";
  import Tooltip from "../components/Tooltip.svelte";
  import AdjustColor from "../controls/AdjustColor.svelte";
  import AlignSelection from "../controls/AlignSelection.svelte";
  import DistributePoints from "../controls/DistributePoints.svelte";
  import Rotate from "../controls/Rotate.svelte";

  import { buttonStyle } from "../lib/styles";

  $: numFocused = $focusStore.focusedColors.length;
</script>

<div class="flex flex-col">
  <div class="text-xs">Adjust</div>
  {#if numFocused >= 1}
    <Tooltip>
      <div slot="content" class="max-w-md">
        <div class="font-bold">Adjust</div>
        <AdjustColor />
        <div class="max-w-80 my-1">
          <Rotate />
        </div>
        {#if numFocused > 2}
          <div class="font-bold mt-1">Distribute</div>
          <DistributePoints />
        {/if}
        {#if numFocused >= 2}
          <div class="font-bold mt-1">Align</div>
          <AlignSelection />
        {/if}
      </div>
      <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
        Selected color{numFocused > 1 ? "s" : ""}
      </button>
    </Tooltip>
  {:else}
    <button class={`${buttonStyle} cursor-not-allowed opacity-50`}>
      Selected colors
    </button>
  {/if}
</div>
