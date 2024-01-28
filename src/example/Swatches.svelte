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

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: {
    if (
      $configStore.colorSim !== "none" &&
      $configStore.useSimulatorOnExamples
    ) {
      colors = colors.map((x) => simulate_cvd($configStore.colorSim, x));
    } else {
      colors = currentPal.colors;
    }
  }
  $: bg = currentPal.background;
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
</script>

<div class="mr-4 mb-2">
  <div class="bg-stone-300 w-full justify-between flex p-1">
    Swatches
    <Tooltip>
      <button slot="target" class={buttonStyle} let:toggle on:click={toggle}>
        Options
      </button>
      <div slot="content">
        <button
          class={buttonStyle}
          on:click={() => exampleStore.toggleSection("swatches")}
        >
          Hide
        </button>
        {#if numToShow > 1}
          <button
            class={buttonStyle}
            on:click={() => {
              exampleStore.onlySwatches();
            }}
          >
            Focus
          </button>
        {/if}
      </div>
    </Tooltip>
  </div>
  <div
    class="flex flex-col p-4 flex-initial"
    style={`background-color: ${bg.toHex()}; max-width: 600px`}
  >
    {#each classes as { className, styleMap, selectionClass }}
      <div class="flex justify-center flex-wrap">
        {#each colors as color, idx}
          <Tooltip top={"100px"} allowDrag={true}>
            <div slot="content" class="flex flex-col" let:onClick>
              <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
            </div>
            <button
              let:toggle
              let:tooltipOpen
              slot="target"
              class={`${className} ${focusSet.has(idx) ? selectionClass : ""}`}
              style={`${styleMap(color)}`}
              on:click={(e) => {
                const isFocused = focusSet.has(idx);
                const shiftKey = e.shiftKey;
                if (!tooltipOpen && !isFocused) {
                  if (shiftKey) {
                    focusStore.addColor(idx);
                  } else {
                    focusStore.setColors([idx]);
                  }
                  toggle();
                } else if (!tooltipOpen && isFocused) {
                  if (shiftKey) {
                    focusStore.toggleColor(idx);
                  } else {
                    focusStore.clearColors();
                  }
                } else if (tooltipOpen && !isFocused) {
                  if (shiftKey) {
                    focusStore.addColor(idx);
                  } else {
                    focusStore.setColors([idx]);
                  }
                } else {
                  toggle();
                  if (shiftKey) {
                    focusStore.toggleColor(idx);
                  } else {
                    focusStore.clearColors();
                  }
                }
              }}
            ></button>
          </Tooltip>
        {/each}
      </div>
    {/each}
    <div class="flex flex-wrap justify-center">
      {#each colors as color, i}
        <button
          style={`color: ${color.toHex()}; transform: rotate(${
            focusSet.has(i) ? 10 : 0
          }deg)`}
          class="mr-2 w-16"
          on:click={(e) => {
            const isMeta = e.metaKey || e.shiftKey || e.ctrlKey;
            if (isMeta) {
              focusStore.toggleColor(i);
            } else {
              focusStore.setColors(focusSet.has(i) ? [] : [i]);
            }
          }}
        >
          {color.toHex()}
        </button>
      {/each}
    </div>
  </div>
</div>
