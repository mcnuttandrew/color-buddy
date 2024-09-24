<script>
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import Times from "virtual:icons/fa6-solid/xmark";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: tags = currentPal?.tags || [];

  let tagInput = "";
  $: inUseTags = new Set(tags);
  $: commonTags = [
    "serious",
    "trustworthy",
    "calm",
    "playful",
    "negative",
    "positive",
  ].filter((x) => !inUseTags.has(x));
</script>

<div class="flex flex-col">
  <div class="text-sm whitespace-nowrap">Palette Tags</div>
  <Tooltip>
    <div slot="content" class="max-w-md">
      <div class="italic text-sm">
        Tags describe palette level usages, like the intended affect and so on.
        They govern which checks are run on the palette.
      </div>
      <div class="text-sm">Current Tags</div>
      <div class="flex flex-wrap">
        {#each tags as tag}
          <div class="bg-stone-200 flex items-center px-1 text-sm mr-2">
            {tag}
            <button
              class="text-xs px-1"
              on:click={() =>
                colorStore.setCurrentTags(
                  tags.filter((x) => x.toLowerCase() !== tag.toLowerCase())
                )}
            >
              <Times />
            </button>
          </div>
        {/each}
      </div>
      <div class="flex flex-col mt-4">
        <span class="text-sm">Common tags</span>
        <div class="flex">
          {#each commonTags as tag}
            <button
              class={buttonStyle}
              on:click={() => colorStore.setCurrentTags([...tags, tag])}
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>
      <div class="flex flex-col mt-4">
        <div class="text-sm">Custom Tag</div>
        <form
          placeholder="Add Tag"
          on:submit|preventDefault|stopPropagation={() =>
            colorStore.setCurrentTags([...tags, tagInput])}
        >
          <input class="w-24 {buttonStyle}" bind:value={tagInput} />
          <button class={buttonStyle}>Add Tag</button>
        </form>
      </div>
    </div>
    <button
      class={`${buttonStyle} flex justify-center  items-center`}
      slot="target"
      let:toggle
      on:click={toggle}
    >
      <div>{tags.join(", ") || "None"}</div>
      <DownChev class="ml-2 text-sm" />
    </button>
  </Tooltip>
</div>
