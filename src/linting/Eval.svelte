<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import { ColorLint } from "../lib/lints/ColorLint";
  import { computeStats } from "../lib/color-stats";
  import { runLintChecks } from "../lib/linter";
  import { colorNameSimple } from "../lib/lints/name-discrim";
  import { buttonStyle } from "../lib/styles";
  import LintDisplay from "./LintDisplay.svelte";
  import { Color } from "../lib/Color";

  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "../components/SwatchTooltipContent.svelte";
  import ExplanationViewer from "./ExplanationViewer.svelte";
  import simulate_cvd from "../lib/blindness";
  import { checkLevelToSymbol } from "../lib/utils";

  $: selectedBlindType = $configStore.colorSim;

  let metric: "dE" | "dE94" | "none" = "none";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: stats = computeStats(colors, metric);

  $: colorNames = colorNameSimple(colors);
  $: palType = currentPal.type;
  $: evalConfig = currentPal.evalConfig;
  $: checks = runLintChecks(currentPal, palType);

  $: checkGroups = checks.reduce(
    (acc, check) => {
      if (!acc[check.group]) {
        acc[check.group] = [];
      }
      acc[check.group].push(check);
      return acc;
    },
    {} as Record<string, ColorLint<any, any>[]>
  );

  $: colorsToIssues = colors.map((x) => {
    const hex = `${x.toHex()}`;
    return checks.filter(
      (check) => !check.passes && check.message.includes(hex)
    );
  });

  const titleCase = (str: string) =>
    str
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join(" ");

  function setGroupTo(checks: ColorLint<any, any>[], ignore: boolean) {
    const newEvalConfig = { ...evalConfig };
    checks.forEach((check) => {
      newEvalConfig[check.name] = { ignore };
    });
    colorStore.setCurrentPalEvalConfig(newEvalConfig);
  }
  $: sim = (color: Color): string =>
    simulate_cvd(selectedBlindType, color).toHex();
</script>

<div class="flex h-full">
  <div class="flex">
    <div class="flex flex-col overflow-auto mr-5 bg-stone-100 px-4">
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
            {#if stats?.dE[idx]}
              <div
                class="absolute text-black text-right"
                style="right: -30px; bottom: -8px"
              >
                <div>dE: {stats?.dE[idx]}</div>
              </div>
            {/if}
          </button>
        </Tooltip>
      {/each}
      <div>
        <span>Metric</span>
        <select bind:value={metric}>
          {#each ["dE", "dE94", "none"] as metric}
            <option value={metric}>{metric}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
  <div class="flex flex-col ml-2">
    <div class="overflow-auto h-full max-w-lg">
      {#if Object.keys(currentPal.evalConfig)}
        <button
          class={`${buttonStyle} ml-0 pl-0 mt-4`}
          on:click={() => colorStore.setCurrentPalEvalConfig({})}
        >
          Restore Defaults
        </button>
      {/if}
      <div class="text-sm">
        This collection of checks validates whether or not your palette matches
        a number of commonly held beliefs about best practices. They will not
        fit every situation or task (so you should feel unashamed if you ignore
        some of them), but they are a good starting point for thinking about how
        to improve your palette.
      </div>
      {#each Object.entries(checkGroups) as checkGroup}
        <div class="flex mt-4">
          <div class="font-bold">{titleCase(checkGroup[0])} Checks</div>
          <button
            class={`${buttonStyle} `}
            on:click={() => setGroupTo(checkGroup[1], true)}
          >
            ignore all
          </button>
          {#if checkGroup[1].some((x) => evalConfig[x.name]?.ignore)}
            <button
              class={`${buttonStyle} `}
              on:click={() => setGroupTo(checkGroup[1], false)}
            >
              re-enable all
            </button>
          {/if}
        </div>
        {#each checkGroup[1] as check}
          <LintDisplay {check} />
        {/each}
      {/each}
    </div>
  </div>
</div>
