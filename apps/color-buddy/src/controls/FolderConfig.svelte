<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import { simpleTooltipRowStyle, buttonStyle } from "../lib/styles";
  import { newVersionName } from "../lib/utils";
  export let folder: string;
  let renaming = false;
  function doRename(newFolder: string) {
    if (!newFolder) {
      return;
    }
    let newName = newVersionName(
      newFolder.trim(),
      $colorStore.palettes.map((x) => x.folder)
    );

    const pals = [...$colorStore.palettes].map((pal) => {
      const hit = pal.folder.toLowerCase() === folder.toLowerCase();
      return hit ? { ...pal, folder: newName } : pal;
    });
    colorStore.setPalettes(pals);
    configStore.setSelectedFolder({ isPreMade: false, name: newName });
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
        const pals = $colorStore.palettes
          .filter((x) => x.folder === folder)
          .map((x) => {
            const { colors, background, name, colorSpace, type } = x;
            return {
              background: background.toHex(),
              colorSpace,
              colors: colors.map((c) => c.toHex()),
              name,
              type,
            };
          });
        const blob = new Blob([JSON.stringify(pals)], {
          type: "application/json",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        // the filename you want
        a.download = "palettes-export.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }}
    >
      Export Palettes
    </button>
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
        class={buttonStyle}
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
