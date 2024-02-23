<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import { Color, colorPickerConfig } from "../lib/Color";
  import { buttonStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: colorSpace = currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace];
  $: zName = config.zChannel.toUpperCase();
  $: xRev = config.xDomain[1] < config.xDomain[0];
  $: yRev = config.yDomain[1] < config.yDomain[0];
  $: zRev = config.zDomain[1] < config.zDomain[0];
  $: isPolar = config.isPolar;

  $: ALIGNS = [
    {
      pos: config.xChannelIndex,
      name: isPolar ? "Inner Radius" : "Left",
      op: xRev ? Math.max : Math.min,
    },
    {
      pos: config.xChannelIndex,
      name: isPolar ? "Outer Radius" : "Right",
      op: xRev ? Math.min : Math.max,
    },
    {
      pos: config.yChannelIndex,
      name: isPolar ? "Min Angle" : "Top",
      op: yRev ? Math.max : Math.min,
    },
    {
      pos: config.yChannelIndex,
      name: isPolar ? "Max Angle" : "Bottom",
      op: yRev ? Math.min : Math.max,
    },
    {
      pos: config.zChannelIndex,
      name: `${zName} Min`,
      op: zRev ? Math.max : Math.min,
    },
    {
      pos: config.zChannelIndex,
      name: `${zName} Max`,
      op: zRev ? Math.min : Math.max,
    },
  ];
</script>

{#if focusedColors.length > 1}
  <div class="w-full border-t-2 border-black my-2"></div>
  <div class="font-bold">Align</div>
  <div class="flex flex-wrap">
    {#each ALIGNS as { pos, name, op }}
      <button
        class={buttonStyle}
        on:click={() => {
          const newCoordinate = op(
            ...colors
              .map((x) => x.toChannels())
              .filter((_, idx) => focusSet.has(idx))
              .map((x) => x[pos])
          );
          const newColors = colors
            .map((x) => x.toChannels())
            .map((x, idx) => {
              let y = x;
              if (focusSet.has(idx)) {
                y[pos] = newCoordinate;
              }
              return y;
            })
            .map((x) => Color.colorFromChannels(x, colorSpace));

          colorStore.setCurrentPalColors(newColors);
        }}
      >
        {name}
      </button>
    {/each}
  </div>
{/if}
