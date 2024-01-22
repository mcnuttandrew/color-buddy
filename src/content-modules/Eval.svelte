<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import { ColorLint } from "../lib/lints/ColorLint";
  import { computeStats } from "../lib/color-stats";
  import { runLintChecks } from "../lib/linter";
  import { colorNameSimple } from "../lib/lints/name-discrim";
  import { buttonStyle } from "../lib/styles";
  import EvalResponse from "./contextual-tools/EvalResponse.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  import ExplanationViewer from "../components/ExplanationViewer.svelte";
  import simulate_cvd from "../lib/blindness";

  $: selectedBlindType = $configStore.colorSim;

  let metric: "dE" | "dE94" | "none" = "none";
  $: colors = $colorStore.currentPal.colors;
  $: stats = computeStats(colors, metric);

  $: colorNames = colorNameSimple(colors);
  $: palType = $colorStore.currentPal.type;
  $: evalConfig = $colorStore.currentPal.evalConfig;
  $: checks = runLintChecks($colorStore.currentPal).filter((x) =>
    x.taskTypes.includes(palType)
  );

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

  const checkLevelToSymbol = {
    error: "❌",
    warning: "⚠️",
  } as any;
  // more info symbol: ℹ️

  const titleCase = (str: string) =>
    str
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join(" ");

  const descriptions = {
    sequential:
      "Sequential palettes are used to represent a range of values. They are often used to represent quantitative data, such as temperature or elevation.",
    diverging:
      "Diverging palettes are used to represent a range of values around a central point. They are often used to represent quantitative data, such as temperature or elevation.",
    categorical:
      "Categorical palettes are used to represent a set of discrete values. They are often used to represent qualitative data, such as different types of land cover or different political parties.",
  };
</script>

<div class="flex h-full">
  <div class="flex">
    <div class="flex flex-col overflow-auto mr-5 bg-slate-100 p-4">
      <div>Colors</div>
      <div class="flex justify-between w-full text-xs italic">
        <span>Hex Value</span>
        {#if colorNames[0]}<span>Inferred Color Name</span>{/if}
      </div>
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
                  style={`background-color: ${simulate_cvd(
                    selectedBlindType,
                    color
                  ).toHex()}`}
                ></div>
              {/if}
            </div>
            <div class="flex justify-between w-full px-2 items-center z-10">
              <span class="flex flex-col items-start">
                <span>{color.toHex()}</span>
                <span class="flex">
                  {#each colorsToIssues[idx] as check}
                    {#if !evalConfig[check.name]?.ignore}
                      <Tooltip>
                        <div slot="content" class="flex flex-col">
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
              </span>
              {#if colorNames[idx]}<span class="text-right">
                  {colorNames[idx]?.word}
                </span>{/if}
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
    <div>
      This is a <select
        value={palType}
        on:change={(e) => {
          // @ts-ignore
          colorStore.setCurrentPalType(e.target.value);
        }}
      >
        {#each ["sequential", "diverging", "categorical"] as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
      palette. {descriptions[palType]}
    </div>

    <div class="overflow-auto h-full max-w-md">
      {#each Object.entries(checkGroups) as checkGroup}
        <div class="flex mt-5">
          <div class="font-bold mr-5">{titleCase(checkGroup[0])} Checks</div>
          <button
            class={buttonStyle}
            on:click={() => {
              const newEvalConfig = { ...evalConfig };
              checkGroup[1].forEach((check) => {
                newEvalConfig[check.name] = { ignore: true };
              });
              colorStore.setCurrentPalEvalConfig(newEvalConfig);
            }}
          >
            ignore all
          </button>
        </div>
        {#each checkGroup[1] as check}
          {#if evalConfig[check.name]?.ignore}
            <div class="text-xs">
              Ignored "{check.name}"
              <button
                class={buttonStyle}
                on:click={() => {
                  colorStore.setCurrentPalEvalConfig({
                    ...evalConfig,
                    [check.name]: { ignore: false },
                  });
                }}
              >
                renable
              </button>
            </div>
          {:else}
            <div class="w-full rounded flex flex-col justify-between py-1">
              <div class="flex" class:font-bold={!check.passes}>
                {#if check.passes}<div class="text-green-500">
                    ✅
                  </div>{:else}<div class="text-red-500">
                    {checkLevelToSymbol[check.level]}
                  </div>{/if}
                <Tooltip>
                  <div slot="content" class="flex flex-col">
                    <div class="">{check.description}</div>
                  </div>
                  <button slot="target" let:toggle on:click={toggle}>ⓘ</button>
                </Tooltip>
                {#if !check.passes}
                  <EvalResponse {check} />
                {/if}{check.name}
              </div>
              {#if !check.passes}
                <ExplanationViewer {check} />
              {/if}
            </div>
          {/if}
        {/each}
      {/each}
      {#if Object.keys($colorStore.currentPal.evalConfig)}
        <button
          class={`${buttonStyle} mt-5`}
          on:click={() => colorStore.setCurrentPalEvalConfig({})}
        >
          Restore Defaults
        </button>
      {/if}
    </div>
  </div>
</div>
