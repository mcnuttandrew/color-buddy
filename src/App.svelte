<script lang="ts">
  import colorStore from "./stores/color-store";
  import { charts, buildTheme } from "./charts";
  import Vega from "./components/Vega.svelte";
  import ColorArea from "./content-modules/ColorArea.svelte";
  import SavedPals from "./content-modules/SavedPals.svelte";
  import ColorPanel from "./content-modules/ActionArea.svelte";
  import TinyWebpage from "./content-modules/TinyWebpage.svelte";
  import TextBlock from "./content-modules/TextBlock.svelte";
  import SuggestionsPanel from "./content-modules/SuggestionsPanel.svelte";
  import Swatches from "./content-modules/Swatches.svelte";
  import Tooltip from "./components/Tooltip.svelte";
  import ColorChannelPicker from "./components/ColorChannelPicker.svelte";
  import ColorNameWithEdit from "./components/ColorNameWithEdit.svelte";

  let showOption: Record<string, boolean> = {
    visualizations: true,
    pages: true,
  };
  $: bg = $colorStore.currentPal.background;
</script>

<main class="flex h-full">
  <SavedPals />
  <div class="w-full flex p-2">
    <!-- left column -->
    <div class="flex-col w-1/2">
      <ColorPanel />
      <div class="flex">
        <!-- <ColorCircle height={300} width={300} /> -->
        <ColorArea height={400} width={400} />
      </div>
      <Swatches />

      <SuggestionsPanel />
      <h1>Evaluation</h1>
      <div>TODO</div>
    </div>
    <!-- right colum -->
    <div class=" w-1/2">
      <div>
        {#each Object.keys(showOption) as key}
          <label class="relative inline-flex items-center cursor-pointer mr-10">
            <input
              type="checkbox"
              value=""
              class="sr-only peer"
              bind:checked={showOption[key]}
            />
            <div
              class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
            <span
              class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {key}
            </span>
          </label>
        {/each}
      </div>
      {#if showOption.swatches}{/if}
      <div>
        <h1>Background</h1>
        <div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <Tooltip top={"100px"}>
            <div slot="content" class="flex" let:onClick>
              <ColorNameWithEdit
                color={$colorStore.currentPal.background}
                onColorChange={(color) => colorStore.setBackground(color)}
              />
              {#each ["lab"] as colorMode}
                <ColorChannelPicker
                  color={$colorStore.currentPal.background}
                  {colorMode}
                  onColorChange={(color) => colorStore.setBackground(color)}
                />
              {/each}
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              let:toggle
              slot="target"
              class={"cursor-pointer mr-2 mb-2 w-8 h-8 rounded-full border-2 border-gray-200"}
              style={`background: ${$colorStore.currentPal.background.toHex()}`}
              on:click={() => {
                toggle();
              }}
            ></div>
          </Tooltip>
        </div>
      </div>
      {#if showOption.visualizations}
        <h1>Visualizations</h1>
        <div
          class="flex flex-wrap overflow-auto p-4"
          style={`background-color: ${bg.toHex()}`}
        >
          {#each charts as spec}
            <Vega spec={spec($colorStore.currentPal)} />
          {/each}
        </div>
      {/if}
      {#if showOption.pages}
        <h1>Web pages</h1>
        <div class="flex flex-wrap overflow-auto">
          <TinyWebpage />
          <TextBlock />
        </div>
      {/if}
    </div>
  </div>
</main>
