<script lang="ts">
  import navStore from "../../stores/nav-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  const aiModes = ["google", "openai"] as const;
</script>

<Tooltip>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    {`Config ⚙`}
  </button>
  <div slot="content">
    <div>Pick AI Provider</div>
    <div>
      {#each aiModes as ai}
        <button
          class={buttonStyle}
          class:font-bold={ai === $navStore.engine}
          on:click={() => navStore.setEngine(ai)}
        >
          {ai}
        </button>
      {/each}
    </div>
    <div>Show color background on drag</div>
    <div>
      <input
        type="checkbox"
        checked={$navStore.showColorBackground}
        on:change={() =>
          navStore.setShowColorBackground(!navStore.showColorBackground)}
      />
    </div>
  </div>
</Tooltip>
