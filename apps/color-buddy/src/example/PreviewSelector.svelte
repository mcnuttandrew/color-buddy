<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  import exampleStore from "../stores/example-store";
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  export let exampleName: string;
</script>

<Tooltip>
  <div slot="content" class="max-w-md">
    <button
      class={buttonStyle}
      on:click={() => configStore.setManageBrowsePreviewIdx(-1)}
    >
      Discs
    </button>
    {#each $exampleStore.examples as example, idx}
      <button
        class={buttonStyle}
        on:click={() => configStore.setManageBrowsePreviewIdx(idx)}
      >
        {example.name}
      </button>
    {/each}
  </div>
  <button
    slot="target"
    let:toggle
    class={`${buttonStyle} pl-0`}
    on:click={toggle}
  >
    Change example: {exampleName || "Discs"}
  </button>
</Tooltip>
