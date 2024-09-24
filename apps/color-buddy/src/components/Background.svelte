<script lang="ts">
  import { Color } from "color-buddy-palette";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import Tooltip from "./Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let onChange: (color: Color) => void;
  export let bg: Color;
  export let colorSpace: any;
  export let onSpaceChange: (space: string) => void;
  $: bgHex = bg.toHex();
</script>

<div class="flex flex-col ml-1">
  <div class="text-sm">Background</div>
  <Tooltip top={"20px"}>
    <div slot="content" class="flex flex-col">
      <div class="text-sm">Current Color</div>
      <input
        class="mb-2 {buttonStyle}"
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
      class={`${buttonStyle} flex items-center justify-between`}
      on:click={() => toggle()}
    >
      <div class="flex items-center">
        <div
          class={"h-3 w-3 rounded-full ml-2"}
          style={`background: ${bgHex}`}
          class:border={bg.luminance() > 0.5}
          class:border-black={bg.luminance() > 0.5}
        ></div>
        {bgHex}
      </div>
      <DownChev class="text-sm ml-2" />
    </button>
  </Tooltip>
</div>
