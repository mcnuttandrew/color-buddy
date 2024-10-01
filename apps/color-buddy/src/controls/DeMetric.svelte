<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
  import { simpleTooltipRowStyle } from "../lib/styles";
  import ChevDown from "virtual:icons/fa6-solid/chevron-down";
  import { controlButtonStyle } from "../lib/styles";
  import { contrastMetrics, deltaMetrics } from "../constants";
</script>

<Tooltip bg="bg-white">
  <button
    class={`${controlButtonStyle
      .split(" ")
      .filter((x) => !x.startsWith("w-"))
      .join(" ")} px-2 w-12`}
    slot="target"
    let:toggle
    on:click={toggle}
  >
    dE <ChevDown class="text-base ml-1" />
  </button>
  <div slot="content" class="flex flex-col">
    <button
      class={simpleTooltipRowStyle}
      class:font-bold={$configStore.evalDeltaDisplay === "none"}
      on:click={() => configStore.setEvalDeltaDisplay("none")}
    >
      None
    </button>
    <div class="text-sm font-bold">Order Difference Metrics</div>
    {#each deltaMetrics as metric}
      <button
        class={simpleTooltipRowStyle}
        class:font-bold={$configStore.evalDeltaDisplay === metric}
        on:click={() => configStore.setEvalDeltaDisplay(metric)}
      >
        {metric}
      </button>
    {/each}
    <div class="text-sm font-bold">Background Contrast Metrics</div>
    {#each contrastMetrics as metric}
      <button
        class={simpleTooltipRowStyle}
        class:font-bold={$configStore.evalDeltaDisplay === metric}
        on:click={() => configStore.setEvalDeltaDisplay(metric)}
      >
        {metric}
        {#if metric === "WCAG21"}
          <span class="font-normal">(You probably want this one)</span>
        {/if}
      </button>
    {/each}
  </div>
</Tooltip>
