<script>
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { titleCase } from "../lib/utils";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: palType = currentPal.type;
  $: tags = currentPal?.tags || [];

  $: inUseTags = new Set(tags);
</script>

<div class="flex flex-col">
  <div class="text-sm">Palette Type</div>
  <Tooltip>
    <div slot="content" class="flex flex-col">
      {#each ["sequential", "diverging", "categorical"] as type}
        <button
          class={simpleTooltipRowStyle}
          value={type}
          on:click={() =>
            // @ts-ignore
            colorStore.setCurrentPalType(type)}
          class:font-bold={type === palType}
        >
          {type}
        </button>
      {/each}
    </div>
    <button
      class={`${buttonStyle} flex`}
      slot="target"
      let:toggle
      on:click={toggle}
    >
      <div>{titleCase(palType)}</div>
      <DownChev class="text-sm" />
    </button>
  </Tooltip>
</div>
