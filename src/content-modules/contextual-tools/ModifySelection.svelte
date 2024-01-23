<script lang="ts">
  import focusStore from "../../stores/focus-store";
  import colorStore from "../../stores/color-store";
  import { buttonStyle } from "../../lib/styles";
  import { deDup } from "../../lib/utils";
  $: focusedColors = $focusStore.focusedColors;
  $: focusSet = new Set(focusedColors);
  $: colors = $colorStore.currentPal.colors;

  $: hasDuplicates = colors && checkForDuplicates();
  function checkForDuplicates() {
    return deDup(colors).length !== colors.length;
  }
  function deDuplicate() {
    let seenColors = new Set<string>([]);
    let prunedIndexes = new Set<number>([]);
    const newColors = colors.filter((x, idx) => {
      if (seenColors.has(x.toHex())) {
        prunedIndexes.add(idx);
        return false;
      }
      seenColors.add(x.toHex());
      return true;
    });
    const updatedFocusedColors = focusedColors.filter(
      (x) => !prunedIndexes.has(x)
    );
    colorStore.setCurrentPalColors(newColors);
    focusStore.setColors(updatedFocusedColors);
  }
</script>

{#if focusedColors.length > 0}
  <div class="w-full border-t-2 border-black my-2"></div>
  <div class="font-bold">Selection</div>
  <div>
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalColors(
          colors.filter((_, idx) => !focusSet.has(idx))
        );
        focusStore.clearColors();
      }}
    >
      Delete Selection
    </button>
    <button class={buttonStyle} on:click={() => focusStore.clearColors()}>
      Clear Selection
    </button>
    {#if hasDuplicates}
      <div>
        <button class={buttonStyle} on:click={() => deDuplicate()}>
          Remove Duplicates
        </button>
      </div>
    {/if}
  </div>
{/if}
