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

{#if $configStore.colorSim !== "none"}
  <button class={buttonStyle} on:click={() => configStore.setColorSim("none")}>
    Deactivate Sim
  </button>
{/if}
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
