<script lang="ts">
  import { Color, stepSize } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  $: focusedSet = new Set($focusStore.focusedColors);
  $: copiedData = [] as Color[];
  $: colorSpace = $colorStore.currentPal.colors[0].spaceName;
  $: [_zStep, xStep, yStep] = stepSize[colorSpace];
  function onKeyDown(e: any) {
    if (e.target.tagName.toLowerCase() === "input") {
      const isUIElement =
        e.target.type === "number" || e.target.type === "range";
      if (!isUIElement) {
        return;
      }
    }
    if (e.target.tagName.toLowerCase() === "textarea") {
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
      const verticalDirs = new Set(["arrowup", "arrowdown"]);
      let step = verticalDirs.has(key) ? yStep : xStep;
      if (e.metaKey || e.shiftKey) {
        step *= 10;
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

    // COPY PASTE
    if (key === "c" && e.metaKey && $focusStore.focusedColors.length) {
      copiedData = $colorStore.currentPal.colors.filter((_, idx) =>
        focusedSet.has(idx)
      );
    }
    if (key === "v" && e.metaKey && copiedData.length) {
      colorStore.setCurrentPalColors([
        ...$colorStore.currentPal.colors,
        ...copiedData,
      ]);
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />
