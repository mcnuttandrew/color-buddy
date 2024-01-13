<script lang="ts">
  import colorStore from "../stores/color-store";
  import chroma from "chroma-js";
  import { Color, colorFromHex } from "../lib/Color";
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  $: bg = $colorStore.currentPal.background;
  $: bgHex = bg.toHex();
  $: colorSpace = $colorStore.currentPal.colorSpace;
  function onChange(color: Color) {
    colorStore.setBackground(color);
  }
</script>

<Tooltip top={"75px"} allowDrag={true}>
  <div slot="content" class="flex flex-col" let:onClick>
    <input
      class="mb-2"
      value={bgHex}
      on:change={(e) => {
        // @ts-ignore
        const newColor = chroma(e.target.value);
        colorStore.setBackground(colorFromHex(newColor.hex(), colorSpace));
      }}
    />
    <ColorChannelPicker color={bg} onColorChange={onChange} />
  </div>
  <button
    let:toggle
    slot="target"
    class={`${buttonStyle} flex items-center justify-center`}
    on:click={() => {
      toggle();
    }}
  >
    Background {bgHex}
    <div
      class={"h-3 w-3 rounded-full ml-2"}
      style={`background: ${bgHex}`}
    ></div>
  </button>
</Tooltip>
