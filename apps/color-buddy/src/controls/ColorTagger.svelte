<script lang="ts">
  import TagsGeneric from "../components/TagsGeneric.svelte";
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";

  $: currentPalette = $colorStore.palettes[$colorStore.currentPal];
  // guaranteed to be a single value by usage context
  $: focusedColorIdx = $focusStore.focusedColors[0];
  $: currentColor = currentPalette.colors[focusedColorIdx];

  function updateTags(updatedTags: string[]) {
    const updatedColors = [...currentPalette.colors];
    updatedColors[focusedColorIdx] = currentColor;
    updatedColors[focusedColorIdx].tags = updatedTags;
    colorStore.setCurrentPalColors(updatedColors);
  }
</script>

<TagsGeneric
  commonTags={["text", "axis"]}
  tags={currentColor.tags}
  setNewTags={updateTags}
  description={`These mark properties like color, brand, and so on.
          Here are some common ones that are have specific effects in the app.`}
  label={"Color Tags"}
/>
