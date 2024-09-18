<script lang="ts">
  import type { Palette } from "color-buddy-palette";

  import BrowseCard from "../example/BrowseCard.svelte";
  import ColorSimControl from "../example/ColorSimControl.svelte";
  import FolderConfig from "../controls/FolderConfig.svelte";
  import GenerateNewNames from "../components/GenerateNewNames.svelte";
  import Modal from "../components/Modal.svelte";
  import NewExampleModal from "../example/NewExampleModal.svelte";
  import PreviewSelector from "../example/PreviewSelector.svelte";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import examplePalStore from "../stores/example-palette-store";
  import exampleStore from "../stores/example-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  import { convertPalToSpace } from "../lib/utils";
  import { suggestNameForPalette } from "../lib/api-calls";

  $: example = $exampleStore.examples[
    $configStore.manageBrowsePreviewIdx
  ] as any;
  $: palNames = new Set(
    $colorStore.palettes.map((pal) => pal.name.toLowerCase())
  );

  $: familiarPals = $examplePalStore.palettes.map((x) => x.palette);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;
  $: selectedFolder = $configStore.selectedFolder;

  function usePal(palette: Palette) {
    colorStore.createNewPal(convertPalToSpace(palette, colorSpace));
    focusStore.clearColors();
    configStore.setSelectedFolder({ isPreMade: false, name: "" });
  }

  function makeOperations(
    paletteIdx: number,
    pal: Palette
  ): { name: string; action: () => void; closeOnClick: boolean }[] {
    return [
      {
        name: "Use",
        action: () => {
          colorStore.startUsingPal(paletteIdx);
        },
        closeOnClick: true,
      },
      {
        name: "Compare with current",
        action: () => {
          configStore.setComparePal(paletteIdx);
          configStore.setRoute("compare");
        },
        closeOnClick: true,
      },
      {
        name: "Duplicate",
        action: () => colorStore.duplicatePal(paletteIdx),
        closeOnClick: true,
      },
      {
        name: "Delete",
        action: () => {
          colorStore.removePal(paletteIdx);
        },
        closeOnClick: true,
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
        closeOnClick: false,
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
        closeOnClick: false,
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
        closeOnClick: false,
      },
      "break",
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
          selectedFolder = { isPreMade: false, name: folderName };
        },
        closeOnClick: true,
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
            closeOnClick: true,
          };
        }),
    ].filter((x) => x) as any[] as {
      name: string;
      action: () => void;
      closeOnClick: boolean;
    }[];
  }

  $: folders = Array.from(
    new Set($colorStore.palettes.map((pal) => pal.folder.toLowerCase()))
  ).sort((a, b) => a.length - b.length);
  let modalState: "closed" | "open" = "open";
  function onClose() {
    modalState = "closed";
  }
</script>

<Modal
  showModal={modalState === "open"}
  closeModal={() => {
    modalState = "closed";
    onClose();
  }}
>
  <div class="bg-stone-300 p-4 text-xl font-bold">Palettes</div>
  <div class="bg-stone-200 flex h-full">
    <div class="py-2 px-6 flex-col">
      <div class="flex">
        <PreviewSelector exampleName={example?.name || "Discs"} />
        <div>
          <NewExampleModal editTarget={null} onClose={() => {}} />
        </div>
        <ColorSimControl />
        <GenerateNewNames />
      </div>
    </div>

    <div class="flex flex-col">
      <div class="text-sm">My Folders</div>
      <div class="flex">
        {#each folders as folder}
          <div class="flex" class:border-b-2={selectedFolder?.name === folder}>
            <button
              class={""}
              on:click={() =>
                configStore.setSelectedFolder({
                  isPreMade: false,
                  name: folder,
                })}
            >
              {folder.length ? `${folder}` : "root"}
            </button>
            {#if folder !== ""}
              <div class=" px-4">
                <FolderConfig {folder} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div class="flex flex-col">
      <div class="text-sm">Samples</div>
      <div>
        {#each ["sequential", "categorical", "diverging"] as folder}
          <button
            on:click={() =>
              configStore.setSelectedFolder({ isPreMade: true, name: folder })}
            class:underline={selectedFolder?.isPreMade &&
              selectedFolder?.name === folder}
          >
            {folder}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="flex flex-wrap h-full overflow-auto p-4 content-baseline h-full">
    {#if selectedFolder.isPreMade}
      {#each familiarPals as palette}
        {#if palette.type === selectedFolder.name}
          <BrowseCard
            {palette}
            usePortal={false}
            markAsCurrent={false}
            allowInteraction={false}
            allowResize={false}
            previewIndex={$configStore.manageBrowsePreviewIdx}
            titleClick={() => usePal(palette)}
            title={palette.name}
            operations={[
              {
                name: "Use the palette",
                action: () => usePal(palette),
                closeOnClick: true,
              },
            ]}
          />
        {/if}
      {/each}
    {:else}
      {#each $colorStore.palettes as pal, paletteIdx}
        {#if pal.folder.toLowerCase() === selectedFolder?.name.toLowerCase()}
          <BrowseCard
            usePortal={false}
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
    {/if}
  </div>
</Modal>
