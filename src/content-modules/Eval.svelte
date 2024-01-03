<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import {
    computeStats,
    checkPal,
    colorNameSimple,
    splitMessageIntoTextAndColors,
  } from "../lib/color-stats";
  import EvalResponse from "./contextual-tools/EvalResponse.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  let metric: "dE" | "dE94" | "none" = "none";
  $: colors = $colorStore.currentPal.colors;
  $: stats = computeStats(
    colors.map((x) => x.toChroma()),
    metric
  );

  $: colorNames = colorNameSimple(colors);
  $: checks = checkPal($colorStore.currentPal, metric);

  $: colorsToIssues = colors.map((x) => {
    const hex = `${x.toHex()}`;
    return checks.filter(
      (check) => !check.check && check.message.includes(hex)
    );
  });
</script>

<div class="flex h-full">
  <div class="flex">
    <div class="flex flex-col flex-wrap mr-5 bg-slate-100 p-4">
      <div>Colors</div>
      <div class="flex justify-between w-full text-xs italic">
        <span>Hex Value</span>
        {#if colorNames[0]}<span>Inferred Color Name</span>{/if}
      </div>
      {#each colors as color, idx}
        <Tooltip
          top={"100px"}
          onClose={() => {
            focusStore.clearColors();
          }}
        >
          <div slot="content" class="flex flex-col" let:onClick>
            <SwatchTooltipContent {color} closeTooltip={onClick} {idx} />
          </div>

          <button
            slot="target"
            let:toggle
            on:click={() => {
              toggle();
              focusStore.addColor(idx);
            }}
            class="w-48 flex flex-col justify-center items-center text-sm relative mt-2 transition-all"
            class:text-white={color.toChroma().luminance() < 0.5}
            class:ml-5={$focusStore.focusedColors.includes(idx)}
            class:mr-5={!$focusStore.focusedColors.includes(idx)}
            style="background-color: {color.toHex()}; min-height: 40px"
          >
            <div class="flex justify-between w-full px-2 items-center">
              <span class="flex flex-col items-start">
                <span>{color.toHex()}</span>
                <span>
                  {#each colorsToIssues[idx] as _i}❌{/each}
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
      This is a <select>
        {#each ["sequential", "diverging", "categorical"] as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
      Palette
    </div>
    <div>Checks</div>
    <div class="overflow-auto h-full">
      {#each checks as check}
        <div class="w-full rounded flex flex-col justify-between py-1">
          <div class="flex" class:font-bold={!check.check}>
            {#if check.check}<div class="text-green-500 mr-2">
                ✅
              </div>{:else}<div class="text-red-500 mr-2">
                ❌
              </div>{/if}{check.name}
            <EvalResponse />
          </div>
          {#if !check.check}
            <div class="text-sm italic">
              {#each splitMessageIntoTextAndColors(check.message) as block}
                {#if block.type === "text"}
                  <span>{block.content}</span>
                {:else}
                  <button
                    on:click={() => {
                      const hexes = colors.map((x) => x.toHex().toLowerCase());
                      const idx = hexes.findIndex(
                        (x) => x === block.content.toLowerCase()
                      );
                      if (idx === -1) return;
                      focusStore.toggleColor(idx);
                    }}
                    style={`background-color: ${block.content}; top: -3px`}
                    class="rounded-full w-3 h-3 ml-1 mr-1 inline-block cursor-pointer relative"
                  ></button>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
