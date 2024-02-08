<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  import exampleStore from "../stores/example-store";
  import SwatchTooltipContent from "../components/SwatchTooltipContent.svelte";
  import { buttonStyle } from "../lib/styles";
  import simulate_cvd from "../lib/blindness";

  export let paletteIdx: number;
  export let allowInteraction: boolean = true;
  export let hideHeader: boolean = false;

  $: currentPal = $colorStore.palettes[paletteIdx];
  $: colors = currentPal?.colors || [];
  $: {
    if (
      $configStore.colorSim !== "none" &&
      $configStore.useSimulatorOnExamples
    ) {
      colors = colors.map((x) => simulate_cvd($configStore.colorSim, x));
    } else {
      colors = currentPal?.colors || [];
    }
  }
  $: bgColor = currentPal?.background?.toHex() || "white";
  $: focused = $focusStore.focusedColors;
  $: focusSet = new Set(focused);

  let common = "cursor-pointer mr-2 mb-2 transition-all";
  let classes = [
    {
      className: `${common} w-8 h-8 `,
      styleMap: (color: Color): string => `background-color: ${color.toHex()};`,
      selectionClass: "rotate-12",
    },
    {
      className: `${common} w-6 h-6`,
      styleMap: (color: Color): string => `background-color: ${color.toHex()};`,
      selectionClass: "rotate-12",
    },
    {
      className: `${common} w-4 h-4 rounded-full`,
      styleMap: (color: Color): string => `border: 2px solid ${color.toHex()};`,
      selectionClass: "relative top-1 left-1",
    },
  ];

  $: sections = $exampleStore.sections as any;
  $: numToShow = $exampleStore.examples.filter((x: any) => {
    if (x.hidden) {
      return false;
    }
    if (sections.svg && x?.svg) {
      return true;
    }
    if (sections.vega && x.vega) {
      return true;
    }
    return false;
  }).length;

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

  function onClickColor(
    colorIdx: number,
    toggle: () => void,
    tooltipOpen: boolean
  ) {
    if (!allowInteraction) {
      return () => {};
    }
    return (e: any) => {
      const isFocused = focusSet.has(colorIdx);
      const shiftKey = e.shiftKey;
      if (!tooltipOpen && !isFocused) {
        if (shiftKey) {
          focusStore.addColor(colorIdx);
        } else {
          focusStore.setColors([colorIdx]);
        }
        toggle();
      } else if (!tooltipOpen && isFocused) {
        if (shiftKey) {
          focusStore.toggleColor(colorIdx);
        } else {
          focusStore.clearColors();
        }
      } else if (tooltipOpen && !isFocused) {
        if (shiftKey) {
          focusStore.addColor(colorIdx);
        } else {
          focusStore.setColors([colorIdx]);
        }
      } else {
        toggle();
        if (shiftKey) {
          focusStore.toggleColor(colorIdx);
        } else {
          focusStore.clearColors();
        }
      }
    };
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
  class="mr-4 mb-2"
  on:click={(e) => {
    if (allowInteraction) {
      focusStore.clearColors();
    }
  }}
>
  {#if !hideHeader}
    <div class="bg-stone-300 w-full justify-between flex p-1">
      Swatches
      <Tooltip>
        <button
          slot="target"
          class={buttonStyle}
          let:toggle
          on:click|preventDefault|stopPropagation={toggle}
        >
          Options
        </button>
        <div slot="content">
          <button
            class={buttonStyle}
            on:click|preventDefault|stopPropagation={() =>
              exampleStore.toggleSection("swatches")}
          >
            Hide
          </button>
          {#if numToShow > 1}
            <button
              class={buttonStyle}
              on:click|preventDefault|stopPropagation={() => {
                exampleStore.onlySwatches();
              }}
            >
              Focus
            </button>
          {/if}
        </div>
      </Tooltip>
    </div>
  {/if}
  <div style={`background-color: ${bgColor}; max-width: 600px`} class="flex">
    <div class="flex flex-col">
      {#each colors as color, i}
        <button
          style={`background-color: ${color.toHex()};`}
          class="w-24 h-5"
          on:click|preventDefault|stopPropagation={onClickColor(
            i,
            () => {},
            false
          )}
        ></button>
      {/each}
    </div>
    <div class="flex flex-col p-4 flex-initial">
      <div class="flex">
        {#each classes as { className, styleMap, selectionClass }}
          <div class="flex flex-col justify-center">
            {#each colorsInGroupsOf3 as colorGroup}
              <div class="flex">
                {#each colorGroup as colorIdx}
                  <Tooltip top={"100px"} allowDrag={true}>
                    <div slot="content" class="flex flex-col" let:onClick>
                      <SwatchTooltipContent
                        color={colors[colorIdx]}
                        closeTooltip={onClick}
                        idx={colorIdx}
                      />
                    </div>
                    <button
                      let:toggle
                      let:tooltipOpen
                      slot="target"
                      class={`${className} ${
                        focusSet.has(colorIdx) ? selectionClass : ""
                      }`}
                      style={`${styleMap(colors[colorIdx])}`}
                      on:click|preventDefault|stopPropagation={onClickColor(
                        colorIdx,
                        toggle,
                        tooltipOpen
                      )}
                    ></button>
                  </Tooltip>
                {/each}
              </div>
            {/each}
          </div>
        {/each}
      </div>
      <div class="flex flex-wrap justify-center">
        {#each colors as color, i}
          <button
            style={`color: ${color.toHex()}; transform: rotate(${
              focusSet.has(i) ? 10 : 0
            }deg)`}
            class="mr-2 w-16"
            on:click|preventDefault|stopPropagation={onClickColor(
              i,
              () => {},
              false
            )}
          >
            {color.toHex()}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
