<script lang="ts">
  import { makePalFromString } from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import { processBodyTextToColors, newGenericPal } from "../lib/utils";
  import { buttonStyle, denseButtonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import SuggestColorPal from "./SuggestColorPal.svelte";
  import ColorThief from "colorthief";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";

  function newPal(newPal: Palette, close: () => void) {
    const colors = newPal.colors.map((x) => x.toColorSpace(colorSpace));
    const background = newPal.background.toColorSpace(colorSpace);
    const pal = {
      ...newPal,
      colors,
      background,
      colorSpace,
    } as Palette;
    colorStore.createNewPal(pal);
    close();
  }

  let inputString = "";
  function processBodyInput(body: string, close: () => void) {
    if (body.length === 0) {
      return;
    }
    try {
      const newColors = processBodyTextToColors(body, colorSpace as any);
      newPal(makePalFromString(newColors.map((x) => x.toHex())), close);
    } catch (e) {
      console.error(e);
      return;
    }
  }
  let palFromImgError = "";
  let palFromImgState: "idle" | "loading" = "idle";
  function processImg(e: any, onClick: () => void) {
    const colorThief = new ColorThief();
    palFromImgState = "loading";
    try {
      const target = e.target as HTMLInputElement;
      const files = target?.files;
      console.log(files);
      if (!files) {
        return;
      }
      const file = [...files].at(0);
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = (e.target as FileReader).result as string;
        img.onload = () => {
          try {
            const colors = colorThief.getPalette(img, 5) as number[][];
            const palRGB = colors.map((x) => `rgb(${x.join(", ")})`);
            const pal = makePalFromString(palRGB);
            console.log(colors);

            newPal(pal, onClick);
          } catch (e) {
            console.error(e);
            palFromImgState = "idle";
            palFromImgError = "Error processing image";
          }
        };
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      palFromImgError = "Error processing image";
      palFromImgState = "idle";
    }
  }
</script>

<Tooltip>
  <div class="w-full" slot="content" let:onClick>
    <div class="font-bold">Start a new palette from</div>
    <div class="">
      <button
        class={buttonStyle}
        on:click={() => newPal(makePalFromString([]), onClick)}
      >
        Blank
      </button>
      <button
        class={buttonStyle}
        on:click={() => newPal(newGenericPal("new palette"), onClick)}
      >
        Categorical
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          const pal = makePalFromString([
            "#0084a9",
            "#009de5",
            "#5fb1ff",
            "#bbc3ff",
            "#ecddff",
          ]);
          pal.type = "sequential";
          newPal(pal, onClick);
        }}
      >
        Sequential
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          const pal = makePalFromString([
            "#0084ae",
            "#8db3c7",
            "#e5e3e0",
            "#eca288",
            "#e25c36",
          ]);
          pal.type = "diverging";
          newPal(pal, onClick);
        }}
      >
        Diverging
      </button>
    </div>
    <div class="mt-5 border-t border-black"></div>
    <div class="font-bold">
      Make a new palette from string of hex (e.g. "#f00", "#0f0", "#00f")
    </div>
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
        processBodyInput(e.currentTarget.value, onClick);
        inputString = "";
      }}
    />
    {#if $configStore.engine !== "none"}
      <div class="mt-5 border-t border-black"></div>
      <div class="font-bold">Generate a new palette using AI</div>
      <SuggestColorPal />
    {/if}
    <div class="mt-5 border-t border-black"></div>
    <div class="font-bold">Generate From Image (png or jpg)</div>
    <input
      type="file"
      accept="image/*"
      id="file"
      on:change={(e) => processImg(e, onClick)}
    />
    {#if palFromImgState === "loading"}
      <div>Loading...</div>
    {/if}
    {#if palFromImgError}
      <div class="text-red-600">{palFromImgError}</div>
    {/if}
  </div>
  <button
    slot="target"
    let:toggle
    on:click={toggle}
    class={`mx-2 ${buttonStyle}`}
  >
    New palette
  </button>
</Tooltip>
