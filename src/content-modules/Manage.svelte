<script lang="ts">
  import colorStore from "../stores/color-store";
  import exampleStore from "../stores/example-store";
  import configStore from "../stores/config-store";
  import BrowseCard from "../example/BrowseCard.svelte";
  import PreviewSelector from "../example/PreviewSelector.svelte";
  import NewExampleModal from "../example/NewExampleModal.svelte";

  import type { Palette } from "../types";

  $: example = $exampleStore.examples[
    $configStore.manageBrowsePreviewIdx
  ] as any;

  function makeOperations(
    paletteIdx: number,
    pal: Palette
  ): { name: string; action: () => void }[] {
    return [
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
    ].filter((x) => x) as any[] as { name: string; action: () => void }[];
  }
</script>

<div class="bg-stone-300 py-2 px-6 flex">
  <PreviewSelector exampleName={example?.name || "Discs"} />
  <NewExampleModal editTarget={null} onClose={() => {}} />
</div>

<div class="flex flex-wrap bg-stone-100 h-full overflow-auto p-4">
  {#each $colorStore.palettes as pal, paletteIdx}
    <BrowseCard
      onRename={(name) => {
        const newPals = [...$colorStore.palettes];
        newPals[paletteIdx] = { ...pal, name };
        colorStore.setPalettes(newPals);
      }}
      allowInteraction={false}
      palette={pal}
      previewIndex={$configStore.manageBrowsePreviewIdx}
      operations={makeOperations(paletteIdx, pal)}
    />
  {/each}
</div>
