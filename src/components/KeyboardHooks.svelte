<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  function onKeyDown(e: any) {
    if (e.target.tagName === "INPUT") {
      return;
    }
    const key = e.key.toLowerCase();
    // UNDO REDO
    if (key === "z" && e.metaKey) {
      e.preventDefault();
      colorStore.undo();
    }
    if (
      (key === "y" && e.metaKey) ||
      (key === "z" && e.metaKey && e.shiftKey)
    ) {
      e.preventDefault();
      colorStore.redo();
    }

    // DELETE
    if (key === "backspace" || key === "delete") {
      e.preventDefault();
      const focusedSet = new Set($focusStore.focusedColors);
      const newColors = $colorStore.currentPal.colors.filter(
        (_, idx) => !focusedSet.has(idx)
      );
      colorStore.setCurrentPalColors(newColors);
      focusStore.clearColors();
    }

    // COLOR SCOOTING
    const arrows = new Set(["arrowup", "arrowdown", "arrowleft", "arrowright"]);
    if (arrows.has(key) && $focusStore.focusedColors.length > 0) {
      let step = 1;
      if (e.metaKey) {
        step = 10;
      }
      e.preventDefault();
      const focusSet = new Set($focusStore.focusedColors);
      const newColors = $colorStore.currentPal.colors.map((color, idx) => {
        if (!focusSet.has(idx)) {
          return color;
        }
        const [l, a, b] = color.toChannels();
        const channels = Object.keys(color.channels);
        if (key === "arrowdown") {
          color.setChannel(channels[2], b + step);
        }
        if (key === "arrowup") {
          color.setChannel(channels[2], b - step);
        }
        if (key === "arrowleft") {
          color.setChannel(channels[1], a - step);
        }
        if (key === "arrowright") {
          color.setChannel(channels[1], a + step);
        }
        return color;
      });

      colorStore.setCurrentPalColors(newColors);
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />
