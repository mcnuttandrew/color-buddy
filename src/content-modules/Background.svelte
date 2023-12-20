<script lang="ts">
  import colorStore from "../stores/color-store";
  import { Color } from "../lib/Color";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import ColorNameWithEdit from "../components/ColorNameWithEdit.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  $: bg = $colorStore.currentPal.background;
  function onChange(color: Color) {
    colorStore.setBackground(color);
  }
</script>

<div>
  <h1>Background</h1>
  <div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <Tooltip top={"75px"}>
      <div slot="content" class="flex flex-col" let:onClick>
        <!-- <ColorNameWithEdit color={bg} onColorChange={onChange} /> -->
        <ColorChannelPicker color={bg} onColorChange={onChange} />
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        let:toggle
        slot="target"
        class={"cursor-pointer mr-2 mb-2 w-full h-8 rounded-full border-2 border-gray-200"}
        style={`background: ${bg.toHex()}`}
        on:click={() => {
          toggle();
        }}
      ></div>
    </Tooltip>
  </div>
</div>
