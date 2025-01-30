<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import DispatchNode from "./summary-nodes/DispatchNode.svelte";
  import { GenerateAST } from "color-buddy-palette-lint";
  import store from "../stores/store";
  export let pal: Palette;
  export let lint: string;

  $: ast = getAST(lint, $store.okayToExecute);
  let error: any;
  function getAST(lint: string, okayToExecute: boolean) {
    console.log("ast");
    if (!okayToExecute) {
      error = "Changes in process";
      return null;
    }
    try {
      return GenerateAST(JSON.parse(lint)).value as any;
    } catch (e) {
      error = e;
    }
  }
  $: console.log("summarizer", $store.okayToExecute);
</script>

<div class="flex">
  {#if error}
    <div>{error}</div>
  {:else}
    <DispatchNode node={ast} {pal} />
  {/if}
</div>
