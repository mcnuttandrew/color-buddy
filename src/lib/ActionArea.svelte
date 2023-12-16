<script lang="ts">
  import chroma from "chroma-js";
  import type { Color } from "chroma-js";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  import { avgColors, opposingColor } from "../utils";
  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: focusLabs = focusedColors.map((idx) => colors[idx].lab());

  function actionOnColor(idx: number, action: (Color: any) => any) {
    const newColor = action(colors[idx]);
    const newColors = [...colors];
    newColors[idx] = newColor;
    colorStore.setCurrentPalColors(newColors);
  }

  const mapFocusedColors = (fn: (color: [number, number, number]) => any) =>
    colors.map((color, idx) => (focusSet.has(idx) ? fn(color.lab()) : color));

  const ALIGNS = [
    { pos: 1, name: "Align Left", op: Math.min },
    { pos: 1, name: "Align Right", op: Math.max },
    { pos: 2, name: "Align Top", op: Math.max },
    { pos: 2, name: "Align Bottom", op: Math.min },
  ];
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  Action Panel
  <div class="flex flex-wrap">
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
      {#each ALIGNS as { pos, name, op }}
        <button
          class="underline mr-2"
          on:click={() => {
            const newCoordinate = op(...focusLabs.map((x) => x[pos]));
            colorStore.setCurrentPalColors(
              mapFocusedColors(([l, a, b]) =>
                pos === 1
                  ? chroma.lab(l, newCoordinate, b)
                  : chroma.lab(l, a, newCoordinate)
              )
            );
          }}
        >
          {name}
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
