<script>
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import DownChev from "virtual:icons/fa6-solid/angle-down";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: tags = currentPal?.tags || [];

  let tagInput = "";
  $: inUseTags = new Set(tags);
  $: commonTags = ["serious", "trustworthy", "calm"].filter(
    (x) => !inUseTags.has(x)
  );
</script>

<div class="flex flex-col">
  <div class="text-sm whitespace-nowrap">Palette Tags</div>
  <Tooltip>
    <div slot="content" class="max-w-md">
      <div class="italic text-sm">
        Tags describe palette level usages, like the intended affect and so on. {#if commonTags.length}
          Here are some common ones that are have specific effects in the app
          (such as engaging lints for specific affects).{/if}
      </div>
      <div class="font-bold">Tags</div>
      <div class="flex flex-wrap">
        {#each tags as tag}
          <div class={buttonStyle}>
            {tag}
            <button
              class="text-xs"
              on:click={() =>
                colorStore.setCurrentTags(
                  tags.filter((x) => x.toLowerCase() !== tag)
                )}
            >
              x
            </button>
          </div>
        {/each}
      </div>
      <div>
        {#each commonTags as tag}
          <button
            class={buttonStyle}
            on:click={() => colorStore.setCurrentTags([...tags, tag])}
          >
            {tag}
          </button>
        {/each}
        <div class="flex">
          <form
            placeholder="Add Tag"
            on:submit|preventDefault|stopPropagation={() =>
              colorStore.setCurrentTags([...tags, tagInput])}
          >
            <input class="w-24" bind:value={tagInput} />
            <button class={buttonStyle}>Add Tag</button>
          </form>
        </div>
      </div>
    </div>
    <button
      class={`${buttonStyle} flex justify-center  items-center`}
      slot="target"
      let:toggle
      on:click={toggle}
    >
      <div>{tags.join(", ")}</div>
      <DownChev class="text-sm" />
    </button>
  </Tooltip>
</div>
