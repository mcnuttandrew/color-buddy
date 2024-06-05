<script lang="ts">
  import { colorPickerConfig } from "../lib/utils";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let colorSpace: string;
  export let onChange: (e: any) => void;
  const notAllowed = new Set(["rgb"]);
  $: basicOptions = Object.keys(colorPickerConfig)
    .filter((x) => !notAllowed.has(x) && !colorPickerConfig[x].advancedSpace)
    .sort((a, b) => {
      if (a === "lab") return -1;
      if (b === "lab") return 1;
      return a.localeCompare(b);
    });

  $: advancedSpaceOptions = Object.keys(colorPickerConfig).filter(
    (x) => !notAllowed.has(x) && colorPickerConfig[x].advancedSpace
  );
</script>

<Tooltip>
  <div slot="content" class="flex flex-col max-w-md">
    <div class="font-bold">Set Color Space</div>
    <div class="text-sm">
      Select the color space to use for the color picker.
    </div>
    <div class="grid grid-cols-4 mt-2">
      {#each basicOptions as space}
        <button
          class={`${buttonStyle} justify-self-start`}
          class:font-bold={space === colorSpace}
          on:click={() => onChange(space)}
        >
          {space.toUpperCase()}
        </button>
        <span class="text-sm italic col-span-3">
          {colorPickerConfig[space].description}
        </span>
      {/each}
    </div>

    <div class="font-bold">Advanced Color Spaces</div>
    <div class="text-sm">
      These color spaces provide more control over the color representation, but
      may be less intuitive or familiar
    </div>
    <div class="grid grid-cols-4 mt-2">
      {#each advancedSpaceOptions as space}
        <button
          class={`${buttonStyle} justify-self-start`}
          class:font-bold={space === colorSpace}
          on:click={() => onChange(space)}
        >
          {space.toUpperCase()}
        </button>
        <span class="text-sm italic col-span-3">
          {colorPickerConfig[space].description}
        </span>
      {/each}
    </div>
  </div>
  <button
    slot="target"
    class={`${buttonStyle} pl-0`}
    let:toggle
    on:click={toggle}
  >
    Color Space: {colorSpace.toUpperCase()}
  </button>
</Tooltip>
