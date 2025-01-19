<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./summary-nodes/DispatchNode.svelte";
  import { GenerateAST } from "color-buddy-palette-lint";
  export let pal: Palette;
  export let lint: string;

  $: ast = getAST(lint);
  let error: any;
  function getAST(lint: string) {
    try {
      return GenerateAST(JSON.parse(lint)).value as any;
    } catch (e) {
      error = e;
    }
  }
  $: console.log("summarizer");
</script>

<div class="flex">
  {#if error}
    <div>{error}</div>
  {:else}
    <DispatchNode node={ast} {pal} />
  {/if}
</div>
