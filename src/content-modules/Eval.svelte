<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { Color } from "../lib/Color";
  import chroma from "chroma-js";
  import {
    computeStats,
    c3,
    colorNameDiscrimCheck,
    colorBlindCheck,
  } from "../lib/color-stats";
  import { buttonStyle, AIButtonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  let metric: "dE" | "dE94" | "none" = "none";
  $: colors = $colorStore.currentPal.colors;
  $: stats = computeStats(
    colors.map((x) => x.toChroma()),
    metric
  );
  $: colorNames = colors
    .map((x) => c3?.colorIdentity(x.toHex()))
    .flatMap((x) => x?.terms);

  $: discrimCheck = colorNameDiscrimCheck(colorNames);
  $: blindCheck = colorBlindCheck(colors.map((x) => x.toChroma()));

  function checkIfAColorIsCloseToAnUglyColor(colors: Color[]) {
    const uglyColors = [
      "#56FF00",
      "#0010FF",
      "#6A7E25",
      "#FF00EF",
      "#806E28",
    ].map((x) => chroma(x));
    return colors.filter((color) => {
      const deltas = uglyColors.map((uglyColor) =>
        chroma.deltaE(color.toChroma(), uglyColor)
      );
      return deltas.some((x) => x < 10);
    });
  }

  $: uggos = checkIfAColorIsCloseToAnUglyColor(colors);
  $: checks = [
    ...["deuteranopia", "protanopia", "tritanopia"].map((blindness) => ({
      name: `Colorblind Friendly for ${blindness}`,
      check: !blindCheck.includes(blindness),
      message: `This palette is not colorblind friendly for ${blindness} color blindness.`,
      taskTypes: ["sequential", "diverging", "categorical"],
    })),
    {
      name: "Color name discrimination",
      check: !discrimCheck,
      message: discrimCheck,
      taskTypes: ["sequential", "diverging", "categorical"],
    },
    {
      name: "dE",
      check: !stats?.dE.some((x) => x > 1),
      message: "Some colors are too similar",
      taskTypes: ["sequential", "diverging", "categorical"],
    },
    {
      name: "max colors",
      check: colors.length < 10,
      message:
        "This palette has too many colors and may be hard to discriminate in some contexts",
      taskTypes: ["sequential", "diverging", "categorical"],
    },
    {
      name: "ugly colors",
      check: uggos.length === 0,
      message: `This palette has some colors (specifically ${uggos
        .map((x) => x.toHex())
        .join(", ")}) that are close to what are known as ugly colors`,
      taskTypes: ["sequential", "diverging", "categorical"],
    },
  ];
</script>

<div class="flex h-full">
  <div class="flex">
    <div class="flex flex-col flex-wrap mr-5 bg-slate-100 p-4">
      <div>Colors</div>
      <div class="flex justify-between w-full text-xs italic">
        <span>Hex Value</span>
        {#if colorNames[0]}<span>Inferred Color Name</span>{/if}
      </div>
      {#each $colorStore.currentPal.colors as color, idx}
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
            class="w-40 h-8 flex justify-center items-center text-sm relative mt-2 transition-all"
            class:text-white={color.toChroma().luminance() < 0.5}
            class:ml-5={$focusStore.focusedColors.includes(idx)}
            class:mr-5={!$focusStore.focusedColors.includes(idx)}
            style="background-color: {color.toHex()}"
          >
            <div class="flex justify-between w-full px-2">
              <span>{color.toHex()}</span>
              {#if colorNames[idx]}<span>{colorNames[idx]?.word}</span>{/if}
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
    {#each checks as check}
      <div
        class="w-full rounded flex flex-col justify-between bg-slate-200 border-slate-700 border-2 mb-2 p-4"
      >
        <div class="font-bold flex">
          {#if check.check}<div class="text-green-500 mr-2">✅</div>{:else}<div
              class="text-red-500 mr-2"
            >
              ❌
            </div>{/if}{check.name}
        </div>
        {#if !check.check}
          <div class="text-sm italic">{check.message}</div>
          <div>
            <button class={buttonStyle}>Ignore for this palette</button>
            <button class={buttonStyle}>Ignore for a bit</button>
            <button class={buttonStyle}>This is too restrictive</button>
            <button class={AIButtonStyle}>Generate Fix Suggestions</button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
