<script lang="ts">
  import { cvdSim } from "color-buddy-palette";
  import { Color } from "color-buddy-palette";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import { dealWithFocusEvent } from "../lib/utils";

  export let paletteIdx: number | "tempPal";
  export let allowInteraction: boolean = true;
  export let maxWidth: number | undefined = undefined;

  $: currentPal =
    paletteIdx === "tempPal"
      ? $configStore.tempPal!
      : $colorStore.palettes[paletteIdx];
  $: colors = currentPal?.colors || [];
  $: {
    if (
      $configStore.colorSim !== "none" &&
      $configStore.useSimulatorOnExamples
    ) {
      colors = colors.map((x) => cvdSim($configStore.colorSim, x));
    } else {
      colors = currentPal?.colors || [];
    }
  }

  $: focused = $focusStore.focusedColors;
  $: focusSet = allowInteraction ? new Set(focused) : new Set();

  let common = "cursor-pointer mr-2 mb-2 transition-all";
  let classes = [
    {
      className: `${common} big-swatch `,
      styleMap: (color): string => `background-color: ${color.toHex()};`,
      selectionClass: "rotate-12",
    },
    {
      className: `${common} small-swatch`,
      styleMap: (color): string => `background-color: ${color.toHex()};`,
      selectionClass: "rotate-12",
    },
    {
      className: `${common} small-swatch rounded-full`,
      styleMap: (color): string => `border: 2px solid ${color.toHex()};`,
      selectionClass: "relative top-1 left-1",
    },
  ] as {
    className: string;
    styleMap: (c: Color) => string;
    selectionClass: string;
  }[];

  $: colorsInGroupsOf3 = colors.reduce(
    (acc: number[][], x: Color, i: number) => {
      const idx = Math.floor(i / 3);
      if (!acc[idx]) {
        acc[idx] = [];
      }
      acc[idx].push(i);
      return acc;
    },
    []
  );
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
  class="mr-4 mb-2"
  style={`max-width: ${maxWidth ? `${maxWidth}px` : "100%"}`}
  on:click={(e) => {
    if (allowInteraction) {
      focusStore.clearColors();
    }
  }}
>
  <div class="flex flex-wrap justify-center">
    {#each colors as color, i}
      <button
        style={`color: ${color.toHex()}; transform: rotate(${
          focusSet.has(i) ? 10 : 0
        }deg)`}
        class="mr-2 w-16"
        on:click|preventDefault|stopPropagation={(e) => {
          allowInteraction &&
            focusStore.setColors(
              dealWithFocusEvent(e, i, $focusStore.focusedColors)
            );
        }}
      >
        {color.toHex()}
      </button>
    {/each}
  </div>
  <div class="flex p-1 flex-wrap">
    <div class="flex flex-col flex-initial">
      <div class="flex">
        {#each classes as { className, styleMap, selectionClass }}
          <div class="flex flex-col justify-center">
            {#each colorsInGroupsOf3 as colorGroup}
              <div class="flex">
                {#each colorGroup as colorIdx}
                  <button
                    class={`${className} ${
                      focusSet.has(colorIdx) ? selectionClass : ""
                    }`}
                    style={`${styleMap(colors[colorIdx])}`}
                    on:click|preventDefault|stopPropagation={(e) => {
                      allowInteraction &&
                        focusStore.setColors(
                          dealWithFocusEvent(
                            e,
                            colorIdx,
                            $focusStore.focusedColors
                          )
                        );
                    }}
                  ></button>
                {/each}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
    <div class="flex flex-col">
      {#each colors as color, i}
        <button
          style={`background-color: ${color.toHex()};`}
          class="wide-bar transition-all w-full"
          class:ml-5={focusSet.has(i)}
          class:mr-5={!focusSet.has(i)}
          on:click|preventDefault|stopPropagation={(e) =>
            allowInteraction &&
            focusStore.setColors(
              dealWithFocusEvent(e, i, $focusStore.focusedColors)
            )}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .big-swatch {
    width: 32px;
    height: 32px;
  }
  .small-swatch {
    width: 12px;
    height: 12px;
  }
  .wide-bar {
    width: 150px;
    height: 30px;
  }
</style>
