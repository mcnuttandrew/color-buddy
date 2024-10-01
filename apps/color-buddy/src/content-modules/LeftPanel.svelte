<script lang="ts">
  import { nameColor } from "color-buddy-color-namer";
  import { cvdSim } from "color-buddy-palette";
  import { Color } from "color-buddy-palette";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";
  import ColorBall from "../components/ColorBall.svelte";

  import ModifySelection from "../controls/ModifySelection.svelte";
  import Sort from "../controls/Sort.svelte";
  import AddColor from "../controls/AddColor.svelte";
  import DeMetric from "../controls/DeMetric.svelte";
  import GetColorsFromString from "../controls/GetColorsFromString.svelte";

  import { deltaMetrics, ballSize } from "../constants";

  $: checks = $lintStore.currentChecks;

  $: colorNames = colors.map((x) => nameColor(x)[0]);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: bg = currentPal.background;

  $: colorsToIssues = colors.map((x) => {
    const hex = `${x.toHex()}`;
    return checks.filter(
      (check) =>
        check.kind === "success" && !check.passes && check.message.includes(hex)
    );
  });

  function computeStats(
    colors: Color[],
    metric: typeof $configStore.evalDeltaDisplay
  ) {
    if (metric === "none") {
      return [];
    }
    // is contrast metric
    if (!new Set(deltaMetrics).has(metric as any)) {
      return colors.map((color) => color.contrast(bg, metric));
    }
    // is delta metric
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
      : computeStats(colors, $configStore.evalDeltaDisplay);

  $: focusedSet = new Set($focusStore.focusedColors);
</script>

<!-- left panel -->
<div class="bg-white w-80 container flex flex-col h-full flex-none">
  <section class="flex flex-col flex-1 overflow-auto p-1" id="left-panel">
    <div class="flex px-4">
      <ModifySelection />
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex flex-col overflow-auto mr-5 px-4 h-full">
      {#each colors as color, idx}
        <ColorBall
          {color}
          colorName={colorNames[idx]}
          {colorsToIssues}
          {idx}
          isFocused={focusedSet.has(idx)}
          {stats}
        />
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

      <div class="flex items-center mt-2">
        <DeMetric />
        <Sort />
        <label>
          Show Issues <input
            class="ml-1"
            on:change={(e) =>
              configStore.setShowIssuesOnLeft(e.currentTarget.checked)}
            type="checkbox"
            checked={$configStore.showIssuesOnLeft}
          />
        </label>
      </div>
      <GetColorsFromString
        onChange={(colors) => colorStore.setCurrentPalColors(colors)}
        colorSpace={currentPal.colorSpace}
        colors={currentPal.colors}
      />
    </div>
  </section>
</div>

<style>
  .container {
    min-width: 300px;
  }
</style>
