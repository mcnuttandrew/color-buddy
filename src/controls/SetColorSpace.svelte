<script lang="ts">
  import { colorPickerConfig } from "../lib/Color";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  // $: colorSpace = $colorStore.currentPal.colorSpace;
  export let colorSpace: string;
  export let onChange: (e: any) => void;
  // const notAllowed = new Set(["rgb", "hsv", "hsl", "srgb", "lch", "oklch"]);
  // const notAllowed = new Set(["rgb", "lch", "oklch", "srgb"]);
  const notAllowed = new Set(["rgb", "oklch", "srgb", "jzazbz", "oklab"]);
  // const onChange = (e: any) => colorStore.setColorSpace(e);
  $: options = Object.keys(colorPickerConfig)
    .filter((x) => !notAllowed.has(x))
    .sort();
</script>

<Tooltip>
  <div slot="content" class="flex flex-col" let:onClick>
    <div>Set Color Space</div>
    {#each options as space}
      <button
        class={buttonStyle}
        class:font-bold={space === colorSpace}
        on:click={() => onChange(space)}
      >
        {space.toUpperCase()}
      </button>
    {/each}
  </div>
  <button slot="target" class={buttonStyle} let:toggle on:click={toggle}>
    Color Space: {colorSpace.toUpperCase()}
  </button>
</Tooltip>
