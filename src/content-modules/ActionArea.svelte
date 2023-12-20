<script lang="ts">
  import { Color, colorFromChannels } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { opposingColor } from "../lib/utils";

  import DeleteSelection from "./brushes/DeleteSelection.svelte";
  import AlignSelection from "./brushes/AlignSelection.svelte";
  import CreateAverage from "./brushes/CreateAverage.svelte";
  import SuggestionModificationToSelection from "./brushes/SuggestionModificationToSelection.svelte";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;

  function actionOnColor(idx: number, action: (Color: Color) => any) {
    const newColor = action(colors[idx]);
    const newColors = [...colors];
    newColors[idx] = newColor;
    colorStore.setCurrentPalColors(newColors);
  }
</script>

<div class="flex flex-col bg-slate-400 w-full p-2 h-20">
  <!-- Action Panel -->
  <div class="flex">
    {#if focusedColors.length === 1}
      <div class="flex">
        {#each ["brighten", "darken", "saturate", "desaturate"] as action}
          <button
            class="underline mr-2"
            on:click={() => {
              actionOnColor(focusedColors[0], (color) => {
                // @ts-ignore
                const chromaColor = color.toChroma()[action]();
                return colorFromChannels(chromaColor.lab(), "lab");
              });
            }}
          >
            {action[0].toUpperCase()}{action.slice(1)}
          </button>
        {/each}

        <button
          class="underline mr-2"
          on:click={() =>
            actionOnColor(focusedColors[0], (color) => opposingColor(color))}
        >
          Opposing Color
        </button>
      </div>
    {/if}

    <CreateAverage />
    <SuggestionModificationToSelection />

    <div>TODO Distribute vertical / horizontally</div>
    <AlignSelection />
    {#if focusedColors.length > 0}
      <div>
        <button
          class="underline mr-2"
          on:click={() => focusStore.clearColors()}
        >
          Clear Selection
        </button>
      </div>
    {/if}
    <DeleteSelection />
  </div>
</div>

<style>
  .action-area {
    min-width: 300px;
  }
</style>
