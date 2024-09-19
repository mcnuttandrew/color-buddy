<script lang="ts">
  import { nameColor } from "color-buddy-color-namer";
  import { cvdSim } from "color-buddy-palette";
  import { Color } from "color-buddy-palette";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";

  import ModifySelection from "../controls/ModifySelection.svelte";
  import EvalResponse from "../linting/EvalResponse.svelte";
  import { dealWithFocusEvent } from "../lib/utils";
  import { typeToSymbol } from "../constants";
  import Sort from "../controls/Sort.svelte";
  import AddColor from "../controls/AddColor.svelte";
  import GetColorsFromString from "../controls/GetColorsFromString.svelte";
  import DeMetric from "../controls/DeMetric.svelte";
  import ContentEditable from "../components/ContentEditable.svelte";
  import EditColor from "../components/EditColor.svelte";

  $: checks = $lintStore.currentChecks;

  $: colorNames = colors.map((x) => nameColor(x)[0]);
  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;
  $: selectedCVDType = $configStore.colorSim;
  $: sim = (color: Color): string => cvdSim(selectedCVDType, color).toHex();

  $: colorsToIssues = colors.map((x) => {
    const hex = `${x.toHex()}`;
    return checks.filter(
      (check) =>
        check.kind === "success" && !check.passes && check.message.includes(hex)
    );
  });

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  function computeDeltas(colors: Color[], metric: string = "2000") {
    const deltas = [];
    for (let i = 1; i < colors.length; i++) {
      const left = colors[i - 1];
      const right = colors[i];
      deltas.push(left.symmetricDeltaE(right, metric as any));
    }
    return deltas;
  }
  $: stats =
    $configStore.evalDeltaDisplay === "none"
      ? []
      : computeDeltas(colors, $configStore.evalDeltaDisplay);

  const checkLevelToSymbol = {
    error: "❌",
    warning: "⚠️",
  } as any;
  const ballSize = 25;
  $: focusedSet = new Set($focusStore.focusedColors);

  $: colorSpace = currentPal.colorSpace;
</script>

<!-- left panel -->
<div class="bg-white w-80 container flex flex-col h-full flex-none">
  <div class="text-4xl font-bold bg-stone-800 text-white px-2 py-1 flex">
    <img src="logo.png" alt="logo" class="h-10 mr-2" />
    <div class="">Color Buddy</div>
  </div>

  <section class="flex flex-col flex-1 overflow-auto p-1" id="left-panel">
    <div class="flex text-2xl py-2 px-4">
      <ContentEditable
        onChange={(x) => colorStore.setCurrentPalName(x)}
        value={currentPal.name}
        useEditButton={true}
      />
    </div>

    <div class="flex px-4">
      <ModifySelection />
      <GetColorsFromString
        onChange={(colors) => colorStore.setCurrentPalColors(colors)}
        colorSpace={currentPal.colorSpace}
        colors={currentPal.colors}
      />
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex flex-col overflow-auto mr-5 px-4 h-full">
      <!-- on:click={(e) => {
        focusStore.setColors([]);
      }} -->
      <!-- on:click|stopPropagation={(e) => {
            focusStore.setColors(
              dealWithFocusEvent(e, idx, $focusStore.focusedColors)
            );
          }} -->
      {#each colors as color, idx}
        <div
          class="w-full flex justify-center items-center text-sm mt-2 transition-all relative"
          class:ml-5={focusedSet.has(idx)}
          class:mr-5={!focusedSet.has(idx)}
          style="min-height: 40px"
        >
          <button
            class="cursor-pointer"
            on:click={(e) => {
              focusStore.setColors(
                dealWithFocusEvent(e, idx, $focusStore.focusedColors)
              );
            }}
          >
            <svg height="{ballSize * 2}px" width="{ballSize * 3}px">
              <circle
                r={ballSize}
                fill={color.toHex()}
                cx={ballSize}
                cy={ballSize}
              ></circle>
            </svg>
          </button>
          <!-- <div class="w-full flex flex-col h-full absolute">
            <div class="h-full"></div>
            {#if selectedCVDType !== "none"}
              <div
                class="h-full"
                style={`background-color: ${sim(color)}`}
              ></div>
            {/if}
          </div> -->
          <div class="flex justify-between w-full px-2 items-center z-10">
            <span class="flex flex-col items-start">
              <span>
                <ContentEditable
                  onChange={(x) => {
                    const updatedColors = [...colors];
                    updatedColors[idx] = Color.colorFromString(x, colorSpace);
                    colorStore.setCurrentPalColors(updatedColors);
                  }}
                  value={color.toHex()}
                  useEditButton={false}
                />
              </span>
              {#if colorNames[idx]}<span class="text-right text-xs">
                  {colorNames[idx]}
                </span>{/if}
              {#if color.tags.length}
                <span class="text-right text-xs">
                  Tags: {color.tags.join(", ")}
                </span>
              {/if}
            </span>
            <div>
              {#if colorsToIssues[idx].length}
                <span>Issues</span>
              {/if}
              <span class="flex flex-wrap flex-row-reverse">
                {#each colorsToIssues[idx] as check}
                  {#if !evalConfig[check.lintProgram.name]?.ignore}
                    <EvalResponse
                      lintResult={check}
                      positionAlongRightEdge={false}
                      customWord={typeToSymbol[check.lintProgram.group]}
                    />
                  {/if}
                {/each}
              </span>
            </div>
          </div>
        </div>

        {#if stats[idx]}
          <div class=" text-black text-right text-xs">
            <div>dE: {Math.round(stats[idx])}</div>
          </div>
        {/if}
        {#if focusedSet.has(idx) && focusedSet.size === 1}
          <div class="ml-6" id="">
            <EditColor />
          </div>
        {/if}
      {/each}
      <div class="flex mt-2">
        <svg height="{ballSize * 2}px" width="{ballSize * 3}px">
          <circle
            r={ballSize}
            fill={"white"}
            stroke={"black"}
            stroke-dasharray="5,5"
            cx={ballSize}
            cy={ballSize}
          ></circle>
        </svg>
        <AddColor />
      </div>

      <div class="flex">
        <DeMetric />
        <Sort />
      </div>
    </div>
  </section>
</div>

<style>
  .container {
    min-width: 300px;
  }
</style>
