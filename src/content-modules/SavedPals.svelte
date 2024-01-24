<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";

  import PalPreview from "../components/PalPreview.svelte";

  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
</script>

<div class="w-full border-t-2 border-black my-2"></div>
<div class="overflow-auto">
  {#each $colorStore.palettes as pal, i}
    <div class="flex flex-col mt-2 h-fit">
      <div class="flex items-center justify-between">
        <div>
          {#if i === $colorStore.currentPal}
            <span class="font-bold">Current Pal:</span>
          {/if}
          <button
            class={buttonStyle}
            on:click={() => {
              focusStore.clearColors();
              colorStore.startUsingPal(i);
            }}
          >
            {pal.name}
          </button>
        </div>
        <Tooltip>
          <div slot="content" let:onClick>
            <button
              class={buttonStyle}
              on:click={() => colorStore.duplicatePal(i)}
            >
              Duplicate
            </button>
            <button
              class={buttonStyle}
              on:click={() => {
                colorStore.removePal(i);
                onClick();
              }}
            >
              Delete
            </button>
          </div>
          <button
            slot="target"
            let:toggle
            class={buttonStyle}
            on:click={toggle}
          >
            ⚙
          </button>
        </Tooltip>
      </div>
      <PalPreview {pal} />
    </div>
  {/each}
</div>
