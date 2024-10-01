<script lang="ts">
  import DownChev from "virtual:icons/fa6-solid/angle-down";

  import configStore from "../stores/config-store";

  import { colorPickerConfig } from "../lib/utils";
  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";
  import Check from "virtual:icons/fa6-solid/check";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";

  export let colorSpace: string;
  export let onChange: (e: any) => void;
  export let showDragPicker: boolean;
  const notAllowed = new Set(["rgb"]);
  $: basicOptions = Object.keys(colorPickerConfig)
    .filter((x) => !notAllowed.has(x) && !colorPickerConfig[x].advancedSpace)
    .sort((a, b) => {
      if (a === "lab") return -1;
      if (b === "lab") return 1;
      return a.localeCompare(b);
    });

  $: advancedSpaceOptions = Object.keys(colorPickerConfig)
    .filter((x) => !notAllowed.has(x) && colorPickerConfig[x].advancedSpace)
    .filter((x) => x.toLowerCase() !== "srgb");

  $: showBg = $configStore.showColorBackground;
  const showTypes = ["show on drag", "always show", "never show"] as Parameters<
    typeof configStore.setShowColorBackground
  >[0][];
</script>

<div class="flex flex-col">
  <div class="whitespace-nowrap text-xs">Color Space</div>
  <Tooltip>
    <div slot="content" class="flex flex-col max-w-md" let:onClick>
      <div class="text-xs">Basic color spaces</div>
      {#each basicOptions as space}
        <button
          class={`${simpleTooltipRowStyle} py-1  flex items-top text-sm `}
          on:click={() => {
            onChange(space);
            onClick();
          }}
        >
          <Check
            class="my-1 text-base mr-2 {space !== colorSpace
              ? 'opacity-0'
              : ''}"
          />
          <div class="flex flex-col">
            <div class:font-bold={space === colorSpace}>
              {space.toUpperCase()}
              {space === "lab" ? "(default)" : ""}
            </div>
            <div class="text-xs">
              {colorPickerConfig[space].description.split(".")[0]}
            </div>
            <div class="text-xs">
              {colorPickerConfig[space].description.split(".")[1]}
            </div>
          </div>
        </button>
      {/each}
      <div class="w-full border-b border-stone-200" />
      <div class="mt-2 text-xs">Advanced color spaces</div>
      <!-- <div class="">
        These color spaces provide more control over the color representation,
        but may be less intuitive or familiar
      </div> -->
      {#each advancedSpaceOptions as space}
        <button
          class={`${simpleTooltipRowStyle} py-1  flex  items-top text-sm`}
          on:click={() => {
            onChange(space);
            onClick();
          }}
        >
          <Check
            class="my-1 text-base mr-2 {space !== colorSpace
              ? 'opacity-0'
              : ''}"
          />
          <div class="flex flex-col">
            <div class:font-bold={space === colorSpace}>
              {space.toUpperCase()}
            </div>
            <div class="text-xs">
              {colorPickerConfig[space].description.split(".")[0]}
            </div>
            <div class="text-xs">
              {colorPickerConfig[space].description.split(".")[1]}
            </div>
          </div>
        </button>
      {/each}

      {#if showDragPicker}
        <div class="w-full border-b border-stone-200" />
        <div class="mt-2 text-xs">Background Color Space</div>
        <Nav
          tabs={showTypes}
          className="text-sm"
          isTabSelected={(x) => x === showBg}
          selectTab={(x) => configStore.setShowColorBackground(x)}
        />
      {/if}
    </div>
    <button
      slot="target"
      class={`${buttonStyle} flex items-center w-36 justify-between`}
      let:toggle
      on:click={toggle}
    >
      {colorSpace.toUpperCase()}
      <DownChev class="text-sm ml-2" />
    </button>
  </Tooltip>
</div>
