<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
  const options = [
    "none",
    "deuteranopia",
    "protanopia",
    "tritanopia",
    "grayscale",
  ] as const;
</script>

<div class="w-full flex justify-between">
  <Tooltip>
    <div slot="content">
      {#each options as value}
        <label>
          <input
            type="radio"
            checked={$configStore.colorSim === value}
            on:change={() => configStore.setColorSim(value)}
            {value}
          />
          {value}
        </label>
      {/each}
    </div>

    <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
      Simulation: {$configStore.colorSim}
    </button>
  </Tooltip>
  {#if $configStore.colorSim !== "none"}
    <div>
      <button
        class={buttonStyle}
        on:click={() => configStore.setColorSim("none")}
      >
        Deactivate Sim
      </button>
    </div>
  {/if}
</div>
