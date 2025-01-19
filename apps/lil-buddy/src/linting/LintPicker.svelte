<script lang="ts">
  import type { LintProgram } from "color-buddy-palette-lint";
  import ChevDown from "virtual:icons/fa6-solid/angle-down";
  import store from "../stores/store";
  import Tooltip from "../components/Tooltip.svelte";
  import { simpleTooltipRowStyle, buttonStyle } from "../lib/styles";

  $: lintGroups = $store.lints.reduce(
    (acc, row) => {
      acc[row.group] = (acc[row.group] || []).concat(row);
      return acc;
    },
    {} as Record<string, LintProgram[]>
  );
</script>

<Tooltip positionAlongRightEdge={true}>
  <div class="flex flex-col text-sm" slot="content">
    {#each Object.entries(lintGroups) as [groupName, items]}
      {#each items || [] as lint}
        <button
          class={simpleTooltipRowStyle}
          on:click={() => {
            store.setFocusedLint(lint.id);
          }}
        >
          {lint.name}
        </button>
      {/each}
      <div class="my-3 border-t border-black"></div>
    {/each}
  </div>
  <button
    slot="target"
    let:toggle
    on:click={toggle}
    class="{buttonStyle} flex items-center"
  >
    Select a different lint
    <ChevDown class="ml-2 text-sm" />
  </button>
</Tooltip>
