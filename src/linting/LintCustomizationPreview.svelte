<script lang="ts">
  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { Color } from "../lib/Color";
  import Background from "../components/Background.svelte";
  import type { Palette } from "../types";
  import { buttonStyle } from "../lib/styles";
  export let pal: Palette;
  export let blamedSet: Set<number> = new Set();
  export let updatePal: (newPal: Palette) => void;
  export let removeCase: () => void;
</script>

<div
  class="flex flex-wrap rounded p-2 grow"
  style="background-color: {pal.background.toDisplay()};"
>
  {#each pal.colors as color, idx}
    <Tooltip top={"75px"} allowDrag={true}>
      <div slot="content" class="flex flex-col">
        <input
          class="mb-2"
          value={color.toHex()}
          on:change={(e) => {
            // @ts-ignore
            const val = e.target.value;
            const newColors = [...pal.colors];
            newColors[idx] = Color.colorFromString(val, pal.colorSpace);
            updatePal({ ...pal, colors: newColors });
          }}
        />
        <ColorChannelPicker
          onSpaceChange={(newSpace) => {
            updatePal({
              ...pal,
              //   @ts-ignore
              colors: pal.colors.map((x) => x.toColorSpace(newSpace)),
              //   @ts-ignore
              colorSpace: newSpace,
            });
          }}
          colorMode={pal.colorSpace}
          {color}
          onColorChange={(newColor) => {
            const newColors = [...pal.colors];
            newColors[idx] = newColor;
            updatePal({ ...pal, colors: newColors });
          }}
        />
        <button
          class="w-6 h-6 mx-2 rounded-full transition-all"
          on:click={() => {
            const newColors = [...pal.colors].filter((_, i) => i !== idx);
            updatePal({ ...pal, colors: newColors });
          }}
        >
          Remove
        </button>
      </div>
      <button
        let:toggle
        slot="target"
        on:click|stopPropagation|preventDefault={(e) => {
          toggle();
        }}
        class={"w-6 h-6 mx-2 rounded-full transition-all"}
        class:border-4={blamedSet.has(idx)}
        class:border-dashed={blamedSet.has(idx)}
        class:border-black={blamedSet.has(idx) && color.luminance() > 0.5}
        class:border-white={blamedSet.has(idx) && color.luminance() <= 0.5}
        style="background-color: {color.toDisplay()}"
      ></button>
    </Tooltip>
  {/each}
  <Tooltip>
    <div slot="content" class="flex flex-col items-start">
      <button
        class={buttonStyle}
        on:click={() => {
          const newColors = [...pal.colors, Color.colorFromString("steelblue")];
          updatePal({ ...pal, colors: newColors });
        }}
      >
        Add Color
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          removeCase();
        }}
      >
        Remove Test Case
      </button>
      <Background
        onChange={(newColor) => updatePal({ ...pal, background: newColor })}
        bg={pal.background}
        colorSpace={pal.colorSpace}
        onSpaceChange={(newSpace) => {
          updatePal({
            ...pal,
            //   @ts-ignore
            colors: pal.colors.map((x) => x.toColorSpace(newSpace)),
            //   @ts-ignore
            colorSpace: newSpace,
          });
        }}
      />
      <div>
        Colors: [{pal.colors.map((x) => `"${x.toHex()}"`).join(", ")}]
      </div>
    </div>
    <button slot="target" let:toggle on:click={toggle}>⚙</button>
  </Tooltip>
</div>
