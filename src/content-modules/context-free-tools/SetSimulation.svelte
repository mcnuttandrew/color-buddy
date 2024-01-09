<script lang="ts">
  import { buttonStyle } from "../../lib/styles";
  import Tooltip from "../../components/Tooltip.svelte";
  import navStore from "../../stores/nav-store";
</script>

<Tooltip>
  <div slot="content">
    {#each ["none", "deuteranopia", "protanopia", "tritanopia"] as value}
      <label>
        <input
          type="radio"
          checked={$navStore.colorSim === value}
          on:change={(e) => {
            // @ts-ignore
            navStore.setColorSim(e.target.value);
          }}
          name="amount"
          {value}
        />
        {value}
      </label>
    {/each}
  </div>
  <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
    Blind Sim: {#if $navStore.colorSim !== "none"}{$navStore.colorSim}{/if}
  </button>
</Tooltip>
