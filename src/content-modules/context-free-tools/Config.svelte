<script lang="ts">
  import configStore from "../../stores/config-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  const aiModes = ["google", "openai"] as const;
  $: showBg = $configStore.showColorBackground;
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
          class:font-bold={ai === $configStore.engine}
          on:click={() => configStore.setEngine(ai)}
        >
          {ai}
        </button>
      {/each}
    </div>
    <div>Show color background on drag</div>
    <div>
      <input
        type="checkbox"
        checked={showBg}
        on:change={() => configStore.setShowColorBackground(!showBg)}
      />
    </div>
  </div>
</Tooltip>
