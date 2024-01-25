<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
</script>

<Tooltip>
  <div slot="content">
    {#each ["none", "deuteranopia", "protanopia", "tritanopia", "black-and-white"] as value}
      <label>
        <input
          type="radio"
          checked={$configStore.colorSim === value}
          on:change={(e) => {
            // @ts-ignore
            configStore.setColorSim(e.target.value);
          }}
          name="amount"
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
