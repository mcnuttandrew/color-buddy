<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "../components/SwatchTooltipContent.svelte";
  import { colorNameSimple } from "../lib/lints/name-discrim";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import simulate_cvd from "../lib/blindness";
  import { Color } from "../lib/Color";
  import { checkLevelToSymbol } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";

  export let checks: any[];

  $: colorNames = colorNameSimple(colors);
  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;
  $: selectedBlindType = $configStore.colorSim;
  $: sim = (color: Color): string =>
    simulate_cvd(selectedBlindType, color).toHex();

  $: colorsToIssues = colors.map((x) => {
    const hex = `${x.toHex()}`;
    return checks.filter(
      (check) => !check.passes && check.message.includes(hex)
    );
  });

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  function computeDeltas(colors: Color[], metric: string = "2000") {
    const deltas = [];
    for (let i = 1; i < colors.length; i++) {
      deltas.push(colors[i].symmetricDeltaE(colors[i - 1], metric as any));
    }
    return deltas;
  }
  $: stats =
    $configStore.evalDeltaDisplay === "none"
      ? []
      : computeDeltas(colors, $configStore.evalDeltaDisplay);
</script>

<div class="flex">
  <div class="flex flex-col overflow-auto mr-5 bg-stone-100 px-4">
    {#if $configStore.colorSim !== "none"}
      <button
        class={`${buttonStyle} ml-0 pl-0 mt-4`}
        on:click={() => configStore.setColorSim("none")}
      >
        Disable Color Blindness Simulation
      </button>
    {/if}
    {#each colors as color, idx}
      <Tooltip
        allowDrag={true}
        onClose={() => focusStore.clearColors()}
        top="50px"
      >
        <div slot="content" class="flex flex-col" let:onClick>
          <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
        </div>

        <button
          slot="target"
          let:toggle
          on:click={() => {
            toggle();
            focusStore.setColors([idx]);
          }}
          class="w-48 flex flex-col justify-center items-center text-sm mt-2 transition-all relative"
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
            {#if selectedBlindType !== "none"}
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
                  {colorNames[idx]?.word}
                </span>{/if}
            </span>
            <span class="flex">
              {#each colorsToIssues[idx] as check}
                {#if !evalConfig[check.name]?.ignore}
                  <Tooltip>
                    <div slot="content" class="flex flex-col max-w-lg">
                      <div class="font-bold">{check.name}</div>
                      <ExplanationViewer {check} />
                    </div>
                    <button
                      slot="target"
                      let:toggle
                      on:click|stopPropagation={toggle}
                    >
                      {checkLevelToSymbol[check.level]}
                    </button>
                  </Tooltip>
                {/if}
              {/each}
            </span>
          </div>
        </button>
      </Tooltip>
      {#if stats[idx]}
        <div class=" text-black text-right text-xs">
          <div>dE: {Math.round(stats[idx])}</div>
        </div>
      {/if}
    {/each}
    <div>
      <span>Metric</span>
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
</div>
