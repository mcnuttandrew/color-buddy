<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import Times from "virtual:icons/fa6-solid/xmark";
  import Info from "virtual:icons/fa6-solid/circle-info";
  import Plus from "virtual:icons/fa6-solid/plus";

  export let commonTags: string[] = [];
  export let tags: string[] = [];
  export let setNewTags: (tags: string[]) => void;
  export let description: string;
  export let label: string;

  let tagInput = "";
  $: inUseTags = new Set(tags);
  $: filteredCommonTags = commonTags.filter((x) => !inUseTags.has(x));
</script>

<div class="w-full">
  <div class="text-xs flex items-center">
    <span>{label}</span>
    <Tooltip>
      <div slot="content" class="italic text-sm max-w-sm">
        {description}
      </div>
      <button class="text-xs mx-2" slot="target" let:toggle on:click={toggle}>
        <Info />
      </button>
    </Tooltip>
  </div>
  <div class="flex flex-wrap bg-white min-h-4 p-2 border border-stone-300">
    {#each tags as tag}
      <div
        class="bg-stone-200 flex items-center px-1 text-sm mr-2 border border-stone-300"
      >
        {tag}
        <button
          class="text-xs px-1"
          on:click={() =>
            setNewTags(
              tags.filter((x) => x.toLowerCase() !== tag.toLowerCase())
            )}
        >
          <Times />
        </button>
      </div>
    {/each}
    <Tooltip>
      <div slot="content">
        <div class="flex flex-col">
          <span class="text-sm">Common tags</span>
          <div class="flex">
            {#each filteredCommonTags as tag}
              <button
                class={`bg-stone-200 flex items-center px-1 text-sm mr-2`}
                on:click={() => setNewTags([...tags, tag])}
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
              setNewTags([...tags, tagInput])}
          >
            <input class="w-24 {buttonStyle}" bind:value={tagInput} />
            <button class={buttonStyle}>Add Tag</button>
          </form>
        </div>
      </div>
      <button
        slot="target"
        let:toggle
        on:click={toggle}
        class="bg-stone-200 flex items-center px-1 text-xs mr-2 p-1 border-stone-300 border"
      >
        <Plus />
      </button>
    </Tooltip>
  </div>
</div>
