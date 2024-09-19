<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
  import { simpleTooltipRowStyle } from "../lib/styles";
  import ChevDown from "virtual:icons/fa6-solid/chevron-down";
  import { controlButtonStyle } from "../lib/styles";

  const metrics = ["76", "CMC", "2000", "ITP", "none"] as const;
</script>

<Tooltip bg="bg-white">
  <button
    class={`${controlButtonStyle}`}
    slot="target"
    let:toggle
    on:click={toggle}
  >
    dE <ChevDown class="text-sm" />
  </button>
  <div slot="content" class="flex flex-col">
    {#each metrics as metric}
      <button
        class={simpleTooltipRowStyle}
        class:font-bold={$configStore.evalDeltaDisplay === metric}
        on:click={() => configStore.setEvalDeltaDisplay(metric)}
      >
        {metric}
      </button>
    {/each}
  </div>
</Tooltip>
