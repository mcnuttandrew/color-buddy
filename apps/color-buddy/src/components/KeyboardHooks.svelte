<script lang="ts">
  import { Color } from "@color-buddy/palette";
  import type { ColorWrap } from "@color-buddy/palette";
  import { colorPickerConfig } from "../lib/utils";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  $: focusedSet = new Set($focusStore.focusedColors);
  $: copiedData = [] as ColorWrap<Color>[];
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";
  $: config = colorPickerConfig[colorSpace];
  $: xStep = config.xStep;
  $: yStep = config.yStep;
  $: zStep = config.zStep;
  $: xDomain = config.xDomain;
  $: yDomain = config.yDomain;
  $: zDomain = config.zDomain;
  function onKeyDown(e: any) {
    const tagName = e.target.tagName.toLowerCase();
    const tagType = e.target.type;

    const classes = e.target.getAttribute("class") || "";
    if (tagName === "input" && !classes.includes("color-slider")) {
      const isUIElement =
        tagType === "number" || tagType === "range" || tagType === "text";
      if (isUIElement) {
        return;
      }
    }
    // block code mirror editing
    if (classes.includes("cm-content")) {
      return;
    }
    if (tagName === "textarea") {
      return;
    }
    const key = e.key.toLowerCase();
    const metaKey = e.metaKey || e.ctrlKey;
    const optionKey = e.altKey;
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
      const newColors = currentPal.colors.filter(
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
      const zDir = zDomain[1] < zDomain[0] ? 1 : -1;
      let step = verticalDirs.has(key) ? (optionKey ? zStep : yStep) : xStep;
      if (metaKey || e.shiftKey) {
        step *= 10;
      }
      e.preventDefault();
      const focusSet = new Set($focusStore.focusedColors);
      const newColors = currentPal.colors.map((color, idx) => {
        if (!focusSet.has(idx)) {
          return color;
        }
        const channels = color.color.toChannels();
        const xVal = channels[config.xChannelIndex];
        const yVal = channels[config.yChannelIndex];
        const zVal = channels[config.zChannelIndex];

        let newColor = color.color;
        if (!optionKey && key === "arrowdown") {
          newColor = newColor.setChannel(
            config.yChannel,
            yVal + verticalDir * step
          );
        }
        if (!optionKey && key === "arrowup") {
          newColor = newColor.setChannel(
            config.yChannel,
            yVal - verticalDir * step
          );
        }
        if (optionKey && key === "arrowdown") {
          newColor = newColor.setChannel(config.zChannel, zVal + zDir * step);
        }
        if (optionKey && key === "arrowup") {
          newColor = newColor.setChannel(config.zChannel, zVal - zDir * step);
        }
        if (key === "arrowleft") {
          newColor = newColor.setChannel(
            config.xChannel,
            xVal - horizontalDir * step
          );
        }
        if (key === "arrowright") {
          newColor = newColor.setChannel(
            config.xChannel,
            xVal + horizontalDir * step
          );
        }
        return { ...color, color: newColor };
      });

      colorStore.setCurrentPalColors(newColors);
    }

    // COPY PASTE
    if (key === "c" && metaKey && $focusStore.focusedColors.length) {
      copiedData = currentPal.colors.filter((_, idx) => focusedSet.has(idx));
    }
    if (key === "v" && metaKey && copiedData.length) {
      colorStore.setCurrentPalColors([...currentPal.colors, ...copiedData]);
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />
