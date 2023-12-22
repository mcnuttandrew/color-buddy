<script lang="ts">
  import { Color, colorFromChannels } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";

  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: focusedColors = $focusStore.focusedColors;
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";

  function actionOnColor(idx: number, action: (Color: Color) => any) {
    const newColor = action(colors[idx]);
    const newColors = [...colors];
    newColors[idx] = newColor;
    colorStore.setCurrentPalColors(newColors);
  }
</script>

{#if focusedColors.length === 1}
  <Tooltip>
    <div slot="content">
      {#each ["brighten", "darken", "saturate", "desaturate"] as action}
        <button
          class={buttonStyle}
          on:click={() => {
            actionOnColor(focusedColors[0], (color) => {
              // @ts-ignore
              const chromaColor = color.toChroma()[action]();
              return colorFromChannels(chromaColor.lab(), colorSpace);
            });
          }}
        >
          {action[0].toUpperCase()}{action.slice(1)}
        </button>
      {/each}
    </div>
    <div slot="target" let:toggle>
      <button class={buttonStyle} on:click={toggle}>Adjust Color</button>
    </div>
  </Tooltip>
{/if}
