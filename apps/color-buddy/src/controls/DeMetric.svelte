<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import configStore from "../stores/config-store";
  import { simpleTooltipRowStyle } from "../lib/styles";
  import ChevDown from "virtual:icons/fa6-solid/chevron-down";
  import { controlButtonStyle } from "../lib/styles";
  import { contrastMetrics, deltaMetrics } from "../constants";

  const nameMap: Record<string, string> = {
    Lstar: "Delta L*",
  };

  $: isContrastMetric = contrastMetrics.includes(
    $configStore.evalDeltaDisplay as any,
  );
</script>

<Tooltip bg="bg-white">
  <button
    class={`${controlButtonStyle
      .split(" ")
      .filter((x) => !x.startsWith("w-") && !x.startsWith("h-"))
      .join(" ")} px-2`}
    slot="target"
    let:toggle
    on:click={toggle}
  >
    Select a metric (current: {isContrastMetric ? "Contrast" : "Delta"}: {$configStore.evalDeltaDisplay})
    <ChevDown class="ml-2 text-sm" />
  </button>
  <div slot="content" class="flex flex-col">
    <button
      class={simpleTooltipRowStyle
        .split(" ")
        .filter((x) => !x.startsWith("px"))
        .join(" ")}
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
        {nameMap[metric] || metric}
        {#if metric === "WCAG21"}
          <span class="font-normal">(recommended)</span>
        {/if}
      </button>
    {/each}
    <!-- <div class="w-full border-b border-stone-200 my-2"></div> -->
    <!-- <label>
      Show Issues <input
        class="ml-1"
        on:change={(e) =>
          configStore.setShowIssuesOnLeft(e.currentTarget.checked)}
        type="checkbox"
        checked={$configStore.showIssuesOnLeft}
      />
    </label> -->
  </div>
</Tooltip>
