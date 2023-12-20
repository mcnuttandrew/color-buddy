<script lang="ts">
  import colorStore from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <button class="underline" on:click={() => colorStore.randomizeOrder()}>
      Randomize order
    </button>
    <button class="underline" on:click={() => colorStore.sortByHue()}>
      Sort by hue
    </button>
  </span>

  <span slot="target" let:toggle>
    <button class="underline" on:click={toggle}>Sort</button>
  </span>
</Tooltip>
