<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { simpleTooltipRowStyle } from "../lib/styles";
  export let folder: string;
  let renaming = false;
  function doRename(newFolder: string) {
    if (!newFolder) {
      return;
    }

    const pals = [...$colorStore.palettes].map((pal) => {
      const hit = pal.folder.toLowerCase() === folder.toLowerCase();
      return hit ? { ...pal, folder: newFolder } : pal;
    });
    colorStore.setPalettes(pals);
    configStore.setSelectedFolder({ isPreMade: false, name: newFolder });
    renaming = false;
  }
</script>

<Tooltip
  targetBody={false}
  top={0}
  bg="bg-white"
  onClose={() => {
    renaming = false;
  }}
>
  <div slot="content" class="flex flex-col">
    <button
      class={simpleTooltipRowStyle}
      on:click={() => {
        const pals = [...$colorStore.palettes].map((pal) =>
          pal.folder === folder ? { ...pal, folder: "" } : pal
        );
        colorStore.setPalettes(pals);
        configStore.setSelectedFolder({ isPreMade: false, name: "" });
      }}
    >
      Delete
    </button>
    <button
      class={simpleTooltipRowStyle}
      on:click|stopPropagation={() => (renaming = true)}
    >
      Rename
    </button>
    {#if renaming}
      <input
        type="text"
        value={folder}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            doRename(e.currentTarget.value);
          }
        }}
        on:blur={(e) => doRename(e.currentTarget.value)}
      />
      <button>Save</button>
    {/if}
  </div>
  <button slot="target" let:toggle class="block" on:click={toggle}>
    <DownChev class="text-xs" />
  </button>
</Tooltip>
