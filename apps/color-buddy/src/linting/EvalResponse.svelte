<script lang="ts">
  import type { LintResult } from "color-buddy-palette-lint";

  import ChevDown from "virtual:icons/fa6-solid/chevron-down";
  import Tooltip from "../components/Tooltip.svelte";
  import LintToolTipContents from "./LintToolTipContents.svelte";

  export let lintResult: LintResult;
  export let customWord: string = "";
  export let customWordIsImg: boolean = false;
  export let positionAlongRightEdge: boolean = true;
</script>

<Tooltip {positionAlongRightEdge}>
  <div slot="content" let:onClick class="max-w-xl eval-tooltip">
    <LintToolTipContents {onClick} {lintResult} />
  </div>
  <button
    slot="target"
    let:toggle
    class={"flex items-center"}
    on:click|stopPropagation={toggle}
  >
    <slot name="target" />
    {#if customWord && !customWordIsImg}
      {customWord}
    {:else if customWord && customWordIsImg}
      <img
        src={customWord}
        class="h-4"
        alt={`Logo for a ${lintResult.lintProgram.group} check. Indicates that there is an issues with ${lintResult.lintProgram.name}`}
        title={`Logo for a ${lintResult.lintProgram.group} check. Indicates that there is an issues with ${lintResult.lintProgram.name}`}
      />
    {:else if lintResult.kind === "success" && lintResult.passes}
      <ChevDown class="h-4 w-4  text-sm" />{:else}<ChevDown
        class="h-4 w-4  text-sm"
      />{/if}
  </button>
</Tooltip>

<style>
  .eval-tooltip {
    min-width: 500px;
  }
</style>
