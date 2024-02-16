<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import PalPreview from "../components/PalPreview.svelte";

  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
</script>

<div class="overflow-auto">
  {#each $colorStore.palettes as pal, i}
    <div class="flex flex-col mt-2 h-fit">
      <div class="flex items-center justify-between">
        <div>
          {#if i === $colorStore.currentPal}
            <span class="font-bold">Current:</span>
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
          <div slot="content" let:onClick class="flex flex-col">
            <button
              class={buttonStyle}
              on:click={() => {
                configStore.setComparePal(i);
                configStore.setRoute("compare");
                onClick();
              }}
            >
              Compare with current
            </button>
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
            {#if i !== 0}
              <button
                class={buttonStyle}
                on:click={() => {
                  const pals = $colorStore.palettes;
                  const newIdx = i - 1;
                  if (newIdx < 0) return;
                  const newPals = [...pals];
                  newPals[i] = pals[newIdx];
                  newPals[newIdx] = pals[i];
                  colorStore.setPalettes(newPals);

                  onClick();
                }}
              >
                Move up
              </button>
            {/if}
            {#if i !== $colorStore.palettes.length - 1}
              <button
                class={buttonStyle}
                on:click={() => {
                  const pals = $colorStore.palettes;
                  const newIdx = i + 1;
                  if (newIdx >= pals.length) return;
                  const newPals = [...pals];
                  newPals[i] = pals[newIdx];
                  newPals[newIdx] = pals[i];
                  colorStore.setPalettes(newPals);

                  onClick();
                }}
              >
                Move down
              </button>
            {/if}
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
