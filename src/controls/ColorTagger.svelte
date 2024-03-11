<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";

  import { buttonStyle } from "../lib/styles";

  $: currentPalette = $colorStore.palettes[$colorStore.currentPal];
  // guaranteed to be a single value by usage context
  $: focusedColorIdx = $focusStore.focusedColors[0];
  $: currentColor = currentPalette.colors[focusedColorIdx];

  const updateTags = (updatedTags: string[]) =>
    updateSemantics({ ...currentColor, tags: updatedTags });
  const updateSize = (size: (typeof sizes)[number]) =>
    updateSemantics({ ...currentColor, size });

  const updateMarkType = (markType: (typeof markTypes)[number]) =>
    updateSemantics({ ...currentColor, markType });
  function updateSemantics(updatedColor: typeof currentColor) {
    const updatedColors = [...currentPalette.colors];
    updatedColors[focusedColorIdx] = updatedColor;
    colorStore.setCurrentPalColors(updatedColors);
  }
  let tagInput = "";
  const sizes = [undefined, "small", "medium", "large"] as const;
  const markTypes = [
    undefined,
    "line",
    "point",
    "bar",
    "area",
    "text",
    "background",
  ] as const;
</script>

<div class="font-bold">Tags</div>
<div class="italic text-sm">
  These to mark properties like color, brand, and so on
</div>
<form
  on:submit|preventDefault|stopPropagation={() => {
    updateTags([...currentColor.tags, tagInput]);
    tagInput = "";
  }}
>
  <input type="text" placeholder="Add tag" bind:value={tagInput} />
</form>

<div class="flex">
  {#each currentColor.tags as tag}
    <div class={buttonStyle}>
      {tag}
      <button
        on:click={() => {
          updateTags(currentColor.tags.filter((x) => x !== tag));
        }}
      >
        ✕
      </button>
    </div>
  {/each}
</div>
<div class="text-sm">Object for this color</div>
<select
  value={currentColor.markType}
  on:change={(e) => {
    // @ts-ignore
    updateMarkType(e.currentTarget.value);
  }}
>
  {#each markTypes as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<div class="text-sm">Size of color</div>
<select
  value={currentColor.size}
  on:change={(e) => {
    // @ts-ignore
    updateSize(e.currentTarget.value);
  }}
>
  {#each sizes as option}
    <option value={option}>{option}</option>
  {/each}
</select>
