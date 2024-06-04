<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import { buttonStyle } from "../lib/styles";

  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;
  $: focused = $focusStore.focusedColors;
  $: buttonsActive = focused.length > 0;
</script>

<button
  class="{buttonStyle} mr-2"
  class:opacity-30={!buttonsActive}
  class:cursor-not-allowed={!buttonsActive}
  on:click|stopPropagation|preventDefault={() => {
    // move every element to the left
    const newColors = [...colors];
    const newFocused = [...focused];
    for (let i = 0; i < focused.length; i++) {
      const idx = focused[i];
      if (idx === 0) {
        continue;
      }
      newColors[idx] = colors[idx - 1];
      newColors[idx - 1] = colors[idx];
      newFocused[i] = idx - 1;
    }
    colorStore.setSort(newColors);
    focusStore.setColors(newFocused);
  }}
>
  Move left
</button>
<button
  class="{buttonStyle} mr-2"
  class:opacity-30={!buttonsActive}
  class:cursor-not-allowed={!buttonsActive}
  on:click|stopPropagation|preventDefault={() => {
    // move every element to the right
    const newColors = [...colors];
    const newFocused = [...focused];
    for (let i = focused.length - 1; i >= 0; i--) {
      const idx = focused[i];
      if (idx === colors.length - 1) {
        continue;
      }
      newColors[idx] = colors[idx + 1];
      newColors[idx + 1] = colors[idx];
      newFocused[i] = idx + 1;
    }
    colorStore.setSort(newColors);
    focusStore.setColors(newFocused);
  }}
>
  Move right
</button>
