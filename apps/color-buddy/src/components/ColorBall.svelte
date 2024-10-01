<script lang="ts">
  import { cvdSim } from "color-buddy-palette";
  import { Color } from "color-buddy-palette";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";

  import EvalResponse from "../linting/EvalResponse.svelte";
  import { dealWithFocusEvent } from "../lib/utils";

  import ContentEditable from "../components/ContentEditable.svelte";
  import EditColor from "../components/EditColor.svelte";
  import { typeToImg, deltaMetrics, ballSize } from "../constants";
  import { buttonStyle } from "../lib/styles";

  export let isFocused: Boolean;
  export let idx: number;
  export let color: Color;
  export let colorName: string | undefined;
  export let colorsToIssues: any[];
  export let stats: number[];

  $: selectedCVDType = $configStore.colorSim;
  $: sim = (color: Color): string => cvdSim(selectedCVDType, color).toHex();
  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  $: colorSpace = currentPal.colorSpace;

  const deltaMetricsSet = new Set(deltaMetrics);
  $: statsTypeIsDelta = deltaMetricsSet.has(
    $configStore.evalDeltaDisplay as any
  );
</script>

<div
  class="w-full flex justify-between items-center text-sm mt-2 relative"
  style="min-height: 40px"
>
  <div
    class:ml-5={isFocused}
    class:mr-5={!isFocused}
    class="flex transition-all"
  >
    <button
      class="cursor-pointer"
      on:click={(e) => {
        focusStore.setColors(
          dealWithFocusEvent(e, idx, $focusStore.focusedColors)
        );
      }}
    >
      <svg height="{ballSize * 2}px" width="{ballSize * 2}px">
        <circle
          r={ballSize}
          fill={selectedCVDType !== "none" ? sim(color) : color.toHex()}
          cx={ballSize}
          cy={ballSize}
        ></circle>
      </svg>
    </button>
    <span class="flex flex-col items-start w-24 mx-2">
      <span class="flex max-w-5">
        {color.toHex()}
        <!-- <ContentEditable
          onChange={(x) => {
            const updatedColors = [...colors];
            updatedColors[idx] = Color.colorFromString(x, colorSpace);
            colorStore.setCurrentPalColors(updatedColors);
          }}
          value={color.toHex()}
          useEditButton={true}
        /> -->
      </span>
      {#if colorName}<span class="text-right text-xs">
          {colorName}
        </span>{/if}
      {#if color.tags.length}
        <span class="text-right text-xs">
          Tags: {color.tags.join(", ")}
        </span>
      {/if}
    </span>
  </div>
  <div class="text-right flex items-end flex-col justify-end w-16">
    {#if $configStore.showIssuesOnLeft}
      <span>
        {#if colorsToIssues[idx].length}
          Issues
        {:else}
          &nbsp
        {/if}
      </span>
      <span class="flex flex-wrap flex-row-reverse min-h-4">
        {#each colorsToIssues[idx] as check}
          {#if !evalConfig[check.lintProgram.name]?.ignore}
            <EvalResponse
              lintResult={check}
              positionAlongRightEdge={false}
              customWord={typeToImg[check.lintProgram.group]}
              customWordIsImg={true}
            />
          {/if}
        {/each}
      </span>
    {/if}
    {#if stats[idx] && !statsTypeIsDelta && $configStore.evalDeltaDisplay !== "none"}
      <div class=" text-black text-right text-xs whitespace-nowrap">
        Contrast: {Math.round(stats[idx])}
      </div>
    {/if}
  </div>
</div>

{#if stats[idx] && statsTypeIsDelta && $configStore.evalDeltaDisplay !== "none"}
  <div class=" text-black text-right text-xs whitespace-nowrap">
    dE: {Math.round(stats[idx])}
  </div>
{/if}
{#if isFocused && $focusStore.focusedColors.length === 1}
  <div class="flex text-xs w-full justify-end" id="">
    <EditColor />
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalColors([...colors].filter((_, i) => i !== idx));
        focusStore.setColors([]);
      }}
    >
      Delete Color
    </button>
  </div>
{/if}
