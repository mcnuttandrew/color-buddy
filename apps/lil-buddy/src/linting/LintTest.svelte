<script lang="ts">
  import { Color } from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";

  import ColorChannelPicker from "../components/ColorChannelPicker.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import Background from "../components/Background.svelte";
  import { buttonStyle } from "../lib/styles";
  export let pal: Palette;
  export let updatePal: (newPal: Palette) => void;
  $: bgLum = pal.background.luminance();
  $: textColor = bgLum > 0.4 ? "#00000066" : "#ffffffaa";
</script>

<div class="flex flex-col rounded">
  <div class=" flex w-full">
    <div class="flex flex-col items-start">
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
    </div>
  </div>
  <div
    class="flex flex-wrap rounded p-2 grow items-center"
    style="background-color: {pal.background.toDisplay()};"
  >
    {#each pal.colors as color, idx}
      <Tooltip top={"75px"}>
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
              const oldColor = newColors[idx];
              const tags = [...oldColor.tags];
              newColors[idx] = newColor;
              newColors[idx].tags = tags;
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
          <div class="font-bold">Tags</div>
          <div class="flex flex-wrap">
            {#each color.tags as tag, jdx}
              <div class={buttonStyle}>
                {tag}
                <button
                  on:click={() => {
                    const newColors = [...pal.colors];
                    newColors[idx].tags = newColors[idx].tags.filter(
                      (_, i) => i !== jdx
                    );
                    updatePal({ ...pal, colors: newColors });
                  }}
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
          <input
            placeholder="Enter tag here"
            on:keydown={(e) => {
              if (e.key === "Enter") {
                const newColors = [...pal.colors];
                newColors[idx].tags = [
                  ...newColors[idx].tags,
                  e.currentTarget.value,
                ];
                updatePal({ ...pal, colors: newColors });
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
        <button
          let:toggle
          slot="target"
          on:click|stopPropagation|preventDefault={(e) => {
            toggle();
          }}
        >
          <div class="flex flex-col text-center relative items-center">
            <div
              class={"w-6 h-6 mx-1 rounded-full dot"}
              style="background-color: {color.toDisplay()}"
            ></div>
            <div class="flex flex-col text-center pointer-events-none">
              {#each color.tags as tag}
                <div class="text-xs" style={`color: ${textColor}`}>{tag}</div>
              {/each}
            </div>
          </div>
        </button>
      </Tooltip>
    {/each}
  </div>
  <!-- <div>
    Colors: [{pal.colors.map((x) => `"${x.toHex()}"`).join(", ")}]
  </div> -->
</div>
