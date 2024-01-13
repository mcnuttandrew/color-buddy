<script lang="ts">
  import colorStore from "../../stores/color-store";
  import { colorPickerConfig } from "../../lib/Color";
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  $: colorSpace = $colorStore.currentPal.colorSpace;
  const notAllowed = new Set(["rgb", "hsv", "hsl", "srgb", "lch", "oklch"]);
  const onChange = (e: any) => colorStore.setColorSpace(e);
  $: options = Object.entries(colorPickerConfig)
    .sort()
    .filter((x) => !notAllowed.has(x[0].toLowerCase()));
</script>

<Tooltip>
  <div slot="content" class="flex flex-col" let:onClick>
    <div>Set Color Space</div>
    {#each options as [space, { title }]}
      <button
        class={buttonStyle}
        class:font-bold={space === colorSpace}
        on:click={() => onChange(space)}
      >
        {title}
      </button>
    {/each}
  </div>
  <button slot="target" class={buttonStyle} let:toggle on:click={toggle}>
    Color Space: {$colorStore.currentPal.colorSpace.toUpperCase()}
  </button>
</Tooltip>
