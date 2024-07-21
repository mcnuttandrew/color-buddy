<script lang="ts">
  import { nameColor } from "color-buddy-color-namer";
  import { cvdSim } from "color-buddy-palette";
  import { Color } from "color-buddy-palette";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";

  import EvalResponse from "./EvalResponse.svelte";
  import { checkLevelToSymbol, dealWithFocusEvent } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";

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
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="flex flex-col overflow-auto mr-5 px-4 h-full w-64"
  on:click={() => {
    focusStore.setColors([]);
  }}
>
  {#if $configStore.colorSim !== "none"}
    <button
      class={`${buttonStyle} ml-0 pl-0 mt-4`}
      on:click|stopPropagation={() => configStore.setColorSim("none")}
    >
      Disable Color Vision Deficiency Simulation
    </button>
  {/if}
  {#each colors as color, idx}
    <button
      on:click|stopPropagation={(e) => {
        focusStore.setColors(
          dealWithFocusEvent(e, idx, $focusStore.focusedColors)
        );
      }}
      class="w-full flex flex-col justify-center items-center text-sm mt-2 transition-all relative"
      class:text-white={color.luminance() < 0.5}
      class:ml-5={$focusStore.focusedColors.includes(idx)}
      class:mr-5={!$focusStore.focusedColors.includes(idx)}
      style="min-height: 40px"
    >
      <div class="w-full flex flex-col h-full absolute">
        <div
          class="grow h-full"
          style="background-color: {color.toHex()}"
        ></div>
        {#if selectedCVDType !== "none"}
          <div
            class="grow h-full"
            style={`background-color: ${sim(color)}`}
          ></div>
        {/if}
      </div>
      <div class="flex justify-between w-full px-2 items-center z-10">
        <span class="flex flex-col items-start">
          <span>{color.toHex()}</span>
          {#if colorNames[idx]}<span class="text-right text-xs">
              {colorNames[idx]}
            </span>{/if}
        </span>
        <span class="flex flex-wrap flex-row-reverse">
          {#each colorsToIssues[idx] as check}
            {#if !evalConfig[check.lintProgram.name]?.ignore}
              <EvalResponse
                lintResult={check}
                positionAlongRightEdge={false}
                customWord={checkLevelToSymbol[check.lintProgram.level]}
              />
            {/if}
          {/each}
        </span>
      </div>
    </button>

    {#if stats[idx]}
      <div class=" text-black text-right text-xs">
        <div>dE: {Math.round(stats[idx])}</div>
      </div>
    {/if}
  {/each}

  <!-- metric -->
  <div>
    <span>dE Metric</span>
    <select
      value={$configStore.evalDeltaDisplay}
      on:change={(e) => {
        // @ts-ignore
        configStore.setEvalDeltaDisplay(e.target.value);
      }}
    >
      {#each ["76", "CMC", "2000", "ITP", "none"] as metric}
        <option value={metric}>{metric}</option>
      {/each}
    </select>
  </div>
</div>
