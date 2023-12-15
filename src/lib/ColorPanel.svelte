<script lang="ts">
  import chroma from "chroma-js";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  $: colors = $colorStore.currentPal.colors;
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  Action Panel
  <div class="flex">
    {#if $focusStore.focusedColor !== undefined}
      <div class="flex">
        {#each ["brighten", "darken", "saturate", "desaturate"] as action}
          <button
            class="underline mr-2"
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
              colors.filter((_, idx) => idx !== $focusStore.focusedColor)
            );
            focusStore.setFocusedColor(undefined);
          }}
        >
          Delete
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .color-container {
    max-width: 640px;
  }
</style>
