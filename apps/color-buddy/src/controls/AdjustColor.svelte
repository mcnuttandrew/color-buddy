<script lang="ts">
  import { Color, clipToGamut } from "color-buddy-palette";
  import { colorPickerConfig } from "../lib/utils";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { clamp } from "../lib/utils";
  import Plus from "virtual:icons/fa6-solid/plus";
  import Minus from "virtual:icons/fa6-solid/minus";

  import { buttonStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = currentPal.colorSpace;

  type ColorEffect = (color: Color) => [number, number, number];
  function actionOnColor(focusedColors: number[], action: ColorEffect) {
    const newColors = [...colors];
    focusedColors.forEach((idx) => {
      const channels = action(colors[idx]);
      const newColor = Color.colorFromChannels(channels, colorSpace);
      newColor.tags = colors[idx].tags;
      newColors[idx] = newColor;
    });
    colorStore.setCurrentPalColors(newColors);
  }
  const actions: (
    | { type: "single"; name: string; effect: ColorEffect }
    | {
        type: "double";
        name: string;
        negative: ColorEffect;
        positive: ColorEffect;
      }
  )[] = [
    {
      type: "double",
      name: "Lighten",
      positive: (color) =>
        color.toColorIO().set("lch.l", (l) => clamp(l ? l * 1.2 : 5, 0, 100))
          .coords,
      negative: (color) =>
        color.toColorIO().set("lch.l", (l) => l * 0.8).coords,
    },

    {
      type: "double",
      name: "Saturate",
      positive: (color) =>
        color.toColorIO().set("hsl.s", (c) => clamp(c ? c * 1.2 : 5, 0, 100))
          .coords,
      negative: (color) =>
        color.toColorIO().set("hsl.s", (c) => c * 0.8).coords,
    },

    {
      type: "single",
      name: "Flip To Opposing",
      effect: (color) =>
        color.toColorIO().set("lch.h", (h) => (h + 180) % 360).coords,
    },
    {
      type: "single",
      name: "Jitter",
      effect: (color) => {
        const newChannels = [...color.toChannels()];
        const config = colorPickerConfig[colorSpace];
        const xStep = config.xStep;
        const yStep = config.yStep;
        const zStep = config.zStep;
        newChannels[config.xChannelIndex] += xStep * (Math.random() - 0.5);
        newChannels[config.yChannelIndex] += yStep * (Math.random() - 0.5);
        newChannels[config.zChannelIndex] += zStep * (Math.random() - 0.5);
        return newChannels as [number, number, number];
      },
    },
    {
      type: "single",
      name: "Clip to gamut",
      effect: (color) => clipToGamut(color),
    },
  ];
</script>

<div class="flex flex-wrap">
  {#each actions as action}
    {#if action.type === "double"}
      <div class="my-2">
        <div
          class={`${buttonStyle
            .split(" ")
            .filter((x) => !x.startsWith("hover"))
            .join(" ")} flex w-40 justify-between`}
        >
          <button
            class={"cursor-pointer"}
            on:click={() => actionOnColor(focusedColors, action.negative)}
          >
            <Minus />
          </button>
          <div>{action.name}</div>
          <button
            class={"cursor-pointer"}
            on:click={() => actionOnColor(focusedColors, action.positive)}
          >
            <Plus />
          </button>
        </div>
      </div>
    {:else}
      <button
        class={buttonStyle}
        on:click={() => actionOnColor(focusedColors, action.effect)}
      >
        {action.name}
      </button>
    {/if}
  {/each}
</div>
