<script lang="ts">
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  import { avgColors, opposingColor } from "../utils";
  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;

  function actionOnColor(idx: number, action: (Color: any) => any) {
    const newColor = action(colors[idx]);
    const newColors = [...colors];
    newColors[idx] = newColor;
    colorStore.setCurrentPalColors(newColors);
  }
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  Action Panel
  <div class="flex">
    {#if focusedColors.length === 1}
      <div class="flex">
        {#each ["brighten", "darken", "saturate", "desaturate"] as action}
          <button
            class="underline mr-2"
            on:click={() => {
              actionOnColor(focusedColors[0], (color) => color[action]());
            }}
          >
            {action[0].toUpperCase()}{action.slice(1)}
          </button>
        {/each}
        <button
          class="underline mr-2"
          on:click={() => {
            colorStore.setCurrentPalColors(
              colors.filter((_, idx) => idx !== focusedColors[0])
            );
            focusStore.clearColors();
          }}
        >
          Delete
        </button>
        <button
          class="underline mr-2"
          on:click={() =>
            actionOnColor(focusedColors[0], (color) => opposingColor(color))}
        >
          Opposing Color
        </button>
      </div>
    {/if}

    {#if focusedColors.length > 1}
      {#each ["hsl", "rgb", "lab"] as colorSpace}
        <button
          class="underline mr-2"
          on:click={() => {
            const newColor = avgColors(
              focusedColors.map((idx) => colors[idx]),
              colorSpace
            );
            colorStore.setCurrentPalColors([...colors, newColor]);
          }}
        >
          {colorSpace} avg
        </button>
      {/each}
    {/if}
    <button class="underline mr-2" on:click={() => focusStore.clearColors()}>
      Clear Selection
    </button>
  </div>
</div>

<style>
  .color-container {
    max-width: 640px;
  }
</style>
