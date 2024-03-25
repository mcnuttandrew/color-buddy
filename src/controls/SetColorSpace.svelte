<script lang="ts">
  import { colorPickerConfig } from "../lib/Color";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  export let colorSpace: string;
  export let onChange: (e: any) => void;
  // const notAllowed = new Set(["rgb", "hsv", "hsl", "srgb", "lch", "oklch"]);
  // const notAllowed = new Set(["rgb", "lch", "oklch", "srgb"]);
  const notAllowed = new Set(["rgb", "oklch", "srgb", "jzazbz", "oklab"]);
  $: options = Object.keys(colorPickerConfig)
    .filter((x) => !notAllowed.has(x))
    .sort((a, b) => {
      if (a === "lab") return -1;
      if (b === "lab") return 1;
      return a.localeCompare(b);
    });
</script>

<Tooltip>
  <div slot="content" class="flex flex-col max-w-md" let:onClick>
    <div class="font-bold">Set Color Space</div>
    <div class="text-sm">
      Note that changing between color space can be a lossy process and colors
      may alter slightly
    </div>
    <div class="grid grid-cols-4 mt-2">
      {#each options as space}
        <!-- <div class="flex"> -->
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
        <!-- </div> -->
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
