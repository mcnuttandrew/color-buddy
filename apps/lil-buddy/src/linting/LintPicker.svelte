<script lang="ts">
  import ChevDown from "virtual:icons/fa6-solid/angle-down";

  import type { LintProgram } from "color-buddy-palette-lint";

  import store from "../stores/store";

  import Tooltip from "../components/Tooltip.svelte";
  import { simpleTooltipRowStyle, buttonStyle } from "../lib/styles";
  import NewLintSuggestion from "./NewLintSuggestion.svelte";
  import DeleteLint from "./DeleteLint.svelte";

  import { newId } from "../lib/utils";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint);
  $: lintGroups = $store.lints.reduce(
    (acc, row) => {
      acc[row.group] = (acc[row.group] || []).concat(row);
      return acc;
    },
    {} as Record<string, LintProgram[]>
  );
  let isOpen = false;
</script>

<Tooltip>
  <div class="" slot="content">
    <div class="flex flex-col text-sm">
      <div class="flex">
        <NewLintSuggestion />
        {#if lint}
          <DeleteLint {lint} />
          <button
            class={buttonStyle}
            on:click={() => {
              const clonedId = newId();
              store.cloneLint(lint.id, clonedId);
              store.setFocusedLint(clonedId);
            }}
          >
            Clone this lint
          </button>
        {/if}
      </div>
      <div class="my-3 border-t border-black"></div>
      {#each Object.entries(lintGroups) as [groupName, items], idx}
        <div class="uppercase font-bold italic">{groupName}</div>
        {#each items || [] as lint}
          <button
            class={simpleTooltipRowStyle}
            on:click={() => {
              isOpen = false;
              store.setFocusedLint(lint.id);
              if (lint.expectedPassingTests.length) {
                store.setFocusedTest({ type: "passing", index: 0 });
              } else if (lint.expectedFailingTests.length) {
                store.setFocusedTest({ type: "failing", index: 0 });
              }
              store.setFocusedTestToBeValid();
            }}
          >
            {lint.name}
          </button>
        {/each}
        {#if idx < Object.keys(lintGroups).length - 1}
          <!-- Add a separator between groups -->
          <div class="my-3 border-t border-black"></div>
        {/if}
      {/each}
    </div>
  </div>
  <button
    slot="target"
    let:toggle
    on:click={toggle}
    class="{buttonStyle} flex items-center"
  >
    {lint ? lint.name : "Select Lint"}
    <ChevDown class="ml-2 text-sm" />
  </button>
</Tooltip>
