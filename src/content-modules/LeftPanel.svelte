<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import Nav from "../components/Nav.svelte";

  import Config from "./context-free-tools/Config.svelte";
  import Controls from "./Controls.svelte";
  import { buttonStyle } from "../lib/styles";

  import SavedPals from "./SavedPals.svelte";
</script>

<!-- left panel -->
<div class="bg-stone-200 w-80 container flex flex-col h-full flex-none">
  <div class="text-4xl font-bold bg-stone-800 text-white px-2 py-1">
    Color Buddy 𑁍
  </div>
  <section class="flex flex-col flex-none">
    <div class="flex justify-between z-50 p-2">
      <div>
        <button class={buttonStyle} on:click={() => colorStore.undo()}>
          Undo
        </button>
        <button class={buttonStyle} on:click={() => colorStore.redo()}>
          Redo
        </button>
      </div>
      <Config />
    </div>
  </section>

  <section class="flex flex-col flex-1 overflow-auto p-2">
    <Nav
      tabs={["saved-pals", "controls"]}
      isTabSelected={(x) => $configStore.leftRoute === x}
      selectTab={(x) => {
        // @ts-ignore
        configStore.setLeftRoute(x);
      }}
      className="w-full"
    />

    {#if $configStore.leftRoute === "saved-pals"}
      <SavedPals />
    {/if}
    {#if $configStore.leftRoute === "controls"}
      <Controls />
    {/if}
  </section>
</div>

<style>
  .container {
    min-width: 300px;
  }
</style>
