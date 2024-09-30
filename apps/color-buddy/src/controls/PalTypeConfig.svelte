<script lang="ts">
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { titleCase } from "../lib/utils";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: palType = currentPal.type;

  const types = ["sequential", "diverging", "categorical"] as const;
  const descriptions: Record<(typeof types)[number], string> = {
    categorical:
      "palettes are used to represent a set of discrete values. They are often used to represent qualitative data, such as different types of land cover or different political parties.",
    diverging:
      "palettes are used to represent a range of values around a central point. They are often used to represent quantitative data, such as temperature or elevation.",
    sequential:
      "palettes are used to represent a range of values. They are often used to represent quantitative data, such as temperature or elevation.",
  };
</script>

<div class="flex flex-col">
  <div class="text-xs">Palette Type</div>
  <Tooltip>
    <div slot="content" class="flex flex-col max-w-md">
      {#each types as type}
        <button
          class={`${simpleTooltipRowStyle} text-sm py-1`}
          value={type}
          class:border-l-4={type === palType}
          on:click={() => colorStore.setCurrentPalType(type)}
        >
          <span class:font-bold={type === palType}>{titleCase(type)}</span>
          <span>{descriptions[type]}</span>
        </button>
      {/each}
    </div>
    <button
      class={`${buttonStyle} flex items-center justify-between w-36`}
      slot="target"
      let:toggle
      on:click={toggle}
    >
      <div>{titleCase(palType)}</div>
      <DownChev class="ml-2 text-sm" />
    </button>
  </Tooltip>
</div>
