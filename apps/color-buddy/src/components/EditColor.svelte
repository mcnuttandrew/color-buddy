<script lang="ts">
  import Tooltip from "./Tooltip.svelte";
  import ColorTagger from "../controls/ColorTagger.svelte";
  import { buttonStyle } from "../lib/styles";
  import ColorChannelWrapper from "./ColorChannelWrapper.svelte";
</script>

<Tooltip>
  <div slot="content">
    <ColorChannelWrapper />
    <ColorTagger />
  </div>
  <button slot="target" class={buttonStyle} let:toggle on:click={toggle}>
    Edit Color
  </button>
</Tooltip>
