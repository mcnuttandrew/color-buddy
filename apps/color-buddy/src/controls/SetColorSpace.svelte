<script lang="ts">
  import DownChev from "virtual:icons/fa6-solid/angle-down";

  import configStore from "../stores/config-store";

  import { colorPickerConfig, titleCase } from "../lib/utils";
  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";
  import Check from "virtual:icons/fa6-solid/check";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";

  export let colorSpace: string;
  export let onChange: (e: any) => void;
  export let showDragPicker: boolean;
  const notAllowed = new Set([
    "rgb",
    // "srgb",
  ]);
  $: spaceGroups = Object.keys(colorPickerConfig)
    .filter((x) => !notAllowed.has(x.toLowerCase()))
    .reduce(
      (acc, x) => {
        const group = colorPickerConfig[x].spaceType;
        if (!acc[group]) acc[group] = [];
        acc[group].push(x);
        return acc;
      },
      {} as Record<string, string[]>
    );
  const groupOrder = [
    "perceptually uniform",
    "rgb based",
    "other interesting spaces",
  ];

  $: showBg = $configStore.showColorBackground;
  const showTypes = ["show on drag", "always show", "never show"] as Parameters<
    typeof configStore.setShowColorBackground
  >[0][];
</script>

<div class="flex flex-col">
  <div class="whitespace-nowrap text-xs">Color space</div>
  <Tooltip>
    <div
      slot="content"
      class="flex flex-col max-w-md max-h-lvh overflow-auto"
      let:onClick
    >
      {#each groupOrder as groupName}
        <div class="text-xs">
          {titleCase(groupName)
            .split(" ")
            .map((x) => (x === "Rgb" ? "RGB" : x))
            .join(" ")}
        </div>
        {#each spaceGroups[groupName] as space}
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
                {colorPickerConfig[space].description}
              </div>
            </div>
          </button>
        {/each}
        <div class="w-full border-b border-stone-200 my-2" />
      {/each}

      {#if showDragPicker}
        <div class="w-full border-b border-stone-200" />
        <div class="mt-2 text-xs">Background Color space</div>
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
