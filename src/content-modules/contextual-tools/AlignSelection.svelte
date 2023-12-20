<script lang="ts">
  import focusStore from "../../stores/focus-store";
  import colorStore from "../../stores/color-store";
  import { Color, colorFromChannels, colorDirectory } from "../../lib/Color";
  import Tooltip from "../../components/Tooltip.svelte";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: focusLabs = focusedColors.map((idx) => colors[idx].toChannels());
  const ALIGNS = [
    { pos: 1, name: "Left", op: Math.min },
    { pos: 1, name: "Right", op: Math.max },
    { pos: 2, name: "Top", op: Math.max },
    { pos: 2, name: "Bottom", op: Math.min },
  ];

  const mapFocusedColors = (fn: (color: [number, number, number]) => any) =>
    colors.map((color, idx) =>
      focusSet.has(idx) ? fn(color.toChannels()) : color
    );
</script>

{#if focusedColors.length > 1}
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
{/if}
