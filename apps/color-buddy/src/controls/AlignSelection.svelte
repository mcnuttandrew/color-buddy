<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import { Color } from "color-buddy-palette";
  import AlignBottomIcon from "virtual:icons/custom/align-bottom";
  import AlignTopIcon from "virtual:icons/custom/align-top";
  import AlignLeftIcon from "virtual:icons/custom/align-left";
  import AlignRightIcon from "virtual:icons/custom/align-right";
  import AlignZTop from "virtual:icons/custom/max-3rd";
  import AlignZBottom from "virtual:icons/custom/min-3rd";
  import { colorPickerConfig } from "../lib/utils";
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

  type AlignTypes =
    | { type: "single"; pos: number; name: String; op: any; icon: any }
    | { type: "divide" };
  $: ALIGNS = [
    {
      type: "single",
      pos: config.xChannelIndex,
      name: isPolar ? "Inner Radius" : "Left",
      op: xRev ? Math.max : Math.min,
      icon: xRev ? AlignRightIcon : AlignLeftIcon,
    },
    {
      type: "single",
      pos: config.xChannelIndex,
      name: isPolar ? "Outer Radius" : "Right",
      op: xRev ? Math.min : Math.max,
      icon: xRev ? AlignLeftIcon : AlignRightIcon,
    },
    // { type: "divide" },
    {
      type: "single",
      pos: config.yChannelIndex,
      name: isPolar ? "Min Angle" : "Top",
      op: yRev ? Math.max : Math.min,
      icon: yRev ? AlignTopIcon : AlignBottomIcon,
    },
    {
      type: "single",
      pos: config.yChannelIndex,
      name: isPolar ? "Max Angle" : "Bottom",
      op: yRev ? Math.min : Math.max,
      icon: yRev ? AlignBottomIcon : AlignTopIcon,
    },
    // { type: "divide" },
    {
      type: "single",
      pos: config.zChannelIndex,
      name: `${zName} Min`,
      op: zRev ? Math.max : Math.min,
      icon: zRev ? AlignZTop : AlignZBottom,
    },
    {
      type: "single",
      pos: config.zChannelIndex,
      name: `${zName} Max`,
      op: zRev ? Math.min : Math.max,
      icon: zRev ? AlignZBottom : AlignZTop,
    },
  ] as AlignTypes[];
</script>

<div class="flex flex-wrap">
  {#each ALIGNS as align}
    {#if align.type === "single"}
      <button
        class={`${buttonStyle} h-full flex justify-between items-center py-1`}
        on:click={() => {
          const newCoordinate = align.op(
            ...colors
              .map((x) => x.toChannels())
              .filter((_, idx) => focusSet.has(idx))
              .map((x) => x[align.pos])
          );
          const newColors = colors
            .map((x) => x.toChannels())
            .map((x, idx) => {
              let y = x;
              if (focusSet.has(idx)) {
                y[align.pos] = newCoordinate;
              }
              return y;
            })
            .map((x, idx) => {
              const newColor = Color.colorFromChannels(x, colorSpace);
              newColor.tags = colors[idx].tags;
              return newColor;
            });

          colorStore.setCurrentPalColors(newColors);
        }}
      >
        {name}
        {#if align.icon}
          <span class="ml-2">
            <svelte:component this={align.icon} />
          </span>
        {/if}
      </button>
    {:else}
      <div class="w-full my-1" />
    {/if}
  {/each}
</div>
