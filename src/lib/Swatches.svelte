<script lang="ts">
  import { flip } from "svelte/animate";
  import colorStore from "./color-store";
  import focusStore from "./focus-store";
  $: colors = $colorStore.currentPal.colors;

  const rowCount = 4;
  const boxSize = 50;

  $: height = Math.ceil((colors || []).length / rowCount) * boxSize;
</script>

<div class="flex">
  <svg width={200} {height} overflow="visible">
    {#each colors as color, i (color)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <rect
        class="cursor-pointer"
        animate:flip={{ duration: 200 }}
        x={(i % rowCount) * boxSize}
        y={Math.floor(i / rowCount) * boxSize}
        width={boxSize - 5}
        height={boxSize - 5}
        fill={color.hex()}
        stroke={color.hex() === $focusStore.focusedColor ? "black" : "none"}
        stroke-width={color.hex() === $focusStore.focusedColor ? 2 : 0}
        on:click={() => focusStore.setFocusedColor(color.hex())}
      />
    {/each}
  </svg>
  <svg width={200} {height} overflow="visible">
    {#each colors as color, i (color)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <rect
        class="cursor-pointer"
        x={(i % rowCount) * boxSize}
        y={Math.floor(i / rowCount) * boxSize}
        width={boxSize / 2}
        height={boxSize / 2}
        fill={color.hex()}
        stroke={color.hex() === $focusStore.focusedColor ? "black" : "none"}
        stroke-width={color.hex() === $focusStore.focusedColor ? 2 : 0}
        on:click={() => focusStore.setFocusedColor(color.hex())}
      />
    {/each}
  </svg>
  <svg width={200} {height} overflow="visible">
    {#each colors as color, i (color)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <circle
        class="cursor-pointer"
        animate:flip={{ duration: 200 }}
        cx={(i % rowCount) * boxSize + boxSize / 4}
        cy={Math.floor(i / rowCount) * boxSize + boxSize / 4}
        r={boxSize / 4}
        stroke={color.hex()}
        stroke-width={5}
        fill={color.hex() === $focusStore.focusedColor ? "black" : "white"}
        on:click={() => focusStore.setFocusedColor(color.hex())}
      />
    {/each}
  </svg>
</div>
