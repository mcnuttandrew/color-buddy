<script lang="ts">
  import { Color } from "color-buddy-palette";
  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import Tooltip from "./Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let onChange: (color: Color) => void;
  export let bg: Color;
  export let colorSpace: any;
  export let onSpaceChange: (space: string) => void;
  $: bgHex = bg.toHex();
</script>

<Tooltip top={"75px"} allowDrag={true}>
  <div slot="content" class="flex flex-col">
    <input
      class="mb-2"
      value={bgHex}
      on:change={(e) => {
        // @ts-ignore
        onChange(Color.colorFromString(e.target.value, colorSpace));
      }}
    />
    <ColorChannelPicker
      {onSpaceChange}
      colorMode={colorSpace}
      color={bg}
      onColorChange={onChange}
    />
  </div>
  <button
    let:toggle
    slot="target"
    class={`${buttonStyle} flex items-center justify-center this-button top-0.5 relative`}
    on:click={() => toggle()}
  >
    Background
    <div
      class={"h-3 w-3 rounded-full ml-2"}
      style={`background: ${bgHex}`}
    ></div>
    {bgHex}
  </button>
</Tooltip>
