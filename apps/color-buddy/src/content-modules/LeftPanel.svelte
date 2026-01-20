<script lang="ts">
  import { nameColor } from "color-buddy-color-namer";

  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";
  import ColorBall from "../components/ColorBall.svelte";

  import ModifySelection from "../controls/ModifySelection.svelte";

  import AddColor from "../controls/AddColor.svelte";

  import { ballSize } from "../constants";

  $: checks = $lintStore.currentChecks;

  $: colorNames = colors.map((x) => nameColor(x)[0]);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;

  $: colorsToIssues = colors.map((x) => {
    const hex = `${x.toHex()}`;
    return checks.filter(
      (check) =>
        check.kind === "success" &&
        !check.passes &&
        check.message.includes(hex),
    );
  });

  $: focusedSet = new Set($focusStore.focusedColors);
</script>

<!-- left panel -->
<div class="bg-white w-80 container flex flex-col h-full flex-none">
  <section class="flex flex-col flex-1 overflow-auto p-1" id="left-panel">
    <div class="flex px-4 w-full justify-between">
      <div class="flex">
        <ModifySelection />
      </div>
    </div>
    <div class="flex flex-col overflow-auto mr-5 px-4 h-full">
      {#each colors as color, idx}
        <ColorBall
          {color}
          colorName={colorNames[idx]}
          {colorsToIssues}
          {idx}
          isFocused={focusedSet.has(idx)}
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
    </div>
  </section>
</div>

<style>
  .container {
    min-width: 300px;
  }
</style>
