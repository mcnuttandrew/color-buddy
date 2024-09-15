<script lang="ts">
  import focusStore from "../stores/focus-store";
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";

  import { buttonStyle } from "../lib/styles";

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
  let tagInput = "";
  $: commonTags = ["text", "axis"].filter(
    (x) =>
      !currentColor.tags.map((x) => x.toLowerCase()).includes(x.toLowerCase())
  );
</script>

<div class="text-sm italic">Tags</div>

<div class="flex">
  {#each currentColor.tags as tag}
    <div>
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
    </div>
  {/each}
  <Tooltip>
    <div slot="content" class="max-w-md">
      <div class="font-bold">Color Tags</div>
      <div class="italic text-sm">
        These mark properties like color, brand, and so on. {#if commonTags.length}
          Here are some common ones that are have specific effects in the app.{/if}
      </div>
      {#each commonTags as tag}
        <button
          class={buttonStyle}
          on:click={() => updateTags([...currentColor.tags, tag])}
        >
          {tag}
        </button>
      {/each}

      <div class="font-bold">Custom</div>

      <form
        on:submit|preventDefault|stopPropagation={() => {
          updateTags([...currentColor.tags, tagInput]);
          tagInput = "";
        }}
      >
        <input type="text" placeholder="Add tag" bind:value={tagInput} />
      </form>
    </div>
    <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
      Add Tag
    </button>
  </Tooltip>
</div>
