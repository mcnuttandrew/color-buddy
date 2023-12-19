<script lang="ts">
  import { Color, colorFromChannels, colorDirectory } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { avgColors, opposingColor } from "../lib/utils";
  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: focusLabs = focusedColors.map((idx) => colors[idx].toChannels());

  function actionOnColor(idx: number, action: (Color: Color) => any) {
    const newColor = action(colors[idx]);
    const newColors = [...colors];
    newColors[idx] = newColor;
    colorStore.setCurrentPalColors(newColors);
  }

  const mapFocusedColors = (fn: (color: [number, number, number]) => any) =>
    colors.map((color, idx) =>
      focusSet.has(idx) ? fn(color.toChannels()) : color
    );

  const ALIGNS = [
    { pos: 1, name: "Left", op: Math.min },
    { pos: 1, name: "Right", op: Math.max },
    { pos: 2, name: "Top", op: Math.max },
    { pos: 2, name: "Bottom", op: Math.min },
  ];
</script>

<div class="flex flex-col border-2 border-slate-300 rounded h-40">
  Action Panel
  <div class="flex flex-wrap">
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
      {#each Object.keys(colorDirectory) as colorSpace}
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
      <Tooltip>
        <div slot="content" class="w-24">
          {#each ALIGNS as { pos, name, op }}
            <button
              class="underline mr-2"
              on:click={() => {
                const newCoordinate = op(...focusLabs.map((x) => x[pos]));
                colorStore.setCurrentPalColors(
                  mapFocusedColors(([l, a, b]) => {
                    return colorFromChannels(
                      [
                        pos === 0 ? newCoordinate : l,
                        pos === 1 ? newCoordinate : a,
                        pos === 2 ? newCoordinate : b,
                      ],
                      "lab"
                    );
                  })
                );
              }}
            >
              {name}
            </button>
          {/each}
        </div>
        <span slot="target" let:toggle>
          <button class="underline" on:click={toggle}>Align to</button>
        </span>
      </Tooltip>

      <div>TODO Distribute vertical / horizontally</div>
      <!-- <button on:click={() => {
        const newColors = [...colors];
        // const sortedColors = focusedColors.map((idx) => colors[idx]).sort((a, b) => a.lab()[0] - b.lab()[0]);
        focusedColors.forEach((idx, i) => {
          newColors[idx] = sortedColors[i];
        });
        colorStore.setCurrentPalColors(newColors);
      }}>Distribute horizontally</button> -->
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
