<script lang="ts">
  import colorStore from "../stores/color-store";

  import PalPreview from "../components/PalPreview.svelte";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
</script>

<div class="overflow-auto">
  {#each $colorStore.palettes as pal}
    <div class="flex flex-col mt-2 h-fit">
      <div class="flex items-center justify-between">
        <div>
          <button
            class={buttonStyle}
            on:click={() => colorStore.startUsingPal(pal.name)}
          >
            {pal.name}
          </button>
        </div>
        <Tooltip>
          <div slot="content" let:onClick>
            <button
              class={buttonStyle}
              on:click={() => colorStore.copyPal(pal.name)}
            >
              Copy
            </button>
            <button
              class={buttonStyle}
              on:click={() => {
                colorStore.removePal(pal.name);
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
