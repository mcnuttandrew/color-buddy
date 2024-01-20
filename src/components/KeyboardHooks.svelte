<script lang="ts">
  import { Color, colorPickerConfig } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  $: focusedSet = new Set($focusStore.focusedColors);
  $: copiedData = [] as Color[];
  $: colorSpace = $colorStore.currentPal.colorSpace;
  $: config = colorPickerConfig[colorSpace];
  $: xStep = config.xStep;
  $: yStep = config.yStep;
  $: xDomain = config.xDomain;
  $: yDomain = config.yDomain;
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
    const metaKey = e.metaKey || e.ctrlKey;
    // UNDO REDO
    if (key === "z" && metaKey) {
      e.preventDefault();
      colorStore.undo();
    }
    if ((key === "y" && metaKey) || (key === "z" && metaKey && e.shiftKey)) {
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
      const verticalDir = xDomain[1] < xDomain[0] ? 1 : -1;
      const horizontalDir = yDomain[1] < yDomain[0] ? 1 : -1;
      let step = verticalDirs.has(key) ? yStep : xStep;
      if (metaKey || e.shiftKey) {
        step *= 10;
      }
      e.preventDefault();
      const focusSet = new Set($focusStore.focusedColors);
      const newColors = $colorStore.currentPal.colors.map((color, idx) => {
        if (!focusSet.has(idx)) {
          return color;
        }
        const channels = color.toChannels();
        const xVal = channels[config.xChannelIndex];
        const yVal = channels[config.yChannelIndex];
        if (key === "arrowdown") {
          return color.setChannel(config.yChannel, yVal + verticalDir * step);
        }
        if (key === "arrowup") {
          return color.setChannel(config.yChannel, yVal - verticalDir * step);
        }
        if (key === "arrowleft") {
          return color.setChannel(config.xChannel, xVal - horizontalDir * step);
        }
        if (key === "arrowright") {
          return color.setChannel(config.xChannel, xVal + horizontalDir * step);
        }
        return color;
      });

      colorStore.setCurrentPalColors(newColors);
    }

    // SAVE BY DUPLICATING PALETTE
    if (key === "s" && metaKey) {
      e.preventDefault();
      const newPal = {
        ...$colorStore.currentPal,
        name: `${$colorStore.currentPal.name} copy`,
        colors: [...$colorStore.currentPal.colors],
      };
      colorStore.createNewPal(newPal);
    }

    // COPY PASTE
    if (key === "c" && metaKey && $focusStore.focusedColors.length) {
      copiedData = $colorStore.currentPal.colors.filter((_, idx) =>
        focusedSet.has(idx)
      );
    }
    if (key === "v" && metaKey && copiedData.length) {
      colorStore.setCurrentPalColors([
        ...$colorStore.currentPal.colors,
        ...copiedData,
      ]);
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />
