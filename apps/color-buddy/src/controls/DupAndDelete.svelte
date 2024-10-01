<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  import DuplicateIcon from "virtual:icons/custom/duplicate-color";

  import Cross from "virtual:icons/fa6-solid/xmark";

  $: colors = $colorStore.palettes[$colorStore.currentPal].colors;
  $: focusSet = new Set($focusStore.focusedColors);
</script>

<div>
  <button
    class={`${buttonStyle} flex items-center`}
    on:click={() => {
      colorStore.setCurrentPalColors(
        colors.filter((_, idx) => !focusSet.has(idx))
      );
      focusStore.clearColors();
    }}
  >
    <Cross class="mr-2" /> Delete
  </button>
</div>
<div>
  <button
    class={`${buttonStyle} flex items-center`}
    on:click={() =>
      colorStore.setCurrentPalColors([
        ...colors,
        ...colors.filter((_, idx) => focusSet.has(idx)),
      ])}
  >
    <DuplicateIcon class="mr-2" /> Duplicate
  </button>
</div>
