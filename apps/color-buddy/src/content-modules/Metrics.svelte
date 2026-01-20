<script lang="ts">
  import { Color } from "color-buddy-palette";
  import { deltaMetrics, contrastMetrics } from "../constants";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import DeMetric from "../controls/DeMetric.svelte";
  import { nameColor } from "color-buddy-color-namer";
  $: isContrastMetric = contrastMetrics.includes(
    $configStore.evalDeltaDisplay as any,
  );

  function computeStats(
    colors: Color[],
    metric: typeof $configStore.evalDeltaDisplay,
  ): number[][] {
    if (metric === "none") {
      return [];
    }
    // is contrast metric
    if (!new Set(deltaMetrics).has(metric as any)) {
      return colors.map((color) =>
        colors.map((colorPair) => color.contrast(colorPair, metric)),
      );
    } else {
      // is delta metric
      return colors.map((color) =>
        colors.map((colorPair) =>
          color.symmetricDeltaE(colorPair, metric as any),
        ),
      );
    }
    // is delta metric
    // const deltas = [];
    // for (let i = 1; i < colors.length; i++) {
    //   const left = colors[i - 1];
    //   const right = colors[i];
    //   deltas.push(left.symmetricDeltaE(right, metric as any));
    // }
    // return deltas;
  }

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: bg = currentPal.background;
  $: colors = [...currentPal.colors, bg];

  $: stats =
    $configStore.evalDeltaDisplay === "none"
      ? []
      : computeStats(colors, $configStore.evalDeltaDisplay);

  $: colorNames = colors.map((x) => nameColor(x)[0]);
</script>

<div class="bg-stone-100 w-full py-1 px-2">
  <DeMetric />
</div>

<div class="p-4 h-full overflow-y-auto pb-64">
  {#if !isContrastMetric}
    <div class="mb-8">
      <div class="font-bold">Differences in sequence order</div>
      <div class="flex mt-8">
        {#each colors as color, idx}
          {#each colors as pairColor, jdx}
            {#if idx + 1 == jdx}
              <div class="flex items relative">
                <div
                  class="w-8 h-8 border border-stone-400 mr-6"
                  style="background-color: {color.toHex()}"
                ></div>
                {#if jdx < colors.length - 1}
                  <div
                    class="font-mono text-sm absolute right-[-4px] text-center {idx %
                      2 ===
                    0
                      ? 'top-[-20px]'
                      : 'bottom-[-20px]'}"
                  >
                    {stats[idx][jdx].toFixed(2)}
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        {/each}
      </div>
    </div>
  {/if}

  <div class="font-bold">All difference pairs</div>
  {#each colors as color, idx}
    <div class="flex flex-col border-b border-stone-300 pt-4">
      <div class="flex items-center mb-4">
        <div
          class="w-8 h-8 border border-stone-400 mr-2"
          style="background-color: {color.toHex()}"
        ></div>
        <div class="font-bold mr-4">{colorNames[idx]}</div>
        <div class="font-mono">{color.toHex()}</div>
      </div>
      <div class="text-sm font-bold italic">Compared to</div>
      <div class="flex flex-wrap">
        {#each colors as colorPair, jdx}
          <div class="flex items-center justify-center mr-4 mb-4">
            <div
              class="w-8 h-8 border border-stone-400 mr-2"
              style="background-color: {colorPair.toHex()}"
            ></div>
            <div class="font-mono mb-2 text-sm">
              {#if stats.length > 0}
                {stats[idx][jdx].toFixed(2)}
              {:else}
                --
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
