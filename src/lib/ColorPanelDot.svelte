<script lang="ts">
  import chroma from "chroma-js";
  import focusStore from "./focus-store";
  import { insert, deleteFrom, randColor } from "../utils";
  import colorStore from "./color-store";
  $: focusedColor = $focusStore.focusedColor;
  $: colors = $colorStore.currentPal.colors;
  export let i: number;
  $: color = colors[i];
  let state: "idle" | "editing" | "error" = "idle";
  $: localColor = color;

  $: borderColor =
    focusedColor === color.hex()
      ? "black"
      : state === "error"
        ? "red"
        : state === "editing"
          ? "blue"
          : color;
</script>

<div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="w-32 h-32 text-center flex flex-col justify-center items-center rounded-full cursor-pointer mr-2 mb-2"
    style="border: 10px solid {borderColor}; background-color: {color}; "
    on:click={() => {
      focusStore.setFocusedColor(color);
    }}
  >
    <div>
      <button
        on:click={() =>
          colorStore.setCurrentPalColors(insert(colors, randColor(), i))}
      >
        🔀
      </button>
      <button
        on:click={() => colorStore.setCurrentPalColors(deleteFrom(colors, i))}
      >
        ␡
      </button>
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class:text-white={chroma(color).luminance() < 0.5}
      on:focus={() => {
        state = "editing";
      }}
      on:blur={() => {
        state = "idle";
        // error handling: check if color is valid
        try {
          chroma(localColor);
        } catch (e) {
          //   localColor = color;
          state = "error";
          return;
        }
        // update store
        const palUpdates = [...colors];
        palUpdates[i] = localColor;
        colorStore.setCurrentPalColors(palUpdates);
      }}
      on:keyup={(e) => {
        // @ts-ignore
        localColor = e.target.textContent;
      }}
      contenteditable="true"
    >
      {color}
    </div>
  </div>
</div>
