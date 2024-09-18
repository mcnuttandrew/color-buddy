<script lang="ts">
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
  import { simpleTooltipRowStyle } from "../lib/styles";
  const options = [
    "none",
    "deuteranopia",
    "protanopia",
    "tritanopia",
    "grayscale",
  ] as const;
</script>

<div class="w-full flex flex-col">
  <div class="text-sm">CVD Simulation:</div>
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
          {value}
        </div>
      {/each}
    </div>

    <button
      slot="target"
      let:toggle
      on:click={toggle}
      class={`${buttonStyle} whitespace-nowrap flex items-center`}
    >
      {$configStore.colorSim}
      <DownChev class="text-sm" />
    </button>
  </Tooltip>
</div>
