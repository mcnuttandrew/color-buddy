<script lang="ts">
  import type { LintProgram } from "color-buddy-palette-lint";
  import ChevDown from "virtual:icons/fa6-solid/angle-down";
  import store from "../stores/store";
  import Tooltip from "../components/Tooltip.svelte";
  import Modal from "../components/Modal.svelte";
  import { simpleTooltipRowStyle, buttonStyle } from "../lib/styles";

  $: lintGroups = $store.lints.reduce(
    (acc, row) => {
      acc[row.group] = (acc[row.group] || []).concat(row);
      return acc;
    },
    {} as Record<string, LintProgram[]>
  );
  let isOpen = false;
</script>

<Modal
  closeModal={() => {
    isOpen = false;
  }}
  showModal={isOpen}
>
  <div class="">
    <div class="w-full bg-stone-200 px-2">Select a lint</div>
    <div class="flex flex-col text-sm">
      {#each Object.entries(lintGroups) as [groupName, items]}
        <div>{groupName}</div>
        {#each items || [] as lint}
          <button
            class={simpleTooltipRowStyle}
            on:click={() => {
              isOpen = false;
              store.setFocusedLint(lint.id);
            }}
          >
            {lint.name}
          </button>
        {/each}
        <div class="my-3 border-t border-black"></div>
      {/each}
    </div>
  </div>
</Modal>
<button
  on:click={() => {
    isOpen = true;
  }}
  class="{buttonStyle} flex items-center"
>
  Select a different lint
  <ChevDown class="ml-2 text-sm" />
</button>
