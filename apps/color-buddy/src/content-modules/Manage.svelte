<script lang="ts">
  import type { Palette } from "color-buddy-palette";

  import Plus from "virtual:icons/fa6-solid/plus";
  import BrowseCard from "../example/BrowseCard.svelte";
  import FolderConfig from "../controls/FolderConfig.svelte";
  import GenerateNewNames from "../components/GenerateNewNames.svelte";
  import Modal from "../components/Modal.svelte";
  import PreviewSelector from "../example/PreviewSelector.svelte";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import examplePalStore from "../stores/example-palette-store";
  import exampleStore from "../stores/example-store";
  import focusStore from "../stores/focus-store";
  import { buttonStyle } from "../lib/styles";
  import { convertPalToSpace } from "../lib/utils";
  import { suggestNameForPalette } from "../lib/api-calls";
  import Nav from "../components/Nav.svelte";

  import { newVersionName } from "../lib/utils";
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
        action: () => {
          const newPal = { ...currentPal };
          const currentPalNames = new Set(
            $colorStore.palettes.map((v) => v.name)
          );
          let i = 2;
          // regex removes the version number from the name
          const name = newPal.name.replace(/ v\d+$/, "");
          while (currentPalNames.has(`${name} v${i}`)) {
            i++;
          }
          newPal.name = `${name} v${i}`;
          colorStore.createNewPal(newPal);
        },
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
        name: "Generate New Name (AI)",
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
      ...folders
        .filter((x) => pal.folder !== x)
        .map((x) => {
          return {
            name: `Move to ${x || "Home"}`,
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
  let modalState: "closed" | "open" = "closed";
  function onClose() {
    modalState = "closed";
  }
</script>

<button
  class={"text-white"}
  on:click={() => {
    modalState = "open";
  }}
>
  Palettes...
</button>

{#if modalState === "open"}
  <Modal
    showModal={modalState === "open"}
    closeModal={() => {
      modalState = "closed";
      onClose();
    }}
  >
    <div class="bg-stone-200 p-4 text-xl font-bold">Palettes</div>
    <div class="bg-stone-100 flex flex-col h-full py-2 px-4">
      <div class="flex w-full items-center justify-between">
        <div class="flex flex-col">
          <div class="flex flex-col">
            <div class="text-sm uppercase font-bold">Samples</div>
            <Nav
              className="justify-start"
              tabs={["sequential", "categorical", "diverging"]}
              isTabSelected={(tab) => selectedFolder?.name === tab}
              selectTab={(tab) => {
                configStore.setSelectedFolder({
                  isPreMade: true,
                  name: tab,
                });
              }}
            />
          </div>
          <div class="flex flex-col">
            <div class="text-sm uppercase font-bold">My Folders</div>
            <div class="flex">
              <Nav
                className="justify-start"
                tabs={folders}
                isTabSelected={(tab) => selectedFolder?.name === tab}
                formatter={(x) => x || "Home"}
                selectTab={(tab) => {
                  configStore.setSelectedFolder({
                    isPreMade: false,
                    name: tab,
                  });
                }}
              >
                <div slot="menu" let:tab>
                  {#if tab !== ""}
                    <div class="px-1">
                      <FolderConfig folder={tab} />
                    </div>
                  {/if}
                </div>
              </Nav>
              <button
                class="ml-4"
                on:click={() => {
                  folders = [...folders, newVersionName("New Folder", folders)];
                }}
              >
                <Plus />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start">
          <span class="whitespace-nowrap text-sm">Thumbnail Style:</span>
          <PreviewSelector exampleName={example?.name || "Discs"} />
          <GenerateNewNames />
        </div>
      </div>
    </div>
    <div
      class="flex flex-wrap h-full overflow-auto p-4 content-baseline min-h-96"
    >
      {#if selectedFolder.isPreMade}
        {#each familiarPals as palette}
          {#if palette.type === selectedFolder.name}
            <BrowseCard
              {palette}
              targetBody={false}
              markAsCurrent={false}
              allowInteraction={false}
              allowResize={false}
              previewIndex={$configStore.manageBrowsePreviewIdx}
              titleClick={() => {
                usePal(palette);
                onClose();
              }}
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
              targetBody={false}
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
                let isSelected = $colorStore.currentPal === paletteIdx;
                colorStore.startUsingPal(paletteIdx);
                if (isSelected) {
                  onClose();
                }
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
{/if}
