<script lang="ts">
  import DownArrow from "virtual:icons/fa6-solid/arrow-down";
  import UpArrow from "virtual:icons/fa6-solid/arrow-up";
  import Cross from "virtual:icons/fa6-solid/xmark";
  import NumTwo from "virtual:icons/fa6-solid/2";

  import SuggestionModificationToSelection from "../controls/SuggestionModificationToSelection.svelte";
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import { buttonStyle } from "../lib/styles";
  $: focusedColors = $focusStore.focusedColors;
  $: focusedSet = new Set(focusedColors);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: focused = $focusStore.focusedColors;

  $: buttonsActive = focusedColors.length > 0;
  const style = "border border-stone-400 rounded mr-2 px-2";
</script>

<button
  class={style}
  class:opacity-30={!buttonsActive}
  class:opacity-50={buttonsActive}
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
  class={style}
  class:opacity-30={!buttonsActive}
  class:opacity-50={buttonsActive}
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

<button
  class={style}
  class:button-deactivated={!buttonsActive}
  on:click={() => {
    colorStore.setCurrentPalColors(
      colors.filter((_, idx) => !focusedSet.has(idx))
    );
    focusStore.clearColors();
  }}
>
  <Cross />
</button>
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
<button
  class={`${buttonStyle} flex items-center`}
  class:button-deactivated={!buttonsActive}
  on:click={() =>
    colorStore.setCurrentPalColors([
      ...currentPal.colors,
      ...currentPal.colors.filter((_, idx) => focusedSet.has(idx)),
    ])}
>
  <Cross /><NumTwo />
</button>
<SuggestionModificationToSelection />

<style>
  .button-deactivated {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
