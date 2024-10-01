<script lang="ts">
  import DownArrow from "virtual:icons/fa6-solid/arrow-down";
  import UpArrow from "virtual:icons/fa6-solid/arrow-up";

  import SuggestionModificationToSelection from "../controls/SuggestionModificationToSelection.svelte";
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import Sort from "../controls/Sort.svelte";
  import { buttonStyle, controlButtonStyle } from "../lib/styles";
  $: focusedColors = $focusStore.focusedColors;
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focused = $focusStore.focusedColors;

  $: buttonsActive = focusedColors.length > 0;
</script>

<button
  class={`${controlButtonStyle} `}
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
  <UpArrow />
</button>
<button
  class={controlButtonStyle}
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
  <DownArrow />
</button>
<Sort />

<!-- <button
  class={buttonStyle}
  class:button-deactivated={!buttonsActive}
  on:click={() => focusStore.clearColors()}
>
  Deselect
</button>
<button
  class={buttonStyle}
  on:click={() => focusStore.setColors(currentPal.colors.map((_, idx) => idx))}
>
  Select All
</button> -->

<style>
  .button-deactivated {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
