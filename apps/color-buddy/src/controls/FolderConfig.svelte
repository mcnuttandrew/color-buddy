<script lang="ts">
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let setFolder: (folder?: string) => void;
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
    setFolder(newFolder);
    renaming = false;
  }
</script>

<Tooltip>
  <div slot="content" class="text-xs flex flex-col">
    <button
      class={buttonStyle}
      on:click={() => {
        const pals = [...$colorStore.palettes].map((pal) =>
          pal.folder === folder ? { ...pal, folder: "" } : pal
        );
        colorStore.setPalettes(pals);
        setFolder("");
      }}
    >
      Delete
    </button>
    <button
      class={buttonStyle}
      on:click={() => {
        renaming = true;
      }}
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
  <div slot="target" let:toggle class="w-full block">
    <button class={buttonStyle} on:click={toggle}>Folder Settings</button>
  </div>
</Tooltip>
