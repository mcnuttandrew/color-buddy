<script lang="ts">
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { buttonStyle } from "../../lib/styles";

  $: colors = $colorStore.currentPal.colors;
  $: hasDuplicates = colors && checkForDuplicates();
  function checkForDuplicates() {
    let seenColors = new Set<string>();
    for (let i = 0; i < colors.length; i++) {
      if (seenColors.has(colors[i].toHex())) {
        return true;
      }
      seenColors.add(colors[i].toHex());
    }
  }
  function deDuplicate() {
    let seenColors = new Set<string>([]);
    let prunedIndexes = new Set<number>([]);
    const newColors = $colorStore.currentPal.colors.filter((x, idx) => {
      if (seenColors.has(x.toHex())) {
        prunedIndexes.add(idx);
        return false;
      }
      seenColors.add(x.toHex());
      return true;
    });
    const updatedFocusedColors = $focusStore.focusedColors.filter(
      (x) => !prunedIndexes.has(x)
    );
    colorStore.setCurrentPalColors(newColors);
    focusStore.setColors(updatedFocusedColors);
  }
</script>

{#if hasDuplicates}
  <div>
    <button class={buttonStyle} on:click={() => deDuplicate()}>
      Remove Duplicates
    </button>
  </div>
{/if}
