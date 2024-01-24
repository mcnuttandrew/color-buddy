<script lang="ts">
  import focusStore from "../../stores/focus-store";
  import colorStore from "../../stores/color-store";
  import { Color, colorPickerConfig } from "../../lib/Color";
  import { buttonStyle } from "../../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: focusLabs = focusedColors.map((idx) => colors[idx].toChannels());
  $: colorSpace = currentPal.colorSpace;
  $: zName = colorPickerConfig[colorSpace].zChannel;
  $: ALIGNS = [
    { pos: 1, name: "Left", op: Math.min },
    { pos: 1, name: "Right", op: Math.max },
    { pos: 2, name: "Top", op: Math.min },
    { pos: 2, name: "Bottom", op: Math.max },
    { pos: 0, name: `${zName} Min`, op: Math.min },
    { pos: 0, name: `${zName} Max`, op: Math.max },
  ];

  const mapFocusedColors = (fn: (color: [number, number, number]) => any) =>
    colors.map((color, idx) =>
      focusSet.has(idx) ? fn(color.toChannels()) : color
    );
</script>

{#if focusedColors.length > 1}
  <div class="w-full border-t-2 border-black my-2"></div>
  <!-- <Tooltip> -->
  <div class="font-bold">Align</div>
  <div class="flex flex-wrap">
    {#each ALIGNS as { pos, name, op }}
      <button
        class={buttonStyle}
        on:click={() => {
          const newCoordinate = op(...focusLabs.map((x) => x[pos]));
          colorStore.setCurrentPalColors(
            mapFocusedColors(([a, b, c]) => {
              return Color.colorFromChannels(
                [
                  pos === 0 ? newCoordinate : a,
                  pos === 1 ? newCoordinate : b,
                  pos === 2 ? newCoordinate : c,
                ],
                colorSpace
              );
            })
          );
        }}
      >
        {name}
      </button>
    {/each}
  </div>
{/if}
