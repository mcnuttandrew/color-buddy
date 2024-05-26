<script lang="ts">
  import examplePalStore from "../stores/example-palette-store";
  import exampleStore from "../stores/example-store";
  import configStore from "../stores/config-store";
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import BrowseCard from "../example/BrowseCard.svelte";
  import PreviewSelector from "../example/PreviewSelector.svelte";
  import NewExampleModal from "../example/NewExampleModal.svelte";

  $: familiarPals = $examplePalStore.palettes.map((x) => x.palette);

  let searchString = "";
  $: filteredPals = familiarPals
    .filter((pal) =>
      pal.name.toLowerCase().includes(searchString.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  $: example = $exampleStore.examples[
    $configStore.manageBrowsePreviewIdx
  ] as any;
</script>

<div class="bg-stone-300 py-2 px-6">
  <div class="flex">
    <PreviewSelector exampleName={example?.name || "Discs"} />
    <NewExampleModal editTarget={null} onClose={() => {}} />
  </div>
  <div class="flex">
    <div class="mr-2">Search for palettes</div>
    <input bind:value={searchString} placeholder="Search" />
  </div>
</div>
<div class="overflow-y-scroll h-full p-2 bg-stone-100">
  <div class="flex flex-wrap">
    {#each filteredPals as palette}
      <BrowseCard
        {palette}
        allowInteraction={false}
        previewIndex={$configStore.manageBrowsePreviewIdx}
        operations={[
          {
            name: "Use the palette",
            action: () => {
              colorStore.createNewPal(palette);
              focusStore.clearColors();
              configStore.setRoute("examples");
            },
          },
        ]}
      />
    {/each}
  </div>
</div>
