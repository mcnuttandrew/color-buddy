<script>
  import colorStore from "../stores/color-store";
  import TagsGeneric from "../components/TagsGeneric.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: tags = currentPal?.tags || [];
</script>

<TagsGeneric
  commonTags={[
    "serious",
    "trustworthy",
    "calm",
    "playful",
    "negative",
    "positive",
  ]}
  {tags}
  setNewTags={(tags) => colorStore.setCurrentTags(tags)}
  description={`Tags describe palette level usages, like the intended affect and so on.
        They govern which checks are run on the palette.`}
  label={"Palette Tags"}
/>
