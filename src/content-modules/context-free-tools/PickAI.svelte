<script lang="ts">
  import colorStore from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { AIButtonStyle, buttonStyle } from "../../lib/styles";
</script>

<Tooltip>
  <button class={AIButtonStyle} slot="target" let:toggle on:click={toggle}>
    {`AI ⚙`}
  </button>
  <div slot="content">
    <div>Pick AI Provider</div>
    <div>
      {#each ["google", "openai"] as ai}
        <button
          class={buttonStyle}
          class:font-bold={ai === $colorStore.engine}
          on:click={() => {
            colorStore.setEngine(ai);
          }}
        >
          {ai}
        </button>
      {/each}
    </div>
  </div>
</Tooltip>
