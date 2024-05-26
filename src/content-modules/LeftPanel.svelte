<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import Nav from "../components/Nav.svelte";
  import NewPal from "../controls/NewPal.svelte";
  import EvalColorColumn from "../linting/EvalColorColumn.svelte";

  import Config from "../controls/Config.svelte";
  import Controls from "./Controls.svelte";
  import { denseButtonStyle } from "../lib/styles";

  import SavedPals from "./SavedPals.svelte";

  $: leftPanelTabs = ["controls", "colors"];

  $: {
    if (!new Set(["controls", "colors"]).has($configStore.leftRoute)) {
      configStore.setLeftPanelRoute("controls");
    }
  }
</script>

<!-- left panel -->
<div class="bg-stone-200 w-80 container flex flex-col h-full flex-none">
  <div class="text-4xl font-bold bg-stone-800 text-white px-2 py-1">
    Color Buddy 𑁍
  </div>
  <section class="flex flex-col flex-none" id="top-controls">
    <div class="flex w-full justify-between items-start">
      <div class="flex ml-1">
        <NewPal />
      </div>
      <div class="flex">
        <button
          class={`${denseButtonStyle} p-0 mt-0.5`}
          on:click={() => colorStore.undo()}
        >
          Undo
        </button>
        /
        <button
          class={`${denseButtonStyle} p-0 mt-0.5`}
          on:click={() => colorStore.redo()}
        >
          Redo
        </button>
      </div>
      <Config />
    </div>
    <div class="flex justify-center z-50"></div>
  </section>

  <section class="flex flex-col flex-1 overflow-auto p-1" id="left-panel">
    <div class="flex justify-center items-center">
      <Nav
        tabs={leftPanelTabs}
        isTabSelected={(x) => x === $configStore.leftRoute}
        selectTab={(x) => {
          //@ts-ignore
          configStore.setLeftPanelRoute(x);
        }}
      />
    </div>
    <div class="w-full border-t-2 border-black my-2"></div>
    {#if $configStore.leftRoute === "controls"}
      <Controls />
    {/if}
    {#if $configStore.leftRoute === "colors"}
      <EvalColorColumn />
    {/if}
  </section>
</div>

<style>
  .container {
    min-width: 300px;
  }
</style>
