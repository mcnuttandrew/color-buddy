<script lang="ts">
  import { flip } from "svelte/animate";
  import colorStore from "./color-store";
  $: colors = $colorStore.currentPal.colors;

  const rowCount = 4;
  const boxSize = 50;

  $: height = Math.ceil((colors || []).length / rowCount) * boxSize;
  $: console.log(height);
</script>

<div class="flex">
  <svg width={200} {height} overflow="visible">
    {#each colors as color, i (color)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <rect
        animate:flip={{ duration: 200 }}
        x={(i % rowCount) * boxSize}
        y={Math.floor(i / rowCount) * boxSize}
        width={boxSize - 5}
        height={boxSize - 5}
        fill={color.hex()}
        on:click={() =>
          colorStore.setCurrentPalColors(colors.filter((x) => x !== color))}
      />
    {/each}
  </svg>
  <svg width={200} {height} overflow="visible">
    {#each colors as color, i (color)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->

      <rect
        x={(i % rowCount) * boxSize}
        y={Math.floor(i / rowCount) * boxSize}
        width={boxSize / 2}
        height={boxSize / 2}
        fill={color.hex()}
      />
    {/each}
  </svg>
  <svg width={200} {height} overflow="visible">
    {#each colors as color, i (color)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <circle
        animate:flip={{ duration: 200 }}
        cx={(i % rowCount) * boxSize + boxSize / 4}
        cy={Math.floor(i / rowCount) * boxSize + boxSize / 4}
        r={boxSize / 4}
        stroke={color.hex()}
        stroke-width={5}
        fill={"white"}
        on:click={() =>
          colorStore.setCurrentPalColors(colors.filter((x) => x !== color))}
      />
    {/each}
  </svg>
</div>
