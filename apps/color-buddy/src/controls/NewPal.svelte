<script lang="ts">
  import {
    Color,
    wrapInBlankSemantics,
    createPalFromHexes,
  } from "@color-buddy/palette-check";
  import type { StringPalette, Palette } from "@color-buddy/palette-check";

  import colorStore from "../stores/color-store";

  import { processBodyTextToColors } from "../lib/utils";
  import { buttonStyle, denseButtonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import { newGenericPal } from "../lib/utils";
  import SuggestColorPal from "./SuggestColorPal.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";

  function newPal(newPal: StringPalette) {
    const colors = newPal.colors.map((x) => {
      const color = Color.colorFromString(x.color, colorSpace);
      return wrapInBlankSemantics(color);
    });
    const background = Color.colorFromString(newPal.background, colorSpace);
    console.log(background.toHex(), newPal.background);
    const pal = {
      ...newPal,
      colors,
      background,
      colorSpace,
    } as Palette;
    colorStore.createNewPal(pal);
  }

  let inputString = "";
  function processBodyInput(body: string) {
    if (body.length === 0) {
      return;
    }
    try {
      const newColors = processBodyTextToColors(body, colorSpace as any);
      newPal(createPalFromHexes(newColors.map((x) => x.toHex())));
    } catch (e) {
      console.error(e);
      return;
    }
  }
</script>

<Tooltip>
  <div class="w-full" slot="content">
    <div class="">
      <button
        class={buttonStyle}
        on:click={() => newPal(createPalFromHexes([]))}
      >
        New blank
      </button>
      <button
        class={buttonStyle}
        on:click={() => newPal(newGenericPal("new palette"))}
      >
        New categorical
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          const pal = createPalFromHexes([
            "#0084a9",
            "#009de5",
            "#5fb1ff",
            "#bbc3ff",
            "#ecddff",
          ]);
          pal.type = "sequential";
          newPal(pal);
        }}
      >
        New sequential
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          const pal = createPalFromHexes([
            "#0084ae",
            "#8db3c7",
            "#e5e3e0",
            "#eca288",
            "#e25c36",
          ]);
          pal.type = "diverging";
          newPal(pal);
        }}
      >
        New diverging
      </button>
    </div>
    <div class="mt-5 border-t-2 border-black"></div>
    <div class="font-bold">New from string of hex</div>
    <textarea
      id="current-colors"
      class="w-full p-2 rounded border-2"
      value={inputString}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      on:blur={(e) => {
        processBodyInput(e.currentTarget.value);
        inputString = "";
      }}
    />
    <div class="mt-5 border-t-2 border-black"></div>
    <div class="font-bold">Generate a new palette using AI</div>
    <SuggestColorPal />
  </div>
  <button slot="target" let:toggle on:click={toggle} class={denseButtonStyle}>
    New
  </button>
</Tooltip>
