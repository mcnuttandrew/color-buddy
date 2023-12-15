<script lang="ts">
  import { flip } from "svelte/animate";
  import { insert, deleteFrom, randColor } from "../utils";
  import chroma from "chroma-js";
  import ColorPanelDot from "./ColorPanelDot.svelte";
  import ColorChannelPicker from "./ColorChannelPicker.svelte";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  $: colors = $colorStore.currentPal.colors;
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  <div class="flex">
    <ColorChannelPicker
      heading="Background"
      color={$colorStore.currentPal.background}
      onColorChange={(color) => {
        colorStore.setBackground(color);
      }}
    />
    {#if !!$focusStore.focusedColor}
      <div class="flex">
        <ColorChannelPicker
          heading="Focused Color"
          color={chroma($focusStore.focusedColor)}
          onColorChange={(color) => {
            if (!$focusStore.focusedColor) return;
            colorStore.replaceColor(chroma($focusStore.focusedColor), color);
            focusStore.setFocusedColor(color);
          }}
        />
        <div class="flex flex-col">
          {#each ["brighten", "darken", "saturate", "desaturate"] as action}
            <button
              class="underline"
              on:click={() => {
                if (!$focusStore.focusedColor) return;
                const color = chroma($focusStore.focusedColor);
                //@ts-ignore
                const newColor = color[action]();
                colorStore.replaceColor(color, newColor);
                focusStore.setFocusedColor(newColor.hex());
              }}
            >
              {action[0].toUpperCase()}{action.slice(1)}
            </button>
          {/each}
          <button
            class="underline"
            on:click={() => {
              if (!$focusStore.focusedColor) return;
              colorStore.setCurrentPalColors(
                deleteFrom(colors, $focusStore.focusedColor)
              );
              focusStore.setFocusedColor(undefined);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .color-container {
    max-width: 640px;
  }
</style>
