<script lang="ts">
  import colorStore from "../stores/color-store";
  import chroma from "chroma-js";
  import { Color } from "../lib/Color";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
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
        <input
          class="mb-2"
          value={bg.toHex()}
          on:change={(e) => {
            const newColor = chroma(e.target.value);
            colorStore.setBackground(bg.fromChroma(newColor));
          }}
        />
        <ColorChannelPicker color={bg} onColorChange={onChange} />
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        let:toggle
        slot="target"
        class={"cursor-pointer mr-2 mb-2 w-full h-8 rounded-full border-2 border-gray-200 text-center"}
        class:text-white={bg.toChroma().luminance() < 0.5}
        style={`background: ${bg.toHex()}`}
        on:click={() => {
          toggle();
        }}
      >
        {bg.toHex()}
      </div>
    </Tooltip>
  </div>
</div>
