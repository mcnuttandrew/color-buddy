<script lang="ts">
  import type { Palette } from "color-buddy-palette";

  import colorStore from "../stores/color-store";
  import exampleStore from "../stores/example-store";
  import configStore from "../stores/config-store";
  import BrowseCard from "../example/BrowseCard.svelte";
  import PreviewSelector from "../example/PreviewSelector.svelte";
  import ColorSimControl from "../example/ColorSimControl.svelte";
  import NewExampleModal from "../example/NewExampleModal.svelte";
  import GenerateNewNames from "../components/GenerateNewNames.svelte";
  import { suggestNameForPalette } from "../lib/api-calls";
  import { buttonStyle } from "../lib/styles";
  import FolderConfig from "../controls/FolderConfig.svelte";

  $: example = $exampleStore.examples[
    $configStore.manageBrowsePreviewIdx
  ] as any;
  $: palNames = new Set(
    $colorStore.palettes.map((pal) => pal.name.toLowerCase())
  );

  function makeOperations(
    paletteIdx: number,
    pal: Palette
  ): { name: string; action: () => void }[] {
    return [
      {
        name: "Use",
        action: () => {
          colorStore.startUsingPal(paletteIdx);
        },
      },
      {
        name: "Compare with current",
        action: () => {
          configStore.setComparePal(paletteIdx);
          configStore.setRoute("compare");
        },
      },
      {
        name: "Duplicate",
        action: () => colorStore.duplicatePal(paletteIdx),
      },
      {
        name: "Delete",
        action: () => {
          colorStore.removePal(paletteIdx);
        },
      },
      paletteIdx !== 0 && {
        name: "Move up",
        action: () => {
          const pals = $colorStore.palettes;
          const newIdx = paletteIdx - 1;
          if (newIdx < 0) return;
          const newPals = [...pals];
          newPals[paletteIdx] = pals[newIdx];
          newPals[newIdx] = pals[paletteIdx];
          colorStore.setPalettes(newPals);
        },
      },
      paletteIdx !== $colorStore.palettes.length - 1 && {
        name: "Move down",
        action: () => {
          const pals = $colorStore.palettes;
          const newIdx = paletteIdx + 1;
          if (newIdx >= pals.length) return;
          const newPals = [...pals];
          newPals[paletteIdx] = pals[newIdx];
          newPals[newIdx] = pals[paletteIdx];
          colorStore.setPalettes(newPals);
        },
      },
      {
        name: "Generate New Name",
        action: async () => {
          try {
            const names = await suggestNameForPalette(pal, $configStore.engine);
            if (names.length > 0) {
              const subNames = names.filter(
                (name) => !palNames.has(name.toLowerCase())
              );
              const newName = subNames.length > 0 ? subNames[0] : names[0];
              colorStore.renamePalette(paletteIdx, newName);
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
      {
        name: "Create a new folder with this",
        action: () => {
          const newPals = [...$colorStore.palettes];
          // todo make the folder name be unique
          let folderName = "new folder";
          let i = 1;
          while ($colorStore.palettes.some((x) => x.folder === folderName)) {
            folderName = `new folder ${i}`;
            i++;
          }

          newPals[paletteIdx] = { ...pal, folder: folderName };
          colorStore.setPalettes(newPals);
          selectedFolder = folderName;
        },
      },
      ...folders
        .filter((x) => pal.folder !== x)
        .map((x) => {
          return {
            name: `Move to ${x || "root"}`,
            action: () => {
              const newPals = [...$colorStore.palettes];
              newPals[paletteIdx] = { ...pal, folder: x };
              colorStore.setPalettes(newPals);
            },
          };
        }),
    ].filter((x) => x) as any[] as { name: string; action: () => void }[];
  }

  $: folders = Array.from(
    new Set($colorStore.palettes.map((pal) => pal.folder.toLowerCase()))
  );
  let selectedFolder = "";
</script>

<div class="bg-stone-300 py-2 px-6 flex-col">
  <div class="flex">
    <PreviewSelector exampleName={example?.name || "Discs"} />
    <div>
      <NewExampleModal editTarget={null} onClose={() => {}} />
    </div>
    <ColorSimControl />
    <GenerateNewNames />
  </div>
  <div class="text-xs">
    These are the palettes you've created. Click on one to make it active
  </div>
</div>

<div class="bg-stone-200 px-4 py-1 flex">
  <div class="text-sm">Folders</div>
  {#each folders as folder}
    <button
      class={buttonStyle
        .split(" ")
        .filter((x) => x !== "font-bold")
        .join(" ")}
      on:click={() => (selectedFolder = folder)}
      class:font-bold={selectedFolder === folder}
      class:underline={selectedFolder === folder}
    >
      {`${folder}/`}
    </button>
  {/each}
</div>
{#if selectedFolder !== ""}
  <div class="bg-stone-200 px-2">
    <FolderConfig
      folder={selectedFolder}
      setFolder={(newFolder) => {
        selectedFolder = newFolder || "";
      }}
    />
  </div>
{/if}

<div
  class="flex flex-wrap bg-stone-100 h-full overflow-auto p-4 content-baseline"
>
  {#each $colorStore.palettes as pal, paletteIdx}
    {#if pal.folder.toLowerCase() === selectedFolder.toLowerCase()}
      <BrowseCard
        markAsCurrent={$colorStore.currentPal === paletteIdx}
        onRename={(name) => {
          const newPals = [...$colorStore.palettes];
          newPals[paletteIdx] = { ...pal, name };
          colorStore.setPalettes(newPals);
        }}
        allowInteraction={false}
        allowResize={false}
        palette={pal}
        titleClick={() => {
          colorStore.startUsingPal(paletteIdx);
        }}
        title={pal.name}
        previewIndex={$configStore.manageBrowsePreviewIdx}
        operations={makeOperations(paletteIdx, pal)}
      />
    {/if}
  {/each}
</div>
