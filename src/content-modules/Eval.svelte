<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { computeStats, c3, colorNameDiscrimCheck } from "../lib/color-stats";
  import Tooltip from "../components/Tooltip.svelte";
  import SwatchTooltipContent from "./SwatchTooltipContent.svelte";
  let metric: "dE" | "dE94" | "none" = "dE";
  $: colors = $colorStore.currentPal.colors;
  $: stats = computeStats(
    colors.map((x) => x.toChroma()),
    metric
  );
  $: colorNames = colors
    .map((x) => c3?.colorIdentity(x.toHex()))
    .flatMap((x) => x?.terms);

  $: discrimCheck = colorNameDiscrimCheck(colorNames);
</script>

<div class="flex" style="height: 400px;">
  <div class="flex flex-col flex-wrap">
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
          class="w-40 h-8 mr-2 flex justify-center items-center text-sm relative mt-2 mr-12"
          class:text-white={color.toChroma().luminance() < 0.5}
          style="background-color: {color.toHex()}"
        >
          <div>
            {color.toHex()}{#if colorNames[idx]}—{colorNames[idx]?.word}{/if}
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
  </div>
</div>
<div class="flex">
  <div>
    <span>Metric</span>
    <select bind:value={metric}>
      {#each ["dE", "dE94", "none"] as metric}
        <option value={metric}>{metric}</option>
      {/each}
    </select>
  </div>
  <div>
    {#if discrimCheck}
      <div class="text-red-500">
        {discrimCheck}
      </div>
    {/if}
  </div>
</div>
