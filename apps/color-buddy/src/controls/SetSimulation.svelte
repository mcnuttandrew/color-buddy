<script lang="ts">
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
  import { simpleTooltipRowStyle } from "../lib/styles";
  import { titleCase } from "../lib/utils";
  const options = [
    "none",
    "deuteranopia",
    "protanopia",
    "tritanopia",
    "grayscale",
  ] as const;
</script>

<div class="flex flex-col ml-1">
  <div class="text-xs">CVD Simulation:</div>
  <Tooltip bg="bg-white">
    <div slot="content" class="flex flex-col">
      {#each options as value}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class={simpleTooltipRowStyle}
          on:click={() => configStore.setColorSim(value)}
          class:font-bold={$configStore.colorSim === value}
        >
          {titleCase(value)}
        </div>
      {/each}
    </div>

    <button
      slot="target"
      let:toggle
      on:click={toggle}
      class={`${buttonStyle} whitespace-nowrap flex items-center w-full justify-between`}
    >
      {titleCase($configStore.colorSim)}
      <DownChev class="ml-2 text-sm" />
    </button>
  </Tooltip>
</div>
