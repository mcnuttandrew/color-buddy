<script lang="ts">
  import configStore from "../stores/config-store";
  import { buttonStyle } from "../lib/styles";
</script>

{#if $configStore.colorSim !== "none"}
  <div>
    <button
      class={buttonStyle}
      on:click={() =>
        configStore.setUseSimulatorOnExamples(
          !$configStore.useSimulatorOnExamples
        )}
    >
      {#if $configStore.useSimulatorOnExamples}
        Use original colors
      {:else}
        Use simulated colors
      {/if}
    </button>
  </div>
{/if}
