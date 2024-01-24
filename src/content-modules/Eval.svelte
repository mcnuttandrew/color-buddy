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
          {#if checkGroup[1].some((x) => evalConfig[x.name]?.ignore)}
            <button
              class={buttonStyle}
              on:click={() => {
                const newEvalConfig = { ...evalConfig };
                checkGroup[1].forEach((check) => {
                  newEvalConfig[check.name] = { ignore: false };
                });
                colorStore.setCurrentPalEvalConfig(newEvalConfig);
              }}
            >
              renable all
            </button>
          {/if}
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
      {#if Object.keys(currentPal.evalConfig)}
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
